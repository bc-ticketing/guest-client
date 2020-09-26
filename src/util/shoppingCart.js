import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";

export class ShoppingCart {
  constructor() {
    this.fungibleTickets = [];
    this.nonFungibleTickets = [];
  }

  fungibleAlreadySelected(type) {
    return this.fungibleTickets.filter((t) => t.typeId == type).length > 0;
  }

  increaseSelection(type, amount) {
    this.fungibleTickets.filter((t) => t.typeId == type)[0] += amount;
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
