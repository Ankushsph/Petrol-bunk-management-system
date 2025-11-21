import { NextResponse } from "next/server"
import { getDb } from "lib/mongodb"

export async function GET() {
  const uri = process.env.MONGODB_URI || ""
  console.log("Testing connection with URI:", uri.replace(/:[^:]*@/, ":****@"))

  try {
    const db = await getDb("loginDB")
    // light ping
    await db.command({ ping: 1 })
    const collections = await db.listCollections().toArray()

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
        error: (error as Error).message,
        stack: (error as Error).stack,
      },
      { status: 500 },
    )
  }
}
