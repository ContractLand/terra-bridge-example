require('dotenv').config()
const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const { sendTx, sendRawTx } = require('../helper/sendTx')
const ForeignBridgeABI = require('../abis/ForeignBridge.abi')

const {
  USER_ADDRESS,
  USER_ADDRESS_PRIVATE_KEY,
  FOREIGN_BRIDGE_ADDRESS,
  FOREIGN_RPC_URL,
  FOREIGN_MIN_AMOUNT_PER_TX,
  NUMBER_OF_TRANSFERS_TO_SEND,
  GAS_PRICE
} = process.env

const foreignProvider = new Web3.providers.HttpProvider(FOREIGN_RPC_URL)
const web3Foreign = new Web3(foreignProvider)

const foreignBridge = new web3Foreign.eth.Contract(ForeignBridgeABI, FOREIGN_BRIDGE_ADDRESS)

async function main() {
  const foreignChaindId = await sendRawTx({
    url: FOREIGN_RPC_URL,
    params: [],
    method: 'net_version'
  })
  let nonce = await sendRawTx({
    url: FOREIGN_RPC_URL,
    method: 'eth_getTransactionCount',
    params: [USER_ADDRESS, 'latest']
  })
  nonce = Web3Utils.hexToNumber(nonce)
  let actualSent = 0

  const data = await foreignBridge.methods
      .transferNativeToHome(USER_ADDRESS)
      .encodeABI({ from: USER_ADDRESS })
  const txHash = await sendTx({
    rpcUrl: FOREIGN_RPC_URL,
    privateKey: USER_ADDRESS_PRIVATE_KEY,
    data: data,
    nonce,
    gasPrice: GAS_PRICE,
    amount: FOREIGN_MIN_AMOUNT_PER_TX,
    gasLimit: 50000,
    to: FOREIGN_BRIDGE_ADDRESS,
    web3: web3Foreign,
    chainId: foreignChaindId
  })
  if (txHash !== undefined) {
    nonce++
    actualSent++
    console.log(actualSent, ' # ', txHash)
  }
}

main()
