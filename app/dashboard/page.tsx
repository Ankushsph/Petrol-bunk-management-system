"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Fuel, TrendingUp, Droplets, DollarSign, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DashboardData = {
  totalSales: number;
  volumeSold: number;
  averageDensity: number;
  transactions: number;
  salesChartData: { name: string; total: number }[];
  volumeChartData: { name: string; volume: number }[];
  fuelTypeData: { name: string; value: number }[];
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch dashboard data: ${response.statusText}`
          );
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );

        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-white text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-500 mb-2">
            Error Loading Data
          </h2>
          <p className="text-white mb-4">{error}</p>
          <p className="text-gray-400">
            Please check your connection and try again.
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-amber-500 mb-2">
            No Data Available
          </h2>
          <p className="text-white mb-4">
            Upload some receipts to see your dashboard data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Sales</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  ₹{dashboardData.totalSales.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-400">
                From {dashboardData.transactions} transactions
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Volume Sold</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {dashboardData.volumeSold.toLocaleString()} L
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Fuel className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-400">Across all fuel types</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Avg. Density
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {dashboardData.averageDensity.toFixed(3)} g/cm³
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Droplets className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-400">At standard temperature</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Transactions
                </p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {dashboardData.transactions.toLocaleString()}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-400">Total receipts processed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger
            value="sales"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Sales Analysis
          </TabsTrigger>
          <TabsTrigger
            value="volume"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Volume Analysis
          </TabsTrigger>
          <TabsTrigger
            value="distribution"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Fuel Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Monthly Sales</CardTitle>
              <CardDescription className="text-gray-400">
                Sales performance by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dashboardData.salesChartData.length > 0 ? (
                  <BarChart
                    data={dashboardData.salesChartData}
                    index="name"
                    categories={["total"]}
                    colors={["amber"]}
                    valueFormatter={(value: number) => `₹${value.toLocaleString()}`}
                    yAxisWidth={60}
                    className="text-gray-400"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No sales data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Monthly Volume</CardTitle>
              <CardDescription className="text-gray-400">
                Fuel volume sold by month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dashboardData.volumeChartData.length > 0 ? (
                  <LineChart
                    data={dashboardData.volumeChartData}
                    index="name"
                    categories={["volume"]}
                    colors={["blue"]}
                    valueFormatter={(value: number) => `${value.toLocaleString()} L`}
                    yAxisWidth={60}
                    className="text-gray-400"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No volume data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="mt-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Fuel Type Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">
                Distribution of fuel types sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {dashboardData.fuelTypeData.length > 0 ? (
                  <PieChart
                    data={dashboardData.fuelTypeData}
                    index="name"
                    valueFormatter={(value: number) => `${value.toFixed(1)}%`}
                    category="value"
                    colors={["amber", "blue", "purple"]}
                    className="text-gray-400"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">
                      No distribution data available
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
