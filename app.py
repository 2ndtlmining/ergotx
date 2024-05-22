from flask import Flask, render_template
from maintest import *
from apidata import *

app = Flask(__name__)

@app.route('/')
def index():
    LatestblockURL = Latestblock
    latestblockdata = get_data_from_api(LatestblockURL)
    if latestblockdata is None:
        return "Error while fetching data from API"
    
    erg_price = get_and_print_rounded_price()
    total_transactions_combined = run_total_transaction_calculation()
    average_hashrate = round(run_avg_hashrate_calculation(), 2)
    
    return render_template('index.html', erg_price=erg_price, total_transactions_combined=total_transactions_combined, average_hashrate=average_hashrate, latestblockdata=latestblockdata)

if __name__ == '__main__':
    app.run()