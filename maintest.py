import requests, json
from apidata import ErgopriceURL, Blocks500URL, Blocks220URL, Latestblock
from datetime import datetime

def get_and_print_rounded_price():
    try:
        response = requests.get(ErgopriceURL)
        response.raise_for_status()  # Raise an exception for unsuccessful status codes
        data = response.json()
        rounded_price = round(float(data["items"][0]["value"]), 2)
        return rounded_price
    except (requests.exceptions.RequestException, KeyError, IndexError) as e:
        print(f"Error: {e}")


get_and_print_rounded_price()

def calculate_total_transactions(api_url):
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        total_transactions = sum(block["transactionsCount"] for block in data["items"])
        
        return total_transactions
    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError) as e:
        print(f"Error while calculating total data: {e}")
        return None
    
def calculate_total_hashrate(api_url):
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        
        total_difficulty = sum(block["difficulty"] for block in data["items"])
        
        return total_difficulty
    except (requests.exceptions.RequestException, ValueError, KeyError, IndexError) as e:
        print(f"Error while calculating total data: {e}")
        return None

def run_total_transaction_calculation():
    # Calculate total transactions for the last 720 blocks
    total_transactions_500 = calculate_total_transactions(Blocks500URL)
    total_transactions_220 = calculate_total_transactions(Blocks220URL)

    if total_transactions_500 is not None and total_transactions_220 is not None:
        total_transactions_combined = total_transactions_500 + total_transactions_220
        return total_transactions_combined
    
run_total_transaction_calculation()

def run_avg_hashrate_calculation():
    total_difficulty_500 = calculate_total_hashrate(Blocks500URL)
    total_difficulty_220 = calculate_total_hashrate(Blocks220URL)

    if total_difficulty_500 is not None and total_difficulty_220 is not None:
        # Calculate hashrate by taking difficulty in the last 24 hours and dividing by 10^12 and showing in Terrahash TH
        average_hashrate = ((total_difficulty_500 + total_difficulty_220)/(24*60*60))/1000000000000
        return average_hashrate

run_avg_hashrate_calculation()

def get_data_from_api(Latestblock):
    try:
        response = requests.get(Latestblock)
        response.raise_for_status()
        data = response.json()

        result = {
            "latest_block": data["items"][0]["height"],
            "miner_address": data["items"][0]["miner"]["address"],
            "timestamp": datetime.fromtimestamp(data["items"][0]["timestamp"] / 1000).strftime("%Y-%m-%d %H:%M:%S"),
            "time_difference": None
        }

        with open('address_book.json') as f:
            address_book = json.load(f)

        if result["miner_address"] in address_book:
            result["miner_address"] = address_book[result["miner_address"]]

        current_time = datetime.now()
        time_difference = current_time - datetime.fromtimestamp(data["items"][0]["timestamp"] / 1000)
        minutes, seconds = divmod(time_difference.total_seconds(), 60)
        result["time_difference"] = f"{int(minutes)}m {int(seconds)}s"

        return result
    except (requests.exceptions.RequestException, KeyError, IndexError, ValueError) as e:
        print(f"Error: {e}")
        return None
    
get_data_from_api(Latestblock)