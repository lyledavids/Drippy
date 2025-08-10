"use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Settings } from "lucide-react"

interface ProfileCardProps {
  userAddress: string
  profileData?: {
    username: string
    bio: string
    avatarIPFSHash: string
  } | null
}

export function ProfileCard({ userAddress, profileData }: ProfileCardProps) {
  const profile = {
    username: profileData?.username || "Loading...",
    bio: profileData?.bio || "Web3 enthusiast and creator",
    avatar: profileData?.avatarIPFSHash
      ? `https://api.pinata.cloud/v3/files/public/${profileData.avatarIPFSHash}`
      : "/placeholder.svg",
    //followers: 0, 
    //following: 0,
    //posts: 0,
    //likes: 0,
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white p-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-white text-purple-600 text-xl font-bold">
              {profile.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-bold">@{profile.username}</h2>
            <p className="text-purple-100 text-sm">{profile.bio}</p>
          </div>
        </div>
      </CardHeader>

      
    </Card>
  )
}
