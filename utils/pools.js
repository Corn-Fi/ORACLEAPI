const pools = [
    {
        pid: 0,
        LP: true,
        tokenStakeAddress: "0xea718C7dd15C6E1F98de3ED10f50d812e39E66D2",
        tokenBaseAddress: "0x7DBaFf79d13A0c842777742A86aE3aCAc9817250",
        tokenStakeName: "ALT1-ALT2",
        tokenStakeLogoName: "sushilogo",
        decimals: 18,
        tokenEarnAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenEarnName: "COB",
        tokenEarnLogoName: "cornlogo",
        cobPerBlock: 0.5,
        multiplier: "2x",
        depositFee: "10%"

    },
    {   
        pid: 1,
        LP: true,
        tokenStakeAddress: "0xadbF1854e5883eB8aa7BAf50705338739e558E5b",
        tokenBaseAddress: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
        tokenStakeName: "ETH-MATIC",
        tokenStakeLogoName: "sushilogo",
        decimals: 18,
        tokenEarnAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenEarnName: "COB",
        tokenEarnLogoName: "cornlogo",
        cobPerBlock: 0.5,
        multiplier: "2x",
        depositFee: "10%"

    },
    {   pid: 2,
        LP: true,
        tokenStakeAddress: "0x972575f78EE1738Fc578289b1DE98e0Cd90c0119",
        tokenBaseAddress: "0x793acf39c3d605d3ad042ae01fd290a6fe489164",
        tokenStakeName: "USDC-COB",
        tokenStakeLogoName: "usdclogo",
        decimals: 18,
        tokenEarnAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenEarnName: "COB",
        tokenEarnLogoName: "cornlogo",
        cobPerBlock: 0.5,
        multiplier: "2x",
        depositFee: "10%"

    },
    {
        pid: 3,
        LP: false,
        tokenStakeAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenBaseAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenStakeName: "COB",
        tokenStakeLogoName: "cornlogo",
        decimals: 18,
        tokenEarnAddress: "0x793AcF39c3d605d3aD042Ae01fd290a6fE489164",
        tokenEarnName: "COB",
        tokenEarnLogoName: "cornlogo",
        cobPerBlock: 0.5,
        multiplier: "2x",
        depositFee: "10%"

    }
]

module.exports = {
    pools
}