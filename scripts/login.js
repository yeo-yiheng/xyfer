const submitButton = document.querySelector(".login-button");

let cache = window.localStorage;
const currentUserKey = "currentuser";
const accountsKey = "accsystem";

if (cache.getItem(accountsKey) === null) {
    const accounts = {
        testAccount : "testPassword"
    };
    cache.setItem(accountsKey, JSON.stringify(accounts));
}

const clearButton = document.querySelector(".temp-clear-button");
clearButton.addEventListener("click", (event) => {
    cache.removeItem(accountsKey);    
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
            window.location.href = "../pages/dashboard.html";
        }
    }
});


