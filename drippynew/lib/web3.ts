import { ethers } from "ethers"
import { CONFIG } from "./constants"

const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "text",
        type: "string",
      },
      {
        internalType: "string",
        name: "contentIPFSHash",
        type: "string",
      },
    ],
    name: "createPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string",
        name: "bio",
        type: "string",
      },
      {
        internalType: "string",
        name: "avatarIPFSHash",
        type: "string",
      },
    ],
    name: "createProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userToFollow",
        type: "address",
      },
    ],
    name: "follow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "follower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "followee",
        type: "address",
      },
    ],
    name: "Followed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
    ],
    name: "likePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "text",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "contentIPFSHash",
        type: "string",
      },
    ],
    name: "PostCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "liker",
        type: "address",
      },
    ],
    name: "PostLiked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "unliker",
        type: "address",
      },
    ],
    name: "PostUnliked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "ProfileCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "username",
        type: "string",
      },
    ],
    name: "ProfileUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Tipped",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address payable",
        name: "user",
        type: "address",
      },
    ],
    name: "tipUser",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "userToUnfollow",
        type: "address",
      },
    ],
    name: "unfollow",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "follower",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "followee",
        type: "address",
      },
    ],
    name: "Unfollowed",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
    ],
    name: "unlikePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string",
        name: "bio",
        type: "string",
      },
      {
        internalType: "string",
        name: "avatarIPFSHash",
        type: "string",
      },
    ],
    name: "updateProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
    ],
    name: "getPost",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "author",
        type: "address",
      },
      {
        internalType: "string",
        name: "text",
        type: "string",
      },
      {
        internalType: "string",
        name: "contentIPFSHash",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "likeCount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getPostsByUser",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getProfile",
    outputs: [
      {
        internalType: "string",
        name: "username",
        type: "string",
      },
      {
        internalType: "string",
        name: "bio",
        type: "string",
      },
      {
        internalType: "string",
        name: "avatarIPFSHash",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "postId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasLiked",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "follower",
        type: "address",
      },
      {
        internalType: "address",
        name: "followee",
        type: "address",
      },
    ],
    name: "isFollowing",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// Custom provider class that completely disables ENS
class NoENSProvider extends ethers.BrowserProvider {
  async resolveName(name: string): Promise<string | null> {
    // If it's already an address, return it
    if (ethers.isAddress(name)) {
      return name
    }
    // Otherwise, return null (no ENS resolution)
    return null
  }

  async lookupAddress(address: string): Promise<string | null> {
    // Never resolve addresses to ENS names
    return null
  }
}

export function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new NoENSProvider(window.ethereum)
  }
  throw new Error("No Web3 provider found")
}

export async function getSigner() {
  const provider = getProvider()
  return await provider.getSigner()
}

export function getContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const providerOrSigner = signerOrProvider || getProvider()
  return new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, providerOrSigner)
}

export async function getContractWithSigner() {
  const signer = await getSigner()
  return getContract(signer)
}

// Export configuration for debugging
export const config = {
  CONTRACT_ADDRESS: CONFIG.CONTRACT_ADDRESS,
  PINATA_JWT: CONFIG.PINATA_JWT ? "SET" : "NOT SET",
  isValidAddress: ethers.isAddress(CONFIG.CONTRACT_ADDRESS),
  NETWORK_NAME: CONFIG.NETWORK_NAME,
  CHAIN_ID: CONFIG.CHAIN_ID,
}

// Direct contract interaction functions that bypass any ENS resolution
export const contractUtils = {
  async createProfile(username: string, bio: string, avatarIPFSHash: string) {
    try {
      console.log("Creating profile with contract address:", CONFIG.CONTRACT_ADDRESS)
      console.log("Is valid address:", ethers.isAddress(CONFIG.CONTRACT_ADDRESS))

      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      console.log("Calling createProfile with:", { username, bio, avatarIPFSHash })
      const tx = await contract.createProfile(username, bio, avatarIPFSHash)
      console.log("Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)
      return receipt
    } catch (error) {
      console.error("Contract call failed:", error)
      throw error
    }
  },

  async getProfile(address: string) {
    try {
      const provider = getProvider()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const [username, bio, avatarIPFSHash] = await contract.getProfile(address)
      return { username, bio, avatarIPFSHash }
    } catch (error) {
      console.log("Profile not found for address:", address)
      return null
    }
  },

  async createPost(text: string, contentIPFSHash: string) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      console.log("Calling createPost with:", { text, contentIPFSHash })
      const tx = await contract.createPost(text, contentIPFSHash)
      console.log("Transaction sent:", tx.hash)

      const receipt = await tx.wait()
      console.log("Transaction confirmed:", receipt)
      return receipt
    } catch (error) {
      console.error("Contract call failed:", error)
      throw error
    }
  },

  async getPost(postId: number) {
    try {
      const provider = getProvider()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const [id, author, text, contentIPFSHash, timestamp, likeCount] = await contract.getPost(postId)
      return {
        id: Number(id),
        author,
        text,
        contentIPFSHash,
        timestamp: Number(timestamp),
        likeCount: Number(likeCount),
      }
    } catch (error) {
      return null
    }
  },

  async getPostsByUser(address: string) {
    try {
      const provider = getProvider()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const postIds = await contract.getPostsByUser(address)
      return postIds.map((id: any) => Number(id))
    } catch (error) {
      return []
    }
  },

  async likePost(postId: number) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.likePost(postId)
      return await tx.wait()
    } catch (error) {
      console.error("Like post failed:", error)
      throw error
    }
  },

  async unlikePost(postId: number) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.unlikePost(postId)
      return await tx.wait()
    } catch (error) {
      console.error("Unlike post failed:", error)
      throw error
    }
  },

  async hasLiked(postId: number, userAddress: string) {
    try {
      const provider = getProvider()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      return await contract.hasLiked(postId, userAddress)
    } catch (error) {
      return false
    }
  },

  async follow(userToFollow: string) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.follow(userToFollow)
      return await tx.wait()
    } catch (error) {
      console.error("Follow failed:", error)
      throw error
    }
  },

  async unfollow(userToUnfollow: string) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.unfollow(userToUnfollow)
      return await tx.wait()
    } catch (error) {
      console.error("Unfollow failed:", error)
      throw error
    }
  },

  async isFollowing(follower: string, followee: string) {
    try {
      const provider = getProvider()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      return await contract.isFollowing(follower, followee)
    } catch (error) {
      return false
    }
  },

  async tipUser(userAddress: string, amount: string) {
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      const tx = await contract.tipUser(userAddress, { value: ethers.parseEther(amount) })
      return await tx.wait()
    } catch (error) {
      console.error("Tip failed:", error)
      throw error
    }
  },
}
