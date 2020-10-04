import {
  MintFungibles,
  MintNonFungibles,
  ticketTransferred,
} from "./blockchainEventHandler";
import idb from "./../util/db/idb";
import { isNf, getTicketId, getTicketTypeIndex } from "idetix-utils";

const BigNumber = require("bignumber.js");

export class User {
  constructor(account, balance) {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
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
            amount += t.amount;
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
    seller.map(t => {t.changeType = 'sold'});
    const buyer = await ticketTransferred(
      contract,
      fromBlock,
      "buyer",
      this.account
    );
    buyer.map(t=> {t.changeType = 'bought'});
    return seller.concat(buyer);
  }

  async loadTicketsForEvent(web3Instance, ABI, event, fromBlock) {
      console.log('loading tickets from block: '+ fromBlock);
    const eventSC = new web3Instance.eth.Contract(ABI, event.contractAddress);
    const inStore = await idb.getUserTickets(this.account);
    console.log('in store: ',inStore);
    this.fungibleTickets = this.fungibleTickets.concat(inStore.fungibleTickets);
    this.nonFungibleTickets = this.nonFungibleTickets.concat(inStore.nonFungibleTickets);
    console.log(this.fungibleTickets);
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
      this.fungibleTickets.push({
        ticketType: ticketType,
        amount: quantity,
        eventContractAddress: event.contractAddress
      });
    }
    for (const purchase of nonFungiblePurchases) {
        console.log('bought nonFungibleTicket')
      const ids = purchase.returnValues.ids;
      for (const id of ids) {
        const ticketType = Number(getTicketTypeIndex(new BigNumber(id)).toFixed());
        const ticketId = Number(getTicketId(new BigNumber(id)).toFixed());
        this.nonFungibleTickets.push({
            ticketId: ticketId,
            ticketType: ticketType,
            eventContractAddress: event.contractAddress,
        });
      }
    }
    /* Changes in ownership involving the current user */
    const changes = await this.checkTicketChanges(eventSC, fromBlock);
    for (const change of changes) {
      const ticketType = new BigNumber(change.returnValues.ticketType);
      if (!isNf(ticketType)) {
        let t = this.fungibleTickets.find(t => t.ticketType === ticketType.toFixed());
        if (change.changeType === 'sold') {
            console.log('sold f ticket');
            if (t) {
                t.amount -=1;
            }
        } else {
            console.log('bought f ticket');
            if (t) {
                t.amount += 1;
            } else {
                this.fungibleTickets.push({
                    ticketType: ticketType.toFixed(),
                    amount: 1,
                    eventContractAddress: event.contractAddress,
                  });
            }
        }
      } else {
        let t = this.nonFungibleTickets.find(t => {t === ticketType.toFixed()});
        if(change.changeType === 'sold') {
            console.log('sold nf ticket');
            if(t) {
                this.nonFungibleTickets.filter(t => {t === ticketType.toFixed()});
            }
        } else {
            console.log('bought nf ticket');
            this.nonFungibleTickets.push({
                ticketId: ticketType.toFixed(),
                eventContractAddress: event.contractAddress,
            });
        }

      }
    }
    console.log(this.fungibleTickets);

  }

  ownsFungibles(ticketType, amount) {
    return (
      this.fungibleTickets.filter(
        (t) => t.ticketType.typeId === ticketType && t.amount >= amount
      ).length > 0
    );
  }

  ownsNonFungible(ticketType, ticketNr) {
    return (
      this.nonFungibleTickets.filter(
        (t) => t.ticketTypeId === ticketType && t.ticketId === ticketNr
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
