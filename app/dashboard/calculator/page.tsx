"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Calculator, ArrowRight } from "lucide-react";

export default function DensityCalculator() {
  // State for the density converter
  const [density, setDensity] = useState<string>("");
  const [currentTemp, setCurrentTemp] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("petrol"); // Default to petrol
  const [standardDensity, setStandardDensity] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Thermal expansion coefficients (per °C)
  const expansionCoefficients = {
    petrol: 0.001, // 0.1% per °C for petrol
    diesel: 0.0007, // 0.07% per °C for diesel
    premium: 0.00095, // 0.095% per °C for premium fuels
  };

  const calculateStandardDensity = () => {
    setError(null);
    
    // Validate inputs
    if (!density || !currentTemp) {
      setError("Please enter both density and temperature values");
      return;
    }
    
    const densityValue = parseFloat(density);
    const tempValue = parseFloat(currentTemp);
    
    if (isNaN(densityValue) || isNaN(tempValue)) {
      setError("Please enter valid numbers");
      return;
    }
    
    if (densityValue <= 0) {
      setError("Density must be greater than zero");
      return;
    }
    
    if (tempValue < -50 || tempValue > 100) {
      setError("Temperature must be between -50°C and 100°C");
      return;
    }
    
    // Get the correct expansion coefficient based on fuel type
    const coefficient = expansionCoefficients[fuelType as keyof typeof expansionCoefficients];
    
    // Calculate the standard density at 15°C
    // Formula: density_at_15C = density_at_T / (1 + coefficient * (T - 15))
    const tempDifference = tempValue - 15;
    const standardDensityValue = densityValue / (1 + coefficient * tempDifference);
    
    setStandardDensity(parseFloat(standardDensityValue.toFixed(5)));
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Density Calculator</h1>
      </div>

      <Tabs defaultValue="density" className="w-full">
        <TabsList className="grid grid-cols-1 mb-6 bg-gray-800 text-gray-400">
          <TabsTrigger value="density" className="data-[state=active]:text-white data-[state=active]:bg-gray-700">
            <div className="flex items-center">
              <Droplets className="mr-2 h-4 w-4" />
              <span>Density Conversion</span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="density">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Fuel Density Standardization</CardTitle>
              <CardDescription className="text-gray-400">
                Convert fuel density at your current temperature to standard density at 15°C
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fuel-type" className="text-gray-300">Fuel Type</Label>
                    <Select 
                      value={fuelType} 
                      onValueChange={setFuelType}
                    >
                      <SelectTrigger id="fuel-type" className="bg-gray-900 border-gray-700 text-white">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="petrol">Petrol</SelectItem>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="density" className="text-gray-300">Current Density (g/cm³)</Label>
                    <Input
                      id="density"
                      type="number"
                      step="0.00001"
                      min="0"
                      placeholder="e.g. 0.7853"
                      value={density}
                      onChange={(e) => setDensity(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="text-gray-300">Current Temperature (°C)</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 25.5"
                      value={currentTemp}
                      onChange={(e) => setCurrentTemp(e.target.value)}
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  
                  <Button 
                    onClick={calculateStandardDensity}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Calculate Standard Density
                  </Button>
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                </div>
                
                <div className="bg-gray-900 p-6 rounded-lg flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-medium text-gray-400">
                        Conversion Result
                      </h3>
                      
                      <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Current Density at {currentTemp || "?"} °C</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {density ? `${parseFloat(density).toFixed(5)} g/cm³` : "—"}
                          </p>
                        </div>
                        
                        <ArrowRight className="h-6 w-6 text-blue-500" />
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-400">Standard Density at 15 °C</p>
                          <p className="text-2xl font-bold text-white mt-1">
                            {standardDensity ? `${standardDensity} g/cm³` : "—"}
                          </p>
                        </div>
                      </div>
                      
                      {standardDensity && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                          <p className="text-gray-300">
                            The density of {fuelType} at 15°C standard temperature is 
                            <span className="font-bold text-white"> {standardDensity} g/cm³</span>.
                          </p>
                          <p className="text-gray-400 text-sm mt-2">
                            This value is standardized according to fuel industry practices for consistent measurement across different temperatures.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-lg mt-6">
                <h3 className="text-lg font-medium text-white mb-2">How Density Changes with Temperature</h3>
                <p className="text-gray-400 text-sm">
                  Fuel density decreases as temperature increases. For petrol, the density changes approximately 0.1% per °C, 
                  while diesel changes by about 0.07% per °C. The standard reference temperature for fuel density is 15°C.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Formula used: Density at 15°C = Density at T°C / (1 + coefficient × (T - 15))
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 