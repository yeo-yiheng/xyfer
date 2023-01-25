require('dotenv').config();
const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const Web3 = require("web3");
const web3 = new Web3(rpc_url);

async function transfer(to, amount, abi, contractAddress, deployerAddr, ownerPrivateKey, contract) {
    console.log("Transferring to: " + to);
    const nonce = await web3.eth.getTransactionCount(deployerAddr, 'latest'); 
    
    const tx = {
      'from': to,
      'to': contractAddress,
      'nonce': nonce,
      'gas': 500000,
      'maxPriorityFeePerGas': 1999999987,
      'data': contract.methods.sendERC20(to, amount).encodeABI()
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerPrivateKey);
    console.log("Transaction signed");
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`Transaction receipt: ${JSON.stringify(transactionReceipt)}`);
    return transactionReceipt.transactionHash;
}

module.exports = transfer;
