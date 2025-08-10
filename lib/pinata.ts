import { CONFIG } from "./constants"

export async function uploadToPinata(file: File): Promise<string> {
  console.log("Starting Pinata upload for file:", file.name, "Size:", file.size)

  if (!CONFIG.PINATA_JWT) {
    throw new Error("Pinata JWT token not configured")
  }

  const formData = new FormData()
  formData.append("network", "public") // Explicitly set to public
  formData.append("file", file)
  formData.append("name", `drippy-${file.name}-${Date.now()}`)

  console.log("Uploading to Pinata as PUBLIC with JWT:", CONFIG.PINATA_JWT.substring(0, 10) + "...")

  const response = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.PINATA_JWT}`,
    },
    body: formData,
  })

  console.log("Pinata response status:", response.status)

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Pinata upload failed:", errorText)
    throw new Error(`Failed to upload to Pinata: ${response.status} ${errorText}`)
  }

  const data = await response.json()
  console.log("Pinata upload successful (PUBLIC):", data)

  // Verify the file was uploaded as public
  if (data.data) {
    console.log("File ID:", data.data.id)
    console.log("File should be public - testing access...")

    // Test if we can access the file info immediately
    setTimeout(async () => {
      try {
        const testInfo = await getPinataFileInfo(data.data.id)
        console.log("✅ File info accessible:", testInfo)
      } catch (error) {
        console.error("❌ File info not accessible:", error)
      }
    }, 1000)
  }

  return data.data.id
}

export async function getPinataFileInfo(fileId: string) {
  if (!CONFIG.PINATA_JWT) {
    throw new Error("Pinata JWT token not configured")
  }

  console.log("Fetching file info for ID:", fileId)

  const url = `https://api.pinata.cloud/v3/files/public/${fileId}`
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${CONFIG.PINATA_JWT}`,
    },
  }

  try {
    console.log("Making request to:", url)
    const response = await fetch(url, options)

    console.log("File info response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("File info fetch failed:", response.status, errorText)
      throw new Error(`Failed to fetch file info: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("File info fetched successfully:", data)

    if (!data.data || !data.data.cid) {
      console.error("Invalid file info response:", data)
      throw new Error("Invalid file info response - missing CID")
    }

    return data.data
  } catch (error) {
    console.error("Error fetching file info for ID:", fileId, error)
    throw error
  }
}

export function getPinataUrl(cid: string): string {
  // Use your custom gateway URL with the CID
  const url = `https://rose-causal-catshark-554.mypinata.cloud/ipfs/${cid}`
  console.log("Generated Pinata URL:", url)
  return url
}

export async function getDisplayUrl(fileId: string): Promise<string | null> {
  try {
    console.log("Getting display URL for file ID:", fileId)

    if (!fileId || fileId.trim() === "") {
      console.log("Empty file ID provided")
      return null
    }

    const fileInfo = await getPinataFileInfo(fileId)

    if (!fileInfo.cid) {
      console.error("No CID found in file info:", fileInfo)
      return null
    }

    const displayUrl = getPinataUrl(fileInfo.cid)
    console.log("✅ Display URL generated:", displayUrl)
    return displayUrl
  } catch (error) {
    console.error("❌ Error getting display URL for file ID:", fileId, error)
    return null
  }
}

// Helper function to check if a file is public
export async function checkFileAccess(fileId: string): Promise<boolean> {
  try {
    const fileInfo = await getPinataFileInfo(fileId)
    console.log("File access check passed for:", fileId)
    return true
  } catch (error) {
    console.error("File access check failed for:", fileId, error)
    return false
  }
}
