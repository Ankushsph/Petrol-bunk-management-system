import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    try {
      // Verify token
      const decoded = verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };

      // Get user from database
      const usersCollection = await getCollection("loginDB", "users");
      const user = await usersCollection.findOne({
        _id: new ObjectId(decoded.userId),
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }

      // Return user data
      return NextResponse.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      { status: 500 }
    );
  }
}
