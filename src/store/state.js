let state = {
  web3: {
    isInjected: false,
    web3Instance: null,
    networkId: null,
    eth: null,
    account: null,
    balance: null,
    error: null,
    currentBlock: null,
  },
  pageTransition: {},
  eventAddresses: [],
  events: [],
  eventFactory: null,
  identity: null,
  approvers: [],
  ipfsInstance: null,
  activeUser: undefined,
  lastFetchedBlock: 1,
};
export default state;
