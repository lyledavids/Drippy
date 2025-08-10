"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ImageIcon, VideoIcon, SmileIcon, SendIcon } from "lucide-react"
import { uploadToPinata, checkFileAccess } from "@/lib/pinata"
import { contractUtils } from "@/lib/web3"

interface CreatePostProps {
  userAddress: string
  onPostCreated: () => void
}

export function CreatePost({ userAddress, onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState("")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string>("")
  const [isPosting, setIsPosting] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const createPost = async () => {
    if (!postText.trim() && !mediaFile) return

    setIsPosting(true)
    setError("")
    setSuccess(false)

    try {
      let contentHash = ""

      if (mediaFile) {
        console.log("🔄 Uploading media to Pinata...")
        contentHash = await uploadToPinata(mediaFile)
        console.log("✅ Media uploaded successfully with ID:", contentHash)

        // Verify the file is accessible
        console.log("🔍 Verifying file access...")
        const isAccessible = await checkFileAccess(contentHash)
        if (!isAccessible) {
          throw new Error("Uploaded file is not accessible - may be private")
        }
        console.log("✅ File is publicly accessible")
      }

      console.log("🔄 Creating post on blockchain...")

      // Use the direct contract utility function
      await contractUtils.createPost(postText, contentHash)
      console.log("✅ Post created successfully on blockchain!")

      // Reset form
      setPostText("")
      setMediaFile(null)
      setMediaPreview("")
      setSuccess(true)

      // Trigger feed refresh
      onPostCreated()

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error("❌ Error creating post:", error)

      if (error.message?.includes("user rejected")) {
        setError("Transaction was rejected")
      } else if (error.message?.includes("insufficient funds")) {
        setError("Insufficient funds for transaction")
      } else if (error.message?.includes("not accessible")) {
        setError("File upload failed - file may be private. Please try again.")
      } else if (error.reason) {
        setError(`Contract error: ${error.reason}`)
      } else {
        setError(error.message || "Failed to create post")
      }
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="w-12 h-12 border-2 border-purple-200">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600">U</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening in your world?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="border-0 resize-none text-lg placeholder:text-gray-400 focus-visible:ring-0 bg-transparent"
              rows={3}
            />

            {mediaPreview && (
              <div className="relative rounded-xl overflow-hidden">
                {mediaFile?.type.startsWith("image/") ? (
                  <img
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full max-h-64 object-cover"
                  />
                ) : (
                  <video src={mediaPreview} className="w-full max-h-64 object-cover" controls />
                )}
                <button
                  onClick={() => {
                    setMediaFile(null)
                    setMediaPreview("")
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
                >
                  ×
                </button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                🎉 Post created successfully! Media is publicly accessible.
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <label className="p-2 text-purple-500 hover:bg-purple-50 rounded-full cursor-pointer transition-colors">
                  <ImageIcon className="w-5 h-5" />
                  <input type="file" accept="image/*" onChange={handleMediaChange} className="hidden" />
                </label>
                <label className="p-2 text-purple-500 hover:bg-purple-50 rounded-full cursor-pointer transition-colors">
                  <VideoIcon className="w-5 h-5" />
                  <input type="file" accept="video/*" onChange={handleMediaChange} className="hidden" />
                </label>
                <button className="p-2 text-purple-500 hover:bg-purple-50 rounded-full transition-colors">
                  <SmileIcon className="w-5 h-5" />
                </button>
              </div>

              <Button
                onClick={createPost}
                disabled={(!postText.trim() && !mediaFile) || isPosting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6"
              >
                <SendIcon className="w-4 h-4 mr-2" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
