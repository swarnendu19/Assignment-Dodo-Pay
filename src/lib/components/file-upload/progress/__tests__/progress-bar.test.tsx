import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from '../progress-bar'

describe('ProgressBar', () => {
    it('renders with default props', () => {
        render(<ProgressBar progress={50} />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toBeInTheDocument()
        expect(progressBar).toHaveAttribute('aria-valuenow', '50')
        expect(progressBar).toHaveAttribute('aria-valuemin', '0')
        expect(progressBar).toHaveAttribute('aria-valuemax', '100')
    })

    it('displays correct progress value', () => {
        render(<ProgressBar progress={75} />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-valuenow', '75')
    })

    it('clamps progress values to 0-100 range', () => {
        const { rerender } = render(<ProgressBar progress={-10} />)
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')

        rerender(<ProgressBar progress={150} />)
        expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
    })

    it('shows percentage when showPercentage is true', () => {
        render(<ProgressBar progress={42} showPercentage />)

        expect(screen.getByText('42%')).toBeInTheDocument()
    })

    it('applies correct size classes', () => {
        const { rerender } = render(<ProgressBar progress={50} size="sm" />)
        expect(screen.getByRole('progressbar')).toHaveClass('h-1')

        rerender(<ProgressBar progress={50} size="md" />)
        expect(screen.getByRole('progressbar')).toHaveClass('h-2')

        rerender(<ProgressBar progress={50} size="lg" />)
        expect(screen.getByRole('progressbar')).toHaveClass('h-3')
    })

    it('applies correct variant classes', () => {
        const { rerender } = render(<ProgressBar progress={50} variant="default" />)
        expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-blue-500')

        rerender(<ProgressBar progress={50} variant="success" />)
        expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-green-500')

        rerender(<ProgressBar progress={50} variant="error" />)
        expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-red-500')

        rerender(<ProgressBar progress={50} variant="warning" />)
        expect(screen.getByRole('progressbar').firstChild).toHaveClass('bg-yellow-500')
    })

    it('supports custom aria-label', () => {
        render(<ProgressBar progress={50} aria-label="Custom progress label" />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-label', 'Custom progress label')
    })

    it('supports aria-describedby', () => {
        render(<ProgressBar progress={50} aria-describedby="progress-description" />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-describedby', 'progress-description')
    })

    it('applies custom className', () => {
        render(<ProgressBar progress={50} className="custom-class" />)

        expect(screen.getByRole('progressbar').parentElement).toHaveClass('custom-class')
    })

    it('has correct default aria-label', () => {
        render(<ProgressBar progress={33} />)

        const progressBar = screen.getByRole('progressbar')
        expect(progressBar).toHaveAttribute('aria-label', 'Upload progress: 33%')
    })
})