import requests
from apidata import ErgopriceURL

def get_and_print_rounded_price():
    try:
        response = requests.get(ErgopriceURL)
        response.raise_for_status()  # Raise an exception for unsuccessful status codes
        data = response.json()
        rounded_price = round(float(data["items"][0]["value"]), 2)
        print(f"The price is: ${rounded_price}")
    except (requests.exceptions.RequestException, KeyError, IndexError) as e:
        print(f"Error: {e}")

# Run the function
get_and_print_rounded_price()