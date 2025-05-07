"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type LoaderContextType = {
  isLoading: boolean;
  startLoading: () => void;
  endLoading: () => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [themeLoaded, setThemeLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Detect when the theme has been properly applied
  useEffect(() => {
    // Check if document is available (client-side only)
    if (typeof window !== 'undefined') {
      // Function to check if the theme is applied
      const checkThemeApplied = () => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = localStorage.getItem('theme');
        
        // Theme is considered "applied" when:
        // 1. Dark mode class matches preference or stored setting
        // 2. Or when we've waited a reasonable time for everything to settle
        const isApplied = (
          (isDarkMode && (prefersDark || storedTheme === 'dark')) || 
          (!isDarkMode && (!prefersDark || storedTheme === 'light'))
        );
        
        if (isApplied) {
          setThemeLoaded(true);
        }
      };

      // Initial check
      checkThemeApplied();
      
      // Also set a timeout as a fallback
      const timeoutId = setTimeout(() => {
        setThemeLoaded(true);
      }, 500); // Give the theme 500ms to load
      
      // Set up an observer to detect DOM changes that might indicate theme application
      const observer = new MutationObserver(checkThemeApplied);
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      
      return () => {
        observer.disconnect();
        clearTimeout(timeoutId);
      };
    }
  }, []);

  // Track route changes to show loading state
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => {
      // Only complete loading when theme is also loaded
      if (themeLoaded) {
        const timeout = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timeout);
      }
    };

    handleStart();
    const timeout = setTimeout(() => {
      handleComplete();
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams, themeLoaded]);

  // Update loading state when theme is loaded
  useEffect(() => {
    if (themeLoaded) {
      // Allow a small delay for rendering after theme loads
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [themeLoaded]);

  const startLoading = () => setIsLoading(true);
  const endLoading = () => setIsLoading(false);

  return (
    <LoaderContext.Provider value={{ isLoading, startLoading, endLoading }}>
      <div className={isLoading ? 'invisible' : 'visible'}>
        {children}
      </div>
      {isLoading && <GlobalLoader />}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
}

function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background backdrop-blur-sm">
      <div className="flex flex-col items-center gap-2">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm font-medium text-foreground">Loading...</p>
      </div>
    </div>
  );
}