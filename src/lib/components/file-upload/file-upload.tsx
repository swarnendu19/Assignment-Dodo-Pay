import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn"

const fileUploadVariants = cva(
    [
        "relative cursor-pointer transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[drag-over=true]:border-primary data-[drag-over=true]:bg-primary/5",
        // Button variant
        "data-[variant=button]:inline-flex data-[variant=button]:items-center data-[variant=button]:justify-center data-[variant=button]:gap-2",
        "data-[variant=button]:rounded-md data-[variant=button]:border data-[variant=button]:border-input data-[variant=button]:bg-background",
        "data-[variant=button]:font-medium data-[variant=button]:hover:bg-accent data-[variant=button]:hover:text-accent-foreground",
        // Dropzone variant
        "data-[variant=dropzone]:w-full data-[variant=dropzone]:rounded-lg data-[variant=dropzone]:border-2 data-[variant=dropzone]:border-dashed",
        "data-[variant=dropzone]:border-muted-foreground/25 data-[variant=dropzone]:bg-background/50 data-[variant=dropzone]:hover:bg-accent/50",
        "data-[variant=dropzone]:flex data-[variant=dropzone]:flex-col data-[variant=dropzone]:items-center data-[variant=dropzone]:justify-center",
        "data-[variant=dropzone]:gap-2 data-[variant=dropzone]:text-center",
        // Image variant
        "data-[variant=image-only]:aspect-square data-[variant=image-only]:w-full data-[variant=image-only]:max-w-sm data-[variant=image-only]:rounded-lg",
        "data-[variant=image-only]:border-2 data-[variant=image-only]:border-dashed data-[variant=image-only]:border-muted-foreground/25",
        "data-[variant=image-only]:bg-background/50 data-[variant=image-only]:hover:bg-accent/50 data-[variant=image-only]:flex",
        "data-[variant=image-only]:flex-col data-[variant=image-only]:items-center data-[variant=image-only]:justify-center",
        "data-[variant=image-only]:gap-2 data-[variant=image-only]:text-center",
        "data-[variant=image-only]:data-[has-image=true]:border-solid data-[variant=image-only]:data-[has-image=true]:border-input",
        // Preview/Multi-file variants
        "data-[variant=preview]:w-full data-[variant=preview]:rounded-lg data-[variant=preview]:border data-[variant=preview]:border-input",
        "data-[variant=preview]:bg-background data-[variant=preview]:flex data-[variant=preview]:flex-col data-[variant=preview]:gap-4",
        "data-[variant=multi-file]:w-full data-[variant=multi-file]:rounded-lg data-[variant=multi-file]:border data-[variant=multi-file]:border-input",
        "data-[variant=multi-file]:bg-background data-[variant=multi-file]:flex data-[variant=multi-file]:flex-col data-[variant=multi-file]:gap-4"
    ],
    {
        variants: {
            size: {
                sm: [
                    "text-xs",
                    "data-[variant=button]:h-8 data-[variant=button]:px-3 data-[variant=button]:py-1",
                    "data-[variant=dropzone]:min-h-[150px] data-[variant=dropzone]:p-4",
                    "data-[variant=preview]:p-3 data-[variant=multi-file]:p-3 data-[variant=image-only]:p-4"
                ],
                md: [
                    "text-sm",
                    "data-[variant=button]:h-10 data-[variant=button]:px-4 data-[variant=button]:py-2",
                    "data-[variant=dropzone]:min-h-[200px] data-[variant=dropzone]:p-6",
                    "data-[variant=preview]:p-4 data-[variant=multi-file]:p-4 data-[variant=image-only]:p-6"
                ],
                lg: [
                    "text-base",
                    "data-[variant=button]:h-12 data-[variant=button]:px-6 data-[variant=button]:py-3",
                    "data-[variant=dropzone]:min-h-[250px] data-[variant=dropzone]:p-8",
                    "data-[variant=preview]:p-6 data-[variant=multi-file]:p-6 data-[variant=image-only]:p-8"
                ]
            }
        },
        defaultVariants: {
            size: "md"
        }
    }
)

