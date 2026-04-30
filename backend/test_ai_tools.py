"""
Test AI Tools Endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_bench_memo():
    """Test bench memo endpoint"""
    print("\n🧪 Testing Bench Memo Generator...")
    
    url = f"{BASE_URL}/api/judge/bench-memo"
    data = {
        "case_file": "This is a test case about property dispute between two parties."
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Response keys: {result.keys()}")
            print(f"Bench memo preview: {str(result.get('bench_memo', ''))[:100]}...")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_adversarial():
    """Test adversarial simulation endpoint"""
    print("\n🧪 Testing Adversarial Simulation...")
    
    url = f"{BASE_URL}/api/lawyer/adversarial"
    data = {
        "case_brief": "Contract dispute case",
        "user_arguments": "The contract was breached by the defendant"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Response keys: {result.keys()}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def test_counterfactual():
    """Test counterfactual analysis endpoint"""
    print("\n🧪 Testing Counterfactual Analysis...")
    
    url = f"{BASE_URL}/api/analytics/counterfactual"
    data = {
        "case_details": "Property dispute case",
        "what_if_scenario": "What if the contract had a different clause?"
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"Response keys: {result.keys()}")
        else:
            print(f"❌ FAILED: {response.text}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Testing AI Tools Endpoints")
    print("=" * 60)
    print("\nMake sure backend is running on http://localhost:8000")
    print("Press Ctrl+C to cancel\n")
    
    input("Press Enter to start tests...")
    
    test_bench_memo()
    test_adversarial()
    test_counterfactual()
    
    print("\n" + "=" * 60)
    print("✅ Tests Complete!")
    print("=" * 60)
