require('dotenv').config();
const Web3 = require('web3');

const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const web3 = new Web3(rpc_url);

async function deploy(abi, bytecode, privateKey) {
    console.log("Deploying contract");
    let deploy_contract = new web3.eth.Contract(abi);
    let tx = deploy_contract.deploy({
        data: bytecode,
        arguments: [process.env.TOKEN_ADDRESS]
    });
    const createTransaction = await web3.eth.accounts.signTransaction(
        {
            data: tx.encodeABI(),
            gas: await tx.estimateGas()
        },
        privateKey
    );
    const receipt = await web3.eth.sendSignedTransaction(createTransaction.rawTransaction);
    const cAddress = receipt.contractAddress;
    console.log(`Contract deployed at address: ${cAddress}`);
    deploy_contract.options.address = cAddress;
    return {
        address : cAddress,
        contract: deploy_contract
    };
}

module.exports = deploy;