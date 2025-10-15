import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getCollection } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    // Parse request body
    const { name, email, password } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email and password are required",
        },
        { status: 400 },
      )
    }

    try {
      // Get users collection
      const usersCollection = await getCollection("loginDB", "users")

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email })
      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 409 },
        )
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const result = await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      })

      return NextResponse.json(
        {
          success: true,
          message: "Account created successfully",
          userId: result.insertedId,
        },
        { status: 201 },
      )
    } catch (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          success: false,
          message: `Database error: ${error.message}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 },
    )
  }
}
