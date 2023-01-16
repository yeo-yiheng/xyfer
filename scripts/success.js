const cache = window.localStorage;
const destKey = "destination";
const sourceKey = "source";
const amountKey = "amount";

let dest = cache.getItem(destKey);
let source = cache.getItem(sourceKey);
let amt = cache.getItem(amountKey);
let fromElement = document.querySelector(".from-data");
let toElement = document.querySelector(".to-data");
let amountElement = document.querySelector(".amount-data");

fromElement.innerHTML = source;
toElement.innerHTML = dest;
amountElement.innerHTML = amt;
