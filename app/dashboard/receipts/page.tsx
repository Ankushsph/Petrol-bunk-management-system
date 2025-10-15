"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  Download,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type NozzleData = {
  nozzle: string;
  a: string;
  v: string;
  totSales: string;
};

type ReceiptData = {
  printDate: string;
  pumpSerialNumber: string;
  model?: string;
  nozzles: NozzleData[];
};

type Receipt = {
  id: string;
  date: string;
  pumpSerial: string;
  totalSales: number;
  volume: number;
  fileUrl: string;
  processedAt: string;
  rawData?: ReceiptData;
};

export default function ReceiptsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch recent receipts on component mount
  useEffect(() => {
    const fetchRecentReceipts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/receipts", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch receipts: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.receipts)) {
          setRecentReceipts(data.receipts);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error fetching receipts:", error);
        toast({
          title: "Error",
          description: "Failed to load receipt history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentReceipts();
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);

      // Create a preview URL for the image
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("receipt", file);

      // Upload the file
      const uploadResponse = await fetch("/api/receipts/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Failed to upload receipt");
      }

      const { fileUrl } = await uploadResponse.json();

      // Process the receipt
      setIsUploading(false);
      setIsProcessing(true);

      const processResponse = await fetch("/api/receipts/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileUrl }),
        credentials: "include",
      });

      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.message || "Failed to process receipt");
      }

      const data = await processResponse.json();

      if (data.success && data.data) {
        setReceiptData(data.data);

        // Refresh the recent receipts list
        const recentReceiptsResponse = await fetch("/api/receipts", {
          credentials: "include",
        });
        if (recentReceiptsResponse.ok) {
          const recentReceiptsData = await recentReceiptsResponse.json();
          if (recentReceiptsData.success && Array.isArray(recentReceiptsData.receipts)) {
            setRecentReceipts(recentReceiptsData.receipts);
          }
        }

        toast({
          title: "Receipt processed successfully",
          description: "The receipt data has been extracted and saved",
        });
      } else {
        throw new Error(data.message || "Failed to extract data from receipt");
      }
    } catch (error) {
      console.error("Error processing receipt:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );

      toast({
        title: "Error processing receipt",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? Number.parseFloat(value) : value;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Add handler for deleting a receipt
  const handleDeleteReceipt = async (receiptId: string) => {
    try {
      setIsDeleting(receiptId);
      
      const response = await fetch(`/api/receipts?id=${receiptId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        // Remove the deleted receipt from the state
        setRecentReceipts(prevReceipts => 
          prevReceipts.filter(receipt => receipt.id !== receiptId)
        );
        
        toast({
          title: "Receipt deleted",
          description: "The receipt has been successfully deleted",
        });
      } else {
        throw new Error(data.message || "Failed to delete receipt");
      }
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the receipt",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Receipt Management</h1>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700 overflow-x-auto flex-nowrap w-full">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Upload Receipt
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Receipt History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Upload Receipt</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a receipt image to extract data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
                    {previewUrl ? (
                      <div className="mb-4 relative">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Receipt preview"
                          className="max-h-64 mx-auto rounded-md object-contain"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white"
                            onClick={() => window.open(previewUrl, "_blank")}
                          >
                            <Eye className="h-6 w-6" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                    )}

                    <h3 className="text-lg font-medium text-white mb-1">
                      {previewUrl
                        ? "Receipt selected"
                        : "Drag and drop your receipt"}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {previewUrl ? file?.name : "or click to browse files"}
                    </p>

                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="receipt"
                      className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md cursor-pointer"
                    >
                      {previewUrl ? "Change File" : "Select File"}
                    </Label>

                    {file && !previewUrl && (
                      <p className="mt-4 text-sm text-gray-300">
                        Selected:{" "}
                        <span className="font-medium">{file.name}</span>
                      </p>
                    )}

                    {error && (
                      <div className="mt-4 flex items-center text-red-500 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {error}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleUpload}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isUploading || isProcessing || !file}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Process Receipt
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Extracted Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Data extracted from the receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-auto max-h-[600px]">
                {receiptData ? (
                  <div className="space-y-4">
                    <div className="bg-gray-900 p-4 rounded-md">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">Print Date</p>
                          <p className="text-white font-medium">
                            {receiptData.printDate || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">
                            Pump Serial Number
                          </p>
                          <p className="text-white font-medium">
                            {receiptData.pumpSerialNumber || "N/A"}
                          </p>
                        </div>
                        {receiptData.model && (
                          <div>
                            <p className="text-sm text-gray-400">Model</p>
                            <p className="text-white font-medium">
                              {receiptData.model}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Nozzle Data
                      </h4>
                      {receiptData.nozzles && receiptData.nozzles.length > 0 ? (
                        <div className="space-y-3">
                          {receiptData.nozzles.map((nozzle, index) => (
                            <div
                              key={index}
                              className="bg-gray-900 p-3 rounded-md"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Nozzle
                                  </p>
                                  <p className="text-white">
                                    {nozzle.nozzle || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">A</p>
                                  <p className="text-white">
                                    {nozzle.a || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">V</p>
                                  <p className="text-white">
                                    {nozzle.v || "N/A"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-400">
                                    Total Sales
                                  </p>
                                  <p className="text-white">
                                    {formatCurrency(nozzle.totSales || "0")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          No nozzle data available
                        </p>
                      )}
                    </div>

                    <div className="flex items-center text-green-500 text-sm">
                      <Check className="h-4 w-4 mr-1" />
                      Receipt processed successfully
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <FileText className="h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-1">
                      No data yet
                    </h3>
                    <p className="text-sm text-gray-400">
                      Upload and process a receipt to see the extracted data
                      here
                    </p>
                  </div>
                )}
              </CardContent>
              {receiptData && (
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      // Download receipt data as JSON
                      const dataStr = JSON.stringify(receiptData, null, 2);
                      const dataUri =
                        "data:application/json;charset=utf-8," +
                        encodeURIComponent(dataStr);

                      const exportFileDefaultName = `receipt-${receiptData.pumpSerialNumber}-${receiptData.printDate}.json`;

                      const linkElement = document.createElement("a");
                      linkElement.setAttribute("href", dataUri);
                      linkElement.setAttribute(
                        "download",
                        exportFileDefaultName
                      );
                      linkElement.click();
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Data
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Receipts</CardTitle>
              <CardDescription className="text-gray-400">
                View and manage your recent receipt scans
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : recentReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <FileText className="h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">
                    No receipts found
                  </h3>
                  <p className="text-sm text-gray-400">
                    Upload and process receipts to see them here
                  </p>
                </div>
              ) : (
                <div className="min-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">
                          Receipt ID
                        </TableHead>
                        <TableHead className="text-gray-300">Date</TableHead>
                        <TableHead className="text-gray-300">
                          Pump Serial
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Total Sales
                        </TableHead>
                        <TableHead className="text-gray-300">
                          Volume (L)
                        </TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentReceipts.map((receipt) => (
                        <TableRow key={receipt.id} className="border-gray-700">
                          <TableCell className="font-medium text-white">
                            {receipt.id.substring(0, 8)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {receipt.date}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {receipt.pumpSerial}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatCurrency(receipt.totalSales)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {receipt.volume.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-500 hover:text-amber-400 hover:bg-gray-700"
                                onClick={() => {
                                  if (receipt.rawData) {
                                    setReceiptData(receipt.rawData);

                                    // Switch to upload tab to show the data
                                    const uploadTab = document.querySelector(
                                      '[data-state="inactive"][value="upload"]'
                                    );
                                    if (uploadTab) {
                                      (uploadTab as HTMLElement).click();
                                    }
                                  } else {
                                    toast({
                                      title: "Error",
                                      description: "Receipt data not available",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-400 hover:bg-gray-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-800 border-gray-700">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">
                                      Delete Receipt
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Are you sure you want to delete this receipt? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 text-white hover:bg-red-700"
                                      onClick={() => handleDeleteReceipt(receipt.id)}
                                      disabled={isDeleting === receipt.id}
                                    >
                                      {isDeleting === receipt.id ? (
                                        <>
                                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                          Deleting...
                                        </>
                                      ) : (
                                        "Delete"
                                      )}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
