let state = {
  web3: {
    isInjected: false,
    web3Instance: null,
    networkId: null,
    eth: null,
    account: null,
    balance: null,
    error: null,
  },
  eventAddresses: [],
  events: {
    '1': {metadata: {event: {location: 'Zuerich', title: 'Concert'}}, contractAddress: '1', tickets: [{price: 50, supply: 50, ticketsSold: 20}]},
  },
  eventFactory: null,
  ipfsInstance: null,
  userTickets: [],
};
export default state;
