export class ShoppingCart {
    constructor() {
        this.fungibleTickets = [];
        this.nonFungibleTickets = [];
    }
    
    add(ticket) {
        if(ticket.isNf) {
            this.fungibleTickets.push({
                type: ticket.typeId,
                amount: 1,
                price: ticket.price,
            })
        } else {
            this.nonFungibleTickets.push({
                type: ticket.ticketTypeId,
                ticketId: ticket.ticketId,
                price: ticket.price,
                }
            )
        }
    }

    checkout() {

    }

    clear() {
        this.fungibleTickets = [];
        this.nonFungibleTickets = [];
    }
}