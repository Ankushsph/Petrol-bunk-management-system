"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Petrol Pump Management Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from chatbot")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message to chatbot:", error)

      toast({
        title: "Error",
        description: "Failed to get response from the chatbot. Please try again.",
        variant: "destructive",
      })

      // Add error message from assistant
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Petrol Pump Assistant</h1>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Gemini AI Chatbot</CardTitle>
          <CardDescription className="text-gray-400">
            Ask questions about your petrol pump management, data analysis, or general inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar className={`h-8 w-8 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                    {message.role === "user" ? (
                      <>
                        <AvatarFallback className="bg-amber-500 text-black">U</AvatarFallback>
                        <AvatarImage src="/user-avatar.png" />
                      </>
                    ) : (
                      <>
                        <AvatarFallback className="bg-blue-500">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                        <AvatarImage src="/bot-avatar.png" />
                      </>
                    )}
                  </Avatar>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" ? "bg-amber-500 text-black" : "bg-gray-700 text-white"
                    }`}
                  >
                    <div className="text-sm">{message.content}</div>
                    <div className={`text-xs mt-1 ${message.role === "user" ? "text-amber-800" : "text-gray-400"}`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex flex-row">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback className="bg-blue-500">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg p-3 bg-gray-700 text-white">
                    <div className="flex items-center space-x-2">
                      <div
                        className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"
                        style={{ animationDelay: "600ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="w-full flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-amber-500"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-white"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Suggested Questions</CardTitle>
          <CardDescription className="text-gray-400">Try asking these questions to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="justify-start border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setInput("What is the total sales for this month?")
              }}
            >
              What is the total sales for this month?
            </Button>
            <Button
              variant="outline"
              className="justify-start border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setInput("How does temperature affect fuel density?")
              }}
            >
              How does temperature affect fuel density?
            </Button>
            <Button
              variant="outline"
              className="justify-start border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setInput("Show me the sales trend for the last quarter")
              }}
            >
              Show me the sales trend for the last quarter
            </Button>
            <Button
              variant="outline"
              className="justify-start border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                setInput("What is the average volume sold per transaction?")
              }}
            >
              What is the average volume sold per transaction?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
