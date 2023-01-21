const submitButton = document.querySelector(".register-button");
const backButton = document.querySelector(".back-button");
let cache = window.localStorage;
let newAddress;

const accountsKey = "accsystem";
const whitelistKey = "whitelisted";

if (cache.getItem(accountsKey) === null) {
    const accounts = { testAccount : "testPassword" };
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
    // Username or password is blank
    if (usernameInput.length === 0 || passwordInput.length === 0) {
        alert("Username or Password cannot be blank!");
    } else {
        if (passwordInput.length < 8) {
            alert("Password has to be at least 8 characters long!");
        } else {
            $.ajax({
                type: 'get',
                async: false,
                url: 'http://localhost:3000/generate-user-wallet',
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
            
            $.ajax({
                method: 'POST',
                async: false,
                url: 'http://localhost:3000/sign-up-user',
                data: { 
                    user_name: usernameInput,
                    password: passwordInput,
                    user_account: JSON.stringify(userDefaultAccounts) 
                },
                success: function (data) {
                    console.log("User does not exist, begin creating data entry");
                    window.location.href = "../pages/login.html";
                },
                error: function (data) {
                    alert(`User ${usernameInput} already exists!`);
                }
            });
        }
        // let userdb = JSON.parse(cache.getItem(accountsKey));
        // // Username is taken
        // if (userdb[usernameInput] !== undefined) {
        //     alert("User already exists!");
        //     // Password is not at least 8 characters in length
        // } else {
        //     userdb[usernameInput] = passwordInput;
        //     cache.setItem(accountsKey, JSON.stringify(userdb));
        //     cache.setItem(usernameInput, JSON.stringify(userDefaultAccounts)); // Key: Username, Value: User account details

        //     let whitelistedDb = JSON.parse(cache.getItem(whitelistKey));
        //     whitelistedDb[usernameInput] = newAddress;
        //     cache.setItem(whitelistKey, JSON.stringify(whitelistedDb));
        //     window.location.href = "../pages/login.html";
        // }
    }
});

backButton.addEventListener('click', e => {
    window.location.href = "../pages/login.html";
})