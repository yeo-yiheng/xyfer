
const appId = 'IqmgcmlID2I3saQUEVaLNaTGRPcERbE2S88MIRYo';
const forms = document.querySelectorAll(".form-select");
let data;
let toField = document.querySelector(".to-input");
let fieldArr = document.querySelector(".from-input");
let transferButton = document.querySelector(".transfer-button");

fetch(`https://api.currencyapi.com/v3/latest?apikey=${appId}`, {
    method: 'GET',
    headers: {

    },
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

let fromChosen = false;
let toChosen = false;
let fromValue;
let toValue;
let fromRate;
let toRate;
let sendAmount = 0;
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
            exchangeElement.innerHTML = `Exchange Rate: ${division} ${toValue} per 1 ${fromValue}`;
            if (fieldArr.value !== undefined) {
                let currInput = fieldArr.value;
                let finalValue = (toRate / fromRate) * currInput;
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
        let finalValue = (toRate / fromRate) * currInput;
        toField.placeholder = finalValue;
    }
});

transferButton.addEventListener("click", e => {
    let balance = 1000;
    if (sendAmount > balance) {
        alert("Insufficient Funds!");
    } else {
        // Store balance - sendAmount back into local cache of current user account balance
        // Update other user account balance + sendAmount
        // Replace alert with transaction page
        alert("Transfer successful!");
    }
})