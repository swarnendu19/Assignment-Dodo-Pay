# ZentrixUI

<div align="center">
  <h1>🚀 ZentrixUI</h1>
  <p>Modern, highly customizable and accessible React file upload components</p>
  
  [![npm version](https://badge.fury.io/js/zentrixui.svg)](https://badge.fury.io/js/zentrixui)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18%2B-blue)](https://reactjs.org/)
</div>

A modern, highly customizable and accessible React file upload component library with multiple variants, JSON-based configuration, and excellent developer experience. Built with TypeScript, TailwindCSS, and Radix UI primitives.

## Features

- 🎨 **Multiple Variants**: Button, Dropzone, Preview, Image-only, and Multi-file upload variants
- ⚙️ **JSON Configuration**: Declarative configuration system for easy customization
- ♿ **Accessibility First**: Full keyboard navigation, screen reader support, and ARIA compliance
- 🎯 **TypeScript**: Complete type safety with comprehensive TypeScript definitions
- 🎨 **Themeable**: Light/dark themes with customizable colors, spacing, and styling
- 📱 **Responsive**: Mobile-friendly with touch interactions and responsive layouts
- 🔧 **Developer Experience**: Excellent DX with clear APIs and comprehensive documentation
- 🧪 **Mock Upload**: Built-in mock upload service for development and testing
- 🌳 **Tree Shakeable**: Import only what you need for optimal bundle size

## Installation

```bash
npm install zentrixui
# or
pnpm add zentrixui
# or
yarn add zentrixui
```

## Quick Start

```tsx
import { FileUpload } from 'zentrixui'
import 'zentrixui/styles'

function App() {
  const handleUpload = async (files: File[]) => {
    // Handle file upload
    console.log('Uploading files:', files)
  }

  return (
    <FileUpload
      variant="dropzone"
      onUpload={handleUpload}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      multiple
    />
  )
}
```

## Variants

### Button Upload
Traditional file input styled as a button.

```tsx
<FileUpload
  variant="button"
  onUpload={handleUpload}
  size="lg"
  radius="md"
/>
```

### Dropzone Upload
Drag-and-drop area with visual feedback.

```tsx
<FileUpload
  variant="dropzone"
  onUpload={handleUpload}
  accept="image/*,video/*"
  multiple
  maxFiles={10}
/>
```

### Preview Upload
Shows file previews after selection with upload progress.

```tsx
<FileUpload
  variant="preview"
  onUpload={handleUpload}
  multiple
  maxSize={10 * 1024 * 1024}
/>
```

### Image Upload
Specialized for image files with thumbnail preview.

```tsx
<FileUpload
  variant="image-only"
  onUpload={handleUpload}
  accept="image/*"
  maxSize={2 * 1024 * 1024}
/>
```

### Multi-file Upload
Handles multiple files with individual progress tracking.

```tsx
<FileUpload
  variant="multi-file"
  onUpload={handleUpload}
  multiple
  maxFiles={20}
  accept=".pdf,.doc,.docx"
/>
```

## Configuration

### Props Configuration

```tsx
interface FileUploadProps {
  // Core behavior
  variant?: 'button' | 'dropzone' | 'preview' | 'image-only' | 'multi-file'
  size?: 'sm' | 'md' | 'lg'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  disabled?: boolean
  multiple?: boolean
  accept?: string
  maxSize?: number
  maxFiles?: number

  // Styling
  theme?: 'light' | 'dark' | 'auto'
  className?: string
  style?: React.CSSProperties

  // Customization
  icon?: ReactNode
  iconPlacement?: 'left' | 'right' | 'top' | 'bottom'
  placeholder?: string
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none'
  borderWidth?: 'thin' | 'medium' | 'thick'

  // Event handlers
  onUpload?: (files: File[]) => Promise<void>
  onError?: (error: string) => void
  onProgress?: (progress: number, file?: UploadFile) => void
  onFileSelect?: (files: File[]) => void
  onFileRemove?: (fileId: string) => void

  // Configuration
  config?: FileUploadConfig | string // Config object or path to JSON file

  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string

  children?: ReactNode
}
```

### JSON Configuration

Create a `file-upload.config.json` file for declarative configuration:

```json
{
  "defaults": {
    "variant": "dropzone",
    "size": "md",
    "radius": "md",
    "theme": "auto",
    "multiple": true,
    "maxSize": 10485760,
    "maxFiles": 5
  },
  "validation": {
    "allowedTypes": ["image/*", "application/pdf"],
    "allowedExtensions": [".jpg", ".png", ".pdf"],
    "maxSize": 10485760,
    "maxFiles": 5
  },
  "styling": {
    "theme": "auto",
    "colors": {
      "primary": "#3b82f6",
      "success": "#10b981",
      "error": "#ef4444"
    }
  },
  "labels": {
    "uploadText": "Choose files to upload",
    "dragText": "Drag and drop files here",
    "successText": "Upload successful"
  },
  "features": {
    "dragAndDrop": true,
    "preview": true,
    "progress": true,
    "removeFiles": true
  }
}
```

Then use it in your component:

```tsx
import config from './file-upload.config.json'

<FileUpload config={config} onUpload={handleUpload} />
```

## Theming

### Theme Provider

Wrap your app with the ThemeProvider for consistent theming:

```tsx
import { ThemeProvider } from 'zentrixui'

function App() {
  return (
    <ThemeProvider theme="auto">
      <YourApp />
    </ThemeProvider>
  )
}
```

### Custom Themes

```tsx
const customTheme = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#64748b',
    success: '#059669',
    error: '#dc2626',
    background: '#ffffff',
    foreground: '#1f2937'
  },
  spacing: {
    padding: '1.5rem',
    margin: '0.75rem',
    gap: '0.75rem'
  }
}

<FileUpload
  config={{ styling: customTheme }}
  onUpload={handleUpload}
/>
```

## Accessibility

The component is built with accessibility in mind:

- **Keyboard Navigation**: Full keyboard support with Tab, Enter, Space, and Escape keys
- **Screen Reader Support**: Comprehensive ARIA labels and live regions
- **Focus Management**: Proper focus indicators and focus trapping
- **High Contrast**: Support for high contrast mode and custom focus indicators
- **Announcements**: Status updates announced to screen readers

### Accessibility Props

```tsx
<FileUpload
  ariaLabel="Upload your documents"
  ariaDescribedBy="upload-help-text"
  onUpload={handleUpload}
/>
<div id="upload-help-text">
  Supported formats: PDF, DOC, DOCX. Maximum size: 10MB.
</div>
```

## Advanced Usage

### File Validation

```tsx
const handleUpload = async (files: File[]) => {
  // Custom validation
  const validFiles = files.filter(file => {
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File ${file.name} is too large`)
      return false
    }
    return true
  })

  // Upload valid files
  for (const file of validFiles) {
    await uploadFile(file)
  }
}

