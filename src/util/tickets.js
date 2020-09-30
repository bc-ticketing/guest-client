import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import { NULL_ADDRESS } from "./constants/constants";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

const BigNumber = require("bignumber.js");

class TicketType {
    constructor(eventContractAddress, typeId) {
        this.eventContractAddress = eventContractAddress;
        this.typeId = typeId;
        this.price = 0;
        this.supply = 0;
        this.ticketsSold = 0;
        this.aftermarketGranularity = 0;
        this.title = '';
        this.description = '';
        this.color = '';
        this.ipfsHash = '';
    }

    numberFreeSeats() {
        return this.supply - this.ticketsSold;
    }

}

export class FungibleTicketType extends TicketType {
    constructor(eventContractAddress, typeId) {
        super(eventContractAddress, typeId);
        this.sellOrders = {};
        this.buyOrders = {};
        this.seatMapping = [];
        this.isNf = false;
    }

    isFree() {
        return this.ticketsSold < this.supply; 
    }

    async makeBuyOrder(web3Instance, amount, percentage, account) {
        console.log(`creating buy order: \n
        Event: ${this.eventContractAddress}\n
        Ticket: ${this.getFullTicketId()}\n
        Amount: ${amount}\n
        Percentage: ${percentage}\n
        Price: ${amount * web3Instance.utils.toWei(String(Math.floor(this.price* (percentage/100))))}`);
        const contract = new web3Instance.eth.Contract(EVENT_MINTABLE_AFTERMARKET_ABI, this.eventContractAddress);
        const result = await contract.methods.makeBuyOrder(this.getFullTicketId(), amount, percentage).send({
            from: account,
            value: amount * web3Instance.utils.toWei(String(Math.floor(this.price* (percentage/100)))),
          });
        console.log(result);
    }

    async fillBuyOrder(web3Instance, amount, percentage) {
        const contract = new web3Instance.eth.Contract(EVENT_MINTABLE_AFTERMARKET_ABI, this.eventContractAddress);
        const result = await contract.methods.fillBuyOrderFungibles(this.getFullTicketId(), amount, percentage).call();
        console.log(result);
    }

    async makeSellOrder(web3Instance, amount, percentage, account) {
        console.log(`creating sell order: \n
        Event: ${this.eventContractAddress}\n
        Ticket: ${this.getFullTicketId()}\n
        Amount: ${amount}\n
        Percentage: ${percentage}<n
        From Account: ${account}`);
        const contract = new web3Instance.eth.Contract(EVENT_MINTABLE_AFTERMARKET_ABI, this.eventContractAddress);
        var myTickets = await contract.methods
                .tickets(this.getFullTicketId(), account)
                .call();
        console.log(`Ì own ${myTickets} tickets of this type`);
        const result = await contract.methods.makeSellOrderFungibles(this.getFullTicketId(), amount, percentage).call();
        console.log(result);
    }

    async fillSellOrder(percentage, amount, contract) {
        await contract.methods.fillSellOrderFungibles(this.getFullTicketId(), amount, percentage).call();
    }

    async buy(amount, web3Instance, ABI, account) {
        console.log(`buying ticket \n
        from account: ${account}\n
        ticketType: ${this.typeId} \n
        full ticket id: ${this.getFullTicketId()}\n
        amount: ${amount}\n
        price per ticket: ${this.price}\n
        total price: ${amount * this.price}\n
        price in wei: ${amount * web3Instance.utils.toWei(this.price)}`);
        const eventSC = new web3Instance.eth.Contract(ABI, this.eventContractAddress);
        const result = await eventSC.methods.mintFungible(this.getFullTicketId(), amount).send({
            from: account,
            value: amount * web3Instance.utils.toWei(this.price),
          });
        console.log(result);
    }

    getFullTicketId() {
        return getIdAsBigNumber(false, this.typeId).toFixed();
    }

