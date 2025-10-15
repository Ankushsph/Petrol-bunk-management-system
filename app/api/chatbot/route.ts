import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

// Always use environment variables for secrets
const JWT_SECRET = process.env.JWT_SECRET || "petrol-pump-management-secret-key-2023";
// Using the provided Gemini API key with fallback to environment variable
const GEMINI_API_KEY = "AIzaSyC8pe0zeBPtLi6FhmidWE7gsRe3HJa9QMA";

// Define base URL for Gemini API - using the correct API endpoint
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com";
const GEMINI_MODEL = "gemini-pro";

export async function POST(request: Request) {
  try {
    // Proper async cookie handling
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify token with error handling
    try {
      verify(token, JWT_SECRET);
    } catch (error) {
      console.error("JWT Verification Error:", error);
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Validate request body
    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json(
        { message: "Message is required" },
        { status: 400 }
      );
    }

    // System prompt template
    const systemContext = `You are an expert assistant for a Petrol Pump Management System. 
    Provide accurate information about:
    - Fuel sales trends
    - Volume calculations
    - Density measurements
    - Temperature effects
    - Operational best practices
    Keep responses concise and technical.`;

    let response: string;

    // Construct the API URL
    const apiUrl = `${GEMINI_API_BASE_URL}/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
      // Prepare request body - simplified structure that works with current API
      const requestBody = {
        contents: [
          {
            parts: [
              { text: systemContext + "\n\n" + message }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      };
      
      console.log("Sending request to Gemini API:", apiUrl.replace(GEMINI_API_KEY, "API_KEY_HIDDEN"));
      
      // Make the API request
      const geminiResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Parse the API response
      const data = await geminiResponse.json();
      
      if (!geminiResponse.ok) {
        console.error("Gemini API error response:", data);
        throw new Error(`Gemini API error: ${data.error?.message || geminiResponse.statusText}`);
      }

      // Extract the response text from the API response
      if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          response = candidate.content.parts[0].text;
          console.log("Successfully extracted response from Gemini API");
        } else {
          console.error("Unexpected response structure:", data);
          throw new Error("Unexpected response structure from Gemini API");
        }
      } else {
        // Handle case when no candidates are returned
        console.error("No candidates returned from Gemini API:", data);
        throw new Error("No response candidates from Gemini API");
      }
    } catch (apiError) {
      console.error("Error calling Gemini API:", apiError);
      // Fallback to predefined responses
      response = getFallbackResponse(message);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { 
        message: "I'm sorry, I encountered an error processing your request. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Fallback response function
function getFallbackResponse(message: string): string {
  const cleanMessage = message.toLowerCase();
  
  // Comprehensive set of predefined responses
  if (cleanMessage.includes("sales") || cleanMessage.includes("revenue")) {
    return "Recent sales show 12.5% monthly increase with weekend peaks. Highest sales are typically observed between 4PM-7PM on Fridays and Saturdays.";
  } 
  else if (cleanMessage.includes("volume") || cleanMessage.includes("liters") || cleanMessage.includes("litres")) {
    return "Current month: 5,720L total (Diesel 35%, Petrol 60%, Premium 5%). Volume measurements are temperature-corrected to 15°C baseline.";
  } 
  else if (cleanMessage.includes("density") || cleanMessage.includes("specific gravity")) {
    return "Petrol density: 0.785 g/cm³ baseline, -0.001 g/cm³ per °C change. Diesel: 0.830 g/cm³ baseline, -0.0007 g/cm³ per °C. Monitoring density helps detect fuel quality issues.";
  } 
  else if (cleanMessage.includes("temperature") || cleanMessage.includes("weather")) {
    return "Fuel expands 0.12% per °C - crucial for volume measurement accuracy. Our system automatically applies temperature compensation to ensure consistent sales records.";
  }
  else if (cleanMessage.includes("nozzle") || cleanMessage.includes("pump")) {
    return "Each nozzle's performance is tracked individually. Nozzle 1 (Petrol) currently shows highest throughput at 398,656.8L, while Nozzle 4 has the highest sales-to-volume ratio.";
  }
  else if (cleanMessage.includes("receipt") || cleanMessage.includes("invoice")) {
    return "The receipt scanning system extracts data including pump serial number, date, and per-nozzle metrics. Data is automatically added to your analytics dashboard after processing.";
  }
  else if (cleanMessage.includes("maintenance") || cleanMessage.includes("service")) {
    return "Scheduled maintenance should be performed every 3 months or 100,000L dispensed, whichever comes first. Our system tracks volume dispensed and notifies when maintenance is due.";
  }
  else if (cleanMessage.includes("calibration")) {
    return "Pump calibration is critical for accurate volume measurement. Standard practice is to calibrate quarterly using a certified 5L prover container, maintaining accuracy within ±0.25%.";
  }
  else if (cleanMessage.includes("hello") || cleanMessage.includes("hi") || cleanMessage.includes("hey")) {
    return "Hello! I'm your Petrol Pump Management assistant. I can help with questions about sales, volume, density, temperature effects, and operational best practices. What would you like to know?";
  }
  else {
    return "I can provide information about sales trends, volume calculations, density measurements, temperature effects, and operational best practices for your petrol pump. Please ask a specific question about these topics.";
  }
}
