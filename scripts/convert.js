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
let usdToRate;
let sendAmount = 0;
let finalValue = 0;
let usdValue = 0;

const appId = "85cuBq0REBEVpoFEqGA8cid3yPyCKKkdAADrOazn"; // Should do server side if have time
const currentUserKey = "currentuser";
const destKey = "destination";
const amountKey = "amount";
const hashKey = "hash";

let tmp = document.createElement('div');
let loader = `<div id="loading-wrapper">
            <div id="loading-text">LOADING</div>
            <div id="loading-content"></div>
         </div>`;
tmp.innerHTML = loader;
let background = document.querySelector('.background-wrapper');

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
                console.log("Current currency: " + currency);
                if (currency === fromValue) {
                    let currencyData = data[currency];
                    fromRate = currencyData["value"];
                    console.log(`fromRate: ${fromRate}`);
                } else if (currency === toValue) {
                    let currencyData = data[currency];
                    toRate = currencyData["value"];
                    console.log(`toRate: ${toRate}`);
                } 
                
                if (currency === "USD") {
                    let currencyData = data[currency];
                    usdToRate = currencyData["value"];
                    console.log(`usdToRate: ${toRate}`);
                }
            }
            let exchangeElement = document.querySelector(".exchange-rate");
            let numFloat = toRate / fromRate;
            let usdNumFloat = usdToRate / fromRate;
            let division = parseFloat(numFloat.toString()).toFixed(2);
            let usdDivision = parseFloat(usdNumFloat.toString()).toFixed(2);
            exchangeElement.innerHTML = `Exchange Rate: 1 ${fromValue} ≈  ${division} ${toValue}`;
            if (fieldArr.value !== undefined) {
                let currInput = fieldArr.value;
                finalValue = (toRate / fromRate) * currInput;
                toField.placeholder = finalValue;
                console.log("USD TO RATE: " + usdToRate);
                console.log("USD FROM RATE: " + fromRate);
                console.log("current input: " + currInput);
                usdValue = (usdToRate / fromRate) * currInput;
            }
        }
    });
});

fieldArr.addEventListener("input", (event) => {
    let currInput = event.target.value;
    if (currInput.match("[0-9]")) {
        sendAmount = parseFloat(currInput).toFixed(2);
    } else {
        event.target.value = "";
    }
    if (fromChosen && toChosen) {
        finalValue = (toRate / fromRate) * currInput;
        usdValue = (usdToRate / fromRate) * currInput;
        toField.placeholder = finalValue;
    }
});

transferButton.addEventListener("click", e => {
    background.appendChild(tmp);
    let balance;
    console.log(usdValue);
    setTimeout(() => {
        $.ajax({
            method: 'POST',
            async: false,
            url: 'http://localhost:3000/initiate-dashboard',
            data: { 
                user_name: cache[currentUserKey],
            },
            success: function (data) {
                $.ajax({
                    type: 'get',
                    async: false,
                    url: 'http://localhost:3000/retrieve-bank-details',
                    success: function (data) {
                        balance = data.account_state.acc1.Balance;
                        balance = balance.replace("$", "");
                        balance = parseFloat(balance).toFixed(2);
                        if (+sendAmount > +balance) {
                            background.removeChild(tmp);
                            alert("Insufficient Funds!");
                        } else {
                            balance -= sendAmount;
                            balance = "$" + balance;
                            // Update current user balance
                            $.ajax({
                                method: 'POST',
                                async: false,
                                url: 'http://localhost:3000/update-balance',
                                data: { 
                                    user_name: cache[currentUserKey],
                                    res_balance : balance,
                                },
                                success: function (data) {
                                    console.log(data);
                                }
                            });
    
                            // Update receiver balance
                            $.ajax({
                                method: 'POST',
                                async: false,
                                url: 'http://localhost:3000/update-receiver-balance',
                                data: { 
                                    receiver : cache[destKey],
                                    rcvamt : finalValue
                                },
                                success: function (data) {
                                    console.log(data);
                                }
                            });
                            // Perform blockchain transfer
                            $.ajax({
                                method: 'POST',
                                url: 'http://localhost:3000/xyfer-transfer',
                                async: false,
                                data: {
                                    recipient : cache[destKey],
                                    value : usdValue,
                                    sender : cache[currentUserKey]
                                },
                                success: function(data) {
                                    console.log(data);
                                    cache.setItem(hashKey, data);
                                }
                            });
                            background.removeChild(tmp);
                            cache.setItem(amountKey, `$${sendAmount}`);
                            window.location.href = "../pages/success.html";
                        }
                    }
                });
            }
        });
    }, 1000);
});