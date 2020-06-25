<p align="center">
    <img src="./docs/img/ticket-icon.png" alt="Ticketing dApp" align="center">
</p>

<h2 align="center">Blockchain Ticketing</h2>
<h3 align="center">Software Project</h3>
<div align="center"><code >University of Zurich</code></div>

---

## Prerequisites

- [Git](https://git-scm.com/) command line interface
- [Node.js](https://nodejs.org/) command line interface
- [Metamask Extension](https://metamask.io/) for your browser communicating with the Ethereum blockchain
- [Ganache](https://www.trufflesuite.com/ganache) to spin up a blockchain with funded test accounts and instant mining

## Project Setup
### Clone the Project

```bash
git clone --recurse-submodules https://github.com/bc-ticketing/guest-client
```

### Set up Client

```bash
cd guest-client/client
npm install
```

### Install Truffle

```bash
cd ..
sudo npm install -g truffle
```

### Setup Metamask

1. Start a local blockchain by opening the `Ganache` application.
2. Create a new workspace and add `truffle-config.js` to the project and safe the workspace.
3. Copy the mnemonic phrase (12 word seed phrase) in the `Ganache` application.
4. Open `Metamask` in your browser (Google Chrome recommended).
5. Click on `import using account seed phrase` and paste the mnemonic seed phrase. (No funds are shown because Metamask is not connected to the local network yet.)
6. Click on the network dropdown and select _Custom RPC_.
7. Enter `Ganache` as the _Network Name_ and the Ganache network configuration as the _RPC URL_ which is by default `http://127.0.0.1:7545`.
8. Click _Save_.
9. You should now be logged in with an account(s) from the `Ganache` application with a balance of _100 ETH_.

## Run Environment

First, start local blockchain with by opening the `Ganache` application.

Then:
```bash
# get recent contracts, deploy them and run
./deployRun.sh
```

```bash
# if contracts already deployed, to run the environment
npm install
npm run serve
```

## Standalone setup and run commands

```bash
# compiles and minifies for production
npm run build
```

```bash
# run unit tests
npm run test:unit
```

```bash
# lints and fixes files
npm run lint
```

:warning: Make sure your Metamask is connected to the correct network! :warning:

