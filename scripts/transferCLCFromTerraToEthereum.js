require('dotenv').config()
const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const { sendTx, sendRawTx } = require('../helper/sendTx')
const HomeBridgeABI = require('../abis/HomeBridge.abi')
const ERC20ABI = require('../abis/ERC20.abi')

const {
  USER_ADDRESS,
  USER_ADDRESS_PRIVATE_KEY,
  HOME_BRIDGE_ADDRESS,
  HOME_RPC_URL,
  HOME_MIN_AMOUNT_PER_TX,
  NUMBER_OF_TRANSFERS_TO_SEND,
  GAS_PRICE,
  HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS
} = process.env

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
const web3Home = new Web3(homeProvider)

const homeBridge = new web3Home.eth.Contract(HomeBridgeABI, HOME_BRIDGE_ADDRESS)
const homeTokenForForeignNative = new web3Home.eth.Contract(ERC20ABI, HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS)

async function main() {
  const homeChaindId = await sendRawTx({
    url: HOME_RPC_URL,
    params: [],
    method: 'net_version'
  })
  let nonce = await sendRawTx({
    url: HOME_RPC_URL,
    method: 'eth_getTransactionCount',
    params: [USER_ADDRESS, 'latest']
  })
  nonce = Web3Utils.hexToNumber(nonce)
  let actualSent = 0

  const transferFeeInWei = await homeBridge.methods.transferFee.call().call()
  const approveData = await homeTokenForForeignNative.methods
      .approve(HOME_BRIDGE_ADDRESS, transferFeeInWei)
      .encodeABI({ from: USER_ADDRESS })
  let txHash = await sendTx({
    rpcUrl: HOME_RPC_URL,
    privateKey: USER_ADDRESS_PRIVATE_KEY,
    data: approveData,
    nonce,
    gasPrice: GAS_PRICE,
    amount: '0',
    gasLimit: 100000,
    to: HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS,
    web3: web3Home,
    chainId: homeChaindId
  })
  if (txHash !== undefined) {
    nonce++
    actualSent++
    console.log(actualSent, ' # ', txHash)
  }

  const transferData = await homeBridge.methods
      .transferNativeToForeign(USER_ADDRESS)
      .encodeABI({ from: USER_ADDRESS })
  txHash = await sendTx({
    rpcUrl: HOME_RPC_URL,
    privateKey: USER_ADDRESS_PRIVATE_KEY,
    data: transferData,
    nonce,
    gasPrice: GAS_PRICE,
    amount: HOME_MIN_AMOUNT_PER_TX,
    gasLimit: 100000,
    to: HOME_BRIDGE_ADDRESS,
    web3: web3Home,
    chainId: homeChaindId
  })
  if (txHash !== undefined) {
    nonce++
    actualSent++
    console.log(actualSent, ' # ', txHash)
  }
}

main()
