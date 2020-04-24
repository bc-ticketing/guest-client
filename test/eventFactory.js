const bs58 = require("bs58");

const EventFactory = artifacts.require("EventFactory");
const Event = artifacts.require("Event");

const getBytes32FromIpfsHash = (ipfsHash) =>
  "0x" + bs58.decode(ipfsHash).slice(2).toString("hex");

const getIpfsHashFromBytes32 = (bytes32Hex, hashFuncion, size) => {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex =
    hashFuncion.toString(16) + size.toString(16) + bytes32Hex.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  const hashStr = bs58.encode(hashBytes);
  return hashStr;
};

contract("EventFactory", () => {
  let eventFactory = null;

  before(async () => {
    eventFactory = await EventFactory.deployed();
  });

  it("Smart contract deployment", async () => {
    assert(eventFactory.address !== "");
  });

  it("Create an Event with ipfs hash", async () => {
    // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
    const ipfsHash = "QmNSUYVKDSvPUnRLKmuxk9diJ6yS96r1TrAXzjTiBcCLAL";
    const bytes = getBytes32FromIpfsHash(ipfsHash);
    const hashFunction = 18;
    const size = 32;

    await eventFactory.createEvent(bytes, hashFunction, size);
    const eventAddress = await eventFactory.events(0);
    const event = await Event.at(eventAddress);

    const calledMetadataMultihash = await event.metadataMultihash.call();

    const calledBytes = calledMetadataMultihash.hashBytes;
    const calledHashFunction = calledMetadataMultihash.hashFunction.toNumber();
    const calledSize = calledMetadataMultihash.hashSize.toNumber();

    console.log("metadata " + calledBytes);
    const loadedIPFSHash = getIpfsHashFromBytes32(
      calledBytes,
      calledHashFunction,
      calledSize
    );
    assert(loadedIPFSHash === ipfsHash);
  });
});
