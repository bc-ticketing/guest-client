import { argsToCid, getIdAsBigNumber } from "idetix-utils";
import { NULL_ADDRESS } from "./constants/constants";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

const BigNumber = require("bignumber.js");

export function numberFreeSeats(ticket) {
  return ticket.supply - ticket.ticketsSold;
}

export async function loadBuyOrders(ticket, web3Instance, ABI) {
  const aftermarket = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
    const percentage = (100 / ticket.aftermarketGranularity) * i;
    const buyingQueue = await aftermarket.methods
      .buyingQueue(getFullTicketTypeId(ticket), percentage)
      .call();
    const numBuyingOrders = buyingQueue.numberTickets;
    if (numBuyingOrders > 0) {
      ticket.buyOrders[percentage] = numBuyingOrders;
    }
  }
  return ticket;
}

export async function loadSellOrders(ticket, web3Instance, ABI) {
  const aftermarket = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  for (let i = ticket.aftermarketGranularity; i >= 1; i--) {
    const percentage = (100 / ticket.aftermarketGranularity) * i;
    const sellingQueue = await aftermarket.methods
      .sellingQueue(getFullTicketTypeId(ticket), percentage)
      .call();
    const numSellOrders = sellingQueue.numberTickets;
    if (numSellOrders > 0) {
      ticket.sellOrders[percentage] = numSellOrders;
    }
  }
  return ticket;
}

export function getHighestBuyOrder(ticket) {
  for (const [key, value] of Object.entries(ticket.buyOrders)) {
    if (value > 0) {
      return key;
    }
  }
  return 0;
}

export function getLowestSellOrder(ticket) {
  for (const [key, value] of Object.entries(ticket.sellOrders).reverse()) {
    if (value > 0) {
      return { queue: key, amount: value };
    }
  }
  return 0;
}

export function getTitle(ticket) {
  return ticket.title;
}

export function ticketsAvailable(ticket) {
  return ticket.ticketsSold < ticket.supply;
}

export async function makeBuyOrder(
  ticket,
  web3Instance,
  amount,
  percentage,
  account
) {
  console.log(`creating buy order: \n
    Event: ${ticket.eventContractAddress}\n
    Ticket: ${ticket.getFullTicketId()}\n
    Amount: ${amount}\n
    Percentage: ${percentage}\n
    Price: ${amount *
      web3Instance.utils.toWei(
        String(Math.floor(ticket.price * (percentage / 100)))
      )}`);
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  const result = await contract.methods
    .makeBuyOrder(ticket.getFullTicketId(), amount, percentage)
    .send({
      from: account,
      value:
        amount *
        web3Instance.utils.toWei(
          String(Math.floor(ticket.price * (percentage / 100)))
        ),
    });
  console.log(result);
}

export async function fillBuyOrder(
  ticket,
  web3Instance,
  amount,
  percentage,
  account
) {
  console.log(`Filling buy order: \n
    Event: ${ticket.eventContractAddress}\n
    Ticket: ${ticket.getFullTicketId()}\n
    Amount: ${amount}\n
    Percentage: ${percentage}\n
    Price: ${amount *
      web3Instance.utils.toWei(
        String(Math.floor(ticket.price * (percentage / 100)))
      )}`);
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  const result = await contract.methods
    .fillBuyOrderFungibles(ticket.getFullTicketId(), amount, percentage)
    .send({
      from: account,
    });
  console.log(result);
}

export async function makeSellOrder(
  ticket,
  web3Instance,
  amount,
  percentage,
  account
) {
  console.log(`Making sell order: \n
    Event: ${ticket.eventContractAddress}\n
    Ticket: ${ticket.getFullTicketId()}\n
    Amount: ${amount}\n
    Percentage: ${percentage}<n
    From Account: ${account}`);
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  const result = await contract.methods
    .makeSellOrderFungibles(ticket.getFullTicketId(), amount, percentage)
    .send({
      from: account,
    });
  console.log(result);
}

export async function fillSellOrder(
  ticket,
  web3Instance,
  amount,
  percentage,
  account
) {
  console.log(`Filling sell order: \n
    Event: ${ticket.eventContractAddress}\n
    Ticket: ${ticket.getFullTicketId()}\n
    Amount: ${amount}\n
    Percentage: ${percentage}<n
    From Account: ${account}`);
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  var result = await contract.methods
    .fillSellOrderFungibles(ticket.getFullTicketId(), amount, percentage)
    .send({
      from: account,
      value:
        amount *
        web3Instance.utils.toWei(
          String(Math.floor(ticket.price * (percentage / 100)))
        ),
    });
  console.log(result);
}

