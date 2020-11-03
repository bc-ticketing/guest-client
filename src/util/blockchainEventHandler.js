/* 
This file contains helper functions for each type of event that we expect from the Blockchain

Event Types: 

Event:
    event EventMetadata(bytes1 hashexport async function, bytes1 size, bytes32 digest);
    event TicketMetadata(uint256 indexed ticketTypeId, bytes1 hashexport async function, bytes1 size, bytes32 digest);
    event ValueTransferred(address indexed sender, address indexed receiver, uint256 amount, address erc20contract);

Aftermarket:
    event TicketTransferred(address indexed seller, address indexed buyer, uint256 ticketType);
    event BuyOrderPlaced(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event SellOrderFungiblePlaced(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event SellOrderFungibleFilled(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event BuyOrderFungibleFilled(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event SellOrderNonFungiblePlaced(address indexed addr, uint256[] _ids, uint8[] percentage);
    event SellOrderNonFungibleFilled(address indexed addr, uint256[] _ids, uint8[] percentage);
    event BuyOrderNonFungibleFilled(address indexed addr, uint256[] _ids, uint8[] percentage);
    event SellOrderNonFungibleWithdrawn(address indexed addr, uint256 _id);

    event SellOrderFungibleWithdrawn(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event SellOrderWithdrawn(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);
    event BuyOrderWithdrawn(address indexed addr, uint256 ticketType, uint256 quantity, uint8 percentage);

Mintable:
    event MintFungibles(address indexed owner, uint256 ticketType, uint256 quantity);
    event MintNonFungibles(address indexed owner, uint256[] ids);
*/

export async function getJoinedPresales(contract, fromBlock, account) {
  const events = await contract.getPastEvents("PresaleJoined", {
    fromBlock: fromBlock,
    filter: { user: account },
  });
  return events.length > 0 ? events : [];
}

export async function getTicketClaimed(contract, fromBlock, account) {
  const events = await contract.getPastEvents("TicketClaimed", {
    fromBlock: fromBlock,
    filter: { user: account },
  });
  return events.length > 0 ? events : [];
}

export async function getTicketPriceRefunded(contract, fromBlock, account) {
  const events = await contract.getPastEvents("TicketPriceRefunded", {
    fromBlock: fromBlock,
    filter: { user: account },
  });
  return events.length > 0 ? events : [];
}

async function getEvents(contract, name, fromBlock) {
  return await contract.getPastEvents(name, { fromBlock: fromBlock });
}


/* event */
export async function eventMetadata(contract, fromBlock) {
  const events = await contract.getPastEvents("EventMetadata", {
    fromBlock: fromBlock,
  });
  return events.length > 0 ? events : [];
}


export async function ticketMetadata(contract, fromBlock) {
  const events = await contract.getPastEvents("TicketMetadata", {
    fromBlock: fromBlock,
  });
  return events.length > 0 ? events : [];
}

/* aftermarket */
export async function ticketTransferred(
  contract,
  fromBlock,
  filter = "",
  filterValue = ""
) {
  let events;
  if (filter == "") {
    events = await contract.getPastEvents("TicketTransferred", fromBlock);
  } else if (filter === "seller") {
    events = await contract.getPastEvents("TicketTransferred", {
      fromBlock: fromBlock,
      filter: { seller: filterValue },
    });
  } else {
    events = await contract.getPastEvents("TicketTransferred", {
      fromBlock: fromBlock,
      filter: { buyer: filterValue },
    });
  }
  return events.length > 0 ? events : [];
}

export async function MintFungibles(contract, fromBlock, address) {
  const events = await contract.getPastEvents("MintFungibles", {
    fromBlock: fromBlock,
    filter: { owner: address },
  });
  return events.length > 0 ? events : [];
}

export async function MintNonFungibles(contract, fromBlock, address) {
  const events = await contract.getPastEvents("MintNonFungibles", {
    fromBlock: fromBlock,
    filter: { owner: address },
  });
  return events.length > 0 ? events : [];
}

export async function BuyOrderPlaced(contract, fromBlock) {
  const events = await getEvents(contract, "BuyOrderPlaced", fromBlock);
  return events.length > 0 ? events : [];
}

export async function SellOrderFungiblePlaced(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderFungiblePlaced",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function SellOrderFungibleFilled(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderFungibleFilled",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function BuyOrderFungibleFilled(contract, fromBlock) {
  const events = await getEvents(contract, "BuyOrderFungibleFilled", fromBlock);
  return events.length > 0 ? events : [];
}

export async function SellOrderFungibleWithdrawn(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderFungibleWithdrawn",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function SellOrderNonFungiblePlaced(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderNonFungiblePlaced",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function SellOrderNonFungibleFilled(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderNonFungibleFilled",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function BuyOrderNonFungibleFilled(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "BuyOrderNonFungibleFilled",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function SellOrderNonFungibleWithdrawn(contract, fromBlock) {
  const events = await getEvents(
    contract,
    "SellOrderNonFungibleWithdrawn",
    fromBlock
  );
  return events.length > 0 ? events : [];
}

export async function SellOrderWithdrawn(contract, fromBlock) {
  const events = await getEvents(contract, "SellOrderWithdrawn", fromBlock);
  return events.length > 0 ? events : [];
}

export async function BuyOrderWithdrawn(contract, fromBlock) {
  const events = await getEvents(contract, "BuyOrderWithdrawn", fromBlock);
  return events.length > 0 ? events : [];
}

/* mintable */
