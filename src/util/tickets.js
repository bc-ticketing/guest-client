import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import { NULL_ADDRESS } from "./constants/constants";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

const BigNumber = require("bignumber.js");

/**
 * Returns the number of available seats for a ticket Type
 * @param {TicketType} ticket 
 */
export function numberFreeSeats(ticket) {
  return ticket.supply - ticket.ticketsSold;
}

/**
 * Fetches the buy orders for a Fungible ticketType and stores it in the object
 * @param {FungibleTicketType} ticket
 * @param {web3Instance} web3Instance
 * @param {SC_ABI} ABI 
 */
export async function loadBuyOrders(ticket, web3Instance, ABI) {
  const aftermarket = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
    const percentage = (100 / ticket.aftermarketGranularity) * i;
    const buyingQueue = await aftermarket.methods
      .buyingQueue(getFullTicketTypeId(false, ticket.typeId), percentage)
      .call();
    const numBuyingOrders = buyingQueue.numberTickets;
    if (numBuyingOrders > 0) {
      ticket.buyOrders[percentage] = numBuyingOrders;
    }
  }
  return ticket;
}

/**
 * Fetches the sell orders for a Fungible ticketType and stores it in the object
 * @param {FungibleTicketType} ticket
 * @param {web3Instance} web3Instance
 * @param {SC_ABI} ABI 
 */
export async function loadSellOrders(ticket, web3Instance, ABI) {
  const aftermarket = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
    const percentage = (100 / ticket.aftermarketGranularity) * i;
    const sellingQueue = await aftermarket.methods
      .sellingQueue(getFullTicketTypeId(false, ticket.typeId), percentage)
      .call();
    const numSellOrders = sellingQueue.numberTickets;
    if (numSellOrders > 0) {
      ticket.sellOrders[percentage] = numSellOrders;
    }
  }
  return ticket;
}

/**
 * Returns true if the NFTicket or FTicketType has sell orders
 * @param {Ticket} ticket
 */
export function hasSellOrder(ticket) {
  if(!ticket.isNf) {
    return Object.keys(ticket.sellOrders).length === 0 && ticket.sellOrders.constructor === Object
  } else {
    return new BigNumber(ticket.sellOrder.userAddress).isZero() ? false : true;
  }
  
}

/**
 * Checks for the highest available buy order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns highestBuyOrder or 0 if none
 */
export function getHighestBuyOrder(ticket) {
  for (const [key, value] of Object.entries(ticket.buyOrders)) {
    if (value > 0) {
      return key;
    }
  }
  return 0;
}

/**
 * Checks for the lowst available sell order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns lowestSellOrder or 0 if none
 */
export function getLowestSellOrder(ticket) {
  for (const [key, value] of Object.entries(ticket.sellOrders).reverse()) {
    if (value > 0) {
      return { queue: key, amount: value };
    }
  }
  return 0;
}

/* BUY ORDERS */
export async function makeBuyOrderFungible(
  ticketType,
  amount,
  percentage,
  price,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .makeBuyOrder(getFullTicketTypeId(false,ticketType), amount, percentage)
    .send({
      from: account,
      value:
        amount *
        web3Instance.utils.toWei(
          String(Math.floor(price * (percentage / 100)))
        ),
    });
  console.log(result);
}

export async function makeBuyOrderNonFungible(
  ticketType,
  amount,
  percentage,
  price,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .makeBuyOrder(getFullTicketTypeId(true, ticketType), amount, percentage)
    .send({
      from: account,
      value:
        amount *
        web3Instance.utils.toWei(
          String(Math.floor(price * (percentage / 100)))
        ),
    });
  console.log(result);
}

export async function fillBuyOrderFungible(
  ticketType,
  amount,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .fillBuyOrderFungibles(getFullTicketTypeId(false, ticketType), amount, percentage)
    .send({
      from: account,
    });
  console.log(result);
}
export async function fillBuyOrderNonFungibles(
  ticketType,
  ticketId,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .fillBuyOrderNonFungibles([getFullTicketId(ticketType, ticketId)], [percentage])
    .send({
      from: account,
    });
  console.log(result);
}

/* SELL ORDERS */
export async function makeSellOrderFungible(
  ticketType,
  amount,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .makeSellOrderFungibles(getFullTicketTypeId(false, ticketType), amount, percentage)
    .send({
      from: account,
    });
  console.log(result);
}

export async function makeSellOrderNonFungible(
  ticketType,
  ticket,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  //const ticketIds = tickets.map((ticket) => getFullTicketId(ticket));
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = await contract.methods
    .makeSellOrderNonFungibles([getFullTicketId(ticketType, ticket)], [percentage])
    .send({
      from: account,
    });
  console.log(result);
}

export async function fillSellOrderFungible(
  ticketType,
  amount,
  price,
  percentage,
  account,
  web3Instance,
  eventContractAddress,
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  var result = await contract.methods
    .fillSellOrderFungibles(getFullTicketId(ticketType), amount, percentage)
    .send({
      from: account,
      value:
        amount *
        web3Instance.utils.toWei(
          String(Math.floor(price * (percentage / 100)))
        ),
    });
  console.log(result);
}

