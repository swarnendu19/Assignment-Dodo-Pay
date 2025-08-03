import React from 'react'
import { cn } from '../../../utils/cn'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'primary' | 'secondary'
    className?: string
    'aria-label'?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    variant = 'default',
    className,
    'aria-label': ariaLabel
}) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    }

    const variantClasses = {
        default: 'text-gray-500',
        primary: 'text-blue-500',
        secondary: 'text-gray-400'
    }

    return (
        <div
            className={cn(
                'inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            role="status"
            aria-label={ariaLabel || 'Loading'}
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}