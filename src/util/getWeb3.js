import Web3 from 'web3'
import WalletConnectProvider from "@walletconnect/web3-provider";

async function getWeb3() {
    await linkWeb3(true);
    try {

        // Acccounts now exposed
        var web3 = {};
        web3.networkId = await window.web3.eth.net.getId();
        web3.accounts = await window.web3.eth.getAccounts();
        web3.account = web3.accounts[0];
        web3.balance = await window.web3.eth.getBalance(web3.account);
        return web3;

    } catch (error) {
        // User denied account access...
        console.log(error)
        return new Error('Unable to connect to Metamask')

    }

}

export default getWeb3

async function linkWeb3(walletConnect) {
    if (walletConnect) {
        //  Create WalletConnect Provider
        const provider = new WalletConnectProvider({
            infuraId: "a98a81d8c657449c8538f7bffbf73050" // Required
        });

        //  Enable session (triggers QR Code modal)
        await provider.enable();

        //  Create Web3
        window.web3 = new Web3(provider);
    } else {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            // Request account access if needed
            await window.ethereum.enable();
            // Acccounts now exposed
        }
    }

}