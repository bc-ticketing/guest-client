/* 
  This file contains a data class for the user and helper functions to get specific information from it and to load tickets for the user from the blockchain.
*/

import { getTicketId, getTicketTypeIndex } from "idetix-utils";
import { getTicketInfoFromType } from "./tickets";

const BigNumber = require("bignumber.js");

export class User {
  constructor(account, balance) {
    // hack to turn users from idb into proper user objects
    if (typeof account === "object") {
      Object.assign(this, account);
      this.account = account.account;
      this.balance = balance;
      return;
    }
    this.lastFetchedBlocks = {};
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.buyOrders = [];
    this.sellOrders = [];
    this.account = account;
    this.balance = balance;
    this.presales = {
      joined: {},
      ended: {},
    };
    this.idetixIdentity = {
      phone: false,
      mail: false,
      kyc: false,
    };
    this.approvalLevels = {};
  }

  getTicket(eventContractAddress, ticketType, isNf) {
    if (isNf) {
      return this.nonFungibleTickets.find(
        (t) =>
          t.ticketType === ticketType &&
          t.eventContractAddress === eventContractAddress &&
          t.ticketId === isNf
      );
    } else {
      return this.fungibleTickets.find(
        (t) =>
          t.ticketType === ticketType &&
          t.eventContractAddress === eventContractAddress
      );
    }
  }

  getSellOrders(eventContractAddress, ticketType, ticketId) {
    if (ticketId) {
      return this.sellOrders.filter(
        (o) =>
          o.event === eventContractAddress &&
          o.ticketType === ticketType &&
          o.ticketId === ticketId
      );
    } else {
      return this.sellOrders.filter(
        (o) => o.event === eventContractAddress && o.ticketType === ticketType
      );
    }
  }

  removeNfTicket(eventContractAddress, ticketType, ticketId) {
    this.nonFungibleTickets = this.nonFungibleTickets.filter(
      (t) =>
        t.ticketType !== ticketType ||
        t.eventContractAddress !== eventContractAddress ||
        t.ticketId !== ticketId
    );
  }

  removeSellOrder(eventContractAddress, ticketType, ticketId, percentage) {
    if (ticketId) {
      this.sellOrders = this.sellOrders.filter(
        (o) =>
          o.event !== eventContractAddress ||
          o.ticketType !== ticketType ||
          o.percentage !== percentage ||
          o.ticketId !== ticketId
      );
    } else {
      this.sellOrders = this.sellOrders.filter(
        (o) =>
          o.event !== eventContractAddress ||
          o.ticketType !== ticketType ||
          o.percentage !== percentage
      );
    }
  }

  removeBuyOrder(eventContractAddress, ticketType, ticketId, percentage) {
    if (ticketId) {
      this.buyOrders = this.buyOrders.filter(
        (o) =>
          o.event !== eventContractAddress ||
          o.ticketType !== ticketType ||
          o.percentage !== percentage ||
          o.ticketId !== ticketId
      );
    } else {
      this.buyOrders = this.buyOrders.filter(
        (o) =>
          o.event !== eventContractAddress ||
          o.ticketType !== ticketType ||
          o.percentage !== percentage
      );
    }
  }

