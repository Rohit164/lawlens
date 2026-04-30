from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any
import razorpay
import hmac
import hashlib
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import logging

from db.database import get_db
from db.models import User, Payment
from routes.auth import get_current_user

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Razorpay client
razorpay_client = None

# Initialize Razorpay
def initialize_razorpay():
    global razorpay_client
    try:
        key_id = os.getenv("RAZORPAY_KEY_ID")
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        
        if not key_id or not key_secret:
            logger.warning("Razorpay credentials not found in environment variables")
            return False
        
        razorpay_client = razorpay.Client(auth=(key_id, key_secret))
        logger.info("Razorpay client initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Error initializing Razorpay: {str(e)}")
        return False

# Initialize on startup
@router.on_event("startup")
async def startup_event():
    initialize_razorpay()

# Pydantic models
class CreateOrderRequest(BaseModel):
    subscription_type: str  # "pro_monthly", "pro_yearly", "enterprise"
    currency: str = "INR"

class OrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    subscription_type: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class PaymentResponse(BaseModel):
    success: bool
    message: str
    subscription_tier: str
    subscription_end: Optional[datetime] = None

class SubscriptionInfo(BaseModel):
    subscription_tier: str
    subscription_start: Optional[datetime] = None
    subscription_end: Optional[datetime] = None
    is_active: bool
    days_remaining: Optional[int] = None

# Subscription pricing (in paise - Razorpay uses smallest currency unit)
SUBSCRIPTION_PRICING = {
    "pro_monthly": {
        "amount": 49900,  # ₹499 in paise
        "duration_days": 30,
        "name": "Pro Monthly"
    },
    "pro_yearly": {
        "amount": 499900,  # ₹4999 in paise (2 months free)
        "duration_days": 365,
        "name": "Pro Yearly"
    },
    "enterprise": {
        "amount": 999900,  # ₹9999 in paise
        "duration_days": 365,
        "name": "Enterprise Yearly"
    }
}

