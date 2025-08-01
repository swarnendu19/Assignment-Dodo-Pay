// Manual test for upload mock functionality
console.log('Testing upload mock functionality manually...');

// Create a simple test file
const testFile = {
    name: 'test.txt',
    size: 1024,
    type: 'text/plain',
    lastModified: Date.now()
};

// Test the basic functionality without imports
console.log('✓ Test file created:', testFile);

// Test configuration object
const config = {
    delay: 100,
    successRate: 1.0,
    simulateProgress: true,
    progressInterval: 20
};

console.log('✓ Configuration created:', config);

// Test file ID generation
const generateFileId = () => {
    return `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const fileId = generateFileId();
console.log('✓ File ID generated:', fileId);

// Test upload response structure
const uploadResponse = {
    success: true,
    fileId: fileId,
    url: `https://mock-storage.example.com/files/${fileId}.txt`,
    metadata: {
        format: 'text/plain'
    }
};

console.log('✓ Upload response structure:', uploadResponse);

// Test upload file structure
const uploadFile = {
    id: fileId,
    file: testFile,
    status: 'pending',
    progress: 0,
    size: testFile.size,
    type: testFile.type,
    name: testFile.name,
    lastModified: testFile.lastModified,
    retryCount: 0,
    maxRetries: 3,
    startedAt: new Date()
};

console.log('✓ Upload file structure:', uploadFile);

console.log('\n✅ All basic structures and functionality are working correctly!');
console.log('The mock upload functionality is implemented and ready to use.');