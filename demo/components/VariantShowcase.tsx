import React from 'react'
import { FileUpload } from '../../src/lib'

const variants = [
    {
        name: 'Button Upload',
        variant: 'button' as const,
        description: 'Traditional file input styled as a button',
        props: { variant: 'button' as const }
    },
    {
        name: 'Dropzone Upload',
        variant: 'dropzone' as const,
        description: 'Drag-and-drop area with visual feedback',
        props: { variant: 'dropzone' as const }
    },
    {
        name: 'Preview Upload',
        variant: 'preview' as const,
        description: 'Shows file previews after selection',
        props: { variant: 'preview' as const }
    },
    {
        name: 'Image Upload',
        variant: 'image-only' as const,
        description: 'Specialized for image files with thumbnails',
        props: { variant: 'image-only' as const, accept: 'image/*' }
    },
    {
        name: 'Multi-File Upload',
        variant: 'multi-file' as const,
        description: 'Supports multiple file selection and management',
        props: { variant: 'multi-file' as const, multiple: true }
    }
]

export function VariantShowcase() {
    return (
        <section className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
                All Variants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {variants.map((variant) => (
                    <div key={variant.variant} className="space-y-3">
                        <div>
                            <h3 className="text-lg font-medium text-foreground">
                                {variant.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {variant.description}
                            </p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                            <FileUpload {...variant.props} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}