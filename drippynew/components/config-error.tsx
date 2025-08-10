"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface ConfigErrorProps {
  error: string
}

export function ConfigError({ error }: ConfigErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle className="text-xl font-bold text-red-700">Configuration Error</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">To fix this issue:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-red-700">
              <li>
                Open <code>lib/constants.ts</code>
              </li>
              <li>
                Replace <code>CONTRACT_ADDRESS</code> with your actual deployed contract address
              </li>
              <li>
                Replace <code>PINATA_JWT</code> with your actual Pinata JWT token
              </li>
              <li>Save the file and refresh the page</li>
            </ol>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Example constants.ts:</h3>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {`CONTRACT_ADDRESS: "0xAbC123...",
PINATA_JWT: "eyJhbGciOiJIUzI1NiIs..."`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
