let nextButton = document.querySelector(".next-button");
let parentElement = document.querySelector(".account-details-wrapper.to");
let inputElement = document.querySelector(".input-field");
let cache = window.localStorage;

const addressPattern = "0x[a-zA-Z0-9]{40}"
const currentUserKey = "currentuser";
const destKey = "destination";
const sourceKey = "source";

nextButton.addEventListener("click", e => {
    const dest = inputElement.value;
    // If valid ETH address
    if (dest.match(addressPattern)) {
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
                        cache.setItem(destKey, dest);
                        cache.setItem(sourceKey, data);     
                        window.location.href = "../pages/converter.html";
                    }
                });
            },
            error: function (data) {
                if (data['status'] == 400) {
                    alert("Address is not whitelisted!");
                } else {
                    alert("You cannot send to your own address");
                }
            }
        });
    } else {
        alert("Invalid address format!")
    }
});
