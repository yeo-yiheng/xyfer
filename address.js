const database_keys = require('./constants/key');
const db = require('./database/database');
const minter = require('./init-mint');
const funder = require('./fund-gas');
const compiler = require('./compile-sc');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();
const Tx = require('ethereumjs-tx');
const approver = require('./approval');
const transfer = require('./transfer');
const instantiate = require('./instantiate-sc');

const rpc_url = `https://goerli.infura.io/v3/${process.env.INFURA_API}`; 
const Web3 = require("web3");
const deployer = require('./deploy-sc');
const deposit = require('./deposit');
const web3 = new Web3(rpc_url);

const port = process.env.PORT; 
const HTTP_USER_NOT_FOUND = 418;
const HTTP_INVALID_PASSWORD = 419;
const HTTP_DUPLICATE_USER = 420;
let currUser;

app.use( bodyParser.json() );     
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Generates user wallets
app.get('/generate-user-wallet', (req, res)=>{
    const wallet = require('./generate-wallet')();
    res.send(wallet.wa);
});

// Generates a smart contract for banks
app.post('/generate-smart-contract', (req, res) => {
    const wallet = require('./generate-wallet')();
    const bank_name = req.body['bank_name'];
    db.createDatabase(database_keys.bank_database);
    db.createCollection(database_keys.bank_database, database_keys.bank_addresses_collection);
    let doc = {
        bank : bank_name,
        address : wallet.wa,
        privateKey : wallet.wpk
    }

    db.insertDocument(doc, database_keys.bank_database, database_keys.bank_addresses_collection);
    const options = {};
    db.queryCollection(doc, options, database_keys.bank_database, database_keys.bank_addresses_collection);
    funder(wallet.wa).then(result => {
        const baseContractPath = "./contracts/src/XyferSend.sol";
        let abi;
        let bytecode;
        compiler(baseContractPath).then(result => {
            abi = result.abi;
            bytecode = result.bytecode;
            deployer(abi, bytecode, wallet.wpk).then(obj => {
                console.log("Deployment done");
                approver(wallet.wa, BigInt(10000*10**18), wallet.wpk, wallet.wa).then(ret1 => {
                    console.log("Bank wallet approved");         
                    minter(wallet.wa, BigInt(10000*(10**18)), wallet.wpk).then(result => {
                        const filter = { bank : bank_name };
                        const updateDoc = {
                            $set : {
                                send_abi: JSON.stringify(abi),
                                send_bytecode: bytecode,
                                send_contract_address: obj.address,
                                smart_contract: JSON.stringify(obj.contract)
                            }
                        };
                        db.updateDocument(filter, updateDoc, {}, database_keys.bank_database, database_keys.bank_addresses_collection);  
                        console.log("Bank onboarding completed!");
                        res.sendStatus(200);
                    });
                });
            });
        });
    });
});

app.post('/sign-up-user', (req, res) => {
    const user_name = req.body['user_name'];
    let query = {
        name : user_name
    };
    console.log("Querying for user: " + user_name);
    const options = {};
    db.createDatabase(database_keys.user_database);
    db.createCollection(database_keys.user_database, database_keys.user_details_collection);
    db.queryCollection(query, options, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result == null) {
            let doc = JSON.parse(req.body['user_account']);
            doc['name'] = user_name;
            doc['password'] = req.body['password'];
            doc['bank_name'] = req.body['bank_name'];
            doc['bank_address'] = req.body['bank_address'];
            db.insertDocument(doc, database_keys.user_database, database_keys.user_details_collection);
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });
});

app.post('/verify-login', (req, res) => {
    const username = req.body['user_name'];
    let query = {
        name : username
    };
    const options = {
        projection : { password : 1 }
    };
    db.queryCollection(query, options, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result == null) {
            res.sendStatus(HTTP_USER_NOT_FOUND);
        } else {
            let pw = result['password'];
            if (req.body['password'] == pw) {
                res.sendStatus(200);
            } else {
                res.sendStatus(HTTP_INVALID_PASSWORD);
            }
        }
    });
});

app.post('/initiate-dashboard', (req, res) => {
    currUser = req.body['user_name'];
    res.sendStatus(200);
});

app.get('/retrieve-bank-details', (req, res) => {
    console.log("Populate dashboard with details of " + currUser);
    let query = {
        name : currUser
    };
    const options = {
        projection : { account_state : 1 }
    };
    db.queryCollection(query, options, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result != null) {
            res.send(result);
        }
    });
});

