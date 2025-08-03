// Test script to verify the build exports work correctly
console.log('Testing build exports...')

// Test ESM import
try {
    const esm = await import('./dist/index.js')
    console.log('✓ ESM import successful')
    console.log('ESM exports:', Object.keys(esm))
} catch (error) {
    console.error('✗ ESM import failed:', error.message)
}

// Test CJS require
try {
    const cjs = require('./dist/index.cjs')
    console.log('✓ CJS require successful')
    console.log('CJS exports:', Object.keys(cjs))
} catch (error) {
    console.error('✗ CJS require failed:', error.message)
}

// Test individual module imports
try {
    const components = await import('./dist/components.js')
    console.log('✓ Components module import successful')
    console.log('Components exports:', Object.keys(components))
} catch (error) {
    console.error('✗ Components module import failed:', error.message)
}

try {
    const config = await import('./dist/config.js')
    console.log('✓ Config module import successful')
    console.log('Config exports:', Object.keys(config))
} catch (error) {
    console.error('✗ Config module import failed:', error.message)
}

try {
    const utils = await import('./dist/utils.js')
    console.log('✓ Utils module import successful')
    console.log('Utils exports:', Object.keys(utils))
} catch (error) {
    console.error('✗ Utils module import failed:', error.message)
}

console.log('Build test completed!')