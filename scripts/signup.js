const submitButton = document.querySelector(".register-button");
let cache = window.localStorage;
const accountsKey = "accsystem";
const whitelistKey = "whitelisted";
let newAddress;

$.ajax({
    type: 'get',
    async: false,
    url: 'http://localhost:3000',
    success: function (data) {
        newAddress = data;
    }
});

const userDefaultAccounts = {
    account_state : { 
        acc1 : {
            Name : "Savings Account",
            Account : "123-45678-9", 
            Balance : "$1000",
        }, 
        acc2 : {
            Name : "eWallet 1",
            Account : `${newAddress}`, 
            Balance : "500 USDT",
        }, 
        acc3 : {
            Name : "Investments", 
            Account : "123-45678-9",
            Balance : "$1000",
        }
    }
}

if (cache.getItem(accountsKey) === null) {
    const accounts = {
        testAccount : "testPassword"
    };
    cache.setItem(accountsKey, JSON.stringify(accounts));
}

if (cache.getItem(whitelistKey) === null) {
    const addresses = {
        username : `0x0000000000000000000000000000000000000000`
    };
    cache.setItem(whitelistKey, JSON.stringify(addresses));
}

submitButton.addEventListener("click", (event) => {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    if (usernameInput.length === 0 || passwordInput.length === 0) {
        alert("Username or Password cannot be blank!");
    } else {
        let userdb = JSON.parse(cache.getItem(accountsKey));
        if (userdb[usernameInput] !== undefined) {
            alert("User already exists!");
        } else if (passwordInput.length < 8) {
            alert("Password has to be at least 8 characters long!");
        } else {
            userdb[usernameInput] = passwordInput;
            cache.setItem(accountsKey, JSON.stringify(userdb));
            cache.setItem(usernameInput, JSON.stringify(userDefaultAccounts));
            let whitelistedDb = JSON.parse(cache.getItem(whitelistKey));
            whitelistedDb[usernameInput] = newAddress;
            cache.setItem(whitelistKey, JSON.stringify(whitelistedDb));
            window.location.href = "../pages/login.html";
        }
    }
});

