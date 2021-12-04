const express = require("express");
const app = express()

const ethers = require("ethers");



//use JSON
app.use(express.json())

//route
const ethOracleRoute = require("./routes/eth")
app.use('/', ethOracleRoute)


//run it
PORT = 8090

app.listen(
    PORT,
    () => console.log(`SERVER RUNNING ON PORT ${PORT}`)
)