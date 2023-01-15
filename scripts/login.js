const submitButton = document.querySelector(".login-button");

let cache = window.localStorage;
const currentUserKey = "currentuser";
const accountsKey = "accsystem";
const currentUserDetailKey = "currentuserdetail";
const whitelistKey = "whitelisted";

if (cache.getItem(accountsKey) === null) {
    const accounts = {
        testAccount : "testPassword"
    };
    cache.setItem(accountsKey, JSON.stringify(accounts));
}

const clearButton = document.querySelector(".temp-clear-button");
clearButton.addEventListener("click", (event) => {
    cache.removeItem(accountsKey);    
    cache.removeItem(whitelistKey);
    cache.clear();
    location.reload();
})

submitButton.addEventListener("click", (event) => {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;
    if (usernameInput.length === 0 || passwordInput.length === 0) {
        alert("Username or Password cannot be blank!");
    } else {
        let userdb = JSON.parse(cache.getItem(accountsKey));
        if (userdb[usernameInput] === undefined) {
            alert("No such user!");
        } else if (userdb[usernameInput] !== passwordInput) {
            console.log(userdb);
            alert("Wrong password!");
        } else {
            // Allow login and load details
            cache.setItem(currentUserKey, usernameInput);
            cache.setItem(currentUserDetailKey, cache.getItem(usernameInput));
            window.location.href = "../pages/dashboard.html";
        }
    }
});

// 0xeFB840820e05f8a0868CeEf8a018839980727c0a
console.log(cache.getItem("michew"));
console.log(cache.getItem("branchi"));

