"""
Quick test script to verify backend is working
Run this to test if the backend server is responding
"""

import requests
import sys

def test_backend():
    """Test if backend is running and responding"""
    
    print("=" * 60)
    print("🧪 Testing LawLens Backend")
    print("=" * 60)
    print()
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health Check
    print("Test 1: Health Check")
    print(f"Testing: {base_url}/health")
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ PASS - Backend is running!")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ FAIL - Got status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ FAIL - Cannot connect to backend!")
        print("   Make sure the backend server is running:")
        print("   cd lawlens/backend")
        print("   python app.py")
        return False
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
        return False
    
    print()
    
    # Test 2: Judge Features Info
    print("Test 2: Judge Features Info")
    print(f"Testing: {base_url}/api/judge/features-info")
    try:
        response = requests.get(f"{base_url}/api/judge/features-info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ PASS - Judge features endpoint working!")
            print(f"   Features available: {len(data.get('features', []))}")
        else:
            print(f"❌ FAIL - Got status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
        return False
    
    print()
    
    # Test 3: Lawyer Features Info
    print("Test 3: Lawyer Features Info")
    print(f"Testing: {base_url}/api/lawyer/features-info")
    try:
        response = requests.get(f"{base_url}/api/lawyer/features-info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ PASS - Lawyer features endpoint working!")
            print(f"   Features available: {len(data.get('features', []))}")
        else:
            print(f"❌ FAIL - Got status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
        return False
    
    print()
    
    # Test 4: Analytics Features Info
    print("Test 4: Analytics Features Info")
    print(f"Testing: {base_url}/api/analytics/features-info")
    try:
        response = requests.get(f"{base_url}/api/analytics/features-info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ PASS - Analytics features endpoint working!")
            print(f"   Features available: {len(data.get('features', []))}")
        else:
            print(f"❌ FAIL - Got status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
        return False
    
    print()
    print("=" * 60)
    print("🎉 All tests passed! Backend is working correctly.")
    print("=" * 60)
    print()
    print("✅ Your AI tools should now work in the frontend!")
    print()
    print("Next steps:")
    print("1. Make sure frontend is running: cd lawlens/frontend && npm run dev")
    print("2. Open http://localhost:5173 in your browser")
    print("3. Try the AI tools - they should work now!")
    print()
    
    return True

if __name__ == "__main__":
    try:
        success = test_backend()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
