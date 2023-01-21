const database_keys = require('./constants/key');
const db = require('./database/database')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 3000
const HTTP_USER_NOT_FOUND = 418;
const HTTP_INVALID_PASSWORD = 419;
const HTTP_DUPLICATE_USER = 420;
let currUser;

app.use( bodyParser.json() );     
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors());

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
    const options = {
        // projection : {address:1}
    };
    let pr = db.queryCollection(doc, options, database_keys.bank_database, database_keys.bank_addresses_collection);
    res.send(pr);
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
        console.log("Result is : " + result);
        if (result == null) {
            let doc = JSON.parse(req.body['user_account']);
            doc['name'] = user_name;
            doc['password'] = req.body['password'];
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
        console.log("Result is : " + result);
        if (result == null) {
            res.sendStatus(HTTP_USER_NOT_FOUND);
        } else {
            let pw = result['password'];
            console.log(`Comparing ${pw} and ${req.body['password']}`);
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
    console.log("Populate with details of " + currUser);
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
            console.log("Address not found");
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
    console.log("Curr User: " + currUser)
    console.log("Balance: " + balance);
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

app.listen(port, () => {
    console.log(`Server is runing on port ${port}`)
});