const submitButton = document.querySelector(".login-button");
const clearButton = document.querySelector(".temp-clear-button");
const generateBankButton = document.querySelector(".temp-generate-button");
let cache = window.localStorage;
const currentUserKey = "currentuser";

let tmp = document.createElement('div');
let loader = `<div id="loading-wrapper">
            <div id="loading-text">LOADING</div>
            <div id="loading-content"></div>
         </div>`;
tmp.innerHTML = loader;
let background = document.querySelector('.background-wrapper');

clearButton.addEventListener("click", event => {
    cache.clear();
    location.reload();
});

function generateRandomNumber() {
    return Math.floor(Math.random() * 10000);
}

generateBankButton.addEventListener("click", event => {
    background.appendChild(tmp);
    setTimeout(() => {
        $.ajax({
            method: 'POST',
            async: false,
            url: 'http://localhost:3000/generate-smart-contract',
            data: {bank_name : `Bank ${generateRandomNumber()}`},
            success: function (data) {
                console.log(data);
                background.removeChild(tmp);
            },
            error: function(data) {
                background.removeChild(tmp);
            }
        });
    }, 1000);
});

submitButton.addEventListener("click", (event) => {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    if (usernameInput.length === 0 || passwordInput.length === 0) {
        alert("Username or Password cannot be blank!");
    } else {
        background.appendChild(tmp);
        setTimeout(() => {
            $.ajax({
                method: 'POST',
                async: false,
                url: 'http://localhost:3000/verify-login',
                data: { 
                    user_name: usernameInput,
                    password: passwordInput,
                },
                success: function (data) {
                    background.removeChild(tmp);
                    console.log("Account entry matched with HTTP status " + data);
                    cache[currentUserKey] = usernameInput;
                    window.location.href = "../pages/dashboard.html";
                },
                error: function (data) {
                    background.removeChild(tmp);
                    if (data['status'] == 418) {
                        alert(`User ${usernameInput} does not exists!`);
                    } else {
                        alert(`Incorrect password!`);
                    }
                }
            });
        }, 1000);
    }
});