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
  },
  eventAddresses: [],
  events: [],
  eventFactory: null,
  ipfsInstance: null,
  user: {},
  shoppingCart: new ShoppingCart(),
};
export default state;