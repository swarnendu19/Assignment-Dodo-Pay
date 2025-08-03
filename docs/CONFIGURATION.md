# Configuration Reference

The File Upload Component Library supports extensive configuration through JSON files or configuration objects. This allows you to customize behavior, styling, and features without modifying code.

## Configuration Methods

### 1. JSON Configuration File

Create a configuration file and import it:

```json
// file-upload.config.json
{
  "defaults": {
    "variant": "dropzone",
    "size": "md",
    "multiple": true
  },
  "styling": {
    "colors": {
      "primary": "#3b82f6"
    }
  }
}
```

```tsx
import config from './file-upload.config.json'

<FileUpload config={config} onUpload={handleUpload} />
```

### 2. Configuration Object

Pass configuration directly as a prop:

```tsx
const config = {
  defaults: {
    variant: 'dropzone',
    size: 'lg'
  },
  features: {
    dragAndDrop: true,
    preview: true
  }
}

<FileUpload config={config} onUpload={handleUpload} />
```

### 3. Configuration Path

Pass a path to a JSON configuration file:

```tsx
<FileUpload config="./config/upload.json" onUpload={handleUpload} />
```

## Configuration Schema

### defaults

Default values for component props.

```json
{
  "defaults": {
    "variant": "button",
    "size": "md",
    "radius": "md",
    "theme": "auto",
    "multiple": false,
    "disabled": false,
    "accept": "*",
    "maxSize": 10485760,
    "maxFiles": 5
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `string` | `"button"` | Default variant: `"button"`, `"dropzone"`, `"preview"`, `"image-only"`, `"multi-file"` |
| `size` | `string` | `"md"` | Default size: `"sm"`, `"md"`, `"lg"` |
| `radius` | `string` | `"md"` | Default border radius: `"none"`, `"sm"`, `"md"`, `"lg"`, `"full"` |
| `theme` | `string` | `"auto"` | Default theme: `"light"`, `"dark"`, `"auto"` |
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `disabled` | `boolean` | `false` | Disable component by default |
| `accept` | `string` | `"*"` | Default accepted file types |
| `maxSize` | `number` | `10485760` | Default maximum file size in bytes (10MB) |
| `maxFiles` | `number` | `5` | Default maximum number of files |

### validation

File validation rules and constraints.

```json
{
  "validation": {
    "maxSize": 10485760,
    "maxFiles": 5,
    "allowedTypes": ["image/*", "application/pdf"],
    "allowedExtensions": [".jpg", ".png", ".pdf"],
    "minSize": 1024,
    "validateDimensions": true,
    "maxWidth": 1920,
    "maxHeight": 1080,
    "minWidth": 100,
    "minHeight": 100
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxSize` | `number` | `10485760` | Maximum file size in bytes |
| `maxFiles` | `number` | `5` | Maximum number of files |
| `allowedTypes` | `string[]` | `["*"]` | Allowed MIME types |
| `allowedExtensions` | `string[]` | `["*"]` | Allowed file extensions |
| `minSize` | `number` | `0` | Minimum file size in bytes |
| `validateDimensions` | `boolean` | `false` | Validate image dimensions |
| `maxWidth` | `number` | - | Maximum image width in pixels |
| `maxHeight` | `number` | - | Maximum image height in pixels |
| `minWidth` | `number` | - | Minimum image width in pixels |
| `minHeight` | `number` | - | Minimum image height in pixels |

#### Examples

**Image Only with Size Constraints**
```json
{
  "validation": {
    "allowedTypes": ["image/jpeg", "image/png", "image/webp"],
    "allowedExtensions": [".jpg", ".jpeg", ".png", ".webp"],
    "maxSize": 5242880,
    "validateDimensions": true,
    "maxWidth": 2048,
    "maxHeight": 2048,
    "minWidth": 200,
    "minHeight": 200
  }
}
```

**Document Upload**
```json
{
  "validation": {
    "allowedTypes": ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    "allowedExtensions": [".pdf", ".doc", ".docx"],
    "maxSize": 20971520,
    "maxFiles": 10
  }
}
```

### styling

Visual styling and theming configuration.

```json
{
  "styling": {
    "theme": "auto",
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#6b7280",
      "success": "#10b981",
      "error": "#ef4444",
      "warning": "#f59e0b",
      "background": "#ffffff",
      "foreground": "#1f2937",
      "border": "#d1d5db",
      "muted": "#9ca3af"
    },
    "spacing": {
      "padding": "1rem",
      "margin": "0.5rem",
      "gap": "0.5rem",
      "borderRadius": "0.375rem"
    },
    "typography": {
      "fontSize": "0.875rem",
      "fontWeight": "400",
      "lineHeight": "1.25rem"
    },
    "borders": {
      "width": "1px",
      "style": "solid",
      "color": "#d1d5db"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  }
}
```

#### Colors

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `primary` | `string` | `"#3b82f6"` | Primary brand color |
| `secondary` | `string` | `"#6b7280"` | Secondary color |
| `success` | `string` | `"#10b981"` | Success state color |
| `error` | `string` | `"#ef4444"` | Error state color |
| `warning` | `string` | `"#f59e0b"` | Warning state color |
| `background` | `string` | `"#ffffff"` | Background color |
| `foreground` | `string` | `"#1f2937"` | Text color |
| `border` | `string` | `"#d1d5db"` | Border color |
| `muted` | `string` | `"#9ca3af"` | Muted text color |

#### Spacing

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `padding` | `string` | `"1rem"` | Internal padding |
| `margin` | `string` | `"0.5rem"` | External margin |
| `gap` | `string` | `"0.5rem"` | Gap between elements |
| `borderRadius` | `string` | `"0.375rem"` | Border radius |

#### Typography

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `fontSize` | `string` | `"0.875rem"` | Font size |
| `fontWeight` | `string` | `"400"` | Font weight |
| `lineHeight` | `string` | `"1.25rem"` | Line height |

#### Borders

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | `string` | `"1px"` | Border width |
| `style` | `string` | `"solid"` | Border style: `"solid"`, `"dashed"`, `"dotted"`, `"none"` |
| `color` | `string` | `"#d1d5db"` | Border color |

#### Shadows

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sm` | `string` | `"0 1px 2px 0 rgb(0 0 0 / 0.05)"` | Small shadow |
| `md` | `string` | `"0 4px 6px -1px rgb(0 0 0 / 0.1)"` | Medium shadow |
| `lg` | `string` | `"0 10px 15px -3px rgb(0 0 0 / 0.1)"` | Large shadow |

### labels

Text labels and messages for internationalization and customization.

```json
{
  "labels": {
    "uploadText": "Choose files to upload",
    "dragText": "Drag and drop files here",
    "dropText": "Drop files here",
    "browseText": "Browse",
    "errorText": "Upload failed",
    "successText": "Upload successful",
    "progressText": "Uploading...",
    "removeText": "Remove",
    "retryText": "Retry",
    "cancelText": "Cancel",
    "selectFilesText": "Select files",
    "maxSizeText": "File too large",
    "invalidTypeText": "Invalid file type",
    "tooManyFilesText": "Too many files"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `uploadText` | `string` | `"Choose files to upload"` | Main upload button text |
| `dragText` | `string` | `"Drag and drop files here"` | Drag area text |
| `dropText` | `string` | `"Drop files here"` | Active drop text |
| `browseText` | `string` | `"Browse"` | Browse button text |
| `errorText` | `string` | `"Upload failed"` | Generic error message |
| `successText` | `string` | `"Upload successful"` | Success message |
| `progressText` | `string` | `"Uploading..."` | Progress indicator text |
| `removeText` | `string` | `"Remove"` | Remove file button text |
| `retryText` | `string` | `"Retry"` | Retry button text |
| `cancelText` | `string` | `"Cancel"` | Cancel button text |
| `selectFilesText` | `string` | `"Select files"` | File selection text |
| `maxSizeText` | `string` | `"File too large"` | File size error |
| `invalidTypeText` | `string` | `"Invalid file type"` | File type error |
| `tooManyFilesText` | `string` | `"Too many files"` | File count error |

#### Internationalization Example

```json
{
  "labels": {
    "uploadText": "Dateien zum Hochladen auswählen",
    "dragText": "Dateien hier hineinziehen",
    "dropText": "Dateien hier ablegen",
    "browseText": "Durchsuchen",
    "errorText": "Upload fehlgeschlagen",
    "successText": "Upload erfolgreich",
    "progressText": "Wird hochgeladen...",
    "removeText": "Entfernen",
    "retryText": "Wiederholen",
    "cancelText": "Abbrechen"
  }
}
```

### features

Feature toggles to enable or disable functionality.

```json
{
  "features": {
    "dragAndDrop": true,
    "preview": true,
    "progress": true,
    "multipleFiles": false,
    "removeFiles": true,
    "retryFailed": true,
    "showFileSize": true,
    "showFileType": true,
    "autoUpload": false,
    "chunkedUpload": false,
    "resumableUpload": false
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `dragAndDrop` | `boolean` | `true` | Enable drag and drop functionality |
| `preview` | `boolean` | `true` | Show file previews |
| `progress` | `boolean` | `true` | Show upload progress |
| `multipleFiles` | `boolean` | `false` | Allow multiple file selection |
| `removeFiles` | `boolean` | `true` | Allow file removal |
| `retryFailed` | `boolean` | `true` | Allow retry of failed uploads |
| `showFileSize` | `boolean` | `true` | Display file sizes |
| `showFileType` | `boolean` | `true` | Display file types |
| `autoUpload` | `boolean` | `false` | Start upload automatically |
| `chunkedUpload` | `boolean` | `false` | Enable chunked uploads |
| `resumableUpload` | `boolean` | `false` | Enable resumable uploads |

### animations

Animation settings and preferences.

```json
{
  "animations": {
    "enabled": true,
    "duration": 200,
    "easing": "ease-in-out"
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable animations |
| `duration` | `number` | `200` | Animation duration in milliseconds (0-5000) |
| `easing` | `string` | `"ease-in-out"` | CSS easing function |

### accessibility

Accessibility features and settings.

```json
{
  "accessibility": {
    "announceFileSelection": true,
    "announceProgress": true,
    "announceErrors": true,
    "keyboardNavigation": true,
    "focusManagement": true
  }
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `announceFileSelection` | `boolean` | `true` | Announce file selection to screen readers |
| `announceProgress` | `boolean` | `true` | Announce upload progress |
| `announceErrors` | `boolean` | `true` | Announce errors |
| `keyboardNavigation` | `boolean` | `true` | Enable keyboard navigation |
| `focusManagement` | `boolean` | `true` | Manage focus states |

## Configuration Examples

### Minimal Configuration

```json
{
  "defaults": {
    "variant": "dropzone",
    "multiple": true
  }
}
```

### Image Gallery Upload

```json
{
  "defaults": {
    "variant": "preview",
    "multiple": true,
    "accept": "image/*",
    "maxFiles": 20
  },
  "validation": {
    "allowedTypes": ["image/jpeg", "image/png", "image/webp"],
    "maxSize": 5242880,
    "validateDimensions": true,
    "maxWidth": 2048,
    "maxHeight": 2048
  },
  "features": {
    "preview": true,
    "removeFiles": true,
    "showFileSize": true
  },
  "styling": {
    "colors": {
      "primary": "#8b5cf6"
    }
  }
}
```

### Document Upload System

```json
{
  "defaults": {
    "variant": "multi-file",
    "multiple": true,
    "maxFiles": 50
  },
  "validation": {
    "allowedTypes": [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ],
    "allowedExtensions": [".pdf", ".doc", ".docx", ".txt"],
    "maxSize": 52428800
  },
  "features": {
    "dragAndDrop": true,
    "progress": true,
    "removeFiles": true,
    "retryFailed": true,
    "showFileSize": true,
    "showFileType": true,
    "chunkedUpload": true
  },
  "labels": {
    "uploadText": "Upload Documents",
    "dragText": "Drag documents here or click to browse",
    "maxSizeText": "Document must be smaller than 50MB"
  }
}
```

### Profile Picture Upload

```json
{
  "defaults": {
    "variant": "image-only",
    "accept": "image/*",
    "maxFiles": 1
  },
  "validation": {
    "allowedTypes": ["image/jpeg", "image/png"],
    "maxSize": 2097152,
    "validateDimensions": true,
    "minWidth": 200,
    "minHeight": 200,
    "maxWidth": 1024,
    "maxHeight": 1024
  },
  "features": {
    "preview": true,
    "removeFiles": true,
    "autoUpload": true
  },
  "styling": {
    "colors": {
      "primary": "#059669"
    },
    "spacing": {
      "padding": "2rem"
    }
  },
  "labels": {
    "uploadText": "Upload Profile Picture",
    "dragText": "Drop your profile picture here",
    "maxSizeText": "Image must be smaller than 2MB"
  }
}
```

### Dark Theme Configuration

```json
{
  "styling": {
    "theme": "dark",
    "colors": {
      "primary": "#60a5fa",
      "secondary": "#9ca3af",
      "success": "#34d399",
      "error": "#f87171",
      "warning": "#fbbf24",
      "background": "#1f2937",
      "foreground": "#f9fafb",
      "border": "#374151",
      "muted": "#6b7280"
    }
  }
}
```

## Configuration Validation

The library validates configuration objects against a JSON schema. Invalid configurations will produce helpful error messages:

```tsx
import { validateConfig } from 'file-upload-component-library'

const config = {
  defaults: {
    variant: 'invalid-variant' // This will cause a validation error
  }
}

const result = validateConfig(config)
if (!result.isValid) {
  console.error('Configuration errors:', result.errors)
  // Output: [{ path: 'defaults.variant', message: 'Invalid variant. Must be one of: button, dropzone, preview, image-only, multi-file' }]
}
```

## Configuration Merging

Configurations are merged in the following order (later values override earlier ones):

1. Default configuration
2. JSON configuration file
3. Configuration object prop
4. Individual component props

```tsx
// This prop will override the config's variant setting
<FileUpload
  config={{ defaults: { variant: 'dropzone' } }}
  variant="button" // This takes precedence
  onUpload={handleUpload}
/>
```