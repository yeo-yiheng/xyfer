function generate() {
    let ethers = require('ethers');  
    let crypto = require('crypto');
    let id = crypto.randomBytes(32).toString('hex');
    let privateKey = "0x"+id;
    let wallet = new ethers.Wallet(privateKey);
    return { wa : wallet.address, wpk : privateKey };
}

module.exports = generate;