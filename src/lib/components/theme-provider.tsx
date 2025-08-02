import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { FileUploadConfig, FileUploadTheme } from './file-upload/file-upload.types'
import { applyTheme, resolveTheme, createThemeWatcher, getSystemTheme } from '../utils/theme'

interface ThemeContextValue {
    theme: FileUploadTheme
    resolvedTheme: 'light' | 'dark'
    setTheme: (theme: FileUploadTheme) => void
    config?: FileUploadConfig
    setConfig: (config: FileUploadConfig) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

interface ThemeProviderProps {
    children: ReactNode
    defaultTheme?: FileUploadTheme
    config?: FileUploadConfig
    storageKey?: string
}

export function ThemeProvider({
    children,
    defaultTheme = 'auto',
    config,
    storageKey = 'file-upload-theme'
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<FileUploadTheme>(defaultTheme)
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
    const [themeConfig, setThemeConfig] = useState<FileUploadConfig | undefined>(config)

    // Initialize theme from localStorage or default
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey) as FileUploadTheme
            if (stored && ['light', 'dark', 'auto'].includes(stored)) {
                setThemeState(stored)
            }
        }
    }, [storageKey])

    // Update resolved theme when theme changes
    useEffect(() => {
        const resolved = resolveTheme(theme)
        setResolvedTheme(resolved)
        applyTheme(theme, themeConfig)
    }, [theme, themeConfig])

    // Watch for system theme changes when theme is 'auto'
    useEffect(() => {
        if (theme === 'auto') {
            const cleanup = createThemeWatcher((systemTheme) => {
                setResolvedTheme(systemTheme)
                applyTheme('auto', themeConfig)
            })
            return cleanup
        }
    }, [theme, themeConfig])

    const setTheme = (newTheme: FileUploadTheme) => {
        setThemeState(newTheme)
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, newTheme)
        }
    }

    const setConfig = (newConfig: FileUploadConfig) => {
        setThemeConfig(newConfig)
    }

    const value: ThemeContextValue = {
        theme,
        resolvedTheme,
        setTheme,
        config: themeConfig,
        setConfig
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

/**
 * Hook to get theme-aware CSS variables
 */
export function useThemeVariables() {
    const { config, resolvedTheme } = useTheme()

    return React.useMemo(() => {
        if (!config?.styling) return {}

        const variables: Record<string, string> = {}
        const { colors, spacing, typography, borders, shadows } = config.styling

        // Apply color variables
        if (colors) {
            Object.entries(colors).forEach(([key, value]) => {
                variables[`--file-upload-${key}`] = value
            })
        }

        // Apply spacing variables
        if (spacing) {
            Object.entries(spacing).forEach(([key, value]) => {
                variables[`--file-upload-spacing-${key}`] = value
            })
        }

        // Apply typography variables
        if (typography) {
            Object.entries(typography).forEach(([key, value]) => {
                variables[`--file-upload-${key}`] = value
            })
        }

        // Apply border variables
        if (borders) {
            Object.entries(borders).forEach(([key, value]) => {
                variables[`--file-upload-border-${key}`] = value
            })
        }

        // Apply shadow variables
        if (shadows) {
            Object.entries(shadows).forEach(([key, value]) => {
                variables[`--file-upload-shadow-${key}`] = value
            })
        }

        return variables
    }, [config, resolvedTheme])
}

/**
 * Component to toggle between themes
 */
interface ThemeToggleProps {
    className?: string
    children?: ReactNode
}

export function ThemeToggle({ className, children }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        const themes: FileUploadTheme[] = ['light', 'dark', 'auto']
        const currentIndex = themes.indexOf(theme)
        const nextIndex = (currentIndex + 1) % themes.length
        setTheme(themes[nextIndex])
    }

    return (
        <button
            onClick={toggleTheme}
            className={className}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light'} theme`}
        >
            {children || (
                <span>
                    {theme === 'light' ? '🌙' : theme === 'dark' ? '🌓' : '☀️'}
                </span>
            )}
        </button>
    )
}