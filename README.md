# 💧 Drippy

Drippy is a token streaming protocol built on the Critea testnet that enables real-time, continuous payments. Think of it as your own decentralized payment streaming service.

## 🚀 Features

- Stream tokens in real-time
- Create customizable payment streams with flexible durations
- Cancel streams with automatic fair balance distribution
- Withdraw available funds at any time
- Secure implementation with reentrancy protection
- Modern SvelteKit frontend for easy interaction

## 🛠 Tech Stack

### Smart Contracts
- Solidity ^0.8.0
- OpenZeppelin Contracts
- Remix

### Frontend
- SvelteKit
- ethers.js
- Web3Modal


## 💻 Usage

### Creating a Stream
```solidity
// Create a stream
uint256 streamId = drippy.createStream(
    recipient,  // Address of the recipient
    amount,     // Amount to stream
    duration,   // Duration in seconds
    false       // isNative (false for usdc, true for native token)
);
```

### Withdrawing from a Stream
```solidity
// Withdraw available balance
drippy.withdrawFromStream(streamId, amount);
```

### Canceling a Stream
```solidity
// Cancel stream and distribute remaining balance
drippy.cancelStream(streamId);
```

## 🔐 Security

- Built with OpenZeppelin's secure contract library
- Implements ReentrancyGuard for all sensitive functions
- Comprehensive input validation
- Balance checks before transfers

## 📄 Contract Addresses

- Drippy 0x34e59a4360d5A13E29D71d18b907a1f292754Aac
- Critea fake USDC 0x05D0AcA3ba12f010f6A26104da5cB83419723842


## 📸 Screenshots


![Create Stream](./1.png)

![Stream Details](./2.png)

