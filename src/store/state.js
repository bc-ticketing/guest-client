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
    '1': {metadata: {event: {location: 'Zuerich', title: 'Concert', img_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}},
          contractAddress: '1',
          // let quese = amsc.get(buyqueue);
          // queues.forEach(queue => {
            // if (queue.numberOfTickets != 0 ) { show();}
          //})
          // get percentages from Aftermarket SC -> sellingQueue, which contains a list of addresses
          fungibleTickets: [
            {price: 50, supply: 50, ticketsSold: 26, granularity: 10, metadata: {
              title: 'VIP balcony',
              description: 'This is a VIP ticket only for the best and richest',
              event: '1',
              color: '#bf616a',
              sellOrders: {
                20: 2,
                40: 1
              },
              mapping: ["1/1","1/2","1/3","1/4","1/5","2/1","2/2","2/3","2/4","2/5","3/1","3/2","3/3","3/4","3/5","4/3","4/4","4/5","5/4","5/5","7/4","7/5","8/3","8/4","8/5","9/1","9/2","9/3","9/4","9/5","10/1","10/2","10/3","10/4","10/5","11/1","11/2","11/3","11/4","11/5","12/1","12/2","12/3","12/4","12/5"]
            }
          },
          {price: 20, supply: 400, ticketsSold: 100, granularity: 4, metadata: {
            title: 'standing area',
            description: 'Standing area for the plebs',
            color: '#ebcb8b',
            sellOrders: {
              33: 2,
              66: 1
            },
            event: '1',
            mapping: ["1/9","1/10","1/11","1/12","2/9","2/10","2/11","2/12","3/9","3/10","3/11","3/12","4/9","4/10","4/11","4/12","5/9","5/10","5/11","5/12","6/9","6/10","6/11","6/12","7/9","7/10","7/11","7/12","8/9","8/10","8/11","8/12","9/9","9/10","9/11","9/12","10/9","10/10","10/11","10/12","11/9","11/10","11/11","11/12","12/9","12/10","12/11","12/12"]
          }}
          ],
          nonFungibleTickets: [
            {
              price: 100, supply: 45, ticketsSold: 0, granularity: 3, metadata: {
                title: 'cool guys',
                description: 'i like to sit down',
                color: '#a3be8c',
                event: '1',
                mapping: ["1/6","1/7","1/8","2/6","2/7","2/8","3/6","3/7","3/8","4/6","4/7","4/8","5/6","5/7","7/6","7/7","8/6","8/7","8/8","9/6","9/7","9/8","10/6","10/7","10/8","11/6","11/7","11/8","12/6","12/7","12/8"],
                //TODO: get sold tickets by looping over nfOwners and check if 0 address, 
                // for sold/not sold. and then check Aftermarket SC by looping over nfTickets
                // and check for != 0 for sell orders, these contain the price percentage
                //OR: just get the list nfsForSale, which should contain all the sellOrders.
                soldIndexes: [1, 12,13,14, 20],
                aftermarketIndexes: [],
              }
            }
          ],
        },
        '2': {metadata: {event: {location: 'Warschau', title: 'Open Air', 'img_url': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1267&q=80'}},
            contractAddress: '2',
            fungibleTickets: [
              {price: 30, supply: 200, ticketsSold: 150, metadata: {
                title: 'Standard Pass',
                description: 'Super cool open air',
                event: '2',
                color: '#fff',
                mapping: []
              }}
            ]
        }
  },
  eventFactory: null,
  ipfsInstance: null,
  userTickets: [
    {eventAddress: '1'},
    {eventAddress: '2'},
  ],
};
export default state;
