# Terra-Bridge-Example
This is an example DApp to interact with a Terra-Bridge  between Ethereum and Terra-Chain testnets using Web3.

## Terminologies
The bridge connects 2 networks, called `Home` and `Foreign`. Home in this case is Terra-Chain testnet, and Foreign is Ethereum Kovan testnet.

The `native currency` is the currency that is used as gas for making transactions. For Home network this is `CLC`, and for Foreign network it is `ETH`.

- To request for test `CLC` tokens, please contact team@contractland.io
- To request for test `ETH` tokens, join https://gitter.im/kovan-testnet/faucet chat and input your receiving address

## Install
`npm install`

## Making Transfers

1. Populate `USER_ADDRESS` and `USER_ADDRESS_PRIVATE_KEY` in `.env`. This is the account where the transfers will be made from. `USER_ADDRESS_PRIVATE_KEY` need to be provided without '0x' prefix.
2. To verify user address balances on both chains, run `node scripts/readBalances.js`. User address need to have native currency (gas) on both networks.
3. Use provided scripts for making transfers between networks:

    - To transfer `ETH` from Ethereum to Terra run: `node scripts/transferETHFromEthereumToTerra.js`
    - To transfer `ETH` from Terra to Ethereum run: `node scripts/transferETHFromTerraToEthereum.js`
    - To transfer `CLC` from Terra to Ethereum run: `node scripts/transferCLCFromTerraToEthereum.js`
    - To transfer `CLC` from Ethereum to Terra run: `node scripts/transferCLCFromEthereumToTerra.js`
