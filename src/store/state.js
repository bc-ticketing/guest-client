import { ShoppingCart } from "../util/shoppingCart";

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
  eventAddresses: [],
  events: [],
  eventFactory: null,
  identity: null,
  approvers: [],
  ipfsInstance: null,
  activeUser: undefined,
  shoppingCart: new ShoppingCart(),
  lastFetchedBlock: 1,
};
export default state;