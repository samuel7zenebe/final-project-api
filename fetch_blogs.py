import requests
import time
import json

url = "http://localhost:5000/api/blogs"
max_retries = 3
delay = 2

for attempt in range(1, max_retries + 1):
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
        print(json.dumps(data, indent=2))
        break
    except requests.exceptions.ConnectionError as e:
        print(f"Attempt {attempt}/{max_retries}: Connection error - {e}")
        if attempt < max_retries:
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)
        else:
            print("All attempts failed.")
    except requests.exceptions.HTTPError as e:
        print(f"Attempt {attempt}/{max_retries}: HTTP error - {e}")
        print(f"Response: {response.text}")
        break
    except requests.exceptions.Timeout:
        print(f"Attempt {attempt}/{max_retries}: Timeout")
        if attempt < max_retries:
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)
        else:
            print("All attempts failed.")
    except Exception as e:
        print(f"Attempt {attempt}/{max_retries}: Unexpected error - {e}")
        break