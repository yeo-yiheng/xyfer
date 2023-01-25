require('dotenv').config();
const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const Web3 = require("web3");
const web3 = new Web3(rpc_url);

async function transferGas(receivingAddress) {
    console.log("Funding " + receivingAddress + " with 0.008 GoerliEth");
    const nonce = await web3.eth.getTransactionCount(process.env.DEPLOYER_ADDRESS, 'latest'); 
    
    const tx = {
        nonce: nonce,
        to: receivingAddress,
        value: web3.utils.toHex(web3.utils.toWei('0.008', 'ether')),
        gasLimit: web3.utils.toHex(50000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('50', 'gwei'))
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.DEPLOYER_PRIVATE_KEY);
    console.log("Transaction signed");
    const transactionReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    
    console.log(`Transaction receipt: ${JSON.stringify(transactionReceipt)}`);
}

module.exports = transferGas;
