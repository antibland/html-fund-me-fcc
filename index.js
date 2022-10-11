import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const byId = (id) => document.getElementById(id)

const btnConnect = byId("btnConnect")
const btnFund = byId("btnFund")
const btnGetBalance = byId("btnGetBalance")
const btnWithdraw = byId("btnWithdraw")

btnConnect.onclick = connect
btnFund.onclick = fund
btnGetBalance.onclick = getBalance
btnWithdraw.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.error(error)
        }
        byId("btnConnect").innerHTML = "Connected"
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        })
        console.log(accounts)
    } else {
        byId("btnConnect").innerHTML = "Connect"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum) // MetaMask
        const balance = await provider.getBalance(contractAddress)
        console.log(`Balance is ${ethers.utils.formatEther(balance)}`)
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // need provider / connection to blockchain
        // signer / wallet (gas)
        // contract we are interacting with
        //  ^ ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum) // MetaMask
        const signer = provider.getSigner() // account 1, for example
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // wait for tx to finish
            await listenForTransactionMinded(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.error(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum) // MetaMask
        const signer = provider.getSigner() // account 1, for example
        const contract = new ethers.Contract(contractAddress, abi, signer)

        console.log("signer", signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMinded(transactionResponse, provider)
        } catch (error) {
            console.error(error)
        }
    }
}

function listenForTransactionMinded(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)

    return new Promise((resolve, reject) => {
        // listen for transaction to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}
