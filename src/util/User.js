import {
  MintFungibles,
  MintNonFungibles,
  ticketTransferred,
} from "./blockchainEventHandler";
import idb from "./../util/db/idb";
import {
  isNf,
  getTicketId,
  getTicketTypeIndex
} from "idetix-utils";

const BigNumber = require("bignumber.js");

export class User {
  constructor(account, balance) {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
    this.fBuyOrders = [];
    this.nfBuyOrders = [];
    this.account = account;
    this.balance = balance;
    this.idetixIdentity = {
      phone: false,
      mail: false,
      kyc: false,
    };
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

  async checkFungibleTicketPurchases(contract, fromBlock) {
    const fungibles = await MintFungibles(contract, fromBlock, this.account);
    return fungibles;
  }
  async checkNonFungibleTicketPurchases(contract, fromBlock) {
    const nonFungibles = await MintNonFungibles(
      contract,
      fromBlock,
      this.account
    );
    return nonFungibles;
  }

  async checkTicketChanges(contract, fromBlock) {
    const seller = await ticketTransferred(
      contract,
      fromBlock,
      "seller",
      this.account
    );
    seller.map(t => {
      t.changeType = 'sold'
    });
    const buyer = await ticketTransferred(
      contract,
      fromBlock,
      "buyer",
      this.account
    );
    buyer.map(t => {
      t.changeType = 'bought'
    });
    return seller.concat(buyer);
  }

  async loadTicketsFromStore() {
    const inStore = await idb.getUserTickets(this.account);
    console.log('in store: ', inStore);
    this.fungibleTickets = inStore.fungibleTickets;
    this.nonFungibleTickets = inStore.nonFungibleTickets;
  }


  loadAftermarketForEvent(event) {
    console.log('loading user sell orders');
    for (const ticket of this.fungibleTickets) {
      if (ticket.eventContractAddress === event.contractAddress) {
        const sellOrders = event.getSellOrdersByAddress(this.account, ticket.ticketType, false);
        ticket.sellOrders = sellOrders;
      }

    }
    for (const ticket of this.nonFungibleTickets) {
      if (ticket.eventContractAddress === event.contractAddress) {
        const sellOrder = event.getSellOrdersByAddress(this.account, ticket.ticketType, ticket.ticketId);
        ticket.sellOrder = sellOrder;
      }
    }
    console.log('loading user buy orders');
    this.fBuyOrders = this.fBuyOrders.concat(event.getBuyOrdersByAddress(this.account, false));
    this.nfBuyOrders = this.nfBuyOrders.concat(event.getBuyOrdersByAddress(this.account, true));
  }

  async loadTicketsForEvent(web3Instance, ABI, event, fromBlock) {
    console.log('for loading tickets for event: ' + event.contractAddress);
    const eventSC = new web3Instance.eth.Contract(ABI, event.contractAddress);
    const fungiblePurchases = await this.checkFungibleTicketPurchases(
      eventSC,
      fromBlock
    );
    const nonFungiblePurchases = await this.checkNonFungibleTicketPurchases(
      eventSC,
      fromBlock
    );
    /* Purchases from Host directly */
    for (const purchase of fungiblePurchases) {
      console.log('bought fungible ticket');
      const ticketType = Number(getTicketTypeIndex(new BigNumber(purchase.returnValues.ticketType)).toFixed());
      const quantity = purchase.returnValues.quantity;
      let t = this.fungibleTickets.find(t => t.ticketType === ticketType && t.eventContractAddress === event.contractAddress);
      if (t) {
        t.amount += Number(quantity);
      } else {
        this.fungibleTickets.push({
          ticketType: ticketType,
          amount: Number(quantity),
          eventContractAddress: event.contractAddress
        });
      }
    }
    for (const purchase of nonFungiblePurchases) {
      console.log('bought nonFungibleTicket')
      const ids = purchase.returnValues.ids;
      for (const id of ids) {
        console.log('id: ' + id);
        const ticketType = Number(getTicketTypeIndex(new BigNumber(id)).toFixed());
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        console.log('ticketId: ' + ticketId);
        this.nonFungibleTickets.push({
          ticketId: ticketId,
          ticketType: ticketType,
          eventContractAddress: event.contractAddress,
        });
      }
    }
    /* Changes in ownership involving the current user */
    /* TODO: check with simon to get the actual ticket ID in the NF case */
    const changes = await this.checkTicketChanges(eventSC, fromBlock);
    for (const change of changes) {
      console.log('change: ', change);
      const ticketType = new BigNumber(change.returnValues.ticketType);
      const ticketTypeId = Number(getTicketTypeIndex(new BigNumber(change.returnValues.ticketType)).toFixed());
      if (!isNf(ticketType)) {
        let t = this.fungibleTickets.find(t => t.ticketType === ticketTypeId);
        if (change.changeType === 'sold') {
          console.log('sold f ticket');
          if (t) {
            t.amount -= 1;
          }
        } else {
          console.log('bought f ticket');
          if (t) {
            t.amount += 1;
          } else {
            this.fungibleTickets.push({
              ticketType: ticketTypeId,
              amount: 1,
              eventContractAddress: event.contractAddress,
            });
          }
        }
      } else {
        console.log('change for ticket: ' + change.returnValues.ticketType);
        console.log(new BigNumber(change.returnValues.ticketType).toFixed());
        console.log(Number(getTicketId(new BigNumber(change.returnValues.ticketType)).toFixed()))
        const ticketId = Number(getTicketId(new BigNumber(change.returnValues.ticketType)).toFixed());
        let t = this.nonFungibleTickets.find(t => {
          t === ticketType.toFixed()
        });
        if (change.changeType === 'sold') {
          console.log('sold nf ticket: ' + ticketTypeId + ' - ' + ticketId);
          if (t) {
            this.nonFungibleTickets.filter(t => {
              t.ticketType === ticketTypeId && t.ticketId === ticketId
            });
          }
          console.log('nf tickets: ', this.nonFungibleTickets);
        } else {
          console.log('bought nf ticket: ' + ticketTypeId + ' - ' + ticketId);
          this.nonFungibleTickets.push({
            ticketType: ticketTypeId,
            ticketId: ticketId,
            eventContractAddress: event.contractAddress,
          });
          console.log('nf tickets: ', this.nonFungibleTickets);
        }

      }
    }

  }

  ownsFungibles(eventContract, ticketType, amount) {
    return (
      this.fungibleTickets.filter(
        (t) => t.ticketType === ticketType && t.amount >= amount && t.eventContractAddress == eventContract
      ).length > 0
    );
  }

  ownsNonFungible(eventContract, ticketType, ticketNr) {
    return (
      this.nonFungibleTickets.filter(
        t =>
        t.ticketType === ticketType &&
        t.ticketId === ticketNr &&
        t.eventContractAddress == eventContract
      ).length > 0
    );
  }

  async requestIdentification() {}

  async verify(payload) {
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