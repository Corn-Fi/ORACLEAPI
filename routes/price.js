const express = require("express")
const router = express.Router()
const {aggregatorV3InterfaceABI} = require("../utils/abi")
const {addresses} = require("../utils/addresses")
const {ethers} = require("ethers")
require('dotenv').config()

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

//web3shit



const fetchContract = async (address, abi) => {
    const contract = new ethers.Contract(address, abi, provider);
    console.log(`loaded contract ${contract.address}`);
    return contract;
};//works


const fetchPriceFeed = async (priceFeedAddress) => {
    const ctr = await fetchContract(priceFeedAddress, aggregatorV3InterfaceABI, provider)
    return ctr
}

const getPrice = async (_symbol) => {
    const ctr = await fetchPriceFeed(addresses[_symbol])
    const price = await ctr.latestRoundData()
    return price
}

const mapPriceData = async (priceData) => {
  
        console.log(priceData.roundId)
        const id = ethers.utils.formatUnits(priceData.roundId, 0)
        const answer = ethers.utils.formatUnits(priceData.answer, 8)
        
        const timestamp = ethers.utils.formatUnits(priceData.updatedAt, 0)
        let d = Date(timestamp*1000);
    
        return {
            ID: id,
            time: d,
            price: answer
        }
  
}



//actual route/api endpoint

router.get("/:id", async (req, res) => {

    let symbol = req.params.id
    symbol = symbol.toUpperCase()
    try {
        
        const price = await getPrice(symbol)
        const data = await mapPriceData(price)
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.json(data)
    } catch (err) {
        res.status(500).json({ message: `${err}` })
    }
})

module.exports = [
    router
]