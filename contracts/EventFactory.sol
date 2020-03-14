pragma solidity ^0.5.16;
pragma experimental ABIEncoderV2; //allows returning a struct from a function

/*
TODOS
- option to open secondary market only when all tickets from the event are sold
- send money for the event to an escrow service
- affiliate program
  - registering permitted ETH addressed for affiliate program
  - define affiliate created
  - payout affiliates from escrow account or for every ticket sale
- check if address of ticket buyer is verified
- multiple tickets linked to one address
*/

contract EventFactory{
    // Data structure that stores all events created
    uint public eventIndex;
    mapping (uint => Event) public events;


    // ********** Event **********
    struct Event{
        address payable owner;
        uint eventId;
        string metadataURI; // JSON storing name, date, location, website, website certificate, ticket img url
        bytes32 hashMetadata; // hash of JSON in order to verify the retrieved data
        uint fungibleTicketFactoryIndex;
        mapping (uint => FungibleTicketFactory) fungibleTickets;
        uint nonFungibleTicketFactoryIndex;
        mapping (uint => NonFungibleTicketFactory) nonFungibleTickets;
        
        // TODO allowed different verification methods
        // TODO affiliate addressess
    }
    
    function createEvent(string memory _metadataURI) public{
        events[eventIndex] = Event({
            owner: msg.sender,
            eventId: eventIndex,
            metadataURI: _metadataURI,
            hashMetadata: keccak256(bytes(_metadataURI)),
            fungibleTicketFactoryIndex: 0,
            nonFungibleTicketFactoryIndex:0
        });
        eventIndex++;
    }
    
    
    // ********** Fungible Tickets **********
    // Tickets which are indifferent to each other (eg. standing room area 1)
    struct FungibleTicket{
        uint id;
        address payable owner;
    }
    
    struct FungibleTicketFactory{
        
        // ticket details
        string metadataURI; // JSON storing ticket details such VIP access
        bytes32 hashMetadata; // hash of JSON to verify the retrieved data
        uint numberTickets;
        uint ticketPrice;
        
        // keeping track of sold tickets 
        // using hashes as ids
        uint ticketIndex;
        mapping (uint => FungibleTicket) tickets;

        // parameters for secondary market logic
        uint sellingQueueHead;
        uint sellingQueueTail;
        uint buyingQueueHead;
        uint buyingQueueTail;
        mapping (uint => FungibleTicket) sellingQueue;
        mapping (uint => address payable) buyingQueue;
    }
    
    function addFungibleTicketFactory(uint _eventId, uint _ticketPrice, uint _numberTickets, string memory _metadataURI) public{
        // TODO only owner of the event can add tickets
        uint fungibleTicketFactoryIndex = events[_eventId].fungibleTicketFactoryIndex;
        events[_eventId].fungibleTickets[fungibleTicketFactoryIndex] = FungibleTicketFactory({
            metadataURI: _metadataURI,
            hashMetadata: keccak256(bytes(_metadataURI)),
            numberTickets: _numberTickets,
            ticketPrice: _ticketPrice,
            ticketIndex: 0,
            sellingQueueHead: 0,
            sellingQueueTail: 0,
            buyingQueueHead: 0,
            buyingQueueTail: 0
        });
        events[_eventId].fungibleTicketFactoryIndex++;
    }
    
    function buyFungibleTicket(uint _eventId, uint _fungibleTicketFactoryId) public payable{
        // TODO Check if msg.sender is has verified ID in verification smart contract
        
        FungibleTicketFactory storage ft = events[_eventId].fungibleTickets[_fungibleTicketFactoryId];
        require(msg.value == ft.ticketPrice, "The value does not match the ticket price.");
        
        address payable eventOwner = events[_eventId].owner;
        
        // if not all tickets have been issued, the buyer automatically buys from the event owner
        if(ft.ticketIndex < ft.numberTickets){
            issueFungibleTicket(ft, eventOwner);
        }
        
        // if people want to sell tickets, the buyer automatically buys from the earliest seller
        else if(ft.sellingQueueTail != ft.sellingQueueHead){
            buyFromSellingQueue(ft);
        }
        
        // if nobody wants to sell yet, the buyer joins the buying queue
        // money is stored in the smart contract
        else{
            joinBuyingQueue(ft);
        }
    }

    function issueFungibleTicket(FungibleTicketFactory storage _ft, address payable _eventOwner) internal {
        // issue the ticket
        _ft.tickets[_ft.ticketIndex] = FungibleTicket({
            id: _ft.ticketIndex,
            owner: msg.sender
        });

        _ft.ticketIndex++;
        
        // TODO send ticket price to the event owner or escrow service
        (_eventOwner).transfer(msg.value);
    }
    
    function buyFromSellingQueue(FungibleTicketFactory storage _ft) internal{
        // transfer money
        (_ft.sellingQueue[_ft.sellingQueueHead].owner).transfer(_ft.ticketPrice);
        
        // transfer ownership
        _ft.tickets[_ft.sellingQueue[_ft.sellingQueueHead].id].owner = msg.sender;
        
        // remove user from the queue
        delete _ft.sellingQueue[_ft.sellingQueueHead];
        _ft.sellingQueueHead++;
    }
    
    function joinBuyingQueue(FungibleTicketFactory storage _ft) internal{
        _ft.buyingQueue[_ft.buyingQueueTail] = msg.sender;
        _ft.buyingQueueTail++;
    }
    
    function sellFungibleTicket(uint _eventId, uint _fungibleTicketFactoryId, uint _ticketId) public{
        FungibleTicketFactory storage ftf = events[_eventId].fungibleTickets[_fungibleTicketFactoryId];
        
        require(msg.sender == ftf.tickets[_ticketId].owner, "Only the owner of this ticket can sell this ticket.");
        
        // if people are in the waiting queue for buying tickets
        if(ftf.buyingQueueTail != ftf.buyingQueueHead){
            // transfer money
            (msg.sender).transfer(ftf.ticketPrice);
            
            // transfer ownership
            ftf.tickets[_ticketId].owner = ftf.buyingQueue[ftf.buyingQueueHead];
            
            // remove user from the queue
            delete ftf.buyingQueue[ftf.buyingQueueHead];
            ftf.buyingQueueHead++;
        }
        
        // else join selling queue
        else{
            ftf.sellingQueue[ftf.sellingQueueTail] = ftf.tickets[_ticketId];
            ftf.sellingQueueTail++;
        }
    }
    
    // TODO function to remove position in the buying queue and get money back
    
    
    // ********** Non Fungible Tickets **********
    // Tickets which cannot be replaced by another ticket of the same event such as theater ticket (seat reservation).
    struct NonFungibleTicket{
        uint id;
        address payable owner;
        bool isForSale;
    }

    struct NonFungibleTicketFactory{
        uint numberTickets;
        uint ticketPrice;
            
        string metadataURI; // JSON storing ticket details such as seat number
        bytes32 hashMetadata; // hash of JSON to verify the retrieved data
        
        uint numberTicketsIssued;
        
        mapping (uint => NonFungibleTicket) tickets;
    }
    
    function addNonFungibleTicketFactory(uint _eventId, uint _ticketPrice, uint _numberTickets, string memory _metadataURI) public{
        // TODO only owner of the event can add tickets
        uint nonFungibleTicketFactoryIndex = events[_eventId].nonFungibleTicketFactoryIndex;
        events[_eventId].nonFungibleTickets[nonFungibleTicketFactoryIndex] = NonFungibleTicketFactory({
            metadataURI: _metadataURI,
            hashMetadata: keccak256(bytes(_metadataURI)),
            numberTickets: _numberTickets,
            ticketPrice: _ticketPrice,
            numberTicketsIssued: 0
        });
        events[_eventId].nonFungibleTicketFactoryIndex++;
    }

    function buyNonFungibleTicket(uint _eventId, uint _nonFungibleTicketFactoryId, uint _ticketId) public payable{
        // TODO Check if msg.sender is has verified ID in verification smart contract
        NonFungibleTicketFactory storage nftf = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId];
        require(msg.value == nftf.ticketPrice, "The value does not match the ticket price.");
        require(nftf.tickets[_ticketId].owner == address(0) || nftf.tickets[_ticketId].isForSale, "This ticket has been bought already and is currently not for sale.");
        
        address payable eventOwner = events[_eventId].owner;
        
        // ticket has not been issued before, create a new ticket otherwise transfer the ownership
        if (nftf.tickets[_ticketId].owner == address(0)){
            issueNonFungibleTicket(nftf, _ticketId, msg.sender, msg.value, eventOwner);
        }else{
            changeTicketOwner(nftf, _ticketId, msg.sender, msg.value);
        }
    }
    
    function issueNonFungibleTicket(NonFungibleTicketFactory storage _nftf, uint _ticketId, address payable _owner, uint _ticketPrice, address payable _eventOwner) internal {
        _nftf.tickets[_ticketId] = NonFungibleTicket({
            id: _ticketId,
            owner: _owner,
            isForSale: false
        });
        
        _nftf.numberTicketsIssued ++;
        
        // TODO send ticket price to an escrow service
        (_eventOwner).transfer(_ticketPrice);
    }
    
    function changeTicketOwner(NonFungibleTicketFactory storage _nftf, uint _ticketId, address payable _newOwner, uint _ticketValue) internal {
        
        // pay previous owner
        (_nftf.tickets[_ticketId].owner).transfer(_ticketValue);
        
        // transfer ownership
        _nftf.tickets[_ticketId].owner = _newOwner;
    }
    
    function sellNonFungibleTicket(uint _eventId, uint _nonFungibleTicketFactoryId, uint _ticketId) public{
        NonFungibleTicketFactory storage nftf = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId];
        require(msg.sender == nftf.tickets[_ticketId].owner, "Only the owner of this ticket can sell this ticket.");
        nftf.tickets[_ticketId].isForSale = true;
    }
    
    function cancelSellOrderNonFungibleTicket(uint _eventId, uint _nonFungibleTicketFactoryId, uint _ticketId) public{
        NonFungibleTicketFactory storage nftf = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId];
        require(msg.sender == nftf.tickets[_ticketId].owner, "Only the owner of this ticket can stop the sell order of this ticket.");
        nftf.tickets[_ticketId].isForSale = false;
    }

    // **** Getters ****
    function getFungibleTicket(uint _eventId, uint _fungibleTicketFactoryId, uint _ticketId) public view returns(FungibleTicket memory _ticket){
        return events[_eventId].fungibleTickets[_fungibleTicketFactoryId].tickets[_ticketId];
    }

    function getFungibleTickets(uint _eventId, uint _fungibleTicketFactoryId) public view returns(FungibleTicket[] memory _fts){
        uint numTickets = events[_eventId].fungibleTickets[_fungibleTicketFactoryId].ticketIndex;
        _fts = new FungibleTicket[](numTickets);
        for(uint256 i = 0; i < numTickets; i++){
            _fts[i] = events[_eventId].fungibleTickets[_fungibleTicketFactoryId].tickets[i];
        }
        return _fts;
    }

    function getFungibleTicketFactory(uint _eventId, uint _fungibleTicketFactoryId) public view returns(
            string memory _metadataURI,
            bytes32 _hashMetadata, 
            uint _numberTickets,
            uint _ticketPrice,
            uint _ticketIndex,
            uint _sellingQueueHeadLength,
            uint _buyingQueueHeadLength
        ){
        FungibleTicketFactory memory ftf = events[_eventId].fungibleTickets[_fungibleTicketFactoryId];
        return (ftf.metadataURI, ftf.hashMetadata, ftf.numberTickets, ftf.ticketPrice, ftf.ticketIndex, ftf.sellingQueueHead - ftf.sellingQueueTail, ftf.buyingQueueHead - ftf.buyingQueueTail);
    }

    function getNonFungibleTicket(uint _eventId, uint _nonFungibleTicketFactoryId, uint _ticketId) public view returns(NonFungibleTicket memory _ticket){
        return events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId].tickets[_ticketId];
    }    

    function getNonFungibleTickets(uint _eventId, uint _nonFungibleTicketFactoryId) public view returns(NonFungibleTicket[] memory _nfts){
        uint numTickets = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId].numberTicketsIssued;
        
        _nfts = new NonFungibleTicket[](numTickets);
        
        for(uint256 i = 0; i < numTickets; i++){
            _nfts[i] = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId].tickets[i];
        }
        return _nfts;
    }
    
        function getNonFungibleTicketFactory(uint _eventId, uint _nonFungibleTicketFactoryId) public view returns(
            string memory _metadataURI,
            bytes32 _hashMetadata, 
            uint _numberTickets,
            uint _ticketPrice,
            uint _numberTicketsIssued
        ){
        NonFungibleTicketFactory memory nftf = events[_eventId].nonFungibleTickets[_nonFungibleTicketFactoryId];
        return (nftf.metadataURI, nftf.hashMetadata, nftf.numberTickets, nftf.ticketPrice, nftf.numberTicketsIssued);
    }
}