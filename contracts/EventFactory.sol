pragma solidity >=0.4.22 <0.7.0;

import "./Event.sol";
import "./EventLibrary.sol";


contract EventFactory {
    address[] public events;

    event EventCreated(address _contractAddress);

    function createEvent(
        bytes32 _hashBytes,
        uint8 _hashFunction,
        uint8 _hashSize
    ) public {
        Event newEvent = new Event(
            msg.sender,
            _hashBytes,
            _hashFunction,
            _hashSize
        );
        events.push(address(newEvent));
        emit EventCreated(address(newEvent));
    }
}
