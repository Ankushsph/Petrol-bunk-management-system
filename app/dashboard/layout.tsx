"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  MessageSquare,
  Calculator,
  Users,
  LogOut,
  Menu,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Check if mobile on mount and add resize listener
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Logged out successfully",
          description: "You have been logged out of your account",
        });
        router.push("/login");
      } else {
        throw new Error("Failed to logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Receipts",
      href: "/dashboard/receipts",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Daily Comparison",
      href: "/dashboard/daily-comparison",
      icon: <ArrowLeftRight className="h-5 w-5" />,
    },
    {
      name: "Chatbot",
      href: "/dashboard/chatbot",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: "Density Calculator",
      href: "/dashboard/calculator",
      icon: <Calculator className="h-5 w-5" />,
    },
    {
      name: "User Management",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4">
            <h1 className="text-2xl font-bold text-white">Petrol Pump</h1>
            <p className="text-gray-400 text-sm">Management System</p>
          </div>

          <Separator className="bg-gray-700" />

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  <div
                    className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                      isActive
                        ? "bg-amber-500 text-white"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4">
            <Button
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-gray-900 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}

