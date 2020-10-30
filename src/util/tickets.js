/* 
  This file contains data classes for all ticket types and utility functions for state alterations. All functions that interact with the blockchain for buying/selling tickets are contained here as well as helper functions to get infos from ticket objects
*/
import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import {
  NULL_ADDRESS,
  MESSAGE_TRANSACTION_DENIED,
  MESSAGE_TICKET_BOUGHT,
  MESSAGE_DEFAULT_ERROR,
  MESSAGE_MAX_TICKETS_ALLOWED,
  MESSAGE_SELLORDER_PLACED,
  MESSAGE_SELLORDER_WITHDRAWN,
  MESSAGE_BUYORDER_PLACED,
  MESSAGE_BUYORDER_FILLED,
} from "./constants/constants";
import { AFFILIATE_ADDRESS } from './constants/addresses';
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

const BigNumber = require("bignumber.js");


export async function joinPresale(ticket, account, web3Instance, eventContractAddress) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const typeId = ticket.isNf ? getFullTicketTypeId(true, ticket.typeId) : getFullTicketTypeId(false, ticket.typeId)
  const result = contract.methods.joinPresale(typeId).send({
    value: String(ticket.price),
    from: account
  });
  console.log(result);
}

export async function claimPresale(ticket, account, web3Instance, eventContractAddress) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  const result = contract.methods.claim(ticket.typeId).send({
    from: account
  });
  console.log(result);
}


/**
 * Returns the number of available seats for a ticket Type
 * @param {TicketType} ticket
 */
export function numberFreeSeats(ticket) {
  return ticket.supply - ticket.ticketsSold;
}

export function getNumBuyOrdersByPercent(ticket, percentage) {
  let total = 0;
  ticket.buyOrders.forEach((o) => {
    if (Number(o.percentage) === Number(percentage)) {
      total += Number(o.quantity);
    }
  });

  return total;
}

export function getNumSellOrdersByPercent(ticket, percentage) {
  let total = 0;
  ticket.sellOrders.forEach((o) => {
    if (Number(o.percentage) === percentage) {
      total += Number(o.quantity);
    }
  });
  return total;
}
export function getNumSellOrders(ticket) {
  let total = 0;
  ticket.sellOrders.forEach((o) => {
    total += Number(o.quantity);
  });
  return total;
}

export function getAllSellOferingsNfTicketType(ticketType) {
  let offers = [];
  for (const ticket of ticketType.tickets) {
    if (ticket.sellOrder.address) {
      offers.push({
        percentage: ticket.sellOrder.percentage,
        ticketId: ticket.ticketId,
        seller: ticket.sellOrder.address,
      });
    }
  }
  return offers;
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
    return ticket.sellOrder.address != undefined;
  }
}

export function hasBuyOrder(ticket) {
  if (!ticket.isNf) {
    return ticket.buyOrders.length != 0;
  } else {
    return ticket.buyOrders.length != 0;
  }
}

/**
 * Checks for the highest available buy order for a ticketType or NF Ticket
 * @param {FungibleTicketType} ticket
 * @returns highestBuyOrder or 0 if none
 */
export function getHighestBuyOrder(ticket) {
  console.log(ticket.buyOrders);
  const sorted = ticket.buyOrders.sort(
    (a, b) => Number(a.percentage) - Number(b.percentage)
  );
  console.log(ticket.buyOrders);
  return sorted.length > 0 ? sorted[sorted.length - 1] : {};
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
  const sorted = ticket.sellOrders.sort((a, b) => a.percentage - b.percentage);
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
        value: String(Math.floor((amount * price * percentage) / 100)),
      });
    console.log(result);
    if (result.status) {
      return {
        message: MESSAGE_BUYORDER_PLACED,
        status: 1,
        event: eventContractAddress,
      };
    }
  } catch (e) {
    console.log(e);
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
        value: String(Math.floor((amount * price * percentage) / 100)),
      });
    console.log(result);
    if (result.status) {
      return {
        message: MESSAGE_BUYORDER_PLACED,
        status: 1,
        event: eventContractAddress,
      };
    }
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
  let result;
  console.log(ticketType, amount, percentage);
  await contract.methods
    .fillBuyOrderFungibles(
      getFullTicketTypeId(false, ticketType),
      amount,
      percentage
    )
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      console.log(receipt);
      if (receipt.status) {
        result = {
          message: MESSAGE_BUYORDER_FILLED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      result = decodeError(error);
    })
    .catch(function(e) {
      console.log(e);
      result = decodeError(e);
    });
  return result;
}
export async function fillBuyOrderNonFungible(
  ticketType,
  ticketId,
  percentage,
  account,
  web3Instance,
  eventContractAddress
) {
  console.log(ticketType, ticketId, percentage);
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  let result;
  await contract.methods
    .fillBuyOrderNonFungibles(
      [getFullTicketId(ticketType, ticketId)],
      [percentage]
    )
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_BUYORDER_FILLED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      result = decodeError(error);
    })
    .catch(function(e) {
      console.log(e);
      result = decodeError(e);
    });
  return result;
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
  let result;
  await contract.methods
    .makeSellOrderFungibles(
      getFullTicketTypeId(false, ticketType),
      amount,
      percentage
    )
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_PLACED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      result = decodeError(error);
    })
    .catch(function(e) {
      console.log(e);
      result = decodeError(e);
    });
  return result;
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
  let queue = await contract.methods
    .sellingQueue(getFullTicketTypeId(false, ticketType), percentage)
    .call();
  let foundIndex;
  for (let i = queue.head; i <= queue.tail; i++) {
    const queuedUser = await contract.methods
      .getQueuedUserSelling(
        getFullTicketTypeId(false, ticketType),
        percentage,
        i
      )
      .call();
    console.log(queuedUser);
    if (
      queuedUser.userAddress === account &&
      Number(queuedUser.quantity) >= amount
    ) {
      console.log("found user index");
      foundIndex = i;
    }
    console.log(`found index at ${foundIndex}`);
  }
  console.log(queue);
  let result;
  await contract.methods
    .withdrawSellOrderFungible(
      getFullTicketTypeId(false, ticketType),
      amount,
      percentage,
      foundIndex
    )
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_WITHDRAWN,
          status: 1,
          event: eventContractAddress,
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

