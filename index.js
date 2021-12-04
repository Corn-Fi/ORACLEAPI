const express = require("express");
const app = express()

const ethers = require("ethers");



//use JSON
app.use(express.json())

//route
const ethOracleRoute = require("./routes/eth")
app.use('/', ethOracleRoute)


//run it
const port = 8090

const PORT = process.env.PORT || 3000

app.listen(
    PORT,
    () => console.log(`SERVER RUNNING ON PORT ${PORT}`)
)