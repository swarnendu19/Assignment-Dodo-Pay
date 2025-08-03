import React from 'react'
import { cn } from '../../../utils/cn'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import type { FileUploadStatus } from '../file-upload.types'

interface StatusIndicatorProps {
    status: FileUploadStatus
    size?: 'sm' | 'md' | 'lg'
    showText?: boolean
    className?: string
    'aria-label'?: string
}

const statusConfig = {
    pending: {
        icon: Clock,
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        text: 'Pending'
    },
    uploading: {
        icon: Clock,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        text: 'Uploading'
    },
    success: {
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-100',
        text: 'Success'
    },
    error: {
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-100',
        text: 'Error'
    }
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    status,
    size = 'md',
    showText = false,
    className,
    'aria-label': ariaLabel
}) => {
    const config = statusConfig[status]
    const Icon = config.icon

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    }

    const textSizeClasses = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    }

    return (
        <div
            className={cn('flex items-center gap-2', className)}
            role="status"
            aria-label={ariaLabel || `File status: ${config.text}`}
        >
            <div
                className={cn(
                    'rounded-full p-1 flex items-center justify-center',
                    config.bgColor
                )}
            >
                <Icon
                    className={cn(
                        sizeClasses[size],
                        config.color
                    )}
                    aria-hidden="true"
                />
            </div>
            {showText && (
                <span className={cn(textSizeClasses[size], config.color)}>
                    {config.text}
                </span>
            )}
        </div>
    )
}