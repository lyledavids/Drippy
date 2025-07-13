import { writable } from 'svelte/store';
import { ethers } from 'ethers';
import { browser } from '$app/environment';
import contractABI from './contractABI.json';

export const provider = writable(null);
export const signer = writable(null);
export const address = writable(null);
export const contract = writable(null);
export const usdEContract = writable(null);

const contractAddress = '0x34e59a4360d5A13E29D71d18b907a1f292754Aac';
const usdEAddress = '0x05D0AcA3ba12f010f6A26104da5cB83419723842';
//const contractABI = contractABI
const erc20ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

export async function connectWallet() {
    if (browser && typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const web3Signer = web3Provider.getSigner();
        const userAddress = await web3Signer.getAddress();
        const contractInstance = new ethers.Contract(contractAddress, contractABI, web3Signer);
        const usdEContractInstance = new ethers.Contract(usdEAddress, erc20ABI, web3Signer);
  
        provider.set(web3Provider);
        signer.set(web3Signer);
        address.set(userAddress);
        contract.set(contractInstance);
        usdEContract.set(usdEContractInstance);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    } else {
      console.error('MetaMask is not installed or not in a browser environment');
    }
  }
  
  if (browser) {
    connectWallet();
  }
  
  