  handleMintFungibles(eventContractAddress, event) {
    const ticketType = Number(
      getTicketTypeIndex(new BigNumber(event.ticketType)).toFixed()
    );
    const quantity = event.quantity;
    let t = this.fungibleTickets.find(
      (t) =>
        t.ticketType === ticketType &&
        t.eventContractAddress === eventContractAddress
    );
    if (t) {
      t.amount += Number(quantity);
    } else {
      this.fungibleTickets.push({
        ticketType: ticketType,
        amount: Number(quantity),
        eventContractAddress: eventContractAddress,
      });
    }
  }
  handleMintNonFungibles(eventContractAddress, event) {
    const ids = event.ids;
    for (const id of ids) {
      const ticketType = Number(
        getTicketTypeIndex(new BigNumber(id)).toFixed()
      );
      const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
      this.nonFungibleTickets.push({
        ticketId,
        ticketType: ticketType,
        eventContractAddress: eventContractAddress,
      });
    }
  }
  handleBuyOrderPlaced(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    this.buyOrders.push({
      percentage: Number(event.percentage),
      quantity: Number(event.quantity),
      event: eventContractAddress,
      ticketType: info.ticketTypeId,
      isNf: info.nf,
      ticketId: info.ticketId,
    });
  }
  handleSellOrderFungiblePlaced(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    this.sellOrders.push({
      percentage: Number(event.percentage),
      quantity: Number(event.quantity),
      event: eventContractAddress,
      ticketType: info.ticketTypeId,
      isNf: info.nf,
      ticketId: info.ticketId,
    });
  }
  handleSellOrderNonFungiblePlaced(eventContractAddress, event) {
    for (const id of event.ids) {
      let info = getTicketInfoFromType(id);
      this.sellOrders.push({
        percentage: Number(event.percentage),
        quantity: Number(event.quantity),
        event: eventContractAddress,
        ticketType: info.ticketTypeId,
        isNf: true,
        ticketId: info.ticketId,
      });
    }
  }

  handleBuyOrderFungibleFilled(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    let ticket = this.getTicket(
      eventContractAddress,
      info.ticketTypeId,
      info.ticketId
    );
    // user is the one whe made the buy order and bought the ticket
    if (event.buyer === this.account) {
      if (ticket) {
        ticket.amount += 1;
      } else {
        this.fungibleTickets.push({
          ticketType: info.ticketTypeId,
          amount: 1,
          eventContractAddress: eventContractAddress,
        });
      }
      // user is the one whe filled the buy order and sold the ticket
    } else {
      ticket.quantity -= 1;
    }
  }
  handleBuyOrderNonFungibleFilled(eventContractAddress, event) {
    let info = getTicketInfoFromType(event._id);
    // user is the one whe made the buy order and bought the ticket
    if (event.buyer === this.account) {
      let info = getTicketInfoFromType(event._id);
      this.nonFungibleTickets.push({
        ticketId: info.ticketId,
        ticketType: info.ticketTypeId,
        eventContractAddress: eventContractAddress,
      });
    } else {
      this.removeNfTicket(
        eventContractAddress,
        info.ticketTypeId,
        info.ticketId
      );
    }
  }

  handleSellOrderFungibleFilled(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    let ticket = this.getTicket(
      eventContractAddress,
      info.ticketTypeId,
      info.ticketId
    );
    // user is the one who made the sell order and sold the ticket
    if (event.seller === this.account) {
      ticket.quantity -= 1;
    } else {
      if (ticket) {
        ticket.amount += 1;
      } else {
        this.fungibleTickets.push({
          ticketType: info.ticketTypeId,
          amount: 1,
          eventContractAddress: eventContractAddress,
        });
      }
    }
  }

  handleSellOrderNonFungibleFilled(eventContractAddress, event) {
    let info = getTicketInfoFromType(event._id);
    // user is the one who made the sell order and sold the ticket
    if (event.seller === this.account) {
      this.removeNfTicket(
        eventContractAddress,
        info.ticketTypeId,
        info.ticketId
      );
    } else {
      this.nonFungibleTickets.push({
        ticketId: info.ticketId,
        ticketType: info.ticketTypeId,
        eventContractAddress: eventContractAddress,
      });
    }
  }

  handleSellOrderFungibleWithdrawn(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    this.removeSellOrder(
      eventContractAddress,
      info.ticketTypeId,
      info.ticketId,
      Number(event.percentage)
    );
  }

  handleSellOrderNonFungibleWithdrawn(eventContractAddress, event) {
    let info = getTicketInfoFromType(event._id);
    this.removeSellOrder(
      eventContractAddress,
      info.ticketTypeId,
      info.ticketId,
      Number(event.percentage)
    );
  }

