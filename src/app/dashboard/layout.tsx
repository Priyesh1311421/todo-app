"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  HelpCircle,
  Tag
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  
  // Check viewport size and set mobile state
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      
      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Mobile backdrop - only visible when sidebar is open on mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? "translate-x-0 w-64" : "md:translate-x-0 md:w-20 -translate-x-full"
        } bg-white dark:bg-gray-800 shadow-md transition-all duration-300 ease-in-out fixed md:relative h-full z-30 overflow-y-auto`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">TaskFlow</h1>
          ) : (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">T</h1>
          )}
          <button 
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hidden md:block cursor-pointer"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>
        <nav className="mt-2">
          <div className="px-4 space-y-1">
            <Link 
              href="/dashboard" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:text-primary cursor-pointer group ${
                pathname === "/dashboard" ? "bg-gray-100 dark:bg-gray-700 text-primary font-medium" : ""
              }`}
            >
              <Home className={`h-5 w-5 ${pathname === "/dashboard" ? "text-primary" : ""}`} />
              {isSidebarOpen && (
                <>
                  <span className="ml-3">All Tasks</span>
                  <kbd className="hidden group-hover:inline-flex ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">⌘A</kbd>
                </>
              )}
            </Link>
            <Link 
              href="/dashboard/today" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:text-primary cursor-pointer group ${
                pathname === "/dashboard/today" ? "bg-gray-100 dark:bg-gray-700 text-primary font-medium" : ""
              }`}
            >
              <Calendar className={`h-5 w-5 ${pathname === "/dashboard/today" ? "text-primary" : ""}`} />
              {isSidebarOpen && (
                <>
                  <span className="ml-3">Today</span>
                  <kbd className="hidden group-hover:inline-flex ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">⌘T</kbd>
                </>
              )}
            </Link>
            <Link 
              href="/dashboard/upcoming" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:text-primary cursor-pointer group ${
                pathname === "/dashboard/upcoming" ? "bg-gray-100 dark:bg-gray-700 text-primary font-medium" : ""
              }`}
            >
              <Clock className={`h-5 w-5 ${pathname === "/dashboard/upcoming" ? "text-primary" : ""}`} />
              {isSidebarOpen && (
                <>
                  <span className="ml-3">Upcoming</span>
                  <kbd className="hidden group-hover:inline-flex ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">⌘U</kbd>
                </>
              )}
            </Link>
            <Link 
              href="/dashboard/categories" 
              className={`flex items-center px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:text-primary cursor-pointer group ${
                pathname === "/dashboard/categories" ? "bg-gray-100 dark:bg-gray-700 text-primary font-medium" : ""
              }`}
            >
              <Tag className={`h-5 w-5 ${pathname === "/dashboard/categories" ? "text-primary" : ""}`} />
              {isSidebarOpen && (
                <>
                  <span className="ml-3">Categories</span>
                  <kbd className="hidden group-hover:inline-flex ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">⌘C</kbd>
                </>
              )}
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center min-md:">
            <button 
              onClick={toggleSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white mr-4 cursor-pointer min-md:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1.5 md:p-2 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">
                    {session?.user?.name}
                  </span>
                  <Avatar className="h-7 w-7 md:h-8 md:w-8">
                    <AvatarImage src={session?.user?.image ?? undefined} alt={session?.user?.name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/dashboard/profile" className="flex items-center w-full">
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/dashboard/settings" className="flex items-center w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
          <div className={`transition-all duration-300 ease-in-out ${
            isMobile ? '' : (!isSidebarOpen ? 'md:ml-0' : '')
          }`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}