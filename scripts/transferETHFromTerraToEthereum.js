require('dotenv').config()
const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const { sendTx, sendRawTx } = require('../helper/sendTx')
const HomeBridgeABI = require('../abis/HomeBridge.abi')
const HomeTokenABI = require('../abis/HomeToken.abi')

const {
  USER_ADDRESS,
  USER_ADDRESS_PRIVATE_KEY,
  HOME_BRIDGE_ADDRESS,
  HOME_RPC_URL,
  HOME_MIN_AMOUNT_PER_TX,
  NUMBER_OF_TRANSFERS_TO_SEND,
  HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS
} = process.env

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
const web3Home = new Web3(homeProvider)

const homeBridge = new web3Home.eth.Contract(HomeBridgeABI, HOME_BRIDGE_ADDRESS)
const homeToken = new web3Home.eth.Contract(HomeTokenABI, HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS)

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

  const transferData = await homeBridge.methods
      .transferTokenToForeign(HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS, USER_ADDRESS, Web3Utils.toWei(HOME_MIN_AMOUNT_PER_TX))
      .encodeABI({ from: USER_ADDRESS })

  const txData = await homeToken.methods
      .approveAndCall(HOME_BRIDGE_ADDRESS, Web3Utils.toWei(HOME_MIN_AMOUNT_PER_TX), transferData)
      .encodeABI({ from: USER_ADDRESS })

  const txHash = await sendTx({
    rpcUrl: HOME_RPC_URL,
    privateKey: USER_ADDRESS_PRIVATE_KEY,
    data: txData,
    nonce,
    gasPrice: '1',
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
}
main()
