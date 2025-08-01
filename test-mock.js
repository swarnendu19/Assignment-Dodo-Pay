// Simple test to check if mock upload is working
console.log('Testing mock upload...');

// Try to import the module
import('./src/lib/utils/upload-mock.ts')
    .then(module => {
        console.log('Module imported successfully');
        console.log('Available exports:', Object.keys(module));

        if (module.MockUploadService) {
            console.log('MockUploadService is available');
            const service = new module.MockUploadService();
            console.log('Service created successfully');
        } else {
            console.log('MockUploadService is not available');
        }
    })
    .catch(error => {
        console.error('Import failed:', error);
    });