let nextButton = document.querySelector(".next-button");
let parentElement = document.querySelector(".account-details-wrapper.to");
let inputElement = document.querySelector(".input-field");
let cache = window.localStorage;

const addressPattern = "0x[a-zA-Z0-9]{40}"
const whitelistKey = "whitelisted";
const currentUserDetailKey = "currentuserdetail";
const destKey = "destination";
const sourceKey = "source";

nextButton.addEventListener("click", e => {
    const dest = inputElement.value;
    // If valid ETH address
    if (dest.match(addressPattern)) {
        let whitelistDb = JSON.parse(cache.getItem(whitelistKey));
        const currUserDetails = JSON.parse(cache.getItem(currentUserDetailKey)); 
        const currUserEthAddr = currUserDetails.account_state.acc2.Account;
        const currUserSource = currUserDetails.account_state.acc1.Account;
        // User sending to own address
        if (dest === currUserEthAddr) {
            alert("You cannot send to your own address!");
        } else {
            let shouldAlert = false;
            for (let user in whitelistDb) {
                let curr = whitelistDb[user];
                if (dest === curr) {
                    cache.setItem(destKey, dest);
                    cache.setItem(sourceKey, currUserSource);
                    shouldAlert = true;
                    window.location.href = "../pages/converter.html";
                }
            }
            // Alert that address is not found in whitelist database
            if (!shouldAlert) {
                alert("Address is not whitelisted!");
            }
        }
    } else {
        alert("Invalid address!")
    }
});