def verify_razorpay_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature"""
    try:
        key_secret = os.getenv("RAZORPAY_KEY_SECRET")
        if not key_secret:
            return False
        
        # Create signature string
        message = f"{order_id}|{payment_id}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            key_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(expected_signature, signature)
    except Exception as e:
        logger.error(f"Signature verification error: {str(e)}")
        return False

@router.post("/create-order", response_model=OrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Razorpay order for subscription"""
    if razorpay_client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment service not available"
        )
    
    # Validate subscription type
    if request.subscription_type not in SUBSCRIPTION_PRICING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid subscription type: {request.subscription_type}"
        )
    
    try:
        subscription_info = SUBSCRIPTION_PRICING[request.subscription_type]
        
        # Create Razorpay order
        order_data = {
            "amount": subscription_info["amount"],
            "currency": request.currency,
            "receipt": f"lawlens_{current_user.id}_{int(datetime.now().timestamp())}",
            "notes": {
                "user_id": str(current_user.id),
                "subscription_type": request.subscription_type,
                "user_email": current_user.email
            }
        }
        
        razorpay_order = razorpay_client.order.create(order_data)
        
        # Save payment record
        payment = Payment(
            user_id=current_user.id,
            razorpay_payment_id="",  # Will be updated after payment
            razorpay_order_id=razorpay_order["id"],
            amount=subscription_info["amount"] / 100,  # Convert to rupees
            currency=request.currency,
            status="created",
            subscription_type=request.subscription_type
        )
        db.add(payment)
        db.commit()
        
        return OrderResponse(
            order_id=razorpay_order["id"],
            amount=subscription_info["amount"],
            currency=request.currency,
            key_id=os.getenv("RAZORPAY_KEY_ID"),
            subscription_type=request.subscription_type
        )
        
    except Exception as e:
        logger.error(f"Order creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )

@router.post("/verify-payment", response_model=PaymentResponse)
async def verify_payment(
    request: VerifyPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify Razorpay payment and update subscription"""
    try:
        # Verify signature
        if not verify_razorpay_signature(
            request.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Find payment record
        payment = db.query(Payment).filter(
            Payment.razorpay_order_id == request.razorpay_order_id,
            Payment.user_id == current_user.id
        ).first()
        
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment record not found"
            )
        
        # Update payment record
        payment.razorpay_payment_id = request.razorpay_payment_id
        payment.status = "captured"
        
        # Update user subscription
        subscription_info = SUBSCRIPTION_PRICING[payment.subscription_type]
        
        # Set subscription dates
        subscription_start = datetime.utcnow()
        subscription_end = subscription_start + timedelta(days=subscription_info["duration_days"])
        
        payment.subscription_start = subscription_start
        payment.subscription_end = subscription_end
        
        # Update user tier
        if payment.subscription_type.startswith("pro"):
            current_user.subscription_tier = "pro"
        elif payment.subscription_type == "enterprise":
            current_user.subscription_tier = "enterprise"
        
        db.commit()
        
        return PaymentResponse(
            success=True,
            message="Payment verified and subscription activated",
            subscription_tier=current_user.subscription_tier,
            subscription_end=subscription_end
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )

@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Razorpay webhooks"""
    try:
        # Get webhook signature
        webhook_signature = request.headers.get("X-Razorpay-Signature")
        if not webhook_signature:
            raise HTTPException(status_code=400, detail="Missing webhook signature")
        
        # Get request body
        body = await request.body()
        
        # Verify webhook signature
        webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
        if webhook_secret:
            expected_signature = hmac.new(
                webhook_secret.encode(),
                body,
                hashlib.sha256
            ).hexdigest()
            
            if not hmac.compare_digest(expected_signature, webhook_signature):
                raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
        # Parse webhook data
        webhook_data = json.loads(body.decode())
        event = webhook_data.get("event")
        payload = webhook_data.get("payload", {}).get("payment", {}).get("entity", {})
        
        if event == "payment.captured":
            # Handle successful payment
            order_id = payload.get("order_id")
            payment_id = payload.get("id")
            
            # Find and update payment record
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            
            if payment:
                payment.razorpay_payment_id = payment_id
                payment.status = "captured"
                
                # Update user subscription
                user = db.query(User).filter(User.id == payment.user_id).first()
                if user:
                    subscription_info = SUBSCRIPTION_PRICING[payment.subscription_type]
                    
                    subscription_start = datetime.utcnow()
                    subscription_end = subscription_start + timedelta(days=subscription_info["duration_days"])
                    
                    payment.subscription_start = subscription_start
                    payment.subscription_end = subscription_end
                    
                    if payment.subscription_type.startswith("pro"):
                        user.subscription_tier = "pro"
                    elif payment.subscription_type == "enterprise":
                        user.subscription_tier = "enterprise"
                
                db.commit()
                logger.info(f"Webhook processed: Payment {payment_id} captured")
        
        elif event == "payment.failed":
            # Handle failed payment
            order_id = payload.get("order_id")
            
            payment = db.query(Payment).filter(
                Payment.razorpay_order_id == order_id
            ).first()
            
            if payment:
                payment.status = "failed"
                db.commit()
                logger.info(f"Webhook processed: Payment {order_id} failed")
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook processing failed"
        )

@router.get("/subscription-info", response_model=SubscriptionInfo)
async def get_subscription_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription information"""
    try:
        # Get latest active payment
        latest_payment = db.query(Payment).filter(
            Payment.user_id == current_user.id,
            Payment.status == "captured"
        ).order_by(Payment.created_at.desc()).first()
        
        if not latest_payment or not latest_payment.subscription_end:
            return SubscriptionInfo(
                subscription_tier=current_user.subscription_tier,
                is_active=current_user.subscription_tier != "free"
            )
        
        # Check if subscription is still active
        now = datetime.utcnow()
        is_active = now < latest_payment.subscription_end
        
        # Calculate days remaining
        days_remaining = None
        if is_active:
            days_remaining = (latest_payment.subscription_end - now).days
        
        return SubscriptionInfo(
            subscription_tier=current_user.subscription_tier,
            subscription_start=latest_payment.subscription_start,
            subscription_end=latest_payment.subscription_end,
            is_active=is_active,
            days_remaining=days_remaining
        )
        
    except Exception as e:
        logger.error(f"Subscription info error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get subscription info"
        )

@router.get("/pricing")
async def get_pricing_info():
    """Get subscription pricing information"""
    pricing_info = {}
    
    for sub_type, info in SUBSCRIPTION_PRICING.items():
        pricing_info[sub_type] = {
            "name": info["name"],
            "amount_inr": info["amount"] / 100,  # Convert to rupees
            "duration_days": info["duration_days"],
            "features": {
                "unlimited_documents": True,
                "all_languages": True,
                "priority_support": True,
                "api_access": sub_type == "enterprise",
                "bulk_upload": sub_type == "enterprise"
            }
        }
    
    return {
        "pricing": pricing_info,
        "currency": "INR",
        "free_tier": {
            "documents_per_month": 10,
            "languages": ["English", "Hindi"],
            "features": ["Basic summarization", "Translation"]
        }
    }

@router.get("/status")
async def get_payment_status():
    """Get payment service status"""
    return {
        "status": "active" if razorpay_client is not None else "inactive",
        "razorpay_configured": razorpay_client is not None,
        "supported_currencies": ["INR"],
        "subscription_types": list(SUBSCRIPTION_PRICING.keys())
    }
