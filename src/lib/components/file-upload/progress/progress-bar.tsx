import React from 'react'
import { cn } from '../../../utils/cn'

interface ProgressBarProps {
    progress: number
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'success' | 'error' | 'warning'
    showPercentage?: boolean
    animated?: boolean
    className?: string
    'aria-label'?: string
    'aria-describedby'?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    size = 'md',
    variant = 'default',
    showPercentage = false,
    animated = true,
    className,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy
}) => {
    const clampedProgress = Math.max(0, Math.min(100, progress))

    const sizeClasses = {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
    }

    const variantClasses = {
        default: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    }

    return (
        <div className={cn('w-full', className)}>
            <div
                className={cn(
                    'w-full bg-gray-200 rounded-full overflow-hidden',
                    sizeClasses[size]
                )}
                role="progressbar"
                aria-valuenow={clampedProgress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={ariaLabel || `Upload progress: ${clampedProgress}%`}
                aria-describedby={ariaDescribedBy}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all duration-300 ease-out',
                        variantClasses[variant],
                        animated && 'transition-transform'
                    )}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
            {showPercentage && (
                <div className="mt-1 text-xs text-gray-600 text-right">
                    {Math.round(clampedProgress)}%
                </div>
            )}
        </div>
    )
}