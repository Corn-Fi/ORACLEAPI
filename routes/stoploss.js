const express = require("express")
const router = express.Router()
const {stopLossVaultABI} = require("../utils/abi")
const {addresses} = require("../utils/addresses")
const {ethers} = require("ethers")
require('dotenv').config()

const PROVIDER = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const NAME = "STOP_LOSS_v0.1"





//
// HELPIES
//
const fetchContract = async (address, abi) => {
    const contract = new ethers.Contract(address, abi, PROVIDER);
    return contract;
};//works

const bigNumberToString = async (bignum, dec) => {
    const cleaned = ethers.utils.formatUnits(bignum, dec)
    return cleaned
}


const openOrdersLength = async () => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.openOrdersLength()
    const string = await bigNumberToString(raw, 0)
    const cleaned = parseInt(string)

    return cleaned
}

const ordersLength = async () => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.ordersLength()
    const string = await bigNumberToString(raw, 0)
    const cleaned = parseInt(string)

    return cleaned
}

const getTotalSupply = async () => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.totalSupply()
    const cleaned = await bigNumberToString(raw, 0)
    const cleanedInt = parseInt(cleaned)
    return cleanedInt
}

const ownerOfNft = async (tokenId) => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const owner = await ctr.ownerOf(tokenId)
    return owner
}


//
// CORE
//

const viewAllOpenOrders = async () => {
    const start = 0
    const end = await openOrdersLength() - 1
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.viewOpenOrdersInRange(start, end)

    try {
        const resp = raw[0]

        const token1 = resp.tokens[0]
        const token2 = resp.tokens[1]
        const amounts = resp.amounts
        const orderID = parseInt( await bigNumberToString(resp.orderId, 0))
        const tokenId = parseInt( await bigNumberToString(resp.tokenId, 0))
        const amountsPromises = amounts.map( async (amount) => {
            const cleaned = await bigNumberToString(amount)
            return cleaned
        })
    
        const cleanedAmounts = await Promise.all(amountsPromises)
    
        const ret = {
            vaultId: tokenId,
            tokens: [token1, token2],
            amounts: cleanedAmounts,
            orderId: orderID
    
        }
        return ret
    } catch (err) {console.log(err)}


}

const viewTrades = async (tokenId, tradeIds) => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.viewTrades(tokenId, tradeIds)

    try {
        const resp = raw[0][0]

        const token1 = resp.tokens[0]
        const token2 = resp.tokens[1]
        const amounts = resp.amounts
        const tokenID = parseInt( await bigNumberToString(resp.tokenId, 0))

        const amountsPromises = amounts.map( async (amount) => {
            const cleaned = await bigNumberToString(amount)
            return cleaned
        })
    
        const cleanedAmounts = await Promise.all(amountsPromises)
    
        const ret = {
            vaultId: tokenID,
            tokens: [token1, token2],
            amounts: cleanedAmounts
    
        }
        return ret

    } catch (err) {console.log(err)}

    
}




const getUserNfts = async (userAddress) => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const totalSupply = await getTotalSupply()
    const name = NAME; //global var
    const NFTs = []
    for (let i = 0; i < totalSupply; i++) {
        const owner = await ctr.ownerOf(i)
        if ( userAddress.toLowerCase() == owner.toLowerCase() ) {
            NFTs.push(i)
        }
    }
    const cleaned = {
        strategy: name,
        contract: addresses.STOPLOSSVAULT,
        user: userAddress,
        nfts: NFTs,
    }
    return cleaned
}

//Route

router.get( "/nfts/:address", async (req, res) => {

    const address = req.params.address
    try {
        const nfts = await getUserNfts(address);
        res.json(nfts)
    } catch (err) {
        res.status(500).json({ message: `${err}`})
    }
})

module.exports = [
    router
]



// const main = async () => {

//     const data = await viewTrades(1, [0])

//     const ln = await viewAllOpenOrders()
//     const nfts = await getUserNfts("0x395977E98105A96328357f847Edc75333015b8f4")
//     const ownr = await ownerOfNft(1)
//     console.log(nfts)
//     console.log("*********")

// }

// main()