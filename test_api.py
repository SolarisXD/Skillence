import requests
import json

BASE_URL = "http://localhost:8001"

def test_api_endpoints():
    print("🔍 Testing CareerAI API Endpoints...\n")
    
    # Test 1: Backend health check
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Backend Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Backend Health Check Failed: {e}")
        return
    
    # Test 2: User Registration
    test_user = {
        "email": "test@careerai.com",
        "name": "Test User",
        "password": "testpassword123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/auth/register", json=test_user)
        if response.status_code in [200, 201]:
            print(f"✅ User Registration: {response.status_code}")
            token_data = response.json()
            token = token_data.get("access_token")
        elif response.status_code == 400:
            print(f"ℹ️  User Registration: User already exists, testing login...")
            # Try login instead
            login_data = {"email": test_user["email"], "password": test_user["password"]}
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
            if login_response.status_code == 200:
                print(f"✅ User Login: {login_response.status_code}")
                token_data = login_response.json()
                token = token_data.get("access_token")
            else:
                print(f"❌ User Login Failed: {login_response.status_code} - {login_response.text}")
                return
        else:
            print(f"❌ User Registration Failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Authentication Test Failed: {e}")
        return
    
    # Test 3: Token Verification
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{BASE_URL}/api/auth/verify", headers=headers)
        if response.status_code == 200:
            print(f"✅ Token Verification: {response.status_code}")
            user_data = response.json()
            user_id = user_data.get("id")
        else:
            print(f"❌ Token Verification Failed: {response.status_code} - {response.text}")
            return
    except Exception as e:
        print(f"❌ Token Verification Failed: {e}")
        return
    
    # Test 4: Resume Upload (Mock)
    resume_data = {
        "fullName": "Test User",
        "email": "test@careerai.com",
        "careerSummary": "Experienced software developer",
        "education": "BS Computer Science",
        "skills": ["Python", "React", "MongoDB"],
        "workExperience": [
            {
                "role": "Software Developer",
                "company": "Tech Corp",
                "duration": "2022-2024",
                "description": "Developed web applications"
            }
        ],
        "projects": [
            {
                "title": "Career AI Platform",
                "description": "AI-powered career guidance platform"
            }
        ],
        "certificationsAwards": [
            {
                "title": "AWS Certified Developer",
                "year": "2023"
            }
        ],
        "courses": [
            {
                "title": "Advanced React",
                "platform": "Udemy"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/resume/{user_id}", json=resume_data, headers=headers)
        if response.status_code in [200, 201]:
            print(f"✅ Resume Save: {response.status_code}")
        else:
            print(f"❌ Resume Save Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Resume Save Failed: {e}")
    
    # Test 5: Resume Fetch
    try:
        response = requests.get(f"{BASE_URL}/api/resume/{user_id}", headers=headers)
        if response.status_code == 200:
            print(f"✅ Resume Fetch: {response.status_code}")
            resume_data = response.json()
            print(f"   📄 Resume loaded for: {resume_data.get('fullName', 'Unknown')}")
        else:
            print(f"❌ Resume Fetch Failed: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ Resume Fetch Failed: {e}")
    
    print("\n🎉 API Testing Complete!")

if __name__ == "__main__":
    test_api_endpoints()
