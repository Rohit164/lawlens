"""
Test script for Local AI API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_judge_bench_memo():
    """Test bench memo generation"""
    print("\n🧾 Testing Bench Memo Generation...")
    
    url = f"{BASE_URL}/api/judge-local/bench-memo"
    data = {
        "case_file": "Plaintiff filed suit for breach of contract. Defendant claims force majeure due to pandemic. Contract was signed in 2019 for supply of medical equipment."
    }
    
    try:
        print("⏳ Generating... (this may take 1-2 minutes)")
        response = requests.post(url, json=data, timeout=300)  # 5 minutes timeout
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"Model: {result.get('model_used')}")
            print(f"Time: {result.get('processing_time'):.2f}s")
            print(f"\nBench Memo Preview:")
            print(result.get('bench_memo', '')[:500] + "...")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")


def test_lawyer_adversarial():
    """Test adversarial simulation"""
    print("\n⚔️ Testing Adversarial Simulation...")
    
    url = f"{BASE_URL}/api/lawyer-local/adversarial-simulation"
    data = {
        "case_brief": "Contract dispute case involving force majeure clause",
        "user_arguments": "The pandemic constitutes force majeure under Section 56 of Indian Contract Act. Performance became impossible."
    }
    
    try:
        print("⏳ Generating... (this may take 1-2 minutes)")
        response = requests.post(url, json=data, timeout=300)  # 5 minutes timeout
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            print(f"Model: {result.get('model_used')}")
            print(f"Time: {result.get('processing_time'):.2f}s")
            print(f"\nSimulation Preview:")
            print(result.get('simulation', '')[:500] + "...")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"❌ Request failed: {e}")


def test_features_info():
    """Test features info endpoints"""
    print("\n📋 Testing Features Info...")
    
    try:
        judge_info = requests.get(f"{BASE_URL}/api/judge-local/features-info")
        lawyer_info = requests.get(f"{BASE_URL}/api/lawyer-local/features-info")
        
        print(f"Judge Features: {judge_info.status_code}")
        print(f"Lawyer Features: {lawyer_info.status_code}")
        
        if judge_info.status_code == 200:
            print(f"\n✅ Judge Features Available:")
            for feature in judge_info.json()['features']:
                print(f"  - {feature['name']}")
        
        if lawyer_info.status_code == 200:
            print(f"\n✅ Lawyer Features Available:")
            for feature in lawyer_info.json()['features']:
                print(f"  - {feature['name']}")
                
    except Exception as e:
        print(f"❌ Request failed: {e}")


if __name__ == "__main__":
    print("=" * 60)
    print("LOCAL AI API TEST SUITE")
    print("=" * 60)
    print("\nMake sure the backend is running: python app.py")
    print("This will take 30-60 seconds per test (model inference)")
    
    # Test features info first (quick)
    test_features_info()
    
    # Test actual AI generation (slower)
    choice = input("\n\nRun AI generation tests? (y/n): ").lower()
    if choice == 'y':
        test_judge_bench_memo()
        test_lawyer_adversarial()
    
    print("\n" + "=" * 60)
    print("Tests completed!")
    print("=" * 60)
