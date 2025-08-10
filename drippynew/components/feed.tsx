"use client"

import { useState, useEffect } from "react"
import { PostCard } from "@/components/post-card"
import { contractUtils } from "@/lib/web3"
import { getDisplayUrl } from "@/lib/pinata"

interface Post {
  id: number
  author: string
  username: string
  avatar: string
  text: string
  contentIPFSHash: string
  timestamp: number
  likeCount: number
  isLiked: boolean
}

interface FeedProps {
  userAddress: string
  refreshTrigger: number
}

export function Feed({ userAddress, refreshTrigger }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [userAddress, refreshTrigger])

  const loadPosts = async () => {
    setLoading(true)
    try {
      const recentPosts: Post[] = []

      // Try to load the last 20 posts (assuming sequential IDs)
      for (let i = 1; i <= 20; i++) {
        try {
          const post = await contractUtils.getPost(i)
          if (post) {
            // Get the author's profile
            const profile = await contractUtils.getProfile(post.author)
            const isLiked = await contractUtils.hasLiked(post.id, userAddress)

            // Get avatar URL if available
            let avatarUrl = ""
            if (profile?.avatarIPFSHash) {
              try {
                avatarUrl = (await getDisplayUrl(profile.avatarIPFSHash)) || ""
              } catch (error) {
                console.log("Could not load avatar for user:", profile.username)
              }
            }

            recentPosts.push({
              id: post.id,
              author: post.author,
              username: profile?.username || `User${post.author.slice(-4)}`,
              avatar: avatarUrl,
              text: post.text,
              contentIPFSHash: post.contentIPFSHash,
              timestamp: post.timestamp,
              likeCount: post.likeCount,
              isLiked,
            })
          }
        } catch (error) {
          // Post doesn't exist, continue
          continue
        }
      }

      // Sort by timestamp (newest first)
      recentPosts.sort((a, b) => b.timestamp - a.timestamp)
      setPosts(recentPosts)
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📝</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
        <p className="text-gray-600">Be the first to share something amazing!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} userAddress={userAddress} />
      ))}
    </div>
  )
}
