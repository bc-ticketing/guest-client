const SimpleStorage = artifacts.require("SimpleStorage");
const EventFactory = artifacts.require("EventFactory");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(EventFactory);
};
