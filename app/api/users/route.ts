import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { authenticateUser, handleAuthError } from "@/lib/auth";
import { hash } from "bcryptjs";

// Get all users
export async function GET(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    // Get users collection
    const usersCollection = await getCollection("loginDB", "users");

    // Get all users (excluding password field)
    const users = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    // Map MongoDB _id to id for frontend
    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Create new user
export async function POST(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    // Parse request body
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          message: "Name, email and password are required",
        },
        { status: 400 }
      );
    }

    // Get users collection
    const usersCollection = await getCollection("loginDB", "users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 