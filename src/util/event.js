/* 
  This file contains the Event class and all its member functions. The main functionality contained here is the loading of event metadata and tickets from the Blockchain as well as handling Solidity events related to the event and its ticket. 
*/
import {
  getIdAsBigNumber,
  getTicketId,
  getTicketTypeIndex,
  argsToCid,
  isNf,
} from "idetix-utils";
import {
  NonFungibleTicket,
  NonFungibleTicketType,
  FungibleTicketType,
  addBuyOrders,
  removeBuyOrders,
  addSellOrders,
  removeSellOrders,
  getLowestSellOrder,
} from "./tickets";
import axios from "axios";

import { NULL_ADDRESS } from "./constants/constants";

import { loadIPFSMetadata } from "./tickets";

import { EVENT_MINTABLE_AFTERMARKET_ABI } from "../util/abi/eventMintableAftermarket";
import { ipfsClient } from "./ipfs/getIpfs";

import {
  requestTwitterVerification,
  requestWebsiteVerification,
  getHandle,
} from "./identity";

const BigNumber = require("bignumber.js");

import { subscribeTo } from "./../components/StateManager";

export class Event {
  constructor(contractAddress, web3) {
    // hack to turn events from idb into proper event objects
    if (typeof contractAddress === "object") {
      Object.assign(this, contractAddress);
      this.contractAddress = contractAddress.contractAddress;
      Object.defineProperty(this, "contract", {
        enumerable: false,
        value: new web3.eth.Contract(
          EVENT_MINTABLE_AFTERMARKET_ABI,
          this.contractAddress
        ),
      });
      return;
    }
    this.lastFetchedBlock = 0;
    this.contractAddress = contractAddress;
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.location = "";
    this.title = "";
    this.img_url = "";
    this.ipfsHash = "";
    this.currency = 0;
    this.identityContractAddress = "";
    this.identityLevel = 0;
    this.date = new Date();
    this.website = {
      url: "",
      verification: "pending",
    };
    this.twitter = {
      url: "",
      verification: "pending",
    };
    Object.defineProperty(this, "contract", {
      enumerable: false,
      value: new web3.eth.Contract(
        EVENT_MINTABLE_AFTERMARKET_ABI,
        this.contractAddress
      ),
    });
  }

  //subscribe to solidity events
  initSubscriptions(web3) {
    const contract = new web3.eth.Contract(
      EVENT_MINTABLE_AFTERMARKET_ABI,
      this.contractAddress
    );
    subscribeTo("MintFungibles", contract, (event) =>
      this.handleMintFungibles(event)
    );
    subscribeTo("MintNonFungibles", contract, (event) =>
      this.handleMintNonFungibles(event)
    );
    subscribeTo("BuyOrderWithdrawn", contract, (event) =>
      this.handleBuyOrderWithdrawn(event)
    );
    subscribeTo("SellOrderWithdrawn", contract, (event) => this.handle(event));
    subscribeTo("SellOrderFungibleWithdrawn", contract, (event) =>
      this.handleSellOrderFungibleWithdrawn(event)
    );
    subscribeTo("SellOrderNonFungibleWithdrawn", contract, (event) =>
      this.handleSellOrderNonFungibleWithdrawn(event)
    );
    subscribeTo("BuyOrderNonFungibleFilled", contract, (event) =>
      this.handleBuyOrderNonFungibleFilled(event)
    );
    subscribeTo("SellOrderNonFungibleFilled", contract, (event) =>
      this.handleSellOrderNonFungibleFilled(event)
    );
    subscribeTo("SellOrderNonFungiblePlaced", contract, (event) =>
      this.handleSellOrderNonFungiblePlaced(event)
    );
    subscribeTo("BuyOrderFungibleFilled", contract, (event) =>
      this.handleBuyOrderFungibleFilled(event)
    );
    subscribeTo("SellOrderFungibleFilled", contract, (event) =>
      this.handleSellOrderFungibleFilled(event)
    );
    subscribeTo("SellOrderFungiblePlaced", contract, (event) =>
      this.handleSellOrderFungiblePlaced(event)
    );
    subscribeTo("BuyOrderPlaced", contract, (event) =>
      this.handleBuyOrderPlaced(event)
    );
    // subscribeTo("TicketTransferred", contract, (event) => console.log(event));
    subscribeTo("TicketMetadata", contract, (event) =>
      this.handleTicketMetadata(event)
    );
    subscribeTo("EventMetadata", contract, (event) =>
      this.handleEventMetadata(event)
    );
  }

