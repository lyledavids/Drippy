import { ethers } from 'ethers';
import { get } from 'svelte/store';
import { provider, signer, contract, address, usdEContract } from '../stores/web3Store';
export async function createStream(recipient, deposit, duration, isNative) {
    try {
      const contractInstance = get(contract);
      if (!contractInstance) {
        throw new Error('Contract not initialized. Please connect your wallet.');
      }
  
      const depositAmount = ethers.utils.parseEther(deposit.toString());
      const value = isNative ? depositAmount : 0;
      
      if (!isNative) {
        await approveUSDEIfNeeded(depositAmount);
      }
  
      const tx = await contractInstance.createStream(recipient, depositAmount, duration, isNative, { value });
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'StreamCreated');
      return event.args.streamId.toString();
    } catch (error) {
      console.error('Error creating stream:', error);
      throw error;
    }
  }
  
  export async function cancelStream(streamId) {
    try {
      const contractInstance = get(contract);
      if (!contractInstance) {
        throw new Error('Contract not initialized. Please connect your wallet.');
      }
  
      const tx = await contractInstance.cancelStream(streamId);
      await tx.wait();
    } catch (error) {
      console.error('Error cancelling stream:', error);
      throw error;
    }
  }
  
  export async function withdrawFromStream(streamId, amount) {
    try {
      const contractInstance = get(contract);
      if (!contractInstance) {
        throw new Error('Contract not initialized. Please connect your wallet.');
      }
  
      const amountWei = ethers.utils.parseEther(amount.toString());
      const tx = await contractInstance.withdrawFromStream(streamId, amountWei);
      await tx.wait();
    } catch (error) {
      console.error('Error withdrawing from stream:', error);
      throw error;
    }
  }
  
//   export async function getUserStreams() {
//     try {
//       const contractInstance = get(contract);
//       if (!contractInstance) {
//         throw new Error('Contract not initialized. Please connect your wallet.');
//       }
  
//       const userAddress = get(address);
//       const streamIds = await contractInstance.getUserStreams(userAddress);
      
//       const streams = await Promise.all(streamIds.map(async (id) => {
//         const streamDetails = await getStreamDetails(id);
//         return {
//           ...streamDetails,
//           id: id.toString(),
//           isIncoming: streamDetails.recipient.toLowerCase() === userAddress.toLowerCase()
//         };
//       }));
  
//       console.log('Fetched streams:', streams);
//       return streams;
//     } catch (error) {
//       console.error('Error getting user streams:', error);
//       throw error;
//     }
//   }

export async function getUserStreams() {
    try {
      const contractInstance = get(contract);
      if (!contractInstance) {
        throw new Error('Contract not initialized. Please connect your wallet.');
      }
  
      const userAddress = get(address);
      let streamIds;
      try {
        streamIds = await contractInstance.getUserStreams(userAddress);
      } catch (error) {
        console.error('Error calling getUserStreams:', error);
        return []; // Return an empty array if the call fails
      }
      
      const streams = await Promise.all(streamIds.map(async (id) => {
        try {
          const streamDetails = await getStreamDetails(id);
          return {
            ...streamDetails,
            id: id.toString(),
            isIncoming: streamDetails.recipient.toLowerCase() === userAddress.toLowerCase()
          };
        } catch (error) {
          console.error(`Error fetching details for stream ${id}:`, error);
          return null; // Return null for streams that couldn't be fetched
        }
      }));
  
      const validStreams = streams.filter(stream => stream !== null);
      console.log('Fetched streams:', validStreams);
      return validStreams;
    } catch (error) {
      console.error('Error getting user streams:', error);
      return []; // Return an empty array if there's an error
    }
  }
  
  export async function getStreamDetails(streamId) {
    try {
      const contractInstance = get(contract);
      if (!contractInstance) {
        throw new Error('Contract not initialized. Please connect your wallet.');
      }
  
      const stream = await contractInstance.getStreamDetails(streamId);
      return {
        id: streamId.toString(),
        sender: stream.sender,
        recipient: stream.recipient,
        deposit: ethers.utils.formatEther(stream.deposit),
        startTime: new Date(stream.startTime.toNumber() * 1000),
        stopTime: new Date(stream.stopTime.toNumber() * 1000),
        ratePerSecond: ethers.utils.formatEther(stream.ratePerSecond),
        remainingBalance: ethers.utils.formatEther(stream.remainingBalance),
        isNative: stream.isNative
      };
    } catch (error) {
      console.error('Error getting stream details:', error);
      throw error;
    }
  }
  
  async function approveUSDEIfNeeded(amount) {
    const usdEContractInstance = get(usdEContract);
    const userAddress = get(address);
    const contractAddress = get(contract).address;
  
    const currentAllowance = await usdEContractInstance.allowance(userAddress, contractAddress);
  
    if (currentAllowance.lt(amount)) {
      const approveTx = await usdEContractInstance.approve(contractAddress, amount);
      await approveTx.wait();
      console.log('USDE approval successful');
    }
  }
  

