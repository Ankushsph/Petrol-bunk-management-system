import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("Testing MongoDB connection...")

    // Try to connect to MongoDB using the getCollection function
    const testCollection = await getCollection("loginDB", "test")
    console.log("Connected to MongoDB successfully!")

    // Test a simple operation
    const result = await testCollection.insertOne({ test: "connection", timestamp: new Date() })
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId })

    return NextResponse.json({
      success: true,
      message: "MongoDB connection successful",
      testId: result.insertedId,
    })
  } catch (error: any) {
    console.error("MongoDB connection error:", error)

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
