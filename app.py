from flask import Flask, render_template
from maintest import *

app = Flask(__name__)

@app.route('/')
def index():
    erg_price = get_and_print_rounded_price()
    total_transactions_combined = run_total_transaction_calculation()
    average_hashrate = round(run_avg_hashrate_calculation(), 2) 
    Latestblock = get_latest_block()
    miner_adderss = get_miner_address_from_api()
    return render_template('index.html', erg_price=erg_price, total_transactions_combined=total_transactions_combined, average_hashrate=average_hashrate, Latestblock=Latestblock, miner_adderss=miner_adderss)

if __name__ == '__main__':
    app.run()