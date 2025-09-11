import requests
import json

# Test the chatbot API with a message that typically generates markdown
url = "http://localhost:8000/api/chatbot/chat"
headers = {"Content-Type": "application/json"}
data = {
    "message": "Can you give me interview tips for a data analyst position?",
    "session_id": "test-formatting-session"
}

try:
    print("Testing chatbot formatting...")
    response = requests.post(url, headers=headers, json=data, timeout=30)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print("\n=== AI Response (should be clean of markdown) ===")
        print(result['response'])
        print("\n=== End Response ===")
        
        # Check for common markdown characters
        response_text = result['response']
        if '**' in response_text or '*' in response_text or '#' in response_text:
            print("\n⚠️  WARNING: Markdown characters detected in response!")
        else:
            print("\n✅ Response appears to be properly sanitized!")
    else:
        print(f"Error: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"Request failed: {e}")
