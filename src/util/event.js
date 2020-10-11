/* 
  This file contains the Event class and all its member functions. The main functionality contained here is the loading of event metadata and tickets from the Blockchain as well as handling Solidity events related to the event and its ticket. 
*/
import {
  getIdAsBigNumber,
  getTicketId,
  getTicketTypeIndex,
  argsToCid,
  isNf
} from "idetix-utils";
import {
  NonFungibleTicket,
  NonFungibleTicketType,
  FungibleTicketType,
  addBuyOrders,
  removeBuyOrders,
  addSellOrders,
  removeSellOrders,
  getLowestSellOrder
} from "./tickets";
import axios from "axios";
import {
  MintFungibles,
  ticketMetadataChanged,
  MintNonFungibles,
  BuyOrderPlaced,
  SellOrderFungiblePlaced,
  BuyOrderFungibleFilled,
  SellOrderFungibleWithdrawn,
  SellOrderNonFungiblePlaced,
  SellOrderNonFungibleFilled,
  BuyOrderNonFungibleFilled,
  SellOrderNonFungibleWithdrawn,
  BuyOrderWithdrawn,
  SellOrderFungibleFilled,
  eventMetadataChanged
} from "./blockchainEventHandler";
import { NULL_ADDRESS } from "./constants/constants";

import { fetchIpfsHash, loadIPFSMetadata } from "./tickets";

const BigNumber = require("bignumber.js");

export class Event {
  constructor(contractAddress) {
    // hack to turn events from idb into proper event objects
    if (typeof contractAddress === "object") {
      Object.assign(this, contractAddress);
      this.contractAddress = contractAddress.contractAddress;
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
  }

  parseTimeStamp() {
    this.date = new Date(this.timestamp * 1000);
    this.hours = this.date.getHours();
    this.minutes = "0" + this.date.getMinutes();
    this.seconds = "0" + this.date.getSeconds();
  }

  getTime() {
    return this.hours + ":" + this.minutes.substr(-2);
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
      lng: first.geometry.lng
    };
    this.latlong = latlong;
  }

  getNfOwner(ticketType, ticketId) {
    if (this.getTicketType(ticketType).isNf) {
      return this.getNfTicket(ticketType, ticketId).owner;
    }
    return false;
  }

