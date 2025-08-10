"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share, DollarSign, MoreHorizontal, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { contractUtils } from "@/lib/web3"
import { getDisplayUrl, checkFileAccess } from "@/lib/pinata"
import { TipModal } from "@/components/tip-modal"

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

interface PostCardProps {
  post: Post
  userAddress: string
}

export function PostCard({ post, userAddress }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [showTipModal, setShowTipModal] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (post.contentIPFSHash) {
      loadMediaUrl()
    }
  }, [post.contentIPFSHash])

  const loadMediaUrl = async () => {
    if (!post.contentIPFSHash) return

    setLoadingMedia(true)
    setImageError(false)

    try {
      console.log(`🔄 Loading media for post ${post.id}, file ID:`, post.contentIPFSHash)

      // First check if file is accessible
      const isAccessible = await checkFileAccess(post.contentIPFSHash)
      if (!isAccessible) {
        console.error(`❌ File ${post.contentIPFSHash} is not accessible (may be private)`)
        setImageError(true)
        return
      }

      const url = await getDisplayUrl(post.contentIPFSHash)
      if (url) {
        setMediaUrl(url)
        console.log(`✅ Media URL loaded for post ${post.id}:`, url)
      } else {
        console.error(`❌ Could not generate display URL for post ${post.id}`)
        setImageError(true)
      }
    } catch (error) {
      console.error(`❌ Error loading media for post ${post.id}:`, error)
      setImageError(true)
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleLike = async () => {
    if (isLiking) return

    setIsLiking(true)
    const originalLiked = isLiked
    const originalCount = likeCount

    try {
      // Optimistic update
      if (isLiked) {
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
        await contractUtils.unlikePost(post.id)
      } else {
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
        await contractUtils.likePost(post.id)
      }
    } catch (error: any) {
      console.error("Error toggling like:", error)
      // Revert optimistic update
      setIsLiked(originalLiked)
      setLikeCount(originalCount)
    } finally {
      setIsLiking(false)
    }
  }

  const handleImageError = () => {
    console.error(`❌ Image failed to load for post ${post.id}:`, mediaUrl)
    setImageError(true)
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    console.log(`🔄 Retrying media load for post ${post.id} (attempt ${retryCount + 1})`)
    loadMediaUrl()
  }

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Avatar className="w-12 h-12 border-2 border-purple-200">
              <AvatarImage src={post.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600">
                {post.username[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">@{post.username}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(post.timestamp * 1000), { addSuffix: true })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-gray-800 leading-relaxed">{post.text}</p>

              {post.contentIPFSHash && loadingMedia && (
                <div className="rounded-xl overflow-hidden bg-gray-100 p-8 text-center">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading media from IPFS...</p>
                  <p className="text-xs text-gray-400 mt-1">File ID: {post.contentIPFSHash}</p>
                </div>
              )}

              {post.contentIPFSHash && mediaUrl && !imageError && !loadingMedia && (
                <div className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={mediaUrl || "/placeholder.svg"}
                    alt="Post content"
                    className="w-full max-h-96 object-cover"
                    onError={handleImageError}
                    onLoad={() => console.log(`✅ Image loaded successfully for post ${post.id}:`, mediaUrl)}
                  />
                </div>
              )}

              {post.contentIPFSHash && (imageError || (!mediaUrl && !loadingMedia)) && (
                <div className="rounded-xl overflow-hidden bg-gray-100 p-4 text-center border-2 border-dashed border-gray-300">
                  <p className="text-gray-600 text-sm mb-2">📎 Media content (IPFS)</p>
                  <p className="text-xs text-gray-500 mb-3 font-mono break-all">File ID: {post.contentIPFSHash}</p>
                  <p className="text-xs text-red-500 mb-3">
                    {imageError ? "Failed to load media (file may be private)" : "Media not loaded"}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="outline" onClick={handleRetry} className="text-xs bg-transparent">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry ({retryCount})
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center space-x-2 ${
                      isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Reply</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-gray-500 hover:text-green-500"
                  >
                    <Share className="w-5 h-5" />
                    <span>Share</span>
                  </Button>
                </div>

                {post.author !== userAddress && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTipModal(true)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-full px-4"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Tip</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientAddress={post.author}
        recipientUsername={post.username}
      />
    </>
  )
}
