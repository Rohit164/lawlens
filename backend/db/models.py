from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    subscription_tier = Column(String, default="free")  # free, pro, enterprise
    documents_processed = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    documents = relationship("Document", back_populates="user")
    payments = relationship("Payment", back_populates="user")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_text = Column(Text, nullable=True)
    simplified_text = Column(Text, nullable=True)
    document_type = Column(String, nullable=True)  # judgment, contract, etc.
    file_path = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Metadata
    metadata_json = Column(JSON, nullable=True)  # Store court, date, parties, etc.
    
    # Relationships
    user = relationship("User", back_populates="documents")
    translations = relationship("Translation", back_populates="document")
    classifications = relationship("Classification", back_populates="document")

class Translation(Base):
    __tablename__ = "translations"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    language_code = Column(String, nullable=False)  # hi, mr, ta, etc.
    translated_text = Column(Text, nullable=False)
    translation_model = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="translations")

class Classification(Base):
    __tablename__ = "classifications"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    task_type = Column(String, nullable=False)  # outcome_prediction, statute_classification, etc.
    predicted_label = Column(String, nullable=False)
    confidence_score = Column(Float, nullable=False)
    model_name = Column(String, nullable=True)
    explanation_data = Column(JSON, nullable=True)  # SHAP/LIME results
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    document = relationship("Document", back_populates="classifications")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    razorpay_payment_id = Column(String, unique=True, nullable=False)
    razorpay_order_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    status = Column(String, nullable=False)  # created, authorized, captured, refunded, failed
    subscription_type = Column(String, nullable=False)  # pro_monthly, pro_yearly, enterprise
    subscription_start = Column(DateTime, nullable=True)
    subscription_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="payments")

class APIUsage(Base):
    __tablename__ = "api_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    endpoint = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    processing_time = Column(Float, nullable=True)
    success = Column(Boolean, default=True)
    error_message = Column(String, nullable=True)
