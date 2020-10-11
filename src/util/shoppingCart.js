import {
  EVENT_MINTABLE_AFTERMARKET_ABI
} from "./../util/abi/eventMintableAftermarket";
import {
  buyFungible,
  buyNonFungible
} from "./tickets";

export class ShoppingCart {
  constructor() {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
  }

  getAmountOfItems() {
    return this.fungibleTickets.length + this.nonFungibleTickets.length;
  }

  fungibleAlreadySelected(type) {
    return this.fungibleTickets.filter((t) => t.ticket.typeId == type).length > 0;
  }

  increaseSelection(type, amount) {
    this.fungibleTickets.filter((t) => t.ticket.typeId == type)[0].amount += amount;
  }

  add(selection) {
    if (selection.isNf) {
      console.log('is nf');
      this.nonFungibleTickets.push({
        ticket: selection.ticket,
        ticketType: selection.ticketType,
        price: selection.price,
        eventContractAddress: selection.eventContractAddress
      });
    } else {
      if (this.fungibleAlreadySelected(selection.ticket.typeId)) {
        this.increaseSelection(selection.ticket.typeId, selection.amount);
      } else {
        this.fungibleTickets.push({
          ticket: selection.ticket,
          ticketType: selection.ticketType,
          price: selection.price,
          eventContractAddress: selection.eventContractAddress,
          amount: selection.amount,
        });
      }
    }
  }

  removeByIndex(index, fungible) {
    if (fungible) {
      this.fungibleTickets.splice(index, 1);
    } else {
      this.nonFungibleTickets.splice(index, 1);
    }
  }

  async checkout(web3instance, account) {
    let results = [];
    for (const selection of this.fungibleTickets) {
      const result = await buyFungible(selection.ticketType, selection.amount, selection.price, web3instance, EVENT_MINTABLE_AFTERMARKET_ABI, account, selection.eventContractAddress);
      results.push(result);
    }
    for (const selection of this.nonFungibleTickets) {
      const result = await buyNonFungible(selection.ticketType, selection.ticket, selection.price, web3instance, EVENT_MINTABLE_AFTERMARKET_ABI, account, selection.eventContractAddress);
      results.push(result);
    }
    return results;


  }

  clear() {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
  }
}