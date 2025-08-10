"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, Sparkles } from "lucide-react"

interface ConnectWalletProps {
  onConnect: (address: string) => void
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      if (typeof window.ethereum !== "undefined") {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        })
        onConnect(accounts[0])
      } else {
        alert("Please install MetaMask!")
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome to Drippy
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          The next generation social platform powered by Web3
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Own your content and data</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
            <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Tip creators directly</span>
          </div>
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-50 to-purple-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Decentralized and censorship-resistant</span>
          </div>
        </div>
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          <Wallet className="w-5 h-5 mr-2" />
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      </CardContent>
    </Card>
  )
}