app.post('/verify-whitelisted-address', (req, res) => {
    const address = req.body['address'];
    let query = {
        "account_state.acc2.Account": address
    };
    let option = {
        projection : { "account_state.acc2.Name" : 1 }
    };
    db.queryCollection(query, option, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result == null) {
            res.sendStatus(400)
        } else {
            currUser = req.body['username'];
            let query = {
                name : currUser,
                "account_state.acc2.Account": address
            };
            db.queryCollection(query, {}, database_keys.user_database, database_keys.user_details_collection)
            .then(result => {
                if (result != null) {
                    res.sendStatus(HTTP_DUPLICATE_USER);
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
});

app.get('/retrieve-my-address', (req, res) => {
    let query = {
        name : currUser
    };
    const options = {
        projection : { account_state : 1 }
    };
    db.queryCollection(query, options, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result != null) {
            res.send(result.account_state.acc2.Account);
        }
    });
});

app.post('/update-balance', (req, res) => {
    let currUser = req.body['user_name'];
    let balance = req.body['res_balance'];
    let query = {
        name : currUser
    };
    const options = {
        projection : { account_state : 1 }
    };
    db.queryCollection(query, options, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        if (result != null) {
            const filter = { name : currUser };
            result.account_state.acc1.Balance = balance;
            const updateDoc = {
                $set : {
                    account_state : result['account_state']
                }
            };
            db.updateDocument(filter, updateDoc, {}, database_keys.user_database, database_keys.user_details_collection);  
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });
});

app.post('/update-receiver-balance', (req, res) => {
    let receiver = req.body['receiver'];
    let receivingAmount = req.body['rcvamt'];
    let query = {
        "account_state.acc2.Account": receiver
    };
    db.queryCollection(query, {}, database_keys.user_database, database_keys.user_details_collection)
    .then(result => {
        let originalBalance = result.account_state.acc1.Balance;
        originalBalance = originalBalance.replace("$", "");
        originalBalance = parseFloat(originalBalance).toFixed(2);
        originalBalance = +originalBalance + +parseFloat(receivingAmount).toFixed(2);
        originalBalance = "$" + parseFloat(originalBalance).toFixed(2);
        result.account_state.acc1.Balance = originalBalance;
        const updateDoc = {
            $set: {
                account_state : result['account_state']
            }
        }
        const filter = {
            "account_state.acc2.Account" : receiver
        }
        db.updateDocument(filter, updateDoc, {}, database_keys.user_database, database_keys.user_details_collection);
        res.sendStatus(200);
    });
});

app.post('/xyfer-transfer', (req, res) => {
    let amount = parseFloat(req.body['value']).toFixed(2);
    let receiver = req.body['recipient'];
    let sender = req.body['sender'];
    let queryReceiver = {
        'account_state.acc2.Account' : receiver
    };
    let optionsReceiver = {
        projection : { bank_address : 1 }
    };
    let destinationAddr;
    let sendingBankAddress;
    db.queryCollection(queryReceiver, optionsReceiver, database_keys.user_database, database_keys.user_details_collection).then(result => {
        destinationAddr = result.bank_address;
        let querySender = {
            name : sender
        };
        let optionsSender = {
            projection : { bank_address : 1 }
        }
        db.queryCollection(querySender, optionsSender, database_keys.user_database, database_keys.user_details_collection).then(senderResult => {
            sendingBankAddress = senderResult.bank_address;
            let query = {
                address : sendingBankAddress
            };
            const options = {
                projection : { privateKey : 1, send_abi : 1, send_contract_address : 1, smart_contract : 1 }
            };
            db.queryCollection(query, options, database_keys.bank_database, database_keys.bank_addresses_collection).then(result => {
                const pKey = result['privateKey'];
                const abi = result['send_abi'];
                const contractAddress = result['send_contract_address'];
                instantiate(JSON.parse(abi), contractAddress).then(contractObj => {
                    approver(contractObj.contractAddress, BigInt(10000*10**18), pKey, sendingBankAddress).then(ret2 => {
                        console.log("Smart contract approved");
                        deposit(sendingBankAddress, BigInt(10**18 * amount), JSON.parse(abi), contractObj.contractAddress, sendingBankAddress, pKey, contractObj.contract).then(() => {
                            console.log("Deposit success");
                            transfer(destinationAddr, BigInt(amount * (10**18)), JSON.parse(abi), contractObj.contractAddress, sendingBankAddress, pKey, contractObj.contract).then(hash => {
                                console.log("Transfer success");
                                res.send(hash);
                            })
                        });
                    });
                });
            });
        });
    });
});

app.get('/random-bank', (req, res) => {
    let randomBankIndex = getRandomInt(2);
    const options = {};
    let doc = {}
    db.queryCollectionAll(doc, options, database_keys.bank_database, database_keys.bank_addresses_collection, randomBankIndex)
    .then(result => {
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Server is runing on port ${port}`) 
});