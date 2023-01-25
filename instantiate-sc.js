require('dotenv').config();
const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const Web3 = require("web3");
const web3 = new Web3(rpc_url);

async function instantiate(abi, contractAddress) {
    console.log("Instantiating smart contract at contract address: " + contractAddress);
    const contract = new web3.eth.Contract(abi, contractAddress); 
    return {
        contract : contract,
        contractAddress : contract.options.address
    };
}

module.exports = instantiate;