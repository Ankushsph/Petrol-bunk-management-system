import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { authenticateUser, handleAuthError } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { hash } from "bcryptjs";

// Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    const userId = params.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get users collection
    const usersCollection = await getCollection("loginDB", "users");

    // Find user by ID
    const user = await usersCollection.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error(`Error fetching user with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    const userId = params.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const updates = await request.json();

    // Basic validation
    if (!updates.name && !updates.email && !updates.password) {
      return NextResponse.json(
        { message: "No updates provided" },
        { status: 400 }
      );
    }

    // Get users collection
    const usersCollection = await getCollection("loginDB", "users");

    // Prepare update object
    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.email) {
      // Check if email is already in use by another user
      const existingUser = await usersCollection.findOne({ 
        email: updates.email,
        _id: { $ne: new ObjectId(userId) },
      });
      
      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use by another user" },
          { status: 409 }
        );
      }
      
      updateData.email = updates.email;
    }
    
    if (updates.password) {
      // Hash the new password
      updateData.password = await hash(updates.password, 10);
    }

    // Update the user
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(`Error updating user with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    const userId = params.id;

    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Get users collection
    const usersCollection = await getCollection("loginDB", "users");

    // Delete the user
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(`Error deleting user with ID ${params.id}:`, error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
} 