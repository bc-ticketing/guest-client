pragma solidity >=0.4.22 <0.7.0;

contract FungibleTicketFactory {
    //"0xBfcE6Cc0aA9950427576bD2114E1e3eBf629C562", "0x12","0x20","0x6162636400000000000000000000000000000000000000000000000000000000",1,1000000000000000000

    // stores the metadata of the event
    event IpfsCid(bytes1 hashFunction, bytes1 size, bytes32 digest);

    // ticket details
    uint256 public numberTickets;
    uint256 public ticketPriceWei;

    address payable eventOwner;

    uint256 public ticketIndex;
    //mapping(address payable => uint8) public tickets;
    
    //address payable[] public ticketOwners;

    mapping(address => uint8) public ticketOwners;

    // parameters for secondary market logic
    uint256 public sellingQueueHead;
    uint256 public sellingQueueTail;
    uint256 public buyingQueueHead;
    uint256 public buyingQueueTail;

    mapping(uint256 => address payable) public sellingQueue;
    mapping(uint256 => address payable) public buyingQueue;

    struct FTicket {
        uint256 id;
        address payable owner;
    }

    constructor(
        address payable _eventOwner,
        bytes1 _hashFunction,
        bytes1 _size,
        bytes32 _digest,
        uint256 _numberTickets,
        uint256 _ticketPriceWei
    )
        public
    {
        eventOwner = _eventOwner;
        ticketIndex = 0;

        numberTickets = _numberTickets;
        ticketPriceWei = _ticketPriceWei;

        sellingQueueHead = 0;
        sellingQueueTail = 0;
        buyingQueueHead = 0;
        buyingQueueTail = 0;

        emit IpfsCid(
             _hashFunction,
             _size,
             _digest
        );
    }

    function buyFungibleTicket() public payable{
        // TODO Check if msg.sender is has verified ID in verification smart contract
        require(msg.value == ticketPriceWei, "The value does not match the ticket price.");

        // if not all tickets have been issued, the buyer automatically buys from the event owner
        if(ticketIndex < numberTickets){
            issueFungibleTicket(msg.sender);
            return;
        }

        // if people want to sell tickets, the buyer automatically buys from the earliest seller
        (address sellerAddress, uint newSellingQueueHead) = getNextAddressInSellingQueue();
        if( sellerAddress != address(0)){
            sellingQueueHead = newSellingQueueHead;
            buyFromSellingQueue(msg.sender);
            sellingQueueHead++;
        }

        // if nobody wants to sell yet, the buyer joins the buying queue
        // money is stored in the smart contract
        else{
            joinBuyingQueue();
        }
    }


    function issueFungibleTicket(address payable _ticketOwner) internal {
        // issue the ticket
        ticketOwners[_ticketOwner] = 1;

        ticketIndex++;

        // TODO send ticket price to the event owner or escrow service
        (eventOwner).transfer(msg.value);
    }


    function buyFromSellingQueue(address payable _newOwner) internal{
        // transfer money
        (sellingQueue[sellingQueueHead]).transfer(ticketPriceWei);

        // transfer ownership
        delete ticketOwners[sellingQueue[sellingQueueHead]];
        ticketOwners[_newOwner] = 1;

        // remove user from the queue
        delete sellingQueue[sellingQueueHead];
    }

    function joinBuyingQueue() internal{
        buyingQueue[buyingQueueTail] = msg.sender;
        buyingQueueTail++;
    }

    function sellFungibleTicket() public{

        require(ticketOwners[msg.sender] == 1, "The sender does NOT own a ticket of this kind.");

        // if people are in the waiting queue for buying tickets
        (address buyerAddress, uint newBuyingQueueHead) = getNextAddressInBuyingQueue();
        if(buyerAddress != address(0)){
            // transfer money
            (msg.sender).transfer(ticketPriceWei);

            // transfer ownership
            ticketOwners[buyingQueue[newBuyingQueueHead]] = 1;
            delete ticketOwners[msg.sender];

            // remove user from the queue
            delete buyingQueue[buyingQueueHead];
            buyingQueueHead = newBuyingQueueHead + 1;
        }

        // else join selling queue
        else{
            sellingQueue[sellingQueueTail] = msg.sender;
            sellingQueueTail++;
        }
    }
    
    function exitSellingQueue() public{
        for(uint256 i = sellingQueueHead; i < sellingQueueTail; i++){
            if(sellingQueue[i] == msg.sender){
                delete sellingQueue[i];
                break;
            }
        }
    }
    
    function exitBuyingQueue() public {
        for(uint256 i = buyingQueueHead; i < buyingQueueTail; i++){
            if(buyingQueue[i] == msg.sender){
                
                // delete posistion in the queue
                // basically doing this: sellingQueue[i] == address(0);
                delete buyingQueue[i];
                
                
                // refund deposit
                (msg.sender).transfer(ticketPriceWei);
                
                break;
            }
        }
    }
    
    function hasTicket(address _address) public view returns(bool){
        return ticketOwners[_address] == 1;
    }
    
    function getNextAddressInBuyingQueue() internal view returns(address buyerAddress, uint newBuyingQueueHead){
        uint i = buyingQueueHead;
        while(i < buyingQueueTail){
            if(buyingQueue[i] != address(0)){
                return (buyingQueue[i], i);
            }
        }
        return (address(0), 0);
    }
    
    function getNextAddressInSellingQueue() internal view returns(address sellerAddress, uint newSellingQueueHead){
        uint i = sellingQueueHead;
        while(i < sellingQueueTail){
            if(sellingQueue[i] != address(0)){
                return (sellingQueue[i], i);
            }
        }
        return (address(0), 0);
    }
}