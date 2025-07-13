// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CriteaDrippy is ReentrancyGuard {
    IERC20 public constant USDE = IERC20(0x05D0AcA3ba12f010f6A26104da5cB83419723842);

    struct Stream {
        address sender;
        address recipient;
        uint256 deposit;
        uint256 startTime;
        uint256 stopTime;
        uint256 ratePerSecond;
        uint256 remainingBalance;
        bool isNative;
    }

    mapping(uint256 => Stream) public streams;
    uint256 public nextStreamId;

    event StreamCreated(uint256 indexed streamId, address indexed sender, address indexed recipient, uint256 deposit, uint256 startTime, uint256 stopTime, bool isNative);
    event StreamCancelled(uint256 indexed streamId);
    event WithdrawnFromStream(uint256 indexed streamId, address indexed recipient, uint256 amount);

    function createStream(address recipient, uint256 deposit, uint256 duration, bool isNative) external payable nonReentrant returns (uint256) {
        require(recipient != address(0) && recipient != address(this) && recipient != msg.sender, "Invalid recipient");
        require(deposit > 0, "Deposit must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");

        uint256 startTime = block.timestamp;
        uint256 stopTime = startTime + duration;
        uint256 ratePerSecond = deposit / duration;

        require(ratePerSecond > 0, "Deposit too small");

        if (isNative) {
            require(msg.value == deposit, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted for ERC20 streams");
            require(USDE.transferFrom(msg.sender, address(this), deposit), "Transfer failed");
        }

        uint256 streamId = nextStreamId;
        streams[streamId] = Stream({
            sender: msg.sender,
            recipient: recipient,
            deposit: deposit,
            startTime: startTime,
            stopTime: stopTime,
            ratePerSecond: ratePerSecond,
            remainingBalance: deposit,
            isNative: isNative
        });

        nextStreamId++;

        emit StreamCreated(streamId, msg.sender, recipient, deposit, startTime, stopTime, isNative);
        return streamId;
    }

    function cancelStream(uint256 streamId) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.sender || msg.sender == stream.recipient, "Not authorized");
        require(stream.remainingBalance > 0, "Stream fully withdrawn");

        uint256 senderBalance = _getStreamBalance(stream);
        uint256 recipientBalance = stream.deposit - senderBalance;

        delete streams[streamId];

        if (stream.isNative) {
            payable(stream.sender).transfer(senderBalance);
            payable(stream.recipient).transfer(recipientBalance);
        } else {
            USDE.transfer(stream.sender, senderBalance);
            USDE.transfer(stream.recipient, recipientBalance);
        }

        emit StreamCancelled(streamId);
    }

    function withdrawFromStream(uint256 streamId, uint256 amount) external nonReentrant {
        Stream storage stream = streams[streamId];
        require(msg.sender == stream.recipient, "Not authorized");
        require(stream.remainingBalance >= amount, "Insufficient balance");

        uint256 availableBalance = _getStreamBalance(stream);
        require(availableBalance >= amount, "Requested amount not yet available");

        stream.remainingBalance -= amount;

        if (stream.isNative) {
            payable(msg.sender).transfer(amount);
        } else {
            USDE.transfer(msg.sender, amount);
        }

        emit WithdrawnFromStream(streamId, msg.sender, amount);
    }

    function getStreamDetails(uint256 streamId) external view returns (Stream memory) {
        return streams[streamId];
    }

    // function getUserStreams(address user) external view returns (uint256[] memory) {
    //     uint256[] memory userStreams = new uint256[](nextStreamId);
    //     uint256 count = 0;

    //     for (uint256 i = 0; i < nextStreamId; i++) {
    //         if (streams[i].sender == user || streams[i].recipient == user) {
    //             userStreams[count] = i;
    //             count++;
    //         }
    //     }

    //     uint256[] memory result = new uint256[](count);
    //     for (uint256 i = 0; i < count; i++) {
    //         result[i] = userStreams[i];
    //     }

    //     return result;
    // }


    // function getUserStreams(address user) external view returns (uint256[] memory incoming, uint256[] memory outgoing) {
    //     uint256[] memory incomingStreams = new uint256[](nextStreamId);
    //     uint256[] memory outgoingStreams = new uint256[](nextStreamId);
    //     uint256 incomingCount = 0;
    //     uint256 outgoingCount = 0;

    //     for (uint256 i = 0; i < nextStreamId; i++) {
    //         if (streams[i].recipient == user) {
    //             incomingStreams[incomingCount] = i;
    //             incomingCount++;
    //         } else if (streams[i].sender == user) {
    //             outgoingStreams[outgoingCount] = i;
    //             outgoingCount++;
    //         }
    //     }

    //     incoming = new uint256[](incomingCount);
    //     outgoing = new uint256[](outgoingCount);

    //     for (uint256 i = 0; i < incomingCount; i++) {
    //         incoming[i] = incomingStreams[i];
    //     }
    //     for (uint256 i = 0; i < outgoingCount; i++) {
    //         outgoing[i] = outgoingStreams[i];
    //     }

    //     return (incoming, outgoing);
    // }

    function getUserStreams(address user) external view returns (uint256[] memory) {
        uint256[] memory userStreams = new uint256[](nextStreamId);
        uint256 count = 0;

        for (uint256 i = 0; i < nextStreamId; i++) {
            if (streams[i].sender == user || streams[i].recipient == user) {
                userStreams[count] = i;
                count++;
            }
        }

        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = userStreams[i];
        }

        return result;
    }
    function _getStreamBalance(Stream storage stream) internal view returns (uint256) {
        if (block.timestamp >= stream.stopTime) {
            return 0;
        }
        uint256 elapsedTime = block.timestamp - stream.startTime;
        uint256 withdrawnAmount = elapsedTime * stream.ratePerSecond;
        return stream.deposit - withdrawnAmount;
    }

    receive() external payable {}
}