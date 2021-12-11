const {aggregatorV3InterfaceABI, ERC20Abi, mockERC20Abi} = require("../utils/abi.js")
const {addresses} = require("../utils/addresses.js")
const {ethers} = require("ethers")
const axios = require("axios")
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

const getPrice = async () => {
    const ctr = await fetchPriceFeed(addresses["ETH"])
    const price = await ctr.latestRoundData()
    return price
}

const mapPriceData = async (priceData) => {
  
        console.log(priceData.roundId)
        const id = ethers.utils.formatUnits(priceData.roundId, 0)
        const answer = ethers.utils.formatUnits(priceData.answer, 8)
        
        const timestamp = ethers.utils.formatUnits(priceData.updatedAt, 0)
        let d = Date(timestamp*1000);
        d = JSON.stringify(d)
        return {
            ID: id,
            time: d,
            price: answer
        }
  
}

const getNFTs = async () => {
    const data = await axios.get("https://cornoracleapi.herokuapp.com/stoploss/nfts/0x395977E98105A96328357f847Edc75333015b8f4")
    const darta = data.data
    return darta
}

const getTokenSymbol = async (tokenAddress) => {
    try {
        const ctr = await fetchContract(tokenAddress, mockERC20Abi)
        const sym = await ctr.symbol()
        return sym
    } catch (err) {
        if (tokenAddress.toLowerCase() == addresses.USDC.toLowerCase())  {
            let name = "USDC"
            return name
        } else if (tokenAddress.toLowerCase() == addresses.USDT.toLowerCase()) {
            let name = "USDT"
            return name
        } else if (tokenAddress.toLowerCase() == addresses.BTC.toLowerCase()) {
            let name = "BTC"
            return name
        } else if (tokenAddress.toLowerCase() == addresses.ETH.toLowerCase()) {
            let name = "ETH"
            return name
        } else if (tokenAddress.toLowerCase() == addresses.MATIC.toLowerCase()) {
            let name = "MATIC"
            return name
        } else if (tokenAddress.toLowerCase() == addresses.DAI.toLowerCase()) {
            let name = "DAI"
            return name
        } else {
            let msg = "Symbol Not in Whitelist"
            console.log(err)
            return msg
        }
    }
}

const main = async () => {
    const nfts = await getTokenSymbol("0x4f9Ea20C144981F6bD20F4260920d5692373E4E5")
    console.log(nfts)
}

main()