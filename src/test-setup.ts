import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock URL.createObjectURL and revokeObjectURL for tests
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock Image constructor for dimension validation tests
global.Image = class {
    onload: (() => void) | null = null
    onerror: (() => void) | null = null
    src: string = ''
    width: number = 800
    height: number = 600

    constructor() {
        setTimeout(() => {
            if (this.onload) this.onload()
        }, 0)
    }
} as any