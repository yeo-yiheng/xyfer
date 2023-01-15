const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 3000
// We are using our packages here
app.use( bodyParser.json() );       // to support JSON-encoded bodies

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
 extended: true})); 
app.use(cors())

//You can use this to check if your server is working
app.get('/', (req, res)=>{
res.send(generate());
})

//Start your server on a specified port
app.listen(port, ()=>{
    console.log(`Server is runing on port ${port}`)
})


function generate() {
    var ethers = require('ethers');  
    var crypto = require('crypto');
    
    var id = crypto.randomBytes(32).toString('hex');
    var privateKey = "0x"+id;
    
    var wallet = new ethers.Wallet(privateKey);
    return wallet.address;
}