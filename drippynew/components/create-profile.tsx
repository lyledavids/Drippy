"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User } from "lucide-react"
import { uploadToPinata } from "@/lib/pinata"
import { contractUtils } from "@/lib/web3"

interface CreateProfileProps {
  userAddress: string
  onProfileCreated: () => void
}

export function CreateProfile({ userAddress, onProfileCreated }: CreateProfileProps) {
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string>("")

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createProfile = async () => {
    if (!username.trim()) {
      setError("Username is required")
      return
    }

    setIsCreating(true)
    setError("")

    try {
      let avatarHash = ""

      if (avatarFile) {
        console.log("Uploading avatar to Pinata...")
        avatarHash = await uploadToPinata(avatarFile)
        console.log("Avatar uploaded successfully:", avatarHash)
      }

      console.log("Creating profile on blockchain...")
      console.log("Contract address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS)
      console.log("User address:", userAddress)
      console.log("Profile data:", { username, bio, avatarHash })

      // Use the direct contract utility function
      await contractUtils.createProfile(username, bio, avatarHash)
      console.log("Profile created successfully!")

      onProfileCreated()
    } catch (error: any) {
      console.error("Error creating profile:", error)

      if (error.message?.includes("user rejected")) {
        setError("Transaction was rejected")
      } else if (error.message?.includes("insufficient funds")) {
        setError("Insufficient funds for transaction")
      } else if (error.reason) {
        setError(`Contract error: ${error.reason}`)
      } else {
        setError(error.message || "Failed to create profile")
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Your Profile
        </CardTitle>
        <CardDescription>Set up your Drippy profile to start sharing and connecting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-gradient-to-r from-purple-500 to-pink-500">
              <AvatarImage src={avatarPreview || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100">
                <User className="w-8 h-8 text-purple-500" />
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full cursor-pointer hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border-2 border-purple-100 focus:border-purple-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="border-2 border-purple-100 focus:border-purple-300 min-h-[100px]"
            />
          </div>
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <Button
          onClick={createProfile}
          disabled={!username.trim() || isCreating}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isCreating ? "Creating Profile..." : "Create Profile"}
        </Button>
      </CardContent>
    </Card>
  )
}
