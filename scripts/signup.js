const submitButton = document.querySelector(".register-button");
const backButton = document.querySelector(".back-button");
let cache = window.localStorage;
let newAddress;
let resultingBank;

const accountsKey = "accsystem";
const whitelistKey = "whitelisted";

let tmp = document.createElement('div');
let loader = `<div id="loading-wrapper">
            <div id="loading-text">LOADING</div>
            <div id="loading-content"></div>
         </div>`;
tmp.innerHTML = loader;
let background = document.querySelector('.background-wrapper');

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
            background.appendChild(tmp);
            setTimeout(() => {
                $.ajax({
                    type: 'get',
                    async: false,
                    url: 'http://localhost:3000/generate-user-wallet',
                    success: function (data) {
                        newAddress = data;
                        console.log("Wallet generated");
                        $.ajax({
                            type: 'get',
                            async: false,
                            url: 'http://localhost:3000/random-bank',
                            success: function (data) {
                                resultingBank = data;
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
                                            Balance : "500 XFR",
                                        }, 
                                        acc3 : {
                                            Name : "Investments", 
                                            Account : "123-45678-9",
                                            Balance : "$1000",
                                        }
                                    }
                                }

                                console.log(resultingBank.bank);
                                console.log(resultingBank.address);
                
                                $.ajax({
                                    method: 'POST',
                                    async: false,
                                    url: 'http://localhost:3000/sign-up-user',
                                    data: { 
                                        user_name: usernameInput,
                                        password: passwordInput,
                                        bank_name: resultingBank.bank,
                                        bank_address: resultingBank.address,
                                        user_account: JSON.stringify(userDefaultAccounts) 
                                    },
                                    success: function (data) {
                                        background.removeChild(tmp);
                                        console.log("User does not exist, begin creating data entry");
                                        window.location.href = "../pages/login.html";
                                    },
                                    error: function (data) {
                                        background.removeChild(tmp);
                                        alert(`User ${usernameInput} already exists!`);
                                    }
                                });
                            }
                        });
                        
                    }
                });
            }, 1000);
        }
    }
});

backButton.addEventListener('click', e => {
    window.location.href = "../pages/login.html";
})