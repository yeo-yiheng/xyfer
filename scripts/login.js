const submitButton = document.querySelector(".login-button");
const clearButton = document.querySelector(".temp-clear-button");
let cache = window.localStorage;

// Keys for storing, will be shifted into a central KEY file down the line
const currentUserKey = "currentuser";
const accountsKey = "accsystem";
const currentUserDetailKey = "currentuserdetail";
const whitelistKey = "whitelisted";

if (cache.getItem(accountsKey) === null) {
    const accounts = { testAccount : "testPassword" };
    cache.setItem(accountsKey, JSON.stringify(accounts));
}

clearButton.addEventListener("click", event => {
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
        // User does not exist
        if (userdb[usernameInput] === undefined) {
            alert("No such user!");
            // User exists but password is wrong
        } else if (userdb[usernameInput] !== passwordInput) {
            alert("Wrong password!");
        } else {
            // Stores the current user that is logged in 
            cache.setItem(currentUserKey, usernameInput);
            // Stores the details of the current user that is logged in
            cache.setItem(currentUserDetailKey, cache.getItem(usernameInput));
            window.location.href = "../pages/dashboard.html";
        }
    }
});