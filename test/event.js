const multihashes = require("multihashes");

const EventFactory = artifacts.require("EventFactory");
const Event = artifacts.require("Event");

// util function to decode IPFS CID
const cidToArgs = (cid) => {
  const mh = multihashes.fromB58String(Buffer.from(cid));
  return {
    hashFunction: "0x" + mh.slice(0, 1).toString("hex"),
    size: "0x" + mh.slice(1, 2).toString("hex"),
    digest: "0x" + mh.slice(2).toString("hex"),
  };
};

// util function to recover IPFS CID
const argsToCid = (hashFunction, size, digest) => {
  const hashHex = hashFunction.slice(2) + size.slice(2) + digest.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  return multihashes.toB58String(hashBytes);
};

contract("EventFactory", () => {
  const cid = "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u";

  let eventFactory = null;
  let event = null;

  // before(async () => {
  //   eventFactory = await EventFactory.deployed();

  //   const args = cidToArgs(cid);

  //   await eventFactory.createEvent(ipfsBytes, ipfsHashFunction, ipfsSize);
  //   const eventAddress = await eventFactory.events(0);
  //   event = await Event.at(eventAddress);
  // });

  // it("Deploying the EventFactory smart contract.", async () => {
  //   assert.notEqual(
  //     eventFactory.address !== "",
  //     "The event factory address is not set correctly."
  //   );
  // });

  // it("Deploying the Event smart contract.", async () => {
  //   assert.notEqual(
  //     event.address !== "",
  //     "The event address is not set correctly."
  //   );
  // });

  // it("Creating multiple events.", async () => {
  //   const ticketPriceWei = 1000;
  //   const numTickets = 3;
  //   const ticketMetadataBytes =
  //     "0x6162636400000000000000000000000000000000000000000000000000000000";
  //   const ticketMetadataHashFunction = 12;
  //   const ticketMetadataSize = 32;

  //   event.addFungibleTicketFactory();
  // });
});
