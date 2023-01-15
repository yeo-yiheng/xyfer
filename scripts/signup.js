const submitButton = document.querySelector(".register-button");
let cache = window.localStorage;
const accountsKey = "accsystem";

const userDefaultAccounts = {
    account_state : { 
        acc1 : {
            Name : "Savings Account",
            Account : "123-45678-9", 
            Balance : "$1000",
        }, 
        acc2 : {
            Name : "eWallet 1",
            Account : "0x690b9a9e9aa1c9db991c7721a92d351db4fac990", 
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
            window.location.href = "../pages/login.html";
        }
    }
});

