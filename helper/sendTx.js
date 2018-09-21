const Web3Utils = require('web3-utils')
const fetch = require('node-fetch')
const {
  GET_RECEIPT_INTERVAL_IN_MILLISECONDS
} = process.env

// eslint-disable-next-line consistent-return
async function sendTx({
  rpcUrl,
  privateKey,
  data,
  nonce,
  gasPrice,
  amount,
  gasLimit,
  to,
  chainId,
  web3
}) {
  const serializedTx = await web3.eth.accounts.signTransaction(
    {
      nonce: Number(nonce),
      chainId,
      to,
      data,
      value: Web3Utils.toWei(amount),
      gasPrice: Web3Utils.toWei(gasPrice, 'gwei'),
      gas: gasLimit
    },
    `0x${privateKey}`
  )

  return sendRawTx({
    url: rpcUrl,
    method: 'eth_sendRawTransaction',
    params: [serializedTx.rawTransaction]
  })
}

// eslint-disable-next-line consistent-return
async function sendRawTx({ url, params, method }) {
  // curl -X POST --data '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":[{see above}],"id":1}'
  const request = await fetch(url, {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Math.floor(Math.random() * 100) + 1
    })
  })
  const json = await request.json()
  if (json.error) {
    throw json.error
  }
  return json.result
}

async function getReceipt(txHash, url) {
  await timeout(GET_RECEIPT_INTERVAL_IN_MILLISECONDS);
  let receipt = await sendNodeRequest(url, "eth_getTransactionReceipt", txHash);
  if(receipt === null) {
    receipt = await getReceipt(txHash, url);
  }
  return receipt;
}

async function sendNodeRequest(url, method, signedData){
  const request = await fetch(url, {
    headers: {
      'Content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params: [signedData],
      id: 1
    })
  });
  const json = await request.json()
  if(method === 'eth_sendRawTransaction') {
    assert.equal(json.result.length, 66, `Tx wasn't sent ${json}`)
  }
  return json.result;

}

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  sendTx,
  sendRawTx,
  getReceipt
}
