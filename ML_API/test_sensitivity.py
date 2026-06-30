import requests
import json
import sys

url = "http://127.0.0.1:5000/chat"
headers = {"Content-Type": "application/json"}
sys.stdout.reconfigure(encoding='utf-8')

def test_query(message):
    print(f"\n--- Testing: {message} ---")
    payload = {"message": message}
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            reply = response.json()['reply']
            print(reply)
            if "🚨" in reply:
                print(">> [RESULT] ALERT TRIGGERED")
            else:
                print(">> [RESULT] STANDARD RESPONSE")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

# Run tests
test_query("fever")
test_query("headache")
test_query("chest pain")
test_query("I have a severe headache and neck pain and vomiting")
