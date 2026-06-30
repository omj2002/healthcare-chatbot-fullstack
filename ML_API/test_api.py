import requests
import json

url = "http://127.0.0.1:5000/chat"
payload = {"message": "I have some itching and a skin rash with some eruptions on my skin"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print("Response Body:")
    # Use sys.stdout.buffer to print raw bytes or just safe print
    import sys
    sys.stdout.reconfigure(encoding='utf-8')
    print(response.json()['reply'])
except Exception as e:
    import traceback
    traceback.print_exc()
