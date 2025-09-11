import urllib.request
import json

# Test the chatbot endpoint for formatting
url = "http://localhost:8000/api/chatbot/chat"
data = {
    "message": "Give me 5 tips for preparing for a software engineering interview",
    "session_id": "formatting-test-123"
}

try:
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json'}
    )
    
    print("Testing chatbot response formatting...")
    with urllib.request.urlopen(req, timeout=30) as response:
        result = json.loads(response.read().decode())
        response_text = result['response']
        
        print("\n=== CHATBOT RESPONSE ===")
        print(response_text)
        print("\n=== END RESPONSE ===")
        
        # Check for markdown
        has_bold = '**' in response_text
        has_italic = '*' in response_text and not has_bold
        has_headers = '#' in response_text
        
        print(f"\nFormatting Analysis:")
        print(f"- Bold markdown (**): {'FOUND' if has_bold else 'NOT FOUND'}")
        print(f"- Italic markdown (*): {'FOUND' if has_italic else 'NOT FOUND'}")
        print(f"- Headers (#): {'FOUND' if has_headers else 'NOT FOUND'}")
        
        if not has_bold and not has_italic and not has_headers:
            print("\n✅ FORMATTING TEST PASSED - Response is properly sanitized!")
        else:
            print("\n⚠️ FORMATTING ISSUE - Markdown characters still present")
            
except Exception as e:
    print(f"Test failed: {e}")
