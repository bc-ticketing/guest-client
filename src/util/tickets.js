import { argsToCid, fungibleBaseId, nonFungibleBaseId } from "idetix-utils";

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

    getFullTicketId() {
        return fungibleBaseId.plus(new BigNumber(this.typeId))
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
        const aftermarket = new web3Instance.eth.Contract(ABI, this.contractAddress);
        for (let i = this.aftermarketGranularity; i >= 1; i--) {
            const percentage = (100 / this.aftermarketGranularity) * i;
            const sellingQueue = await aftermarket.methods.sellingQueue(this.getFullTicketId(), percentage).call();
            const numSellOrders = sellingQueue.numberTickets;
            if (numbSellOrders > 0) {
                this.sellOrders[percentage] = numSellOrders;
            }
        }
    }

    async loadBuyOrders(web3Instance, ABI) {
        const aftermarket = new web3Instance.eth.Contract(ABI, this.contractAddress);
        for (let i = this.aftermarketGranularity; i >= 1; i--) {
            const percentage = (100 / this.aftermarketGranularity) * i;
            const buyingQueue = await aftermarket.methods.buyingQueue(this.getFullTicketId(), percentage).call();
            const numBuyingOrders = buyingQueue.numberTickets;
            if (numbBuyingOrders > 0) {
                this.buyOrders[percentage] = numBuyingOrders;
            }
        }

    }
    
}

export class NonFungibleTicketType extends TicketType {
    constructor(eventContractAddress, typeId) {
        super(eventContractAddress, typeId);
        this.tickets = [];
        this.isNf = true;
    }

    async fetchIpfsHash(web3Instance, ABI) {
        const eventSC = new web3Instance.eth.Contract(ABI,this.eventContractAddress);
        let longId = nonFungibleBaseId.plus(new BigNumber(this.typeId));
        const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
            filter: {ticketTypeId: longId},
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
        console.log(this.tickets.length);
        console.log(metadata.ticket.mapping.length);
        metadata.ticket.mapping.forEach((mapping, index) => {
            if (index >= this.tickets.length) {return;}
            this.tickets[index].seatMapping = mapping;
        }, this);
    }
}

export class NonFungibleTicket {
    constructor(ticketTypeID, ticketId) {
        this.ticketTypeId = ticketTypeID;
        this.ticketId = ticketId;
        this.buyOrder = undefined;
        this.sellOrder = undefined;
        this.seatMapping = undefined;
        this.owner = undefined;
    }

    getFullTicketId() {
        return fungibleBaseId.plus(new BigNumber(this.ticketTypeId).plus(this.ticketId))
    }

    isFree() {
        return this.owner == 0;
    }
    hasSellOrder() {
        return new BigNumber(this.sellOrder.userAddress).isZero() ? false : true;
    }
}