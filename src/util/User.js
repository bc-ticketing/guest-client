
export class User {
    constructor(account, balance) {
        this.fungibleTickets = [];
        this.nonFungibleTickets = [];
        this.account = account;
        this.balance = balance;
    }

    async loadTicketsForEvent(web3Instance, ABI, event) {
        const eventSC = new web3Instance.eth.Contract(
            ABI,
            event.contractAddress
          );
        for ( const ticketType of event.fungibleTickets) {
            var myTickets = await eventSC.methods
                .tickets(ticketType.getFullTicketId(), this.account)
                .call();
            if (myTickets > 0) {
                this.fungibleTickets.push({
                    ticketType: ticketType,
                    amount: myTickets
                })
            }
        }
        for( const ticketType of event.nonFungibleTickets) {
            for(const ticket of ticketType.tickets) {
                const owner = await eventSC.methods
                .nfOwners(ticket.getFullTicketId())
                .call();
                if(owner === this.account) {
                    this.nonFungibleTickets.push(ticket);
                }
            }
        }

    }

    ownsFungibles(ticketType, amount) {
        return this.fungibleTickets.filter(t => t.ticketType.typeId === ticketType && t.amount >= amount).length > 0;
    }

    ownsNonFungible(ticketType, ticketNr) {
        return this.nonFungibleTickets.filter(t => t.ticketTypeId === ticketType && t.ticketId === ticketNr).length > 0;
    }

    async makeBuyOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        await aftermarket.methods.makeBuyOrder(ticketTypeId, amount, percentage).call();
    }
    async makeBuyOrderNonFungible() {}

    async makeSellOrderFungible(ticketTypeId, percentage, amount, aftermarket) {
        if (!this.ownsFungibles(ticketTypeId, amount)) {return false;}
        await aftermarket.methods.makeSellOrderFungibles(ticketTypeId, amount, percentage).call();

    }
    async makeSellOrderNonFungible(ticketIds, percentages, aftermarket) {
        //if (!this.ownsNonFungible(ticketTypeId, amount)) {return false;}
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
    async fillSellOrderNonFungible(ticketIds, percentages, aftermarket) {
        await aftermarket.methods.fillSellOrderFungibles(ticketIds, percentages).call();

    }

}