import requests
import json
import sys

url = "http://127.0.0.1:5000/chat"
headers = {"Content-Type": "application/json"}
sys.stdout.reconfigure(encoding='utf-8')

# Mock a session by using a constant IP or similar if needed, 
# but here the server uses request.remote_addr, which will be 127.0.0.1 for both.

def test_chat(messages):
    print("\n--- Starting Conversation ---")
    for msg in messages:
        print(f"User: {msg}")
        payload = {"message": msg}
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Bot: {response.json()['reply']}\n")

# Test 1: Symptom -> Duration
test_chat([
    "I have some itching and a skin rash",
    "It has been there for 20 days"
])

# Test 2: Another Symptom -> Different Duration
test_chat([
    "I have a severe headache",
    "since last week"
])
