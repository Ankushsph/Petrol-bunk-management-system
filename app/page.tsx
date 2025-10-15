import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Petrol Pump Management System
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Advanced analytics, receipt scanning, and intelligent management for your petrol pump business
            </p>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              asChild
              className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white px-8 py-6 text-lg rounded-md"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/10 px-8 py-6 text-lg rounded-md"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
