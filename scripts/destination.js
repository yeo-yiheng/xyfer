let nextButton = document.querySelector(".next-button");
const parentElement = document.querySelector(".account-details-wrapper.to");
const inputElement = document.querySelector(".input-field");
const addressPattern = "0x[a-zA-Z0-9]{40}"

nextButton.addEventListener("click", e => {
    // Do some destination address validation
    const dest = inputElement.value;
    if (dest.match(addressPattern)) {
        window.location.href = "../pages/converter.html"
    } else {
        alert("Invalid address!")
    }
});