import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StatusIndicator } from '../status-indicator'

describe('StatusIndicator', () => {
    it('renders with pending status', () => {
        render(<StatusIndicator status="pending" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toBeInTheDocument()
        expect(indicator).toHaveAttribute('aria-label', 'File status: Pending')
    })

    it('renders with uploading status', () => {
        render(<StatusIndicator status="uploading" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toHaveAttribute('aria-label', 'File status: Uploading')
    })

    it('renders with success status', () => {
        render(<StatusIndicator status="success" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toHaveAttribute('aria-label', 'File status: Success')
    })

    it('renders with error status', () => {
        render(<StatusIndicator status="error" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toHaveAttribute('aria-label', 'File status: Error')
    })

    it('shows text when showText is true', () => {
        const { rerender } = render(<StatusIndicator status="success" showText />)
        expect(screen.getByText('Success')).toBeInTheDocument()

        rerender(<StatusIndicator status="error" showText />)
        expect(screen.getByText('Error')).toBeInTheDocument()

        rerender(<StatusIndicator status="pending" showText />)
        expect(screen.getByText('Pending')).toBeInTheDocument()

        rerender(<StatusIndicator status="uploading" showText />)
        expect(screen.getByText('Uploading')).toBeInTheDocument()
    })

    it('applies correct size classes', () => {
        const { rerender } = render(<StatusIndicator status="success" size="sm" />)
        // Check for icon size class in the SVG element
        const icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveClass('w-4', 'h-4')

        rerender(<StatusIndicator status="success" size="md" />)
        const iconMd = screen.getByRole('status').querySelector('svg')
        expect(iconMd).toHaveClass('w-5', 'h-5')

        rerender(<StatusIndicator status="success" size="lg" />)
        const iconLg = screen.getByRole('status').querySelector('svg')
        expect(iconLg).toHaveClass('w-6', 'h-6')
    })

    it('applies correct color classes for different statuses', () => {
        const { rerender } = render(<StatusIndicator status="pending" />)
        let icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveClass('text-gray-500')

        rerender(<StatusIndicator status="uploading" />)
        icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveClass('text-blue-500')

        rerender(<StatusIndicator status="success" />)
        icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveClass('text-green-500')

        rerender(<StatusIndicator status="error" />)
        icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveClass('text-red-500')
    })

    it('supports custom aria-label', () => {
        render(<StatusIndicator status="success" aria-label="Custom status message" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toHaveAttribute('aria-label', 'Custom status message')
    })

    it('applies custom className', () => {
        render(<StatusIndicator status="success" className="custom-indicator" />)

        const indicator = screen.getByRole('status')
        expect(indicator).toHaveClass('custom-indicator')
    })

    it('has proper icon accessibility', () => {
        render(<StatusIndicator status="success" />)

        const icon = screen.getByRole('status').querySelector('svg')
        expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('applies correct background colors for status containers', () => {
        const { rerender } = render(<StatusIndicator status="pending" />)
        let container = screen.getByRole('status').querySelector('div')
        expect(container).toHaveClass('bg-gray-100')

        rerender(<StatusIndicator status="uploading" />)
        container = screen.getByRole('status').querySelector('div')
        expect(container).toHaveClass('bg-blue-100')

        rerender(<StatusIndicator status="success" />)
        container = screen.getByRole('status').querySelector('div')
        expect(container).toHaveClass('bg-green-100')

        rerender(<StatusIndicator status="error" />)
        container = screen.getByRole('status').querySelector('div')
        expect(container).toHaveClass('bg-red-100')
    })
})