<FileUpload
  onUpload={handleUpload}
  onError={(error) => console.error('Upload error:', error)}
  maxSize={5 * 1024 * 1024}
  accept="image/*,.pdf"
/>
```

### Progress Tracking

```tsx
const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

const handleProgress = (progress: number, file?: UploadFile) => {
  if (file) {
    setUploadProgress(prev => ({
      ...prev,
      [file.id]: progress
    }))
  }
}

<FileUpload
  variant="multi-file"
  onUpload={handleUpload}
  onProgress={handleProgress}
  multiple
/>
```

### Custom Upload Service

```tsx
import { mockUploadService } from 'zentrixui'

// Configure mock service for development
mockUploadService.configure({
  delay: 2000,
  successRate: 0.8,
  chunkSize: 1024 * 1024
})

const handleUpload = async (files: File[]) => {
  for (const file of files) {
    try {
      const result = await mockUploadService.upload(file, {
        onProgress: (progress) => console.log(`${file.name}: ${progress}%`)
      })
      console.log('Upload successful:', result)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }
}
```

## TypeScript Support

The library is built with TypeScript and provides comprehensive type definitions:

```tsx
import type {
  FileUploadProps,
  FileUploadConfig,
  UploadFile,
  FileUploadState,
  FileValidationResult
} from 'zentrixui'

const config: FileUploadConfig = {
  defaults: {
    variant: 'dropzone',
    size: 'lg',
    multiple: true
  },
  // ... rest of config with full type safety
}

const handleFileSelect = (files: File[]) => {
  // Type-safe file handling
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Documentation

- [API Reference](docs/API.md) - Complete API documentation
- [Configuration Guide](docs/CONFIGURATION.md) - JSON configuration reference
- [Usage Examples](docs/EXAMPLES.md) - Code examples for all variants

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.