const express = require("express")
const router = express.Router()
const {addresses} = require("../utils/addresses.js")
const {ethers} = require("ethers")
const axios = require("axios")
const StopLossVault = require("../build/contracts/StopLossVault.json")
const Controller = require("../build/contracts/Controller.json")
const Settings = require("../build/contracts/Settings.json")
const BigNumber = require("bignumber.js");

require('dotenv').config()

const provider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com/v1/4b331c188697971af1cd6f05bb7065bc358b7e89");

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$ HELPERS $$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

const fetchSigner = async () => {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com/v1/4b331c188697971af1cd6f05bb7065bc358b7e89");
    const wsProvider = new ethers.providers.WebSocketProvider("wss://rpc-mainnet.maticvigil.com/ws/v1/4b331c188697971af1cd6f05bb7065bc358b7e89");
    
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    
    const signer = wallet.connect(provider);
    const wsSigner = wallet.connect(provider);
    console.log(`connected to ${signer.address}`);
    
    return signer;
};



const fetchContract = async (address, abi) => {
    const contract = new ethers.Contract(address, abi, provider);
    console.log(`loaded contract ${contract.address}`);
    return contract;
};

const cleanArray = (stringArray) => {
    const removefirst = stringArray.slice(1,-1)
    
    return removefirst
}

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$ CORE $$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$


const fetchVaultTokensByOwner = async (address) => {
    const ctr = await fetchContract(addresses.vaults.controller, Controller.abi)
    // const ctr = ctr_read.connect(signer)

    const userTrades = await ctr.vaultTokensByOwner(address)

    const mappedData = userTrades.map( (trade) => {
        let _vault;
        if (trade.vault == addresses.vaults.limitVault) {
            _vault = "Limit"
            return
        } else if (trade.vault == addresses.vaults.stopVault) {
            _vault = "Stop"
            return
        } else if (trade.vault == addresses.vaults.accDistVault) {
            _vault = "Accumulator Distributor"
            return {
                id: parseInt(ethers.utils.formatUnits(trade.tokenId, 0)),
                vault: _vault,
                vaultAddress: trade.vault
            }
        }


    } )
    const cleanedMap = mappedData.filter( (item) => {
        return item != null
    })
    return cleanedMap
}

const fetchTrades = async (vaultId, tokenId) => {
    const ctr = await fetchContract(addresses.vaults.controller, Controller.abi)
    // const ctr = ctr_read.connect(signer)

    const rawTrades = await ctr.viewTrades(vaultId, tokenId, [0])
    const trades = rawTrades[0]
    const mappedData = trades.map( (trade) => {
        
        const tokenActr =  await fetchContract(trade.tokens[0], ERC20Abi)
        const tokenBctr = await fetchContract(trade.tokens[1], ERC20Abi)
        const tokenADecimals = await tokenActr.decimals()
        const tokenBDecimals = await tokenBctr.decimals()
        const tokenASymbol = await tokenActr.symbol()
        const tokenBSymbol = await tokenBctr.symbol()

        const _amounts = []
        const mappedAmounts = trade.amounts.map( (amount) => {
            
            _amounts.push(amount)
        })

        const formatA = ethers.utils.formatUnits(_amounts[0], 6)
        const formatB = ethers.utils.formatUnits(_amounts[1], 18)

        const _amountA = new BigNumber(formatA)
        const _amountB = new BigNumber(formatB)

        const _rate = _amountA.div(_amountB)
        const _rateBA = _amountB.div(_amountA)



        return {
            tokenId: parseInt(ethers.utils.formatUnits(trade.tokenId, 0)),
            tradeId: parseInt(ethers.utils.formatUnits(trade.tradeId, 0)),
            timestamp: ethers.utils.formatUnits(trade.timestamp, 0),
            tokens: trade.tokens,
            tokens: {
                tokenA: {
                    address: trade.tokens[0],
                    decimals: tokenADecimals,
                    symbol: tokenASymbol
                },
                tokenB: {
                    address: trade.tokens[1],
                    decimals: tokenBDecimals,
                    symbol: tokenBSymbol
                }
            },
            rates: {
                amountA: _amountA,
                amountB: _amountB,
                AB: _rate,
                BA: _rateBA
            }


        }
    })

    return mappedData
}

const fetchOpenOrdersLength = async (vaultId) => {
    const ctr = await fetchContract(addresses.vaults.controller, Controller.abi)
    // const ctr = ctr_read.connect(signer)
    const rawLength = await ctr.openOrdersLength(vaultId)
    const length = parseInt(ethers.utils.formatUnits(rawLength, 0))
    return length
}

const fetchOpenOrders = async (vaultId) => {
    const ctr = await fetchContract(addresses.vaults.controller, Controller.abi)
    // const ctr = ctr_read.connect(signer)
    const end = await fetchOpenOrdersLength(vaultId)
    const rawOrders = await ctr.viewOpenOrdersInRange(vaultId, 0, (end - 1))

    const mappedData = rawOrders.map( (order) => {
        const _amounts = []
        const mappedAmounts = order.amounts.map( (amount) => {
            const int = parseInt(ethers.utils.formatUnits(amount, 0))
            _amounts.push(int)
        })
     

        return {
            tokenId: parseInt(ethers.utils.formatUnits(order.tokenId, 0)),
            tradeId: parseInt(ethers.utils.formatUnits(order.tradeId, 0)),
            timestamp: parseInt(ethers.utils.formatUnits(order.timestamp, 0)),
            tokens: order.tokens,
            amounts: _amounts


        }
    })

    return mappedData
}

// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$
// $$$$$$$$$ ENDPOINTS $$$$$$$$$$$$$$$$
// $$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$

router.get( "/vaults/:address", async (req, res) => {

    const address = req.params.address
    try {
        const nfts = await fetchVaultTokensByOwner(address);
        res.json(nfts)
    } catch (err) {
        res.status(500).json({ message: `${err}`})
    }
})

router.get("/openOrders", async (req, res) => {
    try {
        const allOrders = await fetchOpenOrders(2)
        res.json(allOrders)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: `${err}`})
    }
})

router.get( "/trades/:tokenId", async (req, res) => {

    const vaultId = req.params.vaultId
    const tokenId = req.params.tokenId
  

    try {
        const trades = await fetchTrades(2, tokenId);
        res.json(trades)
    } catch (err) {
        res.status(500).json({ message: `${err}`})
    }
})

module.exports = [
    router
]







// const main = async () => {
//     const one = await fetchVaultTokensByOwner("0x395977E98105A96328357f847Edc75333015b8f4")
//     console.log("Passed one")
//     const two = await fetchOpenOrders(0)
//     console.log("Passed two")
//     const three = await fetchTrades(0, 1)
//     console.log("Passed three")

// }

// main()