export async function fillBuyOrderNonFungible(
  ticket,
  web3Instance,
  tickets,
  percentages,
  account
) {
  console.log(`Filling buy order: \n
    Event: ${ticket.eventContractAddress}\n
    Tickets: ${tickets}\n
    Percentage: ${percentages}`);
  const ticketIds = tickets.map((ticket) => ticket.getFullTicketId());
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  const result = await contract.methods
    .fillBuyOrderNonFungibles(ticketIds, percentages)
    .send({
      from: account,
    });
  console.log(result);
}

export async function makeSellOrderNonFungible(
  ticket,
  web3Instance,
  tickets,
  percentages,
  account
) {
  console.log(`Making sell order: \n
    Event: ${ticket.eventContractAddress}\n
    Tickets: ${tickets}\n
    Percentages: ${percentages}\n
    From Account: ${account}`);
  const ticketIds = tickets.map((ticket) => ticket.getFullTicketId());
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  const result = await contract.methods
    .makeSellOrderNonFungibles(ticketIds, percentages)
    .send({
      from: account,
    });
  console.log(result);
}

export async function fillSellOrderNonFungible(
  ticket,
  web3Instance,
  tickets,
  percentages,
  account
) {
  console.log(`Filling sell order: \n
    Event: ${ticket.eventContractAddress}\n
    Tickets: ${tickets}\n
    Percentages: ${percentages}\n
    From Account: ${account}`);
  const reducer = (total, ticket, index) =>
    total + Math.floor(ticket.ticketType.price * percentages[index]);
  const total = web3Instance.urils.toWei(String(tickets.reduce(reducer)));
  const ticketIds = tickets.map((ticket) => ticket.getFullTicketId());
  const contract = new web3Instance.eth.Contract(
    EVENT_MINTABLE_AFTERMARKET_ABI,
    ticket.eventContractAddress
  );
  var result = await contract.methods
    .fillSellOrderFungibles(ticketIds, percentages)
    .send({
      from: account,
      value: total,
    });
  console.log(result);
}

export async function buy(ticket, amount, web3Instance, ABI, account) {
  console.log(`buying ticket \n
    from account: ${account}\n
    ticketType: ${ticket.typeId} \n
    full ticket id: ${ticket.getFullTicketId()}\n
    amount: ${amount}\n
    price per ticket: ${ticket.price}\n
    total price: ${amount * ticket.price}\n
    price in wei: ${amount * web3Instance.utils.toWei(ticket.price)}`);
  const eventSC = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  if (ticket.isNf) {
    const result = await eventSC.methods
      .mintNonFungibles([ticket.getFullTicketId()])
      .send({
        from: account,
        value: web3Instance.utils.toWei(String(ticket.ticketType.price)),
      });
      console.log(result);

  } else {
    const result = await eventSC.methods
      .mintFungible(ticket.getFullTicketId(), amount)
      .send({
        from: account,
        value: amount * web3Instance.utils.toWei(ticket.price),
      });
      console.log(result);

  }
}

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

export async function fetchIpfsHash(ticket, web3Instance, ABI) {
  const eventSC = new web3Instance.eth.Contract(
    ABI,
    ticket.eventContractAddress
  );
  const ticketMetadata = await eventSC.getPastEvents("TicketMetadata", {
    filter: { ticketTypeId: getFullTicketTypeId(ticket) },
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

export function getFullTicketTypeId(ticket) {
  return getIdAsBigNumber(ticket.isNf, ticket.typeId).toFixed();
}

export function getFullTicketId(ticket) {
  // return nonFungibleBaseId.plus(ticket.ticketTypeId).plus(ticket.ticketId)
  return getIdAsBigNumber(true, ticket.ticketTypeId, ticket.ticketId).toFixed();
}

export function isFree(ticket) {
  return ticket.owner === NULL_ADDRESS;
}

export function hasSellOrder(ticket) {
  return new BigNumber(ticket.sellOrder.userAddress).isZero() ? false : true;
}

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
