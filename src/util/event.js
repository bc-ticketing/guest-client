import { fungibleBaseId, nonFungibleBaseId } from "idetix-utils";
import {
  NonFungibleTicket,
  NonFungibleTicketType,
  FungibleTicketType,
} from "./tickets";
const BigNumber = require("bignumber.js");

export class Event {
  constructor(contractAddress, ipfsHash) {
    console.log('creating event')
    this.contractAddress = contractAddress;
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.location = "";
    this.title = "";
    this.img_url = "";
    this.ipfsHash = ipfsHash;
  }

  async loadIPFSMetadata(ipfsInstance) {
    var ipfsData = null;
    for await (const chunk of ipfsInstance.cat(this.ipfsHash, {
      timeout: 2000,
    })) {
      ipfsData = Buffer(chunk, "utf8").toString();
    }
    const metadata = JSON.parse(ipfsData);
    this.location = metadata.event.location;
    this.title = metadata.event.title;
    this.img_url = metadata.event.img_url;
    this.description = metadata.event.description;
    this.category = metadata.event.category;
    this.duration = metadata.event.duration;
    this.twitter = metadata.event.twitter;
    this.url = metadata.event.url;
    this.timestamp = metadata.event.time;
    this.color = metadata.event.color;
  }

  async loadFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.fNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 0; i < nonce; i++) {
        let ticketType = new FungibleTicketType(this.contractAddress, i);
        const typeIdentifier = fungibleBaseId.plus(i);
        const ticketMapping = await eventSC.methods
          .ticketTypeMeta(typeIdentifier)
          .call();
        ticketType.price = ticketMapping.price;
        ticketType.ticketsSold = ticketMapping.ticketsSold;
        ticketType.supply = ticketMapping.supply;
        await ticketType.fetchIpfsHash(web3Instance, ABI);
        await ticketType.loadIPFSMetadata(ipfsInstance)
        const granularity = await eventSC.methods.granularity.call();
        ticketType.aftermarketGranularity = granularity;
        for (i = 1; i <= new BigNumber(granularity).toNumber(); i++) {
          let percentage = (100 / new BigNumber(granularity).toNumber()) * i;
          const queue = eventSC.methods.sellingQueue(ticketType, percentage);
          const numberSellingOrders = queue.numberTickets;
          if (numberSellingOrders > 0) {
            ticketType.sellOrders.push({
              queue: percentage,
              amount: numberSellingOrders,
            });
            //ticketMapping.sellOrders[String(percentage)] = numberSellingOrders
          }
        }

        //ticketMapping.ticketTypeNr = i;
        //const queues = eventSC.methods.buyingQueue().call();
        this.fungibleTickets.push(ticketType);
      }
    }
  }

  async loadNonFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.nfNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 0; i < nonce; i++) {
        let ticketType = new NonFungibleTicketType(this.contractAddress, i);
        const ticketMapping = await eventSC.methods
          .ticketTypeMeta(nonFungibleBaseId.plus(i))
          .call();
        ticketType.price = ticketMapping.price;
        ticketType.ticketsSold = ticketMapping.ticketsSold;
        ticketType.supply = ticketMapping.supply;
        for (let j = 0; j < ticketType.supply; j++) {
          const ticketId = nonFungibleBaseId.plus(i).plus(j);
          let ticket = new NonFungibleTicket(j);
          const owner = await eventSC.methods.nfOwners(ticketId).call();
          ticket.owner = owner;
          const sellOrder = await eventSC.methods.nfTickets(ticketId).call();
          ticket.sellOrder = sellOrder;
          ticketType.tickets.push(ticket);
        }
        await ticketType.fetchIpfsHash(web3Instance, ABI);
        await ticketType.loadIPFSMetadata(ipfsInstance);
        this.nonFungibleTickets.push(ticketType);
      }
    }
  }
}
