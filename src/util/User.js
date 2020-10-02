import { ticketTransferred } from "./blockchainEventHandler";
import { getFullTicketTypeId, getFullTicketId } from "./tickets";

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

    async checkTicketChanges(contract, fromBlock) {
        return ticketTransferred(contract, fromBlock, 'seller', this.account) ||
                ticketTransferred(contract, fromBlock, 'buyer', this.account);
    }

    async loadTicketsForEvent(web3Instance, ABI, event) {
        const eventSC = new web3Instance.eth.Contract(
            ABI,
            event.contractAddress
          );
        const inStore = await idb.getUserTickets(this.account);
        const changed = await this.checkTicketChanges(eventSC, 1);
        if (changed) {
            for (change of changed) {
                console.log(change);
                //TODO: check if nf/f and handle correctly
                var myTickets = await eventSC.methods
                .tickets(getFullTicketTypeId(ticketType), this.account)
                .call();
            if (myTickets > 0) {
                this.fungibleTickets.push({
                    ticketType: ticketType,
                    amount: myTickets
                })
            }
            }
        }

        for( const ticketType of event.nonFungibleTickets) {
            for(const ticket of ticketType.tickets) {
                const owner = await eventSC.methods
                .nfOwners(getFullTicketId(ticket))
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

    async requestIdentification() {

    }

    async verify(payload) {
        if (payload.method === 'mail') {
            this.addMailVerification(payload.mail);
        } else if (payload.method === 'phone') {
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