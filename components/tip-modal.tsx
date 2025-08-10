"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DollarSign, Heart } from "lucide-react"
import { contractUtils } from "@/lib/web3"

interface TipModalProps {
  isOpen: boolean
  onClose: () => void
  recipientAddress: string
  recipientUsername: string
}

export function TipModal({ isOpen, onClose, recipientAddress, recipientUsername }: TipModalProps) {
  const [amount, setAmount] = useState("")
  const [isTipping, setIsTipping] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const predefinedAmounts = ["0.001", "0.01", "0.1", "1"]

  const handleTip = async () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setIsTipping(true)
    setError("")

    try {
      await contractUtils.tipUser(recipientAddress, amount)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setAmount("")
      }, 2000)
    } catch (error: any) {
      console.error("Error sending tip:", error)
      setError(error.message || "Failed to send tip")
    } finally {
      setIsTipping(false)
    }
  }

  const handleClose = () => {
    if (!isTipping) {
      onClose()
      setAmount("")
      setError("")
      setSuccess(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            <span>Send a Tip</span>
          </DialogTitle>
          <DialogDescription>Show your appreciation by sending CBTC to @{recipientUsername}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-green-500 fill-current" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 mb-2">Tip Sent Successfully!</h3>
            <p className="text-gray-600">
              Your tip of {amount} CBTC has been sent to @{recipientUsername}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-purple-100 text-purple-600">
                  {recipientUsername[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">@{recipientUsername}</p>
                <p className="text-sm text-gray-500">
                  {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (CBTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {predefinedAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className="text-sm"
                  >
                    {preset} CBTC
                  </Button>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
              )}

              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleClose} disabled={isTipping} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleTip}
                  disabled={!amount || Number.parseFloat(amount) <= 0 || isTipping}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {isTipping ? "Sending..." : `Send ${amount || "0"} CBTC`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
