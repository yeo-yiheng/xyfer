let nextButton = document.querySelector(".next-button");
let parentElement = document.querySelector(".account-details-wrapper.to");
let inputElement = document.querySelector(".input-field");
let cache = window.localStorage;

const addressPattern = "0x[a-zA-Z0-9]{40}"
const currentUserKey = "currentuser";
const destKey = "destination";
const sourceKey = "source";

let tmp = document.createElement('div');
let loader = `<div id="loading-wrapper">
            <div id="loading-text">LOADING</div>
            <div id="loading-content"></div>
         </div>`;
tmp.innerHTML = loader;
let background = document.querySelector('.mask');

nextButton.addEventListener("click", e => {
    const dest = inputElement.value;
    // If valid ETH address
    if (dest.match(addressPattern)) {
        background.appendChild(tmp);
        setTimeout(() => {
            $.ajax({
                method: 'POST',
                async: false,
                url: 'http://localhost:3000/verify-whitelisted-address',
                data: { 
                    address : dest,
                    username : cache[currentUserKey]
                },
                success: function (data) {
                    $.ajax({
                        type: 'get',
                        async: false,
                        url: 'http://localhost:3000/retrieve-my-address',
                        success: function (data) {
                            background.removeChild(tmp);
                            cache[destKey] = dest;
                            cache[sourceKey] = data;  
                            window.location.href = "../pages/converter.html";
                        }
                    });
                },
                error: function (data) {
                    background.removeChild(tmp);
                    if (data['status'] == 400) {
                        alert("Address is not whitelisted!");
                    } else {
                        alert("You cannot send to your own address");
                    }
                }
            });
        }, 1000)
    } else {
        alert("Invalid address format!")
    }
});
