require('dotenv').config()
const Web3 = require('web3')
const Web3Utils = require('web3-utils')
const erc20Abi = require('../abis/ERC20.abi.json');
const HomeBridgeABI = require('../abis/HomeBridge.abi')
const ForeignBridgeABI = require('../abis/ForeignBridge.abi')

const {
  USER_ADDRESS,
  HOME_RPC_URL,
  FOREIGN_RPC_URL,
  HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS,
  FOREIGN_TOKEN_FOR_HOME_NATIVE_ADDRESS,
  ERC20_TOKEN_HOME_ADDRESS,
  ERC20_TOKEN_FOREIGN_ADDRESS,
  HOME_BRIDGE_ADDRESS,
  FOREIGN_BRIDGE_ADDRESS
} = process.env

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
const web3Home = new Web3(homeProvider)
const homeTokenContract = new web3Home.eth.Contract(erc20Abi, HOME_TOKEN_FOR_FOREIGN_NATIVE_ADDRESS)
const erc20TokenHomeContract = new web3Home.eth.Contract(erc20Abi, ERC20_TOKEN_HOME_ADDRESS)
const homeBridgeContract = new web3Home.eth.Contract(HomeBridgeABI, HOME_BRIDGE_ADDRESS)

const foreignProvider = new Web3.providers.HttpProvider(FOREIGN_RPC_URL)
const web3Foreign = new Web3(foreignProvider)
const foreignTokenContract = new web3Foreign.eth.Contract(erc20Abi, FOREIGN_TOKEN_FOR_HOME_NATIVE_ADDRESS)
const erc20TokenForeignContract = new web3Foreign.eth.Contract(erc20Abi, ERC20_TOKEN_FOREIGN_ADDRESS)
const foreignBridgeContract = new web3Foreign.eth.Contract(ForeignBridgeABI, FOREIGN_BRIDGE_ADDRESS)

async function main() {
  const homeEth = await web3Home.eth.getBalance(USER_ADDRESS);
  console.log(`Home CLC (native) balance: ${web3Home.utils.fromWei(homeEth).toString()}`);

  const homeToken = await homeTokenContract.methods.balanceOf(USER_ADDRESS).call();
  console.log(`Home ETH (token) balance: ${web3Home.utils.fromWei(homeToken)}`)

  const homeBridgeFeeCollected = await homeBridgeContract.methods.feeCollected.call().call()
  console.log(`HomeBridge fee collected: ${web3Home.utils.fromWei(homeBridgeFeeCollected)}`)

  const foreignEth = await web3Foreign.eth.getBalance(USER_ADDRESS);
  console.log(`Foreign ETH (native) balance: ${web3Foreign.utils.fromWei(foreignEth).toString()}`);

  const foreignToken = await foreignTokenContract.methods.balanceOf(USER_ADDRESS).call();
  console.log(`Foreign CLC (token) balance: ${web3Foreign.utils.fromWei(foreignToken)}`)

  const foreignBridgeFeeCollected = await foreignBridgeContract.methods.feeCollected.call().call()
  console.log(`ForeignBridge fee collected: ${web3Foreign.utils.fromWei(foreignBridgeFeeCollected)}`)
}
main()
