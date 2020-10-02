import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

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
    if (selection.ticket.isNf) {
      this.nonFungibleTickets.push({
        ticket: selection.ticket,
      });
    } else {
      if (this.fungibleAlreadySelected(selection.ticket.typeId)) {
        this.increaseSelection(selection.ticket.typeId, selection.amount);
      } else {
        this.fungibleTickets.push({
          ticket: selection.ticket,
          amount: selection.amount,
        });
      }
    }
  }

  removeByIndex(index, fungible) {
    if (fungible) {
      console.log(`removing fungible ${index}`);
      this.fungibleTickets.splice(index, 1);
    } else {
      this.nonFungibleTickets.splice(index, 1);
    }
  }

  checkout(web3instance, account) {
    this.fungibleTickets.forEach(selection => {
        selection.ticket.buy(selection.amount, web3instance, EVENT_MINTABLE_AFTERMARKET_ABI, account);
    })
    this.nonFungibleTickets.forEach(selection => {
        selection.ticket.buy(web3instance, EVENT_MINTABLE_AFTERMARKET_ABI, account);
    })

  }

  clear() {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
  }
}
