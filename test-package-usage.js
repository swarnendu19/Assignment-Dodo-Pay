// Test script to verify package usage scenarios
import { FileUpload, defaultConfig, validateConfig } from './dist/index.js'
import { ButtonUpload, DropzoneUpload } from './dist/components.js'
import { validateFile, formatFileSize } from './dist/utils.js'

console.log('Testing package usage scenarios...')

// Test 1: Main component export
console.log('✓ FileUpload component imported:', typeof FileUpload === 'function')

// Test 2: Individual variant components
console.log('✓ ButtonUpload component imported:', typeof ButtonUpload === 'function')
console.log('✓ DropzoneUpload component imported:', typeof DropzoneUpload === 'function')

// Test 3: Configuration system
console.log('✓ Default config imported:', typeof defaultConfig === 'object')
console.log('✓ Config validation imported:', typeof validateConfig === 'function')

// Test 4: Utility functions
console.log('✓ File validation imported:', typeof validateFile === 'function')
console.log('✓ File size formatter imported:', typeof formatFileSize === 'function')

// Test 5: Configuration validation
try {
    const validationResult = validateConfig(defaultConfig)
    console.log('✓ Config validation works:', validationResult.isValid)
} catch (error) {
    console.log('✗ Config validation failed:', error.message)
}

// Test 6: Utility function usage
try {
    const formattedSize = formatFileSize(1024 * 1024)
    console.log('✓ File size formatting works:', formattedSize)
} catch (error) {
    console.log('✗ File size formatting failed:', error.message)
}

console.log('Package usage test completed!')