"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
// --- PERBAIKAN DI SINI ---
// Hapus '/dist/types' dari path import
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

