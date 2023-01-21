const submitButton = document.querySelector(".login-button");
const clearButton = document.querySelector(".temp-clear-button");
const generateBankButton = document.querySelector(".temp-generate-button");
let cache = window.localStorage;
const currentUserKey = "currentuser";

clearButton.addEventListener("click", event => {
    cache.clear();
    location.reload();
});

function generateRandomNumber() {
    return Math.floor(Math.random() * 10000);
}
generateBankButton.addEventListener("click", event => {
    $.ajax({
        method: 'POST',
        async: false,
        url: 'http://localhost:3000/generate-smart-contract',
        data: {bank_name : `Bank ${generateRandomNumber()}`},
        success: function (data) {
            console.log(data);
        }
    });
});

submitButton.addEventListener("click", (event) => {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    if (usernameInput.length === 0 || passwordInput.length === 0) {
        alert("Username or Password cannot be blank!");
    } else {
        $.ajax({
            method: 'POST',
            async: false,
            url: 'http://localhost:3000/verify-login',
            data: { 
                user_name: usernameInput,
                password: passwordInput,
            },
            success: function (data) {
                console.log("Account entry matched with HTTP status " + data);
                cache[currentUserKey] = usernameInput;
                window.location.href = "../pages/dashboard.html";
            },
            error: function (data) {
                if (data['status'] == 418) {
                    alert(`User ${usernameInput} does not exists!`);
                } else {
                    alert(`Incorrect password!`);
                }
            }
        });
        // let userdb = JSON.parse(cache.getItem(accountsKey));
        // // User does not exist
        // if (userdb[usernameInput] === undefined) {
        //     alert("No such user!");
        //     // User exists but password is wrong
        // } else if (userdb[usernameInput] !== passwordInput) {
        //     alert("Wrong password!");
        // } else {
        //     // Stores the current user that is logged in 
        //     cache.setItem(currentUserKey, usernameInput);
        //     // Stores the details of the current user that is logged in
        //     cache.setItem(currentUserDetailKey, cache.getItem(usernameInput));
        //     window.location.href = "../pages/dashboard.html";
        // }
    }
});