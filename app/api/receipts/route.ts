import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { authenticateUser, handleAuthError } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    const userId = auth.userId;

    // Get receipts from database
    const receiptsCollection = await getCollection("loginDB", "receipts");

    const receipts = await receiptsCollection
      .find({ userId })
      .sort({ processedAt: -1 })
      .toArray();

    // Transform receipts for the frontend
    const transformedReceipts = receipts.map((receipt) => {
      // Calculate total sales and volume from nozzles
      let totalSales = 0;
      let totalVolume = 0;

      if (receipt.ocrData && receipt.ocrData.nozzles) {
        receipt.ocrData.nozzles.forEach((nozzle: any) => {
          if (nozzle.totSales) {
            totalSales += Number.parseInt(nozzle.totSales, 10) || 0;
          }
          if (nozzle.v) {
            totalVolume += Number.parseFloat(nozzle.v) || 0;
          }
        });
      }

      return {
        id: receipt._id.toString(),
        date:
          receipt.ocrData?.printDate ||
          new Date(receipt.processedAt).toISOString().split("T")[0],
        pumpSerial: receipt.ocrData?.pumpSerialNumber || "Unknown",
        totalSales: totalSales || 0,
        volume: Number.parseFloat(totalVolume.toFixed(2)) || 0,
        fileUrl: receipt.fileUrl,
        processedAt: receipt.processedAt,
        rawData: receipt.ocrData,
      };
    });

    return NextResponse.json({
      success: true,
      receipts: transformedReceipts,
    });
  } catch (error: any) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error fetching receipts: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Authenticate user
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return handleAuthError(auth.error || "Unauthorized");
    }

    const userId = auth.userId;
    
    // Get receipt ID from the URL
    const url = new URL(request.url);
    const receiptId = url.searchParams.get("id");
    
    if (!receiptId) {
      return NextResponse.json(
        { success: false, message: "Receipt ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(receiptId)) {
      return NextResponse.json(
        { success: false, message: "Invalid receipt ID format" },
        { status: 400 }
      );
    }

    // Get receipts collection
    const receiptsCollection = await getCollection("loginDB", "receipts");

    // Delete the receipt (ensuring it belongs to the current user)
    const result = await receiptsCollection.deleteOne({
      _id: new ObjectId(receiptId),
      userId: userId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Receipt not found or not authorized to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Receipt deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting receipt:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Error deleting receipt: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