    async loadIPFSMetadata(ipfsInstance) {
        if (this.ipfsHash === '') {return;}
        var ipfsData = null;
        for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
          timeout: 2000,
        })) {
          ipfsData = Buffer(chunk, "utf8").toString();
        }
        const metadata = JSON.parse(ipfsData);
        this.description = metadata.ticket.description;
        this.seatMapping = metadata.ticket.mapping;
        this.title = metadata.ticket.title;
    }

    async fetchIpfsHash(web3Instance, ABI) {
        const eventSC = new web3Instance.eth.Contract(ABI,this.eventContractAddress);
        const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
            filter: {ticketTypeId: this.getFullTicketId()},
            fromBlock: 1,
          });
          if (ticketMetadata.length < 1) {
              return;
          }
          var metadataObject = ticketMetadata[0].returnValues;
          const ipfsHash = argsToCid(
            metadataObject.hashFunction,
            metadataObject.size,
            metadataObject.digest
          );
            this.ipfsHash = ipfsHash;
    }

    async loadSellOrders(web3Instance, ABI) {
        const aftermarket = new web3Instance.eth.Contract(ABI, this.eventContractAddress);
        for (let i = this.aftermarketGranularity; i >= 1; i--) {
            const percentage = (100 / this.aftermarketGranularity) * i;
            const sellingQueue = await aftermarket.methods.sellingQueue(this.getFullTicketId(), percentage).call();
            const numSellOrders = sellingQueue.numberTickets;
            if (numSellOrders > 0) {
                this.sellOrders[percentage] = numSellOrders;
            }
        }
    }

    async loadBuyOrders(web3Instance, ABI) {
        const aftermarket = new web3Instance.eth.Contract(ABI, this.eventContractAddress);
        for (let i = this.aftermarketGranularity; i >= 1; i--) {
            const percentage = (100 / this.aftermarketGranularity) * i;
            const buyingQueue = await aftermarket.methods.buyingQueue(this.getFullTicketId(), percentage).call();
            const numBuyingOrders = buyingQueue.numberTickets;
            if (numBuyingOrders > 0) {
                this.buyOrders[percentage] = numBuyingOrders;
            }
        }

    }

    getHighestBuyOrder() {
        for (const [key, value] of Object.entries(this.buyOrders)) {
            if (value > 0) {return key;}
        }
        return 0;
    }
    
}

export class NonFungibleTicketType extends TicketType {
    constructor(eventContractAddress, typeId) {
        super(eventContractAddress, typeId);
        this.tickets = [];
        this.isNf = true;
    }

    getFullTicketId() {
        return getIdAsBigNumber(true, this.typeId).toFixed();
    }

    async fetchIpfsHash(web3Instance, ABI) {
        const eventSC = new web3Instance.eth.Contract(ABI,this.eventContractAddress);
        const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
            filter: {ticketTypeId: this.getFullTicketId()},
            fromBlock: 1,
          });
          if (ticketMetadata.length < 1) {
              return;
          }
          var metadataObject = ticketMetadata[0].returnValues;
          const ipfsHash = argsToCid(
            metadataObject.hashFunction,
            metadataObject.size,
            metadataObject.digest
          );
            this.ipfsHash = ipfsHash;
    }

    async loadIPFSMetadata(ipfsInstance) {
        if (this.ipfsHash === '') {return;}
        var ipfsData = null;
        for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
          timeout: 2000,
        })) {
          ipfsData = Buffer(chunk, "utf8").toString();
        }
        const metadata = JSON.parse(ipfsData);
        this.description = metadata.ticket.description;
        this.seatMapping = metadata.ticket.mapping;

        this.title = metadata.ticket.title;
        metadata.ticket.mapping.forEach((mapping, index) => {
            if (index >= this.tickets.length) {return;}
            this.tickets[index].seatMapping = mapping;
        }, this);
    }
}

export class NonFungibleTicket {
    constructor(ticketType, ticketId) {
        this.ticketType = ticketType;
        this.ticketTypeId = ticketType.typeId;
        this.ticketId = ticketId;
        this.buyOrders = {};
        this.sellOrders = {};
        this.seatMapping = undefined;
        this.owner = undefined;
        this.isNf = true;
    }

    async buy(web3Instance, ABI, account) {
        console.log(`buying ticket \n
        from account: ${account}\n
        ticketType: ${this.ticketTypeId} \n
        ticketId: ${this.ticketId}\n
        full ticket id: ${this.getFullTicketId()}\n
        price: ${this.price}\n
        price in wei: ${web3Instance.utils.toWei(String(this.ticketType.price))}`);
        const eventSC = new web3Instance.eth.Contract(ABI, this.ticketType.eventContractAddress);
        const result = await eventSC.methods.mintNonFungibles([this.getFullTicketId()]).send({
            from: account,
            value: web3Instance.utils.toWei(String(this.ticketType.price)),
          });
        console.log(result);
    }

    getFullTicketId() {
        // return nonFungibleBaseId.plus(this.ticketTypeId).plus(this.ticketId)
        return getIdAsBigNumber(true, this.ticketTypeId, this.ticketId).toFixed();
    }

    isFree() {
        return this.owner === NULL_ADDRESS;
    }
    
    hasSellOrder() {
        return new BigNumber(this.sellOrder.userAddress).isZero() ? false : true;
    }

    async makeBuyOrder(web3Instance, percentage, account) {
        console.log(`creating buy order: \n
        Event: ${this.eventContractAddress}\n
        Ticket: ${this.getFullTicketId()}\n
        Percentage: ${percentage}\n
        Price: ${web3Instance.utils.toWei(String(Math.floor(this.ticketType.price* (percentage/100))))}`);
        const contract = new web3Instance.eth.Contract(EVENT_MINTABLE_AFTERMARKET_ABI, this.ticketType.eventContractAddress);
        const result = await contract.methods.makeBuyOrder(this.getFullTicketId(), 1, percentage).send({
            from: account,
            value: web3Instance.utils.toWei(String(Math.floor(this.ticketType.price* (percentage/100)))),
          });
        console.log(result);
    }
}