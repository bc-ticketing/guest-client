import { EVENT_FACTORY_ABI } from "./../util/abi/eventFactory";
import { EVENT_FACTORY_ADDRESS } from "./../util/constants/addresses";
import { EVENT_MINTABLE_AFTERMARKET_ABI } from "./../util/abi/eventMintableAftermarket";
import { argsToCid, fungibleBaseId, nonFungibleBaseId } from "idetix-utils";

/* fetch all buy orders for the ticket category */
export function F_fetchBuyOrders(eventAddress, ticketTypeId, aftermarket) {

}
/* fetch all sell orders for the ticket category */
export function F_fetchSellOrders(eventAddress, ticketTypeId, aftermarket) {

}
/* Check if there is a buy order for the specified ticketId, when a ticket should be sold */
export function NF_fetchBuyOrders(eventAddress, ticketTypeId, aftermarket) {
    const granularity = aftermarket.methods.granularity.call();
    for (i = granularity.toNumber(); i >= 1; i--) {
        let percentage = (100 / granularity.toNumber()) * i;
        const buyingQueue = aftermarket.methods.buyingQueue(ticketTypeId, percentage).call();
        const numBuyingOrders = buyingQueue.numberTickets;
        if (numBuyingOrders > 0) {
            return { foundBuyOrder: true, percentage: percentage }

        }
    }

}
/* Sell ticket to person in buying queue */
export function NF_fillBuyOrder(ticketToBeSold, percentage, aftermarket) {
    aftermarket.methods.fillBuyOrderFungibles(ticketToBeSold, percentage).call();
}

/* create sell order for own ticket */
export function NF_makeSellOrder(ticketId, aftermarket, percentage) {
    aftermarket.methods.makeSellOrderNonFungible([ticketId], [percentage]).call();
}

/* Check if there is a sell order for the specified ticketId */
export function NF_fetchSellOrder(eventAddress, ticketId, aftermarket) {
    const isSold = null;
    /* sellOrder: {address, percentage} */
    const sellOrder = await aftermarket.methods.nfTickets(ticketId).call();
}
