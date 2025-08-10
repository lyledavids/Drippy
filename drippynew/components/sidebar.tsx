"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Bell, User } from "lucide-react"

interface SidebarProps {
  userAddress: string
}

export function Sidebar({ userAddress }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "Home", active: true },
    { icon: User, label: "Profile" },
    
    { icon: Bell, label: "Notifications" },
  ]

  return (
    <div className="w-64 p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          {/* Sparkles icon removed as per updates */}
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Drippy
        </h1>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
        <CardContent className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.label}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start space-x-3 rounded-xl ${
                item.active
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                  : "text-gray-700 hover:bg-purple-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Upgrade card section removed as per updates */}
    </div>
  )
}
