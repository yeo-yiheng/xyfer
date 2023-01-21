const cache = window.localStorage;
const currentUserKey = "currentuser";
let currentUser = cache.getItem(currentUserKey);
let userHtml = document.querySelector(".user");
userHtml.innerHTML = currentUser;

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
                const userDetails = data['account_state'];
                for (let account in userDetails) {
                    const currAcc = userDetails[account];
                    const name = currAcc["Name"];
                    const accId = currAcc["Account"];
                    const balance = currAcc["Balance"];
                    setData(account, name, accId, balance);
                }
            }
        });
    }
});

function setData(accx, name, accId, balance) {
    let nameHtml = document.querySelector(`.${accx}-name`);
    let idHtml = document.querySelector(`.${accx}-id`);
    let balHtml = document.querySelector(`.${accx}-balance`);
    nameHtml.innerHTML = name;
    idHtml.innerHTML = accId;
    balHtml.innerHTML = balance;
}