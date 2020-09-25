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
  events: [],
  eventFactory: null,
  ipfsInstance: null,
  userTickets: [
    {eventAddress: '1'},
    {eventAddress: '2'},
  ],
};
export default state;