let nextButton = document.querySelector(".next-button");
const parentElement = document.querySelector(".account-details-wrapper.to");
const inputElement = document.querySelector(".input-field");
const addressPattern = "0x[a-zA-Z0-9]{40}"
const cache = window.localStorage;
const whitelistKey = "whitelisted";
const currentUserDetailKey = "currentuserdetail";
const destKey = "destination";
const sourceKey = "source";

nextButton.addEventListener("click", e => {
    const dest = inputElement.value;
    if (dest.match(addressPattern)) {
        let whitelistDb = JSON.parse(cache.getItem(whitelistKey));
        const currUserDetails = JSON.parse(cache.getItem(currentUserDetailKey)); 
        const currUserAccs = currUserDetails["account_state"];
        const currUserEthAcc = currUserAccs["acc2"];
        const currUserEthAddr = currUserEthAcc["Account"];
        let currUserSource = currUserAccs.acc1.Account;
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
            if (!shouldAlert) {
                alert("Address is not whitelisted!");
            }
        }
    } else {
        const currUserDetails = JSON.parse(cache.getItem(currentUserDetailKey)); 
        const currUserAccs = currUserDetails["account_state"];
        const currUserEthAcc = currUserAccs["acc2"];
        const currUserEthAddr = currUserEthAcc["Account"];
        console.log(currUserEthAddr);
        alert("Invalid address!")
    }
});
