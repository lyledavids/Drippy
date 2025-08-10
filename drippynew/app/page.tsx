"use client"

import { useState } from "react"
import { ConnectWallet } from "@/components/connect-wallet"
import { CreateProfile } from "@/components/create-profile"
import { Feed } from "@/components/feed"
import { CreatePost } from "@/components/create-post"
import { ProfileCard } from "@/components/profile-card"
import { Sidebar } from "@/components/sidebar"
import { SuggestedUsers } from "@/components/suggested-users"
//import { DebugInfo } from "@/components/debug-info"
import { contractUtils } from "@/lib/web3"

export default function Home() {
  const [isConnected, setIsConnected] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0)

  const handleConnect = async (address: string) => {
    setIsConnected(true)
    setUserAddress(address)
    setLoading(true)

    try {
      // Check if user has a profile
      const profile = await contractUtils.getProfile(address)
      setHasProfile(!!profile)
      setProfileData(profile)
    } catch (error) {
      console.error("Error checking profile:", error)
      setHasProfile(false)
      setProfileData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileCreated = async () => {
    setHasProfile(true)
    try {
      const profile = await contractUtils.getProfile(userAddress)
      setProfileData(profile)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const handlePostCreated = () => {
    // Trigger feed refresh by updating the trigger
    setFeedRefreshTrigger((prev) => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {!isConnected ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="space-y-4">
            
            <ConnectWallet onConnect={handleConnect} />
          </div>
        </div>
      ) : !hasProfile ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <CreateProfile userAddress={userAddress} onProfileCreated={handleProfileCreated} />
        </div>
      ) : (
        <div className="flex max-w-7xl mx-auto">
          <Sidebar userAddress={userAddress} />
          <main className="flex-1 p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <CreatePost userAddress={userAddress} onPostCreated={handlePostCreated} />
                <Feed userAddress={userAddress} refreshTrigger={feedRefreshTrigger} />
              </div>
              <div className="space-y-6">
                <ProfileCard userAddress={userAddress} profileData={profileData} />
                <SuggestedUsers userAddress={userAddress} />
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  )
}
