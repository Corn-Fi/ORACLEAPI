const express = require("express");
const app = express()
const cors = require("cors")
const ethers = require("ethers");

//cors
app.use(cors())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

//use JSON

app.use(express.json())

//route
const priceOracleRoute = require("./routes/price.js")
app.use('/price', priceOracleRoute)

const limitRoute = require("./routes/limit.js")
app.use("/limit", limitRoute)

const stopRoute = require("./routes/stop.js")
app.use("/stop", stopRoute)

const accDistRoute = require("./routes/accdist.js")
app.use("/accumulatordistributor", accDistRoute)

const chef = require("./routes/chef.js")
app.use("/chef", chef)

const equityRouter = require("./routes/equityRouter")
app.use("/router", equityRouter)

//run it
const port = 8090 //for local

const PORT = process.env.PORT || 3000 //for prod

app.listen(
    port,
    () => console.log(`SERVER RUNNING ON PORT ${port}`)
)