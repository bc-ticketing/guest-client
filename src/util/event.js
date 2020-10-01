import { getIdAsBigNumber, argsToCid } from "idetix-utils";
import {
  NonFungibleTicket,
  NonFungibleTicketType,
  FungibleTicketType,
} from "./tickets";
import axios from "axios";


//const BigNumber = require("bignumber.js");

export class Event {
  constructor(contractAddress) {
    this.contractAddress = contractAddress;
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.location = "";
    this.title = "";
    this.img_url = "";
    this.ipfsHash = "";
  }

  parseTimeStamp() {
    this.date = new Date(this.timestamp * 1000);
    this.hours = this.date.getHours();
    this.minutes = "0" + this.date.getMinutes();
    this.seconds = "0" + this.date.getSeconds();
  }

  getTime() {
    return this.hours + ':' + this.minutes.substr(-2);
  }

  getDay() {
    return this.date.getDay();
  }

  getMonth() {
    return this.date.getMonth();
  }

  async fetchPosition() {
    let response = await axios.get(
      `https://api.opencagedata.com/geocode/v1/json?q=${this.location}&key=9b5c0f0e97664b69baf8d617c4d0f1c6&language=en&pretty=1`
    );
    var first = response.data.results[0];
    var latlong = {
      lat: first.geometry.lat,
      lng: first.geometry.lng,
    };
    this.latlong = latlong;
  }

  getTimeAndDate() {
    return `${this.date.getDay()}/${this.date.getMonth()}/${this.date.getFullYear()} - ${this.getTime()}`
  }

  getLowestPrice() {
    let lowestFungible = Math.min(this.fungibleTickets.map(ticket => Number(ticket.price)));
    let lowestNonFungible = Math.min(this.nonFungibleTickets.map(ticket => Number(ticket.price)));
    return Math.min(lowestFungible, lowestNonFungible);
  }

  async loadData(ABI, ipfsInstance, web3Instance) {
    await this.fetchIPFSHash(ABI, web3Instance);
    await this.loadIPFSMetadata(ipfsInstance)
  }

  async fetchIPFSHash(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(
      ABI,
      this.contractAddress
    );
    const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
      fromBlock: 1,
    });
    var metadataObject = eventMetadata[0].returnValues;
    this.ipfsHash = argsToCid(
      metadataObject.hashFunction,
      metadataObject.size,
      metadataObject.digest
    );
    return true;
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
    this.timestamp = metadata.event.time;
    this.parseTimeStamp();
  }

  async loadFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.fNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        let ticketType = new FungibleTicketType(this.contractAddress, i);
        const typeIdentifier = getIdAsBigNumber(false, i);
        const ticketMapping = await eventSC.methods
          .ticketTypeMeta(typeIdentifier)
          .call();
        ticketType.price = ticketMapping.price;
        ticketType.ticketsSold = ticketMapping.ticketsSold;
        ticketType.supply = ticketMapping.supply;
        const granularity = await eventSC.methods.granularity().call();
        ticketType.aftermarketGranularity = granularity;
        await ticketType.fetchIpfsHash(web3Instance, ABI);
        await ticketType.loadIPFSMetadata(ipfsInstance);
        await ticketType.loadSellOrders(web3Instance, ABI);
        await ticketType.loadBuyOrders(web3Instance, ABI);

        this.fungibleTickets.push(ticketType);
      }
    }
  }

  async loadNonFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.nfNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        let ticketType = new NonFungibleTicketType(this.contractAddress, i);
        const ticketMapping = await eventSC.methods
          .ticketTypeMeta(getIdAsBigNumber(true, i).toFixed())
          .call();
        ticketType.price = ticketMapping.price;
        ticketType.ticketsSold = ticketMapping.ticketsSold;
        ticketType.supply = ticketMapping.supply;
        const granularity = await eventSC.methods.granularity().call();
        ticketType.aftermarketGranularity = granularity;
        for (let j = 1; j <= ticketType.supply; j++) {
          const ticketId = getIdAsBigNumber(true, i, j).toFixed();
          let ticket = new NonFungibleTicket(ticketType, j);
          const owner = await eventSC.methods.nfOwners(ticketId).call();
          ticket.owner = owner;
          const sellOrder = await eventSC.methods.nfTickets(ticketId).call();
          ticket.sellOrder = sellOrder;
          ticketType.tickets.push(ticket);
        }
        await ticketType.fetchIpfsHash(web3Instance, ABI);
        await ticketType.loadIPFSMetadata(ipfsInstance);

        await ticketType.loadSellOrders(web3Instance, ABI);
        await ticketType.loadBuyOrders(web3Instance, ABI);
        this.nonFungibleTickets.push(ticketType);
      }
    }
  }
}
