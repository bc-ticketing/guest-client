import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import {
  NULL_ADDRESS,
  MESSAGE_TRANSACTION_DENIED,
  MESSAGE_TICKET_BOUGHT,
  MESSAGE_DEFAULT_ERROR,
  MESSAGE_MAX_TICKETS_ALLOWED
} from "./constants/constants";
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
  if (!ticket.isNf) {
    return ticket.sellOrders.length != 0;
  } else {
    return new BigNumber(ticket.sellOrder.address).isZero() ? false : true;
  }
}

/**
 * Checks for the highest available buy order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns highestBuyOrder or 0 if none
 */
export function getHighestBuyOrder(ticket) {
  const sorted = ticket.buyOrders.sort((a, b) => {
    a.percentage - b.percentage;
  });
  return sorted.length > 0 ? sorted[0] : {};
}

/**
 * Checks for the lowst available sell order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns lowestSellOrder or 0 if none
 */
export function getLowestSellOrder(ticket) {
  if (ticket.isNf) {
    return ticket.sellOrder;
  }
  const sorted = ticket.sellOrders.sort((a, b) => {
    a.percentage - b.percentage;
  });
  return sorted.length > 0 ? sorted[0] : {};
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
  try {
    const result = await contract.methods
      .makeBuyOrder(getFullTicketTypeId(false, ticketType), amount, percentage)
      .send({
        from: account,
        value: String(Math.floor((amount * price * percentage) / 100))
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
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
  try {
    const result = await contract.methods
      .makeBuyOrder(getFullTicketTypeId(true, ticketType), amount, percentage)
      .send({
        from: account,
        value: String(Math.floor((amount * price * percentage) / 100))
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
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
  try {
    const result = await contract.methods
      .fillBuyOrderFungibles(
        getFullTicketTypeId(false, ticketType),
        amount,
        percentage
      )
      .send({
        from: account
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
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
  try {
    const result = await contract.methods
      .fillBuyOrderNonFungibles(
        [getFullTicketId(ticketType, ticketId)],
        [percentage]
      )
      .send({
        from: account
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
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
  try {
    const result = await contract.methods
      .makeSellOrderFungibles(
        getFullTicketTypeId(false, ticketType),
        amount,
        percentage
      )
      .send({
        from: account
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
}

export async function withdrawSellOrderFungible(
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
  try {
    const result = await contract.methods
      .withdrawSellOrderFungible(
        getFullTicketTypeId(false, ticketType),
        amount,
        percentage,
        0
      )
      .send({
        from: account
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
}

export async function makeSellOrderNonFungible(
  ticketType,
  ticket,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  try {
    const result = await contract.methods
      .makeSellOrderNonFungibles(
        [getFullTicketId(ticket, ticketType)],
        [percentage]
      )
      .send({
        from: account
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
}

export async function fillSellOrderFungible(
  ticketType,
  amount,
  price,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  console.log("type; " + getFullTicketTypeId(false, ticketType));
  console.log("quantity: " + amount);
  console.log("percentage: " + percentage);
  const total =
    amount * new BigNumber(String(Math.floor((price * percentage) / 100)));
  console.log("total: " + String(total));
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  try {
    await contract.methods
      .fillSellOrderFungibles(
        getFullTicketTypeId(false, ticketType),
        1,
        percentage
      )
      .send({
        from: account,
        gas: 5000000,
        value: total
      })
      .on("receipt", function(receipt) {
        console.log(receipt);
        return receipt;
      })
      .on("error", function(error, receipt) {
        console.log(receipt);
        console.log(error);
        return decodeError(error);
      });
  } catch (e) {
    return decodeError(e);
  }
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
  try {
    var result = await contract.methods
      .fillSellOrderFungibles(
        [getFullTicketId(ticket, ticketType)],
        [percentage]
      )
      .send({
        from: account,
        value: price * (percentage / 100)
      });
    console.log(result);
  } catch (e) {
    return decodeError(e);
  }
}

function decodeError(e) {
  if (e.code === 4001) {
    return {
      message: MESSAGE_TRANSACTION_DENIED,
      status: -1
    };
  } else if (e.code === -32603) {
    return {
      message: MESSAGE_MAX_TICKETS_ALLOWED,
      status: -1
    };
  }
  return {
    message: MESSAGE_DEFAULT_ERROR,
    status: -1
  };
}

/* BUY DIRECTLY */
export async function buyFungible(
  ticketType,
  amount,
  price,
  web3Instance,
  ABI,
  account,
  eventContractAddress
) {
  const eventSC = new web3Instance.eth.Contract(ABI, eventContractAddress);
  let result;
  await eventSC.methods
    .mintFungible(getFullTicketTypeId(false, new BigNumber(ticketType)), amount)
    .send({
      from: account,
      value: amount * price
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_TICKET_BOUGHT,
          status: 1
        };
      }
    })
    .on("error", function(error) {
      result = decodeError(error);
    })
    .catch(function(e) {
      result = decodeError(e);
    });
    return result;
}

export async function buyNonFungible(
  ticketType,
  ticket,
  price,
  web3Instance,
  ABI,
  account,
  eventContractAddress
) {
  const eventSC = new web3Instance.eth.Contract(ABI, eventContractAddress);
  let result;
  await eventSC.methods
    .mintNonFungibles([getFullTicketId(ticket, ticketType)])
    .send({
      from: account,
      value: price
    })
    .on("receipt", function(receipt) {
      console.log(receipt);
      if (receipt.status === "true") {
        result = {
          message: MESSAGE_TICKET_BOUGHT,
          status: 1
        };
      }
      return receipt;
    })
    .on("error", function(error) {
      result = decodeError(error);
    })
    .catch(function(e) {
      result = decodeError(e);
    });
    return result;
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
    timeout: 2000
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
    filter: {
      ticketTypeId: getFullTicketTypeId(ticket.isNf, ticket.typeId)
    },
    fromBlock: 1
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
  const test = getIdAsBigNumber(true, ticketTypeId, ticketId);
  console.log("full id: " + test.toFixed());
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

export function addBuyOrders(
  ticketType,
  percentage,
  quantity,
  address,
  ticketId = 0
) {
  if (ticketId == 0) {
    ticketType.buyOrders.push({
      address: address,
      percentage: percentage,
      quantity: quantity
    });
  } else {
    let ticket = ticketType.tickets.find(t => t.ticketId == ticketId);
    ticket.buyOrders.push({
      address: address,
      percentage: percentage,
      quantity: quantity
    });
  }
}

export function addSellOrders(
  ticketType,
  percentage,
  quantity,
  address,
  ticketId = 0
) {
  if (ticketId == 0) {
    ticketType.sellOrders.push({
      address: address,
      percentage: percentage,
      quantity: quantity
    });
  } else {
    let ticket = ticketType.tickets.find(t => t.ticketId === ticketId);
    ticket.sellOrder = {
      address: address,
      percentage: percentage
    };
  }
}

export function removeBuyOrders(
  ticketType,
  percentage,
  quantity,
  address,
  ticketId = 0
) {
  if (ticketId == 0) {
    let order = ticketType.buyOrders.find(
      o => o.address === address && o.percentage === percentage
    );
    order.quantity = Math.min(0, order.quantity - quantity);
  } else {
    let ticket = ticketType.tickets.find(t => t.ticketId === ticketId);
    let order = ticket.buyOrders.find(
      o => o.address === address && o.percentage === percentage
    );
    order.quantity = Math.min(0, order.quantity - quantity);
  }
}

export function removeSellOrders(
  ticketType,
  percentage,
  quantity,
  address,
  ticketId = 0
) {
  if (ticketId == 0) {
    let order = ticketType.sellOrders.find(
      o => o.address === address && Number(o.percentage) == Number(percentage)
    );
    if (Number(quantity) >= Number(order.quantity)) {
      ticketType.sellOrders = ticketType.sellOrders.filter(
        o => o.address !== address && Number(o.percentage) != Number(percentage)
      );
    } else {
      order.quantity = Math.min(0, Number(order.quantity) - Number(quantity));
    }
  } else {
    let ticket = ticketType.tickets.find(t => t.ticketId == ticketId);
    ticket.sellOrder = 0;
  }
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
    this.sellOrders = [];
    this.buyOrders = [];
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
    this.sellOrders = [];
    this.buyOrders = [];
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
    this.buyOrders = [];
    this.sellOrder = {};
    this.seatMapping = undefined;
    this.owner = undefined;
    this.isNf = true;
  }
}