  handleBuyOrderWithdrawn(eventContractAddress, event) {
    let info = getTicketInfoFromType(event.ticketType);
    this.removeBuyOrder(
      eventContractAddress,
      info.ticketTypeId,
      info.ticketId,
      Number(event.percentage)
    );
  }

  handlePresaleJoined(eventContractAddress, event) {
    if (!this.presales.joined[eventContractAddress]) {
      this.presales.joined[eventContractAddress] = {};
    }
    this.presales.joined[eventContractAddress][event.ticketType] =
      event.luckyNumber;
  }

  handleTicketClaimed(eventContractAddress, event) {
    this.presales.joined[eventContractAddress][event.ticketType] = -1;
  }

  handleTicketPriceRefunded(eventContractAddress, event) {
    this.presales.joined[eventContractAddress][event.ticketType] = -1;
  }

  handleTicketTransferred() {}

  async handleMissedEvents(
    eventContractAddress,
    events,
    eventUpdateBlock,
    eventSC
  ) {
    if (!this.lastFetchedBlocks[eventContractAddress]) {
      this.lastFetchedBlocks[eventContractAddress] = 0;
    }
    console.info("handling missed user events");
    console.info(
      `event at block ${eventUpdateBlock} user at block ${this.lastFetchedBlocks[eventContractAddress]}`
    );
    let allEvents = [];
    // if the users last update block is lower than the events one,
    // we have to cover all events between those block numbers
    if (eventUpdateBlock > this.lastFetchedBlocks[eventContractAddress] + 1) {
      console.info("event was ahead");
      const eventsMissedByEventLoader = await eventSC.getPastEvents(
        "allEvents",
        {
          fromBlock: this.lastFetchedBlocks[eventContractAddress] + 1,
          toBlock: eventUpdateBlock,
        }
      );
      allEvents = allEvents.concat(
        eventsMissedByEventLoader.map(
          (e) => (e = { type: e.event, event: e.returnValues })
        )
      );
    }
    allEvents = allEvents.concat(events);
    for (const event of allEvents) {
      console.info("handling missed event for user", event.type);
      try {
        this[`handle${event.type}`](eventContractAddress, event.event);
      } catch {
        console.debug(`I don't have an event handler for ${event.type}!`);
      }
    }
  }

  hasActivePresale() {
    return Object.keys(this.presales).length > 0;
  }

  setEventUpToDate(eventContractAddress, block) {
    this.lastFetchedBlocks[eventContractAddress] = block;
  }

  setApprovalLevel(approver, method) {
    this.approvalLevels[approver] = method ? method : 0;
  }
  getApprovalLevelForApprover(approver) {
    return this.approvalLevels[approver];
  }
  isApproved(approver, level) {
    return (
      this.approvalLevels[approver] &&
      this.approvalLevels[approver].level >= level
    );
  }
  getNumberFungibleOwned(event, type) {
    let amount = 0;
    for (const t of this.fungibleTickets) {
      if (t.eventContractAddress === event && t.ticketType === type) {
        amount += Number(t.amount);
      }
    }
    return amount;
  }
  ownsFungibles(eventContract, ticketType, amount) {
    return (
      this.fungibleTickets.filter(
        (t) =>
          t.ticketType === ticketType &&
          t.amount >= amount &&
          t.eventContractAddress == eventContract
      ).length > 0
    );
  }
  ownsNonFungible(eventContract, ticketType, ticketNr) {
    return this.nonFungibleTickets.find(
      (t) =>
        t.ticketType === ticketType &&
        t.ticketId === ticketNr &&
        t.eventContractAddress === eventContract
    );
  }
  requestIdentification() {
    console.log("");
  }

  verify(payload) {
    if (payload.method === "mail") {
      this.addMailVerification(payload.mail);
    } else if (payload.method === "phone") {
      this.addPhoneVerification(payload.phone);
    } else {
      this.addPhoneVerification(payload.files);
    }
  }

  addPhoneVerification(phone) {
    console.log(phone);
  }

  addMailVerification(mail) {
    console.log(mail);
  }

  addKYCVerification(files) {
    console.log(files);
  }
}
