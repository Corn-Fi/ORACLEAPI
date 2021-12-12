const express = require("express");
const app = express()
const cors = require("cors")
const ethers = require("ethers");

//cors
app.use(cors())

//use JSON

app.use(express.json())

//route
const priceOracleRoute = require("./routes/price.js")
app.use('/price', priceOracleRoute)

const stopLossRoute = require("./routes/stoploss.js")
app.use("/stoploss", stopLossRoute)

//run it
const port = 8090 //for local

const PORT = process.env.PORT || 3000 //for prod

app.listen(
    port,
    () => console.log(`SERVER RUNNING ON PORT ${port}`)
)