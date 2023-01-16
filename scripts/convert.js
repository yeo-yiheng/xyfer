
const forms = document.querySelectorAll(".form-select");
let toField = document.querySelector(".to-input");
let fieldArr = document.querySelector(".from-input");
let transferButton = document.querySelector(".transfer-button");
const cache = window.localStorage;

let data;
let fromChosen = false;
let toChosen = false;
let fromValue;
let toValue;
let fromRate;
let toRate;
let sendAmount = 0;
let finalValue = 0;

const appId = 'IqmgcmlID2I3saQUEVaLNaTGRPcERbE2S88MIRYo';
const currentUserDetailKey = "currentuserdetail";
const currentUserKey = "currentuser";
const destKey = "destination";
const whitelistKey = "whitelisted";
const amountKey = "amount";

fetch(`https://api.currencyapi.com/v3/latest?apikey=${appId}`, {
    method: 'GET',
    headers: {},
})
.then(response => response.text())
.then(text => {
    text = JSON.parse(text);
    data = text["data"];
    console.log(data);
    for (let currency in data) {
        let opt1 = document.createElement('option');
        let opt2 = document.createElement('option');
        opt1.innerHTML = currency;
        opt2.innerHTML = currency;
        let turn = false;
        forms.forEach(form => {
            if (turn) {
                form.appendChild(opt1);
            } else {
                form.appendChild(opt2); 
                turn = true;
            }
        });
    }
});

forms.forEach(form => {
    form.addEventListener("change", (event) => {
        const chosen = event.target.value;
        if (form.classList.contains("from")) {
            fromChosen = chosen !== "Select Currency";
            if (fromChosen) {
                fromValue = chosen;
            }
        } else {
            toChosen = chosen !== "Select Currency";
            if (toChosen) {
                toValue = chosen;
            }
        }

        if (fromChosen && toChosen) {
            for (let currency in data) {
                if (currency === fromValue) {
                    let currencyData = data[currency];
                    fromRate = currencyData["value"];
                    console.log(`fromRate: ${fromRate}`);
                } else if (currency === toValue) {
                    let currencyData = data[currency];
                    toRate = currencyData["value"];
                    console.log(`toRate: ${toRate}`);
                }
            }
            let exchangeElement = document.querySelector(".exchange-rate");
            let numFloat = toRate / fromRate;
            let division = parseFloat(numFloat.toString()).toFixed(2);
            exchangeElement.innerHTML = `Exchange Rate: 1 ${fromValue} ≈  ${division} ${toValue}`;
            if (fieldArr.value !== undefined) {
                let currInput = fieldArr.value;
                finalValue = (toRate / fromRate) * currInput;
                toField.placeholder = finalValue;
            }
        }
    });
});

fieldArr.addEventListener("input", (event) => {
    let currInput = event.target.value;
    if (currInput.match("[0-9]")) {
        sendAmount = currInput;
    } else {
        event.target.value = "";
    }
    if (fromChosen && toChosen) {
        finalValue = (toRate / fromRate) * currInput;
        toField.placeholder = finalValue;
    }
});

transferButton.addEventListener("click", e => {
    const currUserDetails = JSON.parse(cache.getItem(currentUserDetailKey)); 
    let balance = currUserDetails.account_state.acc1.Balance;
    balance = balance.replace("$", "");
    balance = parseFloat(balance).toFixed(2);
    if (sendAmount > balance) {
        alert("Insufficient Funds!");
    } else {
        balance -= sendAmount;
        currUserDetails.account_state.acc1.Balance = "$" + balance;
        let currUser = cache.getItem(currentUserKey);
        const userDetailsWrapper = JSON.parse(cache.getItem(currUser));
        userDetailsWrapper.account_state.acc1.Balance = "$" + balance;
        cache.setItem(currUser, JSON.stringify(userDetailsWrapper));
        cache.setItem(currentUserDetailKey, JSON.stringify(currUserDetails));
        let dest = cache.getItem(destKey);
        let target;
        let whitelistArr = JSON.parse(cache.getItem(whitelistKey));
        for (let name in whitelistArr) {
            if (whitelistArr[name] === dest) {
                target = name;
                break;
            }
        }
        let targetDetailsArr = JSON.parse(cache.getItem(target));
        let receiverBalance = targetDetailsArr.account_state.acc1.Balance;
        receiverBalance = receiverBalance.replace("$", "");
        receiverBalance = (parseFloat(receiverBalance) + finalValue).toFixed(2);
        targetDetailsArr.account_state.acc1.Balance = "$" + receiverBalance;
        cache.setItem(target, JSON.stringify(targetDetailsArr));
        cache.setItem(amountKey, `$${sendAmount}`);
        window.location.href = "../pages/success.html";
    }
});