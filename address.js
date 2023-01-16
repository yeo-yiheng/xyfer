const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const port = 3000

app.use( bodyParser.json() );     

app.use(bodyParser.urlencoded({   
 extended: true})); 
app.use(cors())


app.get('/', (req, res)=>{
res.send(generate());
})


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