  getTime() {
    return this.minutes ? this.hours + ":" + this.minutes.substr(-2) : "18:00";
  }

  getDay() {
    return this.date.getDay();
  }

  getMonth() {
    return this.date.getMonth();
  }

  async fetchPosition() {
    let response;
    try {
      response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${this.location}&key=9b5c0f0e97664b69baf8d617c4d0f1c6&language=en&pretty=1`
      );
    } catch (e) {
      this.latlong = "";
      return;
    }
    var first = response.data.results[0];
    var latlong = {
      lat: first.geometry.lat,
      lng: first.geometry.lng,
    };
    this.latlong = latlong;
  }

  getNfOwner(ticketType, ticketId) {
    if (this.getTicketType(ticketType, true).isNf) {
      return this.getNfTicket(ticketType, ticketId).owner;
    }
    return false;
  }

  hasSellOrders(ticketType, ticket = false) {
    let t;
    if (!ticket) {
      t = this.fungibleTickets.find((t) => t.typeId === ticketType);
      return t.sellOrders.length !== 0;
    } else {
      const tt = this.nonFungibleTickets.find(
        (type) => type.typeId === ticketType
      );
      t = tt.tickets.find((temp) => temp.ticketId === ticket);
      return t.sellOrder.address != undefined;
    }
  }

  getLowestSellOrder(ticketType, ticketId = false) {
    let ticket;
    if (!ticketId) {
      ticket = this.getTicketType(ticketType, false);
      return getLowestSellOrder(ticket);
    } else {
      const tt = this.nonFungibleTickets.find(
        (type) => type.typeId === ticketType
      );
      ticket = tt.tickets.find((t) => t.ticketId === ticketId);
      return getLowestSellOrder(ticket);
    }
  }

  getSellOrdersByAddress(address, ticketType, nfId) {
    if (nfId) {
      const tt = this.getTicketType(ticketType, true);
      const t = tt.tickets.find((ticket) => ticket.ticketId === nfId);
      return t.sellOrder.address === address ? t.sellOrder : {};
    } else {
      const orders = this.getTicketType(ticketType, false).sellOrders.filter(
        (o) => o.address === address
      );
      return orders;
    }
  }
  getBuyOrdersByAddress(address, isNf) {
    let buyOrders = [];
    const tickets = !isNf ? this.fungibleTickets : this.nonFungibleTickets;
    for (const tt of tickets) {
      let orders = tt.buyOrders.filter((o) => o.address === address);
      orders.forEach((o) => {
        o.ticketTypeId = tt.typeId;
        o.eventAddress = tt.eventContractAddress;
      });
      buyOrders = buyOrders.concat(orders);
    }
    return buyOrders;
  }

  getGranularity(ticketType) {
    return this.getTicketType(ticketType).aftermarketGranularity;
  }

  isAvailable(ticketType, ticket = false) {
    if (!ticket || ticket == 0) {
      const t = this.getTicketType(ticketType, false);
      return Number(t.ticketsSold) < Number(t.supply);
    }
    return this.getNfTicket(ticketType, ticket).owner === NULL_ADDRESS;
  }

  getTimeAndDate() {
    return `${this.date.getDay()}/${this.date.getMonth()}/${this.date.getFullYear()} - ${this.getTime()}`;
  }

  getLowestPrice() {
    let lowestFungible = Math.min(
      this.fungibleTickets.map((ticket) => Number(ticket.price))
    );
    let lowestNonFungible = Math.min(
      this.nonFungibleTickets.map((ticket) => Number(ticket.price))
    );
    return Math.min(lowestFungible, lowestNonFungible);
  }

  getTicketType(ticketTypeId, isNf = false) {
    if (isNf) {
      const foundNonFungible = this.nonFungibleTickets.find(
        (t) => t.typeId === ticketTypeId
      );
      return foundNonFungible;
    } else {
      const foundFungible = this.fungibleTickets.find(
        (t) => t.typeId === ticketTypeId
      );
      return foundFungible;
    }
  }

  getNfTicket(ticketTypeId, ticketId) {
    const foundNonFungible = this.nonFungibleTickets.find(
      (t) => t.typeId === ticketTypeId
    );
    if (foundNonFungible) {
      return foundNonFungible.tickets.find((t) => t.ticketId === ticketId);
    }
  }

  async verifySocials() {
    try {
      this.requestTwitterVerification();
      this.requestUrlVerification();
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  async requestTwitterVerification() {
    this.twitter.verification = await requestTwitterVerification(
      getHandle(this.twitter.url)
    );
  }

  async requestUrlVerification() {
    this.website.verification = await requestWebsiteVerification(
      this.website.url
    );
  }

  async loadIPFSMetadata() {
    var ipfsData = null;
    for await (const chunk of ipfsClient.cat(this.ipfsHash, {
      timeout: 10000,
    })) {
      ipfsData = Buffer(chunk, "utf8").toString();
    }
    console.log(String(ipfsData));
    const metadata = JSON.parse(ipfsData);
    this.location = metadata.event.location;
    this.title = metadata.event.title;
    this.image = metadata.event.image;
    this.description = metadata.event.description;
    this.category = metadata.event.category;
    this.duration = metadata.event.duration;
    this.twitter.url = metadata.event.twitter;
    this.website.url = metadata.event.url;
    this.timestamp = metadata.event.time;
    this.color = metadata.event.color;
    this.timestamp = metadata.event.time;
    this.date = new Date(this.timestamp * 1000);
    this.hours = this.date.getHours();

    this.minutes = "0" + this.date.getMinutes();
    this.seconds = "0" + this.date.getSeconds();
  }

  hasFungibleTicketType(id) {
    return this.fungibleTickets.filter((t) => t.typeId == id).length > 0
      ? this.fungibleTickets.filter((t) => t.typeId == id)[0]
      : false;
  }

  hasNonFungibleTicketType(id) {
    return this.nonFungibleTickets.filter((t) => t.typeId == id).length > 0
      ? this.nonFungibleTickets.filter((t) => t.typeId == id)[0]
      : false;
  }

  updateNfOwner(ticketType, ticketId, owner) {
    let ticket = this.nonFungibleTickets
      .find((tt) => tt.typeId === ticketType)
      .tickets.find((t) => t.ticketId === ticketId);
    ticket.owner = owner;
  }

  hasNonFungibleTicket(ticketType, ticketId) {
    const tt = this.getTicketType(ticketType, true);
    if (tt) {
      return tt.tickets.find((t) => t.ticketId === ticketId);
    }
    return false;
  }

  updateTicketsSold(ticketTypeId, isNf, amount) {
    let ticketType;
    if (isNf) {
      ticketType = this.nonFungibleTickets.find(
        (t) => t.typeId === ticketTypeId
      );
    } else {
      ticketType = this.fungibleTickets.find((t) => t.typeId === ticketTypeId);
    }
    ticketType.ticketsSold += amount;
  }

  adjustOrders(
    ticketTypeId,
    isNf,
    percentage,
    quantity,
    buyOrSell,
    placedOrFilled,
    address,
    ticketId = 0
  ) {
    if (!isNf) {
      let ticketType = this.getTicketType(ticketTypeId, false);
      if (buyOrSell === "buy") {
        if (placedOrFilled === "placed") {
          addBuyOrders(ticketType, percentage, quantity, address);
        } else {
          removeBuyOrders(ticketType, percentage, quantity, address);
        }
        /* SELL */
      } else {
        if (placedOrFilled === "placed") {
          addSellOrders(ticketType, percentage, quantity, address);
        } else {
          removeSellOrders(ticketType, percentage, quantity, address);
        }
      }
    } else {
      let ticketType = this.getTicketType(ticketTypeId, true);
      if (buyOrSell == "buy") {
        if (placedOrFilled === "placed") {
          addBuyOrders(ticketType, percentage, quantity, address, ticketId);
        } else {
          removeBuyOrders(ticketType, percentage, quantity, address, ticketId);
        }
        /* SELL */
      } else {
        if (placedOrFilled === "placed") {
          addSellOrders(ticketType, percentage, quantity, address, ticketId);
        } else {
          removeSellOrders(ticketType, percentage, quantity, address, ticketId);
        }
      }
    }
  }

  // --------------------------------- Event Handlers ---------------------------------
  async handleMintNonFungibles(event) {
    const owner = event.returnValues.owner;
    for (const id of event.returnValues.ids) {
      const ticketType = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      this.updateNfOwner(ticketType, ticketId, owner);
      this.updateTicketsSold(ticketType, true, 1);
    }
  }

  handleMintFungibles(event) {
    const ticketType = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = Number(event.returnValues.quantity);
    this.updateTicketsSold(ticketType, false, quantity);
  }

  handleBuyOrderWithdrawn(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    const nf = isNf(new BigNumber(event.returnValues.ticketType));
    const ticketId = nf
      ? Number(
          getTicketId(new BigNumber(event.returnValues.ticketType)).toFixed()
        )
      : 0;
    this.adjustOrders(
      ticketTypeId,
      nf,
      percentage,
      quantity,
      "buy",
      "filled",
      address,
      ticketId
    );
  }
  handleSellOrderFungibleWithdrawn(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    this.adjustOrders(
      ticketTypeId,
      false,
      percentage,
      quantity,
      "sell",
      "filled",
      address
    );
  }
  handleSellOrderNonFungibleWithdrawn(event) {
    const address = event.returnValues.addr;
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues._id)).toFixed()
    );
    const ticketId = Number(
      getTicketId(new BigNumber(event.returnValues._id)).toFixed()
    );
    this.adjustOrders(
      ticketTypeId,
      true,
      0,
      1,
      "sell",
      "filled",
      address,
      ticketId
    );
  }
  handleBuyOrderNonFungibleFilled(event) {
    const address = event.returnValues.addr;
    for (const [index, id] of event.returnValues._ids.entries()) {
      const ticketTypeId = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const percentage = event.returnValues.percentage[index];
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      this.adjustOrders(
        ticketTypeId,
        true,
        percentage,
        1,
        "buy",
        "filled",
        address,
        ticketId
      );
    }
  }
  handleSellOrderNonFungibleFilled(event) {
    const address = event.returnValues.addr;
    for (const [index, id] of event.returnValues._ids.entries()) {
      const ticketTypeId = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const percentage = event.returnValues.percentage[index];
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      this.adjustOrders(
        ticketTypeId,
        true,
        percentage,
        1,
        "sell",
        "filled",
        address,
        ticketId
      );
    }
  }
  handleSellOrderNonFungiblePlaced(event) {
    const address = event.returnValues.addr;
    for (const [index, id] of event.returnValues._ids.entries()) {
      const ticketTypeId = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const percentage = event.returnValues.percentage[index];
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      this.adjustOrders(
        ticketTypeId,
        true,
        percentage,
        1,
        "sell",
        "placed",
        address,
        ticketId
      );
    }
  }
  handleBuyOrderFungibleFilled(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    this.adjustOrders(
      ticketTypeId,
      false,
      percentage,
      quantity,
      "buy",
      "filled",
      address
    );
  }
  handleSellOrderFungibleFilled(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    this.adjustOrders(
      ticketTypeId,
      false,
      percentage,
      quantity,
      "sell",
      "filled",
      address
    );
  }
  handleSellOrderFungiblePlaced(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    this.adjustOrders(
      ticketTypeId,
      false,
      percentage,
      quantity,
      "sell",
      "placed",
      address
    );
  }
  handleBuyOrderPlaced(event) {
    const ticketTypeId = Number(
      getTicketTypeIndex(new BigNumber(event.returnValues.ticketType)).toFixed()
    );
    const quantity = event.returnValues.quantity;
    const address = event.returnValues.addr;
    const percentage = event.returnValues.percentage;
    const nf = isNf(new BigNumber(event.returnValues.ticketType));
    const ticketId = nf
      ? Number(
          getTicketId(new BigNumber(event.returnValues.ticketType)).toFixed()
        )
      : 0;
    this.adjustOrders(
      ticketTypeId,
      nf,
      percentage,
      quantity,
      "buy",
      "placed",
      address,
      ticketId
    );
  }
  async handleTicketMetadata(event) {
    const ticketTypeNr = getTicketTypeIndex(
      new BigNumber(event.returnValues.ticketTypeId)
    ).toFixed();
    const isNfTT = isNf(new BigNumber(event.returnValues.ticketTypeId));
    let ticketType = this.getTicketType(ticketTypeNr, isNfTT);
    let exists = true;
    if (!ticketType) {
      exists = false;
      ticketType = isNfTT
        ? new NonFungibleTicketType(this.contractAddress, ticketTypeNr)
        : new FungibleTicketType(this.contractAddress, ticketTypeNr);
    }
    const ticketMetadata = await this.contract.methods
      .ticketTypeMeta(event.returnValues.ticketTypeId)
      .call();
    ticketType.color = ticketMetadata.color;
    ticketType.price = Number(ticketMetadata.price);
    ticketType.ticketsSold = Number(ticketMetadata.ticketsSold);
    ticketType.supply = Number(ticketMetadata.supply);
    const ipfsHash = argsToCid(
      event.returnValues.hashFunction,
      event.returnValues.size,
      event.returnValues.digest
    );
    ticketType.ipfsHash = ipfsHash;
    const granularity = await this.contract.methods.granularity().call();
    ticketType.aftermarketGranularity = Number(granularity);
    // check presale
    const lottery = await this.contract.methods
      .lotteries(event.returnValues.ticketTypeId)
      .call();
    if (lottery.supply > 0) {
      ticketType.presaleSupply = Number(lottery.supply);
      ticketType.presaleClosingBlock = Number(lottery.block);
    }
    if (isNfTT) {
      for (let j = 1; j <= Number(ticketType.supply); j++) {
        const ticketId = getIdAsBigNumber(true, ticketTypeNr, j).toFixed();
        let ticket = this.hasNonFungibleTicket(ticketTypeNr, j);
        if (!ticket) {
          ticket = new NonFungibleTicket(this.contractAddress, ticketTypeNr, j);
        }
        const owner = await this.contract.methods.nfOwners(ticketId).call();
        ticket.owner = owner;
        ticketType.tickets.push(ticket);
      }
    }
    await loadIPFSMetadata(ticketType);
    if (!exists) {
      if (isNfTT) {
        this.nonFungibleTickets.push(ticketType);
      } else {
        this.fungibleTickets.push(ticketType);
      }
    }
  }

  async handleEventMetadata(event) {
    this.ipfsHash = argsToCid(
      event.returnValues.hashFunction,
      event.returnValues.size,
      event.returnValues.digest
    );
    await this.loadIPFSMetadata();
    await this.fetchPosition();

    const currency = await this.contract.methods.erc20Contract().call();
    const identityContractAddress = await this.contract.methods
      .identityApprover()
      .call();
    const identityLevel = await this.contract.methods.identityLevel().call();
    this.currency = currency;
    this.identityContractAddress = identityContractAddress;
    this.identityLevel = identityLevel;
  }

  // we dont need these events at the momont
  async handlePresaleCreated() {}
  async handlePresaleJoined() {}
  async handleValueTransferred() {}

  // go over all missed events while the app was offline and handle them
  async handleMissedEvents() {
    const events = await this.contract.getPastEvents("allEvents", {
      fromBlock: this.lastFetchedBlock,
    });
    for (const event of events) {
      await this[`handle${event.event}`](event);
    }
    return true;
  }
}
