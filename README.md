# whisper-chat-example

This demonstrates how to use the Ethereum Whisper (v5) API. This is the code for [this](https://github.com/llSourcell/Decentralized_Chat) video on Youtube by Siraj Raval

## Running the example

The example assumes that there is a running Whisper v5 node exposing an RPC interface at URL `http://localhost:8545`. For this, you can use `geth` with the folloing parameters:

    $ geth <usual p2p flags> --shh --rpc --rpccorsdomain '*'

`--shh` is the option that enables Whisper v5 for the node.

`--rpc` enables the HTTP RPC interface and `--rplccorsdomain '*'` will disable this annoying CORS verification in the browser. Needless to say, this is only acceptable because this is an example.

Once it's running you can use metamask or alike and connect to your own node (Metamask servers don't expose SHH API) and take advantage of web3 injection.

Then, clone this repository and download the dependencies:

    $ npm install

Finally, start the example with:

    $ npm run dev

The example should be started and the application will be available at `http://localhost:8080`.


## Credits 

Credits for this code go to [gballer](https://github.com/gballet/whisper-chat-example). I've merely created a wrapper to get people started. 
