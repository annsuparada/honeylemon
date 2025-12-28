/**
 * Test script for Image Upload API Routes
 * 
 * This script tests:
 * 1. URL upload API endpoint
 * 2. File upload API endpoint
 * 
 * Usage: 
 *   npm run dev (in one terminal)
 *   npx tsx scripts/test-image-apis.ts (in another terminal)
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testUrlUpload() {
    console.log('🌐 Testing URL Upload API...\n');

    try {
        const testImageUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop';

        const response = await fetch(`${API_BASE_URL}/api/images/upload-url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl: testImageUrl,
                fileName: 'test-url-upload',
            }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ URL upload successful!');
            console.log(`   Cloudinary URL: ${data.imageUrl}\n`);
            return data.imageUrl;
        } else {
            console.error('❌ URL upload failed:', data.error || data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error testing URL upload:', error);
        return null;
    }
}

async function testFileUpload() {
    console.log('📤 Testing File Upload API...\n');

    try {
        // Create a simple test image file (1x1 pixel PNG)
        const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const testImageBuffer = Buffer.from(testImageBase64, 'base64');
        
        // Create FormData using the global FormData (Node.js 18+)
        const formData = new FormData();
        const fileBlob = new Blob([testImageBuffer], { type: 'image/png' });
        formData.append('file', fileBlob, 'test-image.png');

        const response = await fetch(`${API_BASE_URL}/api/images/upload-file`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ File upload successful!');
            console.log(`   Cloudinary URL: ${data.imageUrl}`);
            console.log(`   File name: ${data.fileName}`);
            console.log(`   File size: ${data.fileSize} bytes\n`);
            return data.imageUrl;
        } else {
            console.error('❌ File upload failed:', data.error || data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error testing file upload:', error);
        console.error('   Note: File upload test requires Node.js 18+ with native FormData support');
        console.error('   You can test manually using curl or Postman (see instructions below)\n');
        return null;
    }
}

async function testErrorCases() {
    console.log('🔍 Testing Error Cases...\n');

    // Test 1: Missing imageUrl
    try {
        const response = await fetch(`${API_BASE_URL}/api/images/upload-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        if (response.status === 400 && !data.success) {
            console.log('✅ Error handling: Missing imageUrl - PASSED');
        } else {
            console.log('❌ Error handling: Missing imageUrl - FAILED');
        }
    } catch (error) {
        console.log('❌ Error handling: Missing imageUrl - FAILED');
    }

    // Test 2: Invalid URL
    try {
        const response = await fetch(`${API_BASE_URL}/api/images/upload-url`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: 'not-a-valid-url' }),
        });
        const data = await response.json();
        if (response.status === 400 && !data.success) {
            console.log('✅ Error handling: Invalid URL - PASSED');
        } else {
            console.log('❌ Error handling: Invalid URL - FAILED');
        }
    } catch (error) {
        console.log('❌ Error handling: Invalid URL - FAILED');
    }

    // Test 3: Missing file
    try {
        const response = await fetch(`${API_BASE_URL}/api/images/upload-file`, {
            method: 'POST',
        });
        const data = await response.json();
        if (response.status === 400 && !data.success) {
            console.log('✅ Error handling: Missing file - PASSED');
        } else {
            console.log('❌ Error handling: Missing file - FAILED');
        }
    } catch (error) {
        console.log('❌ Error handling: Missing file - FAILED');
    }

    console.log('');
}

async function main() {
    console.log('🚀 Starting Image Upload API Test Suite\n');
    console.log('=' .repeat(50) + '\n');
    console.log(`API Base URL: ${API_BASE_URL}\n`);

    // Check if server is running
    try {
        const healthCheck = await fetch(`${API_BASE_URL}/api/post`);
        if (!healthCheck.ok && healthCheck.status !== 401) {
            console.log('⚠️  Warning: Server might not be running. Make sure to run "npm run dev" first.\n');
        }
    } catch (error) {
        console.log('⚠️  Warning: Could not connect to server. Make sure to run "npm run dev" first.\n');
    }

    try {
        // Test URL upload
        const urlResult = await testUrlUpload();

        // Test file upload
        const fileResult = await testFileUpload();

        // Test error cases
        await testErrorCases();

        console.log('=' .repeat(50));
        if (urlResult && fileResult) {
            console.log('✅ All API tests passed!\n');
            console.log('📝 Next steps:');
            console.log('   1. Check Cloudinary dashboard to verify images were uploaded');
            console.log('   2. Images should be in the "mexico-travel-guide" folder\n');
        } else {
            console.log('⚠️  Some tests failed. Check the errors above.\n');
        }
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Run the tests
main();

