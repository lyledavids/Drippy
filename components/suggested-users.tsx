"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, UserCheck } from "lucide-react"
import { contractUtils } from "@/lib/web3"
import { getDisplayUrl } from "@/lib/pinata"

interface SuggestedUser {
  address: string
  username: string
  bio: string
  avatar: string
  isFollowing: boolean
}

interface SuggestedUsersProps {
  userAddress: string
}

export function SuggestedUsers({ userAddress }: SuggestedUsersProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    loadRealUsers()
  }, [userAddress])

  const loadRealUsers = async () => {
    setLoading(true)
    try {
      const users: SuggestedUser[] = []
      const seenAddresses = new Set<string>()
      seenAddresses.add(userAddress.toLowerCase()) // Don't include current user

      // Get real users by scanning through posts
      for (let i = 1; i <= 50; i++) {
        try {
          const post = await contractUtils.getPost(i)
          if (post && !seenAddresses.has(post.author.toLowerCase())) {
            seenAddresses.add(post.author.toLowerCase())

            try {
              const profile = await contractUtils.getProfile(post.author)
              const isFollowing = await contractUtils.isFollowing(userAddress, post.author)

              if (profile && profile.username) {
                // Get avatar URL if available
                let avatarUrl = ""
                if (profile.avatarIPFSHash) {
                  try {
                    avatarUrl = (await getDisplayUrl(profile.avatarIPFSHash)) || ""
                  } catch (error) {
                    console.log("Could not load avatar for user:", profile.username)
                  }
                }

                users.push({
                  address: post.author,
                  username: profile.username,
                  bio: profile.bio || "Web3 creator",
                  avatar: avatarUrl,
                  isFollowing,
                })

                // Stop when we have 5 users
                if (users.length >= 5) break
              }
            } catch (profileError) {
              console.log("Could not fetch profile for:", post.author)
            }
          }
        } catch (error) {
          // Post doesn't exist, continue
          continue
        }
      }

      setSuggestedUsers(users)

      // Initialize following states
      const states: { [key: string]: boolean } = {}
      users.forEach((user) => {
        states[user.address] = user.isFollowing
      })
      setFollowingStates(states)
    } catch (error) {
      console.error("Error loading real users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async (targetAddress: string) => {
    try {
      const isCurrentlyFollowing = followingStates[targetAddress]

      // Optimistic update
      setFollowingStates((prev) => ({
        ...prev,
        [targetAddress]: !isCurrentlyFollowing,
      }))

      if (isCurrentlyFollowing) {
        await contractUtils.unfollow(targetAddress)
      } else {
        await contractUtils.follow(targetAddress)
      }
    } catch (error: any) {
      console.error("Error following/unfollowing user:", error)
      // Revert optimistic update
      setFollowingStates((prev) => ({
        ...prev,
        [targetAddress]: !prev[targetAddress],
      }))
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Discover Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (suggestedUsers.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Discover Users</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">👥</span>
          </div>
          <p className="text-gray-600 text-sm">No other users found yet</p>
          <p className="text-gray-500 text-xs mt-1">Be the first to create content!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Discover Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.map((user) => (
          <div key={user.address} className="flex items-center space-x-3">
            <Avatar className="w-10 h-10 border-2 border-purple-200">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600">
                {user.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">@{user.username}</p>
              <p className="text-xs text-gray-500 truncate">{user.bio}</p>
            </div>

            <Button
              size="sm"
              variant={followingStates[user.address] ? "outline" : "default"}
              onClick={() => handleFollow(user.address)}
              className={`${
                followingStates[user.address]
                  ? "text-gray-600 hover:text-red-600 hover:border-red-300"
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              }`}
            >
              {followingStates[user.address] ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