export async function withdrawSellOrderNonFungible(
  ticketType,
  ticket,
  account,
  web3Instance,
  eventContractAddress
) {
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  let result;
  await contract.methods
    .withdrawSellOrderNonFungible(getFullTicketId(ticket, ticketType))
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_WITHDRAWN,
          status: 1,
          event: eventContractAddress,
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

  console.log(ticketType, ticket, percentage, account);
  console.log(getFullTicketId(ticket, ticketType));
  let result;
  await contract.methods
    .makeSellOrderNonFungibles(
      [getFullTicketId(ticket, ticketType)],
      [percentage]
    )
    .send({
      from: account,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_PLACED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      console.log(error);
      result = decodeError(error);
    })
    .catch(function(e) {
      console.log(e);
      result = decodeError(e);
    });
  return result;
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
  const total =
    amount * new BigNumber(String(Math.floor((price * percentage) / 100)));
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    eventContractAddress
  );
  let result;
  await contract.methods
    .fillSellOrderFungibles(
      getFullTicketTypeId(false, ticketType),
      1,
      percentage
    )
    .send({
      from: account,
      gas: 5000000,
      value: total,
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_PLACED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      return decodeError(error);
    })
    .catch(function(e) {
      return decodeError(e);
    });
  return result;
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
  let result;
  await contract.methods
    .fillSellOrderNonFungibles(
      [getFullTicketId(ticket, ticketType)],
      [percentage]
    )
    .send({
      from: account,
      value: price * (percentage / 100),
    })
    .on("receipt", function(receipt) {
      if (receipt.status) {
        result = {
          message: MESSAGE_SELLORDER_PLACED,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      return decodeError(error);
    })
    .catch(function(e) {
      return decodeError(e);
    });
  return result;
}

function decodeError(e) {
  if (e.code === 4001) {
    return {
      message: MESSAGE_TRANSACTION_DENIED,
      status: -1,
    };
  } else if (e.code === -32603) {
    return {
      message: MESSAGE_MAX_TICKETS_ALLOWED,
      status: -1,
    };
  }
  return {
    message: MESSAGE_DEFAULT_ERROR,
    status: -1,
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
    .mintFungible(getFullTicketTypeId(false, new BigNumber(ticketType)), amount, [AFFILIATE_ADDRESS])
    .send({
      from: account,
      value: amount * price,
    })
    .on("receipt", function(receipt) {
      console.log(receipt);
      if (receipt.status) {
        result = {
          message: MESSAGE_TICKET_BOUGHT,
          status: 1,
          event: eventContractAddress,
        };
      }
    })
    .on("error", function(error) {
      result = decodeError(error);
      console.log(error);
    })
    .catch(function(e) {
      result = decodeError(e);
      console.log(e);
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
    .mintNonFungibles([getFullTicketId(ticket, ticketType)], [AFFILIATE_ADDRESS])
    .send({
      from: account,
      value: price,
    })
    .on("receipt", function(receipt) {
      if (receipt.status === "true") {
        result = {
          message: MESSAGE_TICKET_BOUGHT,
          status: 1,
          event: eventContractAddress,
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
    timeout: 2000,
  })) {
    ipfsData = Buffer(chunk, "utf8").toString();
  }
  const metadata = JSON.parse(ipfsData);
  ticket.description = metadata.ticket.description;
  ticket.seatMapping = metadata.ticket.mapping;
  ticket.title = metadata.ticket.title;
  ticket.color = metadata.ticket.color;
  console.log(ticket.seatMapping);
  console.log(ticket.tickets);
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
      ticketTypeId: getFullTicketTypeId(ticket.isNf, ticket.typeId),
    },
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
      quantity: quantity,
    });
  } else {
    let ticket = ticketType.tickets.find((t) => t.ticketId == ticketId);
    ticket.buyOrders.push({
      address: address,
      percentage: percentage,
      quantity: quantity,
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
    console.log("adding sell order");
    ticketType.sellOrders.push({
      address: address,
      percentage: percentage,
      quantity: quantity,
    });
  } else {
    let ticket = ticketType.tickets.find((t) => t.ticketId === ticketId);
    ticket.sellOrder = {
      address: address,
      percentage: percentage,
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
      (o) => o.address === address && o.percentage === percentage
    );
    order.quantity = Math.min(0, order.quantity - quantity);
  } else {
    let ticket = ticketType.tickets.find((t) => t.ticketId === ticketId);
    let order = ticket.buyOrders.find(
      (o) => o.address === address && o.percentage === percentage
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
      (o) => o.address === address && Number(o.percentage) == Number(percentage)
    );
    console.log(order);
    if (!order) {
      return;
    }
    if (Number(quantity) >= Number(order.quantity)) {
      console.log("withdrawing all orders of this type");
      ticketType.sellOrders = ticketType.sellOrders.filter(
        (o) =>
          o.address !== address || Number(o.percentage) !== Number(percentage)
      );
    } else {
      order.quantity = Math.min(0, Number(order.quantity) - Number(quantity));
    }
  } else {
    let ticket = ticketType.tickets.find((t) => t.ticketId === ticketId);
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
    this.presaleSupply = 0;
    this.presaleClosingBlock = 0;
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
    this.presaleSupply = 0;
    this.presaleClosingBlock = 0;
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