  hasSellOrders(ticketType, ticket = false) {
    let t;
    if (!ticket) {
      t = this.fungibleTickets.find(t => t.typeId === ticketType);
      return t.sellOrders.length !== 0;
    } else {
      const tt = this.nonFungibleTickets.find(
        type => type.typeId === ticketType
      );
      t = tt.tickets.find(temp => temp.ticketId === ticket);
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
        type => type.typeId === ticketType
      );
      ticket = tt.tickets.find(t => t.ticketId === ticketId);
      return getLowestSellOrder(ticket);
    }
  }

  getSellOrdersByAddress(address, ticketType, nfId) {
    if (nfId) {
      const tt = this.getTicketType(ticketType, true);
      const t = tt.tickets.find(ticket => ticket.ticketId === nfId);
      return t.sellOrder.address === address ? t.sellOrder : {};
    } else {
      const tt = this.getTicketType(ticketType, false);
      return tt.sellOrders.filter(o => o.address === address);
    }
  }
  getBuyOrdersByAddress(address, isNf) {
    let buyOrders = [];
    const tickets = !isNf ? this.fungibleTickets : this.nonFungibleTickets;
    for (const tt of tickets) {
      let orders = tt.buyOrders.filter(o => o.address === address);
      orders.forEach(o => {
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
      this.fungibleTickets.map(ticket => Number(ticket.price))
    );
    let lowestNonFungible = Math.min(
      this.nonFungibleTickets.map(ticket => Number(ticket.price))
    );
    return Math.min(lowestFungible, lowestNonFungible);
  }

  getTicketType(ticketTypeId, isNf = false) {
    if (isNf) {
      const foundNonFungible = this.nonFungibleTickets.find(
        t => t.typeId === ticketTypeId
      );
      return foundNonFungible;
    } else {
      const foundFungible = this.fungibleTickets.find(
        t => t.typeId === ticketTypeId
      );
      return foundFungible;
    }
  }

  getNfTicket(ticketTypeId, ticketId) {
    const foundNonFungible = this.nonFungibleTickets.find(
      t => t.typeId === ticketTypeId
    );
    if (foundNonFungible) {
      return foundNonFungible.tickets.find(t => t.ticketId === ticketId);
    }
  }

  async metadataChanged(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const changed = await eventMetadataChanged(
      eventSC,
      this.lastFetchedBlock + 1
    );
    return changed;
  }

  async loadData(ABI, ipfsInstance, web3Instance) {
    try {
      const changed = await this.metadataChanged(ABI, web3Instance);
      if (changed) {
        await this.fetchIPFSHash(ABI, web3Instance);
        await this.loadIPFSMetadata(ipfsInstance);
        await this.fetchPosition();
      }
      await this.loadFungibleTickets(web3Instance, ABI, ipfsInstance);
      await this.loadNonFungibleTickets(web3Instance, ABI, ipfsInstance);
      await this.loadOwnerShipChanges(web3Instance, ABI);
      await this.loadTicketsSoldChanges(web3Instance, ABI);
      await this.loadAftermarketChanges(web3Instance, ABI);
    } catch (e) {
      console.log(e);
      return false;
    }
    return true;
  }

  async fetchIPFSHash(ABI, web3Instance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const eventMetadata = await eventSC.getPastEvents("EventMetadata", {
      fromBlock: this.lastFetchedBlock + 1
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
      timeout: 2000
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

  hasFungibleTicketType(id) {
    return this.fungibleTickets.filter(t => t.typeId == id).length > 0
      ? this.fungibleTickets.filter(t => t.typeId == id)[0]
      : false;
  }

  hasNonFungibleTicketType(id) {
    return this.nonFungibleTickets.filter(t => t.typeId == id).length > 0
      ? this.nonFungibleTickets.filter(t => t.typeId == id)[0]
      : false;
  }

  async loadFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.fNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        const typeIdentifier = getIdAsBigNumber(false, i);
        const changed = await ticketMetadataChanged(
          eventSC,
          this.lastFetchedBlock + 1,
          typeIdentifier
        );
        if (changed) {
          const exists = this.hasFungibleTicketType(i);
          let ticketType = exists
            ? exists
            : new FungibleTicketType(this.contractAddress, i);
          const ticketMapping = await eventSC.methods
            .ticketTypeMeta(typeIdentifier)
            .call();
          ticketType.price = ticketMapping.price;
          ticketType.ticketsSold = Number(ticketMapping.ticketsSold);
          ticketType.supply = Number(ticketMapping.supply);
          const granularity = await eventSC.methods.granularity().call();
          ticketType.aftermarketGranularity = granularity;
          await fetchIpfsHash(ticketType, web3Instance, ABI);
          await loadIPFSMetadata(ticketType, ipfsInstance);
          //await loadSellOrders(ticketType, web3Instance, ABI);
          //await loadBuyOrders(ticketType, web3Instance, ABI);
          if (!exists) {
            this.fungibleTickets.push(ticketType);
          }
        }
      }
    }
  }

  async loadNonFungibleTickets(web3Instance, ABI, ipfsInstance) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const nonce = await eventSC.methods.nfNonce().call();
    // nonce shows how many ticket types exist for this event
    if (nonce > 0) {
      for (let i = 1; i <= nonce; i++) {
        const typeIdentifier = getIdAsBigNumber(false, i);
        const changed = await ticketMetadataChanged(
          eventSC,
          this.lastFetchedBlock + 1,
          typeIdentifier
        );
        if (changed) {
          const exists = this.hasNonFungibleTicketType(i);
          let ticketType = exists
            ? exists
            : new NonFungibleTicketType(this.contractAddress, i);
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
            let ticket = this.hasNonFungibleTicket(i, j);
            if (!ticket) {
              ticket = new NonFungibleTicket(this.contractAddress, i, j);
            }
            const owner = await eventSC.methods.nfOwners(ticketId).call();
            ticket.owner = owner;
            //const sellOrder = await eventSC.methods.nfTickets(ticketId).call();
            //ticket.sellOrder = sellOrder;
            ticketType.tickets.push(ticket);
          }
          await fetchIpfsHash(ticketType, web3Instance, ABI);
          await loadIPFSMetadata(ticketType, ipfsInstance);

          //await loadSellOrders(ticketType, web3Instance, ABI);
          //await loadBuyOrders(ticketType, web3Instance, ABI);
          if (!exists) {
            this.nonFungibleTickets.push(ticketType);
          }
        }
      }
    }
  }

  updateNfOwner(ticketType, ticketId, owner) {
    let ticket = this.nonFungibleTickets
      .find(tt => tt.typeId === ticketType)
      .tickets.find(t => t.ticketId === ticketId);
    ticket.owner = owner;
  }

  hasNonFungibleTicket(ticketType, ticketId) {
    const tt = this.getTicketType(ticketType, true);
    if (tt) {
      return tt.tickets.find(t => t.ticketId === ticketId);
    }
    return false;
  }

  updateTicketsSold(ticketTypeId, isNf, amount) {
    let ticketType;
    if (isNf) {
      ticketType = this.nonFungibleTickets.find(t => t.typeId === ticketTypeId);
    } else {
      ticketType = this.fungibleTickets.find(t => t.typeId === ticketTypeId);
    }
    ticketType.ticketsSold += amount;
  }

  async loadOwnerShipChanges(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const events = await MintNonFungibles(eventSC, this.lastFetchedBlock + 1);
    for (const event of events) {
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
  }

  async loadTicketsSoldChanges(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);
    const events = await MintFungibles(eventSC, this.lastFetchedBlock + 1);
    for (const event of events) {
      //const owner = event.returnValues.owner;
      const ticketType = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
      );
      const quantity = Number(event.returnValues.quantity);
      this.updateTicketsSold(ticketType, false, quantity);
    }
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

  async loadAftermarketChanges(web3Instance, ABI) {
    const eventSC = new web3Instance.eth.Contract(ABI, this.contractAddress);

    const buyOrdersPlaced = await BuyOrderPlaced(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of buyOrdersPlaced) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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

    const buyOrderWithdrawn = await BuyOrderWithdrawn(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of buyOrderWithdrawn) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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

    const sellOrderFungiblePlaced = await SellOrderFungiblePlaced(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderFungiblePlaced) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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

    const sellOrderFungibleFilled = await SellOrderFungibleFilled(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderFungibleFilled) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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

    const buyOrderFungibleFilled = await BuyOrderFungibleFilled(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of buyOrderFungibleFilled) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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

    const sellOrderFungibleWithdrawn = await SellOrderFungibleWithdrawn(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderFungibleWithdrawn) {
      const ticketTypeId = Number(
        getTicketTypeIndex(
          new BigNumber(event.returnValues.ticketType)
        ).toFixed()
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
    const sellOrderNonFungiblePlaced = await SellOrderNonFungiblePlaced(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderNonFungiblePlaced) {
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
    const sellOrderNonFungibleFilled = await SellOrderNonFungibleFilled(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderNonFungibleFilled) {
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

    const buyOrderNonFungibleFilled = await BuyOrderNonFungibleFilled(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of buyOrderNonFungibleFilled) {
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

    const sellOrderNonFungibleWithdrawn = await SellOrderNonFungibleWithdrawn(
      eventSC,
      this.lastFetchedBlock + 1
    );
    for (const event of sellOrderNonFungibleWithdrawn) {
      const address = event.returnValues.addr;
        const ticketTypeId = Number(
          getTicketTypeIndex(
            new BigNumber(event.returnValues._id)
          ).toFixed()
        );
        const ticketId = Number(getTicketId(new BigNumber(event.returnValues._id)).toFixed());
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
  }
}
