import {
  MintFungibles,
  MintNonFungibles,
  ticketTransferred
} from "./blockchainEventHandler";
import { isNf, getTicketId, getTicketTypeIndex } from "idetix-utils";

const BigNumber = require("bignumber.js");

export class User {
  constructor(account, balance) {
    // hack to turn events from idb into proper event objects
    if (typeof account === "object") {
      Object.assign(this, account);
      this.account = account.account;
      this.balance = balance;
      return;
    }
    this.lastFetchedBlock = 0;
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.fBuyOrders = [];
    this.nfBuyOrders = [];
    this.account = account;
    this.balance = balance;
    this.idetixIdentity = {
      phone: false,
      mail: false,
      kyc: false
    };
  }
}

export function getNumberFungibleOwned(user, event, type) {
  let amount = 0;
  for (const t of user.fungibleTickets) {
    if (t.eventContractAddress === event && t.ticketType === type) {
      amount += Number(t.amount);
    }
  }
  return amount;
}

export async function checkFungibleTicketPurchases(user, contract) {
  const fungibles = await MintFungibles(
    contract,
    user.lastFetchedBlock,
    user.account
  );
  return fungibles;
}
export async function checkNonFungibleTicketPurchases(user, contract) {
  const nonFungibles = await MintNonFungibles(
    contract,
    user.lastFetchedBlock,
    user.account
  );
  return nonFungibles;
}

export async function checkTicketChanges(user, contract) {
  const seller = await ticketTransferred(
    contract,
    user.lastFetchedBlock,
    "seller",
    user.account
  );
  seller.map(t => {
    t.changeType = "sold";
  });
  const buyer = await ticketTransferred(
    contract,
    user.lastFetchedBlock,
    "buyer",
    user.account
  );
  buyer.map(t => {
    t.changeType = "bought";
  });
  return seller.concat(buyer);
}


export function loadAftermarketForEvent(user, event) {
  console.log("loading user sell orders");
  for (const ticket of user.fungibleTickets) {
    if (ticket.eventContractAddress === event.contractAddress) {
      const sellOrders = event.getSellOrdersByAddress(
        user.account,
        ticket.ticketType,
        false
      );
      ticket.sellOrders = sellOrders;
    }
  }
  for (const ticket of user.nonFungibleTickets) {
    if (ticket.eventContractAddress === event.contractAddress) {
      const sellOrder = event.getSellOrdersByAddress(
        user.account,
        ticket.ticketType,
        ticket.ticketId
      );
      ticket.sellOrder = sellOrder;
    }
  }
  console.log("loading user buy orders");
  user.fBuyOrders = user.fBuyOrders.concat(
    event.getBuyOrdersByAddress(user.account, false)
  );
  user.nfBuyOrders = user.nfBuyOrders.concat(
    event.getBuyOrdersByAddress(user.account, true)
  );
}

export async function loadTicketsForEvent(user, web3Instance, ABI, event) {
  console.log("for loading tickets for event: " + event.contractAddress);
  const eventSC = new web3Instance.eth.Contract(ABI, event.contractAddress);
  const fungiblePurchases = await checkFungibleTicketPurchases(
    user,
    eventSC,
    user.lastFetchedBlock
  );
  const nonFungiblePurchases = await checkNonFungibleTicketPurchases(
    user,
    eventSC,
    user.lastFetchedBlock
  );
  /* Purchases from Host directly */
  for (const purchase of fungiblePurchases) {
    console.log("bought fungible ticket");
    const ticketType = Number(
      getTicketTypeIndex(
        new BigNumber(purchase.returnValues.ticketType)
      ).toFixed()
    );
    const quantity = purchase.returnValues.quantity;
    let t = user.fungibleTickets.find(
      t =>
        t.ticketType === ticketType &&
        t.eventContractAddress === event.contractAddress
    );
    if (t) {
      t.amount += Number(quantity);
    } else {
      user.fungibleTickets.push({
        ticketType: ticketType,
        amount: Number(quantity),
        eventContractAddress: event.contractAddress
      });
    }
  }
  for (const purchase of nonFungiblePurchases) {
    console.log("bought nonFungibleTicket");
    const ids = purchase.returnValues.ids;
    for (const id of ids) {
      console.log("id: " + id);
      const ticketType = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      console.log("ticketId: " + ticketId);
      user.nonFungibleTickets.push({
        ticketId: ticketId,
        ticketType: ticketType,
        eventContractAddress: event.contractAddress
      });
    }
  }
  /* Changes in ownership involving the current user */
  /* TODO: check with simon to get the actual ticket ID in the NF case */
  const changes = await checkTicketChanges(user, eventSC);
  for (const change of changes) {
    console.log("change: ", change);
    const ticketType = new BigNumber(change.returnValues.ticketType);
    const ticketTypeId = Number(
      getTicketTypeIndex(
        new BigNumber(change.returnValues.ticketType)
      ).toFixed()
    );
    if (!isNf(ticketType)) {
      let t = user.fungibleTickets.find(t => t.ticketType === ticketTypeId);
      if (change.changeType === "sold") {
        console.log("sold f ticket");
        if (t) {
          t.amount -= 1;
        }
      } else {
        console.log("bought f ticket");
        if (t) {
          t.amount += 1;
        } else {
          user.fungibleTickets.push({
            ticketType: ticketTypeId,
            amount: 1,
            eventContractAddress: event.contractAddress
          });
        }
      }
    } else {
      console.log("change for ticket: " + change.returnValues.ticketType);
      console.log(new BigNumber(change.returnValues.ticketType).toFixed());
      console.log(
        Number(
          getTicketId(new BigNumber(change.returnValues.ticketType)).toFixed()
        )
      );
      const ticketId = Number(
        getTicketId(new BigNumber(change.returnValues.ticketType)).toFixed()
      );
      let t = user.nonFungibleTickets.find(t => {
        t === ticketType.toFixed();
      });
      if (change.changeType === "sold") {
        console.log("sold nf ticket: " + ticketTypeId + " - " + ticketId);
        if (t) {
          user.nonFungibleTickets.filter(t => {
            t.ticketType === ticketTypeId && t.ticketId === ticketId;
          });
        }
        console.log("nf tickets: ", user.nonFungibleTickets);
      } else {
        console.log("bought nf ticket: " + ticketTypeId + " - " + ticketId);
        user.nonFungibleTickets.push({
          ticketType: ticketTypeId,
          ticketId: ticketId,
          eventContractAddress: event.contractAddress
        });
        console.log("nf tickets: ", user.nonFungibleTickets);
      }
    }
  }
}

export function ownsFungibles(user, eventContract, ticketType, amount) {
  return (
    user.fungibleTickets.filter(
      t =>
        t.ticketType === ticketType &&
        t.amount >= amount &&
        t.eventContractAddress == eventContract
    ).length > 0
  );
}

export function ownsNonFungible(user, eventContract, ticketType, ticketNr) {
  return (
    user.nonFungibleTickets.filter(
      t =>
        t.ticketType === ticketType &&
        t.ticketId === ticketNr &&
        t.eventContractAddress == eventContract
    ).length > 0
  );
}

export async function requestIdentification(user) {
  console.log(user);
}

export async function verify(user, payload) {
  if (payload.method === "mail") {
    user.addMailVerification(payload.mail);
  } else if (payload.method === "phone") {
    user.addPhoneVerification(payload.phone);
  } else {
    user.addPhoneVerification(payload.files);
  }
}

export function addPhoneVerification(user, phone) {
  console.log(phone);
}

export function addMailVerification(user, mail) {
  console.log(mail);
}

export function addKYCVerification(user, files) {
  console.log(files);
}
