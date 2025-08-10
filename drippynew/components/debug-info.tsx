"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { config } from "@/lib/web3"

export function DebugInfo() {
  return (
    <Card className="mb-4 bg-yellow-50 border-yellow-200">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-yellow-700 space-y-1">
        <div>Contract Address: {config.CONTRACT_ADDRESS}</div>
        <div>Is Valid Address: {config.isValidAddress ? "✅ YES" : "❌ NO"}</div>
        <div>Pinata JWT: {config.PINATA_JWT}</div>
        <div>
          Network: {config.NETWORK_NAME} (Chain ID: {config.CHAIN_ID})
        </div>
        <div>
          Status:{" "}
          {config.CONTRACT_ADDRESS && config.isValidAddress && config.PINATA_JWT === "SET"
            ? "✅ Ready"
            : "❌ Configuration Error"}
        </div>
      </CardContent>
    </Card>
  )
}
