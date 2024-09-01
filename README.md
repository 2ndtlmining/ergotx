# ErgoTx

This application is built to run in docker and to show the transactions and blocks on Ergo.
It has 2 main features today:

* Tx: Shows the mempool transaction and as they getting processed
* Blocks: This shows the latest block and who mined the block. This is designed to keep score of which mining pool is winning the latest blocks.




## Running with Docker

To run the app using Docker, follow these steps:

 - Git clone the repo
 - Proceed to the root folder of the app
 - Build the app:
    ` docker build -t ergotx .`
 -  Run the app:
    `docker run --rm -p 4200:4200 ergotx/ergotx`

## Running locally 

- To run the app you need to first install dependencies

`npm install`

- Then start the app in development mode

`npm run dev`

The app will start on http://localhost:4200

