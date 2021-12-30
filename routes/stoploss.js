const express = require("express")
const router = express.Router()
const {stopLossVaultABI, mockERC20Abi, settingsABI} = require("../utils/abi")
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
}

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


//
// CORE
//
const viewSettings = async () => {
    const ctr =  await fetchContract(addresses.SETTINGS, settingsABI)
    
    const one =  ctr.lendingPool()
    const two =  ctr.rewards()
    const three =  ctr.aaveMarketTokens()
    const four = ctr.feePoints()
    const five = ctr.feeBasePoints()
    const six = ctr.maxFeePercent()
    const promises =[one, two, three, four, five, six]

    const [
        lender,
        rewards,
        AMTokens,
        feePoints,
        basisPoints,
        maxFeePercent
    ] = await Promise.all(promises)

    const feeNum = parseFloat(await bigNumberToString(feePoints, 0))
    const basisPointsNum = parseFloat(await bigNumberToString(basisPoints, 0))
    const maxFeePercentNum = parseFloat(await bigNumberToString(maxFeePercent, 0))
    const feeAsPercent = ((feeNum / basisPointsNum) * 100 )
    const data = {
        lendingpool: lender,
        reward: rewards,
        aavetokens: AMTokens,
        feepoints: feeNum,
        basis: basisPointsNum,
        maxfeepoints: maxFeePercentNum,
        feepercent: feeAsPercent
    }

    return data
}

const viewAllOpenOrders = async () => {
    const start = 0
    const end = await openOrdersLength() - 1
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.viewOpenOrdersInRange(start, end)

    try {
        const trades = raw
        const mapResp = trades.map( async (trade) => {
            const token1 = trade.tokens[0]
            const token1Name = await getTokenSymbol(token1)
            const token2 = trade.tokens[1]
            const token2Name = await getTokenSymbol(token2)
            const amounts = trade.amounts
            const orderID = parseInt( await bigNumberToString(trade.orderId, 0))
            const tokenId = parseInt( await bigNumberToString(trade.tokenId, 0))
            const amountsPromises = amounts.map( async (amount) => {
                const cleaned = await bigNumberToString(amount)
                return cleaned
            })
        
            const cleanedAmounts = await Promise.all(amountsPromises)
            const ret = {
                vaultId: tokenId,
                tokens: {
                    tokenA: {tokenAddress: token1, tokenName: token1Name},
                    tokenB: {tokenAddress: token2, tokenName: token2Name}
                },
                amounts: cleanedAmounts,
                orderId: orderID
        
            }
            return ret
        })
 
        const cleanedResp = await Promise.all(mapResp)
        return cleanedResp
    } catch (err) {console.log(err)}


}

const viewTrades = async (tokenId, tradeIds) => {
    const ctr = await fetchContract(addresses.STOPLOSSVAULT, stopLossVaultABI)
    const raw = await ctr.viewTrades(tokenId, tradeIds)

    try {
        const resp = raw[0][0]

        const token1 = resp.tokens[0]
        const token1Name = await getTokenSymbol(token1)
        const token2 = resp.tokens[1]
        const token2Name = await getTokenSymbol(token2)
        const amounts = resp.amounts
        const tokenID = parseInt( await bigNumberToString(resp.tokenId, 0))

        const amountsPromises = amounts.map( async (amount) => {
            const cleaned = await bigNumberToString(amount)
            return cleaned
        })
    
        const cleanedAmounts = await Promise.all(amountsPromises)
    
        const ret = {
            vaultId: tokenID,
            tokens: {
                tokenA: {tokenAddress: token1, tokenName: token1Name},
                tokenB: {tokenAddress: token2, tokenName: token2Name}
            },
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

//Routes

router.get( "/nfts/:address", async (req, res) => {

    const address = req.params.address
    try {
        const nfts = await getUserNfts(address);
        res.json(nfts)
    } catch (err) {
        res.status(500).json({ message: `${err}`})
    }
})

const cleanArray = (stringArray) => {
    const removefirst = stringArray.slice(1,-1)
    
    return removefirst
}

router.get( "/userTrades/:vaultId&:tokenIds", async (req, res) => {

    const vaultId = req.params.vaultId
    const cleanedTokenIds = cleanArray(req.params.tokenIds)
    const tokenIds = Array.from(cleanedTokenIds)
    const tokenIdNums = tokenIds.map( (id) => {
        const numId = parseInt(id)
        return numId
    })
    console.log(vaultId)
    console.log(tokenIdNums)
    try {
        const trades = await viewTrades(vaultId, tokenIdNums);
        res.json(trades)
    } catch (err) {
        res.status(500).json({ message: `${err}`})
    }
})

router.get("/openOrders", async (req, res) => {
    try {
        const allOrders = await viewAllOpenOrders()
        res.json(allOrders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: `${err}`})
    }
})

router.get("/settings", async (req, res) => {
    try {
        const settings = await viewSettings()
        res.json(settings)
    } catch (err) {
        console.log(err)
        res.status(500).json({message: `${err}`})
    }
})

module.exports = [
    router
]



// const main = async () => {

//     // const data = await viewTrades(1, [0])

//     const ln = await viewAllOpenOrders()
//     // const nfts = await getUserNfts("0x395977E98105A96328357f847Edc75333015b8f4")
//     // const ownr = await ownerOfNft(1)
//     console.log(ln)
//     console.log("*********")

// }

// main()