function FileUpload({
    className,
    variant = "button",
    size = "md",
    disabled = false,
    multiple = false,
    accept = "*",
    children,
    asChild = false,
    onFileSelect,
    ...props
}: React.ComponentProps<"div"> &
    VariantProps<typeof fileUploadVariants> & {
        variant?: "button" | "dropzone" | "preview" | "image-only" | "multi-file"
        multiple?: boolean
        accept?: string
        asChild?: boolean
        onFileSelect?: (files: File[]) => void
    }) {

    const inputRef = React.useRef<HTMLInputElement>(null)
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [files, setFiles] = React.useState<File[]>([])

    const handleClick = React.useCallback(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.click()
        }
    }, [disabled])

    const handleFileSelect = React.useCallback((selectedFiles: File[]) => {
        const newFiles = multiple ? [...files, ...selectedFiles] : selectedFiles
        setFiles(newFiles)
        onFileSelect?.(newFiles)
    }, [multiple, files, onFileSelect])

    const handleInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || [])
        handleFileSelect(selectedFiles)
        if (inputRef.current) {
            inputRef.current.value = ''
        }
    }, [handleFileSelect])

    const handleDragOver = React.useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = React.useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = React.useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
        const droppedFiles = Array.from(event.dataTransfer.files)
        handleFileSelect(droppedFiles)
    }, [handleFileSelect])

    const removeFile = React.useCallback((index: number) => {
        const newFiles = files.filter((_, i) => i !== index)
        setFiles(newFiles)
        onFileSelect?.(newFiles)
    }, [files, onFileSelect])

    const Comp = asChild ? Slot : "div"

    return (
        <Comp
            data-slot="file-upload"
            data-variant={variant}
            data-size={size}
            data-drag-over={isDragOver}
            data-has-files={files.length > 0}
            data-has-image={variant === "image-only" && files.length > 0 && files[0]?.type.startsWith('image/')}
            className={cn(fileUploadVariants({ size }), className)}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role={variant === "button" ? "button" : "region"}
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            {...props}
        >
            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled}
                onChange={handleInputChange}
                className="sr-only"
                aria-hidden="true"
            />

            {children || (
                <>
                    {/* Button content */}
                    <span className="data-[variant=button]:inline-flex data-[variant=button]:items-center data-[variant=button]:gap-2 hidden">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload files
                    </span>

                    {/* Dropzone content */}
                    <div className="data-[variant=dropzone]:flex data-[variant=dropzone]:flex-col data-[variant=dropzone]:items-center data-[variant=dropzone]:gap-2 hidden">
                        <div className="rounded-full bg-muted p-3">
                            <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                {isDragOver ? "Drop files here" : "Drag files here"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                or click to browse files
                            </p>
                        </div>
                    </div>

                    {/* Image content */}
                    <div className="data-[variant=image-only]:flex data-[variant=image-only]:flex-col data-[variant=image-only]:items-center data-[variant=image-only]:justify-center data-[variant=image-only]:w-full data-[variant=image-only]:h-full hidden">
                        {files.length > 0 && files[0]?.type.startsWith('image/') ? (
                            <div className="relative w-full h-full">
                                <img
                                    src={URL.createObjectURL(files[0])}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFile(0)
                                    }}
                                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-full bg-muted p-3 mb-2">
                                    <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Click to upload an image
                                </p>
                            </>
                        )}
                    </div>

                    {/* Preview/Multi-file content */}
                    <div className="data-[variant=preview]:block data-[variant=multi-file]:block hidden w-full">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
                            <p className="text-sm text-muted-foreground">
                                Click to select files
                            </p>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                        <span className="text-sm truncate">{file.name}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFile(index)
                                            }}
                                            className="text-destructive hover:text-destructive/80"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </Comp>
    )
}

export { FileUpload, fileUploadVariants }
export type FileUploadVariants = VariantProps<typeof fileUploadVariants>