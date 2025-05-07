"use client";

import { useEffect } from "react";

// Inline script to prevent flash of wrong theme
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Add prevent-flash class to hide content until theme is applied
              document.documentElement.classList.add('prevent-flash');
              
              const savedTheme = localStorage.getItem('theme');
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              
              // Remove the prevent-flash class after a small delay to ensure theme is applied
              setTimeout(function() {
                document.documentElement.classList.remove('prevent-flash');
              }, 0);
            } catch (e) {
              // If there's an error, ensure content becomes visible
              document.documentElement.classList.remove('prevent-flash');
              console.error('Error applying theme:', e);
            }
          })();
        `,
      }}
    />
  );
}

// Theme initialization script to prevent flash of unstyled content
export function ThemeInitializer() {
  useEffect(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply the theme immediately
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return null;
}

// Utility functions for theme toggling
export function setTheme(theme: 'dark' | 'light' | 'system') {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'system') {
    localStorage.removeItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function getTheme(): 'dark' | 'light' | 'system' {
  if (typeof window === 'undefined') return 'system';
  
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') return 'dark';
  if (savedTheme === 'light') return 'light';
  return 'system';
}

export function isDarkMode(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
}