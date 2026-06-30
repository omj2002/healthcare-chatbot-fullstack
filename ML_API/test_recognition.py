import requests
import json

base_url = "http://127.0.0.1:5000/chat"

def test_query(msg):
    print(f"Testing query: '{msg}'")
    try:
        response = requests.post(base_url, json={"message": msg}, headers={"Content-Type": "application/json"})
        if response.status_code == 200:
            print(f"Response: {response.json().get('reply')}")
        else:
            print(f"Error: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Connection failed: {e}")
    print("-" * 20)

if __name__ == "__main__":
    # Test 1: Direct disease mention
    test_query("aids")
    
    # Test 2: Another direct disease (Diabetes)
    test_query("diabetes")
    
    # Test 3: Common alias
    test_query("hiv ads")
    
    # Test 4: NLP Fallback (if vector files exist)
    test_query("what is a virus?")