export async function fillSellOrderNonFungible(
  ticketType,
  ticket,
  percentage,
  price,
  account,
  web3Instance,
  eventContractAddress
) {
  //const reducer = (total, ticket, index) =>
    //total + Math.floor(ticket.ticketType.price * percentages[index]);
  //const total = web3Instance.utils.toWei(String(tickets.reduce(reducer)));
  //const ticketIds = tickets.map((ticket) => ticket.getFullTicketId());
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  var result = await contract.methods
    .fillSellOrderFungibles([getFullTicketId(ticketType, ticket)], [percentage])
    .send({
      from: account,
      value: web3Instance.utils.toWei(price * percentage)
    });
  console.log(result);
}

/* BUY DIRECTLY */
export async function buyFungible(ticket, amount, web3Instance, ABI, account){
  const eventSC = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  const result = await eventSC.methods
      .mintFungible(getFullTicketTypeId(false, ticket), amount)
      .send({
        from: account,
        value: amount * web3Instance.utils.toWei(ticket.price),
      });
      console.log(result);
}

export async function buyNonFungible(ticket, web3Instance, ABI, account){
  const eventSC = new web3Instance.eth.Contract(
    ABI,
    ticket.ticketType.eventContractAddress
  );
  const result = await eventSC.methods
  .mintNonFungibles([getFullTicketId(ticket)])
  .send({
    from: account,
    value: web3Instance.utils.toWei(String(ticket.ticketType.price)),
  });
  console.log(result);
}

/**
 * loads Metadata stored on IPFS for a ticketType
 * @param {TicketType} ticket
 * @param {ipfsInstance} ipfsInstance
 */
export async function loadIPFSMetadata(ticket, ipfsInstance) {
  if (ticket.ipfsHash === "") {
    return;
  }
  var ipfsData = null;
  for await (const chunk of ipfsInstance.cat(ticket.ipfsHash, {
    timeout: 2000,
  })) {
    ipfsData = Buffer(chunk, "utf8").toString();
  }
  const metadata = JSON.parse(ipfsData);
  ticket.description = metadata.ticket.description;
  ticket.seatMapping = metadata.ticket.mapping;
  ticket.title = metadata.ticket.title;
  if (ticket.isNf) {
    metadata.ticket.mapping.forEach((mapping, index) => {
      if (index >= ticket.tickets.length) {
        return;
      }
      ticket.tickets[index].seatMapping = mapping;
    });
  }
  return ticket;
}

/**
 * Fetches the IPFS hash on the blockchain for a ticket Type
 * @param {TicketType} ticket
 */
export async function fetchIpfsHash(ticket, web3Instance, ABI) {
  const eventSC = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
    filter: { ticketTypeId: getFullTicketTypeId(ticket.isNf, ticket.typeId) },
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
  ticket.ipfsHash = ipfsHash;
  return ticket;
}

/**
 * Calculates the full Ticket Type Identifier
 * @param {isNf} Boolean,
 * @param {typeId} Number,
 * @returns {Identifier} String
 */
export function getFullTicketTypeId(isNf, typeId) {
  return getIdAsBigNumber(isNf, typeId).toFixed();
}

/**
 * Calculates the full Ticket Identifier for a NF Ticket
 * @param {ticketId} Number,
 * @param {ticketTypeId} Number
 * @returns {Identifier} String
 */
export function getFullTicketId(ticketId, ticketTypeId) {
  // return nonFungibleBaseId.plus(ticket.ticketTypeId).plus(ticket.ticketId)
  return getIdAsBigNumber(true, ticketTypeId, ticketId).toFixed();
}

/** 
 * Checks if a NF ticket is free
 * @param {NonFungibleTicket} ticket
 * @returns {Boolean} isFree 
 */ 
export function isFree(ticket) {
  return ticket.owner === NULL_ADDRESS;
}


/** 
 * Data Class for Fungible Ticket types
*/
export class FungibleTicketType {
  constructor(eventContractAddress, typeId) {
    this.eventContractAddress = eventContractAddress;
    this.typeId = typeId;
    this.price = 0;
    this.supply = 0;
    this.ticketsSold = 0;
    this.aftermarketGranularity = 0;
    this.title = "";
    this.description = "";
    this.color = "";
    this.ipfsHash = "";
    this.sellOrders = {};
    this.buyOrders = {};
    this.seatMapping = [];
    this.isNf = false;
  }
}
/**
 * Data Class for Nonfungible Ticket Types
 */
export class NonFungibleTicketType {
  constructor(eventContractAddress, typeId) {
    this.eventContractAddress = eventContractAddress;
    this.typeId = typeId;
    this.price = 0;
    this.supply = 0;
    this.ticketsSold = 0;
    this.aftermarketGranularity = 0;
    this.title = "";
    this.description = "";
    this.color = "";
    this.ipfsHash = "";
    this.sellOrders = {};
    this.buyOrders = {};
    this.tickets = [];
    this.isNf = true;
  }
}

/**
 * Data Class for Nonfungible Tickets
 */
export class NonFungibleTicket {
  constructor(eventContractAddress, ticketTypeId, ticketId) {
    this.eventContractAddress = eventContractAddress;
    this.ticketTypeId = ticketTypeId;
    this.ticketId = ticketId;
    this.buyOrder = {};
    this.sellOrder = {};
    this.seatMapping = undefined;
    this.owner = undefined;
    this.isNf = true;
  }
}
