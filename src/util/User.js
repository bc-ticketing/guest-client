import {ShoppingCart} from './shoppingCart';


export class User {
    constructor(account, balance) {
        this.shoppingCart = new ShoppingCart();
        this.fungibleTickets = [];
        this.nonFungibleTickets = [];
        this.account = account;
        this.balance = balance;
    }

    async makeBuyOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        await aftermarket.methods.makeBuyOrder(ticketTypeId, amount, percentage).call();
    }
    async makeBuyOrderNonFungible() {}

    async makeSellOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        await aftermarket.methods.makeSellOrderFungibles(ticketTypeId, amount, percentage).call();

    }
    async makeSellOrderNonFungible(ticketIds, percentages) {
        await aftermarket.methods.makeSellOrderNonFungibles(ticketIds, percentages).call();
    }

    async fillBuyOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        await aftermarket.methods.fillBuyOrderFungibles(ticketTypeId, amount, percentage).call();
    }

    async fillBuyOrderNonFungible(ticketIds, percentages, aftermarket) {
        await aftermarket.methods.fillBuyOrderFungibles(ticketIds, percentages).call();
    }

    async fillSellOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        await aftermarket.methods.fillSellOrderFungibles(ticketTypeId, amount, percentage).call();
    }
    async fillSellOrderNonFungible(ticketIds, percentages) {
        await aftermarket.methods.fillSellOrderFungibles(ticketIds, percentages).call();

    }


    checkout() {
        this.shoppingCart.checkout();
    }

}