const submitButton = document.querySelector(".register-button");
let cache = window.localStorage;
const accountsKey = "accsystem";

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
            window.location.href = "../pages/login.html";
        }
    }
});

