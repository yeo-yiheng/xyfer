require('dotenv').config();
const fs = require('fs');
const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const Web3 = require("web3");
const web3 = new Web3(rpc_url);

async function mint(sendingAddress, amount, privateKey) {
    const contractABI = JSON.parse(fs.readFileSync('./contracts/abi/XyferABI.json', 'utf-8'));
    const contract = new web3.eth.Contract(contractABI, process.env.TOKEN_ADDRESS); 
    const nonce = await web3.eth.getTransactionCount(sendingAddress, 'latest'); 
    
    const tx = {
      'from': sendingAddress,
      'to': process.env.TOKEN_ADDRESS,
      'nonce': nonce,
      'gas': 500000,
      'maxPriorityFeePerGas': 1999999987,
      'data': contract.methods.mint(sendingAddress, amount).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    console.log("Transaction signed");
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`Transaction receipt: ${JSON.stringify(transactionReceipt)}`);
}

module.exports = mint;