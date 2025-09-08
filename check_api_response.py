"""
Test API response structure
"""
import requests
import json

try:
    # Login
    login_response = requests.post('http://localhost:8000/api/auth/login', 
                                 json={'email': 'test@example.com', 'password': 'password'})
    
    if login_response.status_code != 200:
        print(f"Login failed: {login_response.status_code}")
        exit(1)
    
    token = login_response.json().get('access_token')
    
    # Get recommendations
    rec_response = requests.post('http://localhost:8000/api/career-path/recommendations', 
                               headers={'Authorization': f'Bearer {token}'})
    
    if rec_response.status_code != 200:
        print(f"Recommendations failed: {rec_response.status_code}")
        print(f"Error: {rec_response.text}")
        exit(1)
    
    data = rec_response.json()
    
    print("API Response Structure:")
    print("======================")
    print(f"Success: {data.get('success')}")
    print(f"Message: {data.get('message')}")
    print(f"Profile Summary: {data.get('profile_summary')}")
    print(f"Total Tech Skills: {data.get('total_tech_skills')}")
    print(f"Number of recommendations: {len(data.get('recommendations', []))}")
    
    if data.get('recommendations'):
        print("\nFirst recommendation structure:")
        rec = data['recommendations'][0]
        for key, value in rec.items():
            print(f"  {key}: {type(value).__name__} = {value}")

except Exception as e:
    print(f"Error: {e}")
