export const EVENT_FACTORY_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_identityContract",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "_contractAddress",
        "type": "address"
      }
    ],
    "name": "EventCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "events",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "identityContract",
    "outputs": [
      {
        "internalType": "contract Identity",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes1",
        "name": "_hashFunction",
        "type": "bytes1"
      },
      {
        "internalType": "bytes1",
        "name": "_size",
        "type": "bytes1"
      },
      {
        "internalType": "bytes32",
        "name": "_digest",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "_identityApprover",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_identityLevel",
        "type": "uint8"
      },
      {
        "internalType": "address",
        "name": "_erc20Contract",
        "type": "address"
      },
      {
        "internalType": "uint8",
        "name": "_granularity",
        "type": "uint8"
      }
    ],
    "name": "createEvent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEvents",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
