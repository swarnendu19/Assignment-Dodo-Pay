import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoadingSpinner } from '../loading-spinner'

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        render(<LoadingSpinner />)

        const spinner = screen.getByRole('status')
        expect(spinner).toBeInTheDocument()
        expect(spinner).toHaveAttribute('aria-label', 'Loading')
    })

    it('applies correct size classes', () => {
        const { rerender } = render(<LoadingSpinner size="sm" />)
        expect(screen.getByRole('status')).toHaveClass('w-4', 'h-4')

        rerender(<LoadingSpinner size="md" />)
        expect(screen.getByRole('status')).toHaveClass('w-6', 'h-6')

        rerender(<LoadingSpinner size="lg" />)
        expect(screen.getByRole('status')).toHaveClass('w-8', 'h-8')
    })

    it('applies correct variant classes', () => {
        const { rerender } = render(<LoadingSpinner variant="default" />)
        expect(screen.getByRole('status')).toHaveClass('text-gray-500')

        rerender(<LoadingSpinner variant="primary" />)
        expect(screen.getByRole('status')).toHaveClass('text-blue-500')

        rerender(<LoadingSpinner variant="secondary" />)
        expect(screen.getByRole('status')).toHaveClass('text-gray-400')
    })

    it('has spinning animation', () => {
        render(<LoadingSpinner />)

        const spinner = screen.getByRole('status')
        expect(spinner).toHaveClass('animate-spin')
    })

    it('supports custom aria-label', () => {
        render(<LoadingSpinner aria-label="Custom loading message" />)

        const spinner = screen.getByRole('status')
        expect(spinner).toHaveAttribute('aria-label', 'Custom loading message')
    })

    it('applies custom className', () => {
        render(<LoadingSpinner className="custom-spinner" />)

        const spinner = screen.getByRole('status')
        expect(spinner).toHaveClass('custom-spinner')
    })

    it('contains screen reader text', () => {
        render(<LoadingSpinner />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toHaveClass('sr-only')
    })

    it('has proper border styling for spinner effect', () => {
        render(<LoadingSpinner />)

        const spinner = screen.getByRole('status')
        expect(spinner).toHaveClass(
            'rounded-full',
            'border-2',
            'border-solid',
            'border-current',
            'border-r-transparent'
        )
    })
})