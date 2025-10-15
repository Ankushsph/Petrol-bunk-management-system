import { NextResponse } from "next/server"
import { MongoClient } from "mongodb"

export async function GET() {
  const uri = process.env.MONGODB_URI || ""
  console.log("Testing connection with URI:", uri.replace(/:[^:]*@/, ":****@")) // Log URI with password hidden

  try {
    console.log("Creating MongoDB client...")
    const client = new MongoClient(uri, {
      // Explicitly set SSL options
      ssl: true,
      tls: true,
    })

    console.log("Attempting to connect...")
    await client.connect()
    console.log("Connected successfully!")

    const db = client.db("loginDB")
    const collections = await db.listCollections().toArray()

    await client.close()
    console.log("Connection closed")

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      collections: collections.map((c) => c.name),
    })
  } catch (error) {
    console.error("Connection error details:", error)

    return NextResponse.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
