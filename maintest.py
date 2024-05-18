import requests
from apidata import ErgopriceURL, Blocks500URL, Blocks220URL, Latestblock
from datetime import datetime

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

def calculate_total_data(api_url):
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        total_transactions = sum(block["transactionsCount"] for block in data["items"])
        total_difficulty = sum(block["difficulty"] for block in data["items"])
        
        return total_transactions, total_difficulty
    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError) as e:
        print(f"Error while calculating total data: {e}")
        return None, None

def run_total_data_calculation():
    total_transactions_500, total_difficulty_500 = calculate_total_data(Blocks500URL)
    total_transactions_220, total_difficulty_220 = calculate_total_data(Blocks220URL)

    if total_transactions_500 is not None and total_transactions_220 is not None:
        total_transactions_combined = total_transactions_500 + total_transactions_220
        # Calculate hashrate by taking difficulty in the last 24 hours and dividing by 10^12 and showing in Terrahash TH
        average_hashrate = ((total_difficulty_500 + total_difficulty_220)/(24*60*60))/1000000000000
        print(f"Total Tx for the last 720 blocks: {total_transactions_combined}")
        print(f"Averate Hashrate for the last 720 blocks: {average_hashrate:.2f} Th/s")

run_total_data_calculation()

def get_timestamp_from_api():
    try:
        response = requests.get(Latestblock)
        response.raise_for_status()
        data = response.json()
        timestamp = data["items"][0]["timestamp"]
        readable_timestamp = datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d %H:%M:%S")
        return readable_timestamp
    except (requests.exceptions.RequestException, KeyError, IndexError) as e:
        print(f"Error: {e}")
        return None

readable_timestamp = get_timestamp_from_api()
if readable_timestamp is not None:
    print("Readable Timestamp:", readable_timestamp)