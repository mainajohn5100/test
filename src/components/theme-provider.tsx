"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"

const colorThemes = ['default', 'violet', 'orange', 'teal', 'blue'];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'default';
    const htmlEl = document.documentElement;
    
    // Clean up old theme classes
    colorThemes.forEach(theme => {
      if (theme !== savedTheme) {
        htmlEl.classList.remove(`theme-${theme}`);
      }
    });
    
    // Add the current theme class
    if (!htmlEl.classList.contains(`theme-${savedTheme}`)) {
      htmlEl.classList.add(`theme-${savedTheme}`);
    }
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
