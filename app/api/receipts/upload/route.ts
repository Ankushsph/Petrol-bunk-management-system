import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { mkdir } from "fs/promises";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "petrol-pump-management-secret-key-2023";

export async function POST(request: Request) {
  try {
    // Get token from cookies with proper Next.js cookies API
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token
    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Process the uploaded file
    const formData = await request.formData();
    const file = formData.get("receipt") as File;

    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { message: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${fileId}.${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");

    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error("Error creating uploads directory:", error);
    }

    try {
      // Convert the file to a Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Save the file
      const filePath = join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      // Return the file URL
      const fileUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        success: true,
        fileUrl,
      });
    } catch (error) {
      console.error("Error saving file:", error);
      return NextResponse.json(
        {
          success: false,
          message: `Error saving file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error uploading receipt:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}
