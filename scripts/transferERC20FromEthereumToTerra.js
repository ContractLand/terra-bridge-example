require('dotenv').config()
const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const assert = require('assert');
const { sendTx, sendRawTx, getReceipt } = require('../helper/sendTx')

const ERC20ABI = require('../abis/ERC20.abi')
const ForeignBridgeABI = require('../abis/ForeignBridge.abi')

const {
  USER_ADDRESS,
  USER_ADDRESS_PRIVATE_KEY,
  FOREIGN_BRIDGE_ADDRESS,
  FOREIGN_RPC_URL,
  FOREIGN_MIN_AMOUNT_PER_TX,
  ERC20_TOKEN_FOREIGN_ADDRESS,
  NUMBER_OF_TRANSFERS_TO_SEND,
  GAS_PRICE
} = process.env

const foreignProvider = new Web3.providers.HttpProvider(FOREIGN_RPC_URL)
const web3Foreign = new Web3(foreignProvider)

const erc20 = new web3Foreign.eth.Contract(ERC20ABI, ERC20_TOKEN_FOREIGN_ADDRESS)
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

  const approveTxHash = await sendApprove(nonce, foreignChaindId)
  const approveReceipt = await getReceipt(approveTxHash, FOREIGN_RPC_URL)
  if (approveReceipt.status == '0x1') {
    nonce++
    actualSent++
    console.log(actualSent, ' # approve: ', approveTxHash)
  }

  const transferTxHash = await sendtransferTokenToHome(nonce, foreignChaindId)
  const transferReceipt = await getReceipt(transferTxHash, FOREIGN_RPC_URL)
  if (transferReceipt.status == '0x1') {
    nonce++
    actualSent++
    console.log(actualSent, ' #: ', transferTxHash)
  }
}

async function sendApprove(nonce, foreignChaindId) {
  const data = await erc20.methods
      .approve(FOREIGN_BRIDGE_ADDRESS, Web3Utils.toWei(FOREIGN_MIN_AMOUNT_PER_TX, 'ether'))
      .encodeABI({ from: USER_ADDRESS })
  return await sendTransaction(data, nonce, foreignChaindId, erc20.options.address)
}

async function sendtransferTokenToHome(nonce, foreignChaindId) {
  const data = await foreignBridge.methods
      .transferTokenToHome(ERC20_TOKEN_FOREIGN_ADDRESS, USER_ADDRESS, Web3Utils.toWei(FOREIGN_MIN_AMOUNT_PER_TX, 'ether'))
      .encodeABI({ from: USER_ADDRESS })
  return await sendTransaction(data, nonce, foreignChaindId, FOREIGN_BRIDGE_ADDRESS)
}

async function sendTransaction(data, nonce, foreignChaindId, to) {
  const txHash = await sendTx({
    rpcUrl: FOREIGN_RPC_URL,
    privateKey: USER_ADDRESS_PRIVATE_KEY,
    data: data,
    nonce,
    gasPrice: Web3Utils.toWei(String(GAS_PRICE), 'wei'),
    amount: '0',
    gasLimit: 100000,
    to,
    web3: web3Foreign,
    chainId: foreignChaindId
  })
  assert(txHash, 'txHash is null!')
  return txHash
}

main()
