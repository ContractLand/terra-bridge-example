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
  ERC20_TOKEN_HOME_ADDRESS,
  GAS_PRICE
} = process.env

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
const web3Home = new Web3(homeProvider)

const homeBridge = new web3Home.eth.Contract(HomeBridgeABI, HOME_BRIDGE_ADDRESS)
const homeToken = new web3Home.eth.Contract(HomeTokenABI, ERC20_TOKEN_HOME_ADDRESS)

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
      .transferTokenToForeign(ERC20_TOKEN_HOME_ADDRESS, USER_ADDRESS, Web3Utils.toWei(HOME_MIN_AMOUNT_PER_TX))
      .encodeABI({ from: USER_ADDRESS })

  const txData = await homeToken.methods
      .transferAndCall(HOME_BRIDGE_ADDRESS, Web3Utils.toWei(HOME_MIN_AMOUNT_PER_TX), transferData)
      .encodeABI({ from: USER_ADDRESS })

  try {
    const txHash = await sendTx({
      rpcUrl: HOME_RPC_URL,
      privateKey: USER_ADDRESS_PRIVATE_KEY,
      data: txData,
      nonce,
      gasPrice: Web3Utils.toWei(String(GAS_PRICE), 'wei'),
      amount: '0',
      gasLimit: 100000,
      to: ERC20_TOKEN_HOME_ADDRESS,
      web3: web3Home,
      chainId: homeChaindId
    })
    if (txHash !== undefined) {
      nonce++
      actualSent++
      console.log(actualSent, ' # ', txHash)
    }
  } catch (e) {
    console.log(e)
  }
}
main()
