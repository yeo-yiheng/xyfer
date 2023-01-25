const cache = window.localStorage;
const destKey = "destination";
const sourceKey = "source";
const amountKey = "amount";
const hashKey = "hash";

let dest = cache.getItem(destKey);
let source = cache.getItem(sourceKey);
let amt = cache.getItem(amountKey);
let txHash = cache.getItem(hashKey);
let fromElement = document.querySelector(".from-data");
let toElement = document.querySelector(".to-data");
let amountElement = document.querySelector(".amount-data");
let blockExpElement = document.querySelector(".block-explorer");

fromElement.innerHTML = source;
toElement.innerHTML = dest;
amountElement.innerHTML = amt;

blockExpElement.addEventListener('click', e => {
    e.preventDefault();
    window.location = `https://goerli.etherscan.io/tx/${txHash}`;
});

for (var i = 0; i < localStorage.length; i++){
    console.log(`${localStorage.key(i)} is ${localStorage.getItem(localStorage.key(i))}`);
}
