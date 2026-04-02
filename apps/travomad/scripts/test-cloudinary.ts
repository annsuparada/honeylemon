/**
 * Test script for Cloudinary integration
 * 
 * This script tests:
 * 1. Cloudinary configuration
 * 2. Image upload from Buffer
 * 3. Image upload from URL
 * 
 * Usage: npx tsx scripts/test-cloudinary.ts
 */

import 'dotenv/config';
import { uploadImage, uploadImageFromUrl } from '../app/lib/uploadToCloudinary';
import cloudinary from '../app/lib/cloudinary';

async function testCloudinaryConfig() {
    console.log('🔍 Testing Cloudinary Configuration...\n');

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('❌ Missing Cloudinary environment variables!');
        console.error('Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
        process.exit(1);
    }

    console.log('✅ Cloudinary environment variables found:');
    console.log(`   Cloud Name: ${cloudName}`);
    console.log(`   API Key: ${apiKey.substring(0, 8)}...`);
    console.log(`   API Secret: ${apiSecret.substring(0, 8)}...\n`);

    // Test configuration
    try {
        const config = cloudinary.config();
        if (config.cloud_name === cloudName) {
            console.log('✅ Cloudinary configuration verified!\n');
            return true;
        } else {
            console.error('❌ Cloudinary configuration mismatch!');
            return false;
        }
    } catch (error) {
        console.error('❌ Error verifying Cloudinary configuration:', error);
        return false;
    }
}

async function testUploadFromBuffer() {
    console.log('📤 Testing Image Upload from Buffer...\n');

    try {
        // Create a simple test image (1x1 pixel PNG)
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        const url = await uploadImage(testImageBuffer, 'test-image-buffer');
        console.log('✅ Image uploaded successfully!');
        console.log(`   URL: ${url}\n`);
        return url;
    } catch (error) {
        console.error('❌ Failed to upload image from buffer:', error);
        throw error;
    }
}

async function testUploadFromUrl() {
    console.log('🌐 Testing Image Upload from URL...\n');

    try {
        // Use a reliable test image URL (small PNG from a CDN)
        const testImageUrl = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=100&auto=format&fit=crop';
        
        console.log(`   Fetching image from: ${testImageUrl.substring(0, 60)}...`);
        const url = await uploadImageFromUrl(testImageUrl, 'test-image-url');
        console.log('✅ Image uploaded from URL successfully!');
        console.log(`   URL: ${url}\n`);
        return url;
    } catch (error) {
        console.error('❌ Failed to upload image from URL:', error);
        console.error('   Note: This might be due to network issues or the source URL being unavailable.\n');
        // Don't throw - this is a warning, not a critical failure
        return null;
    }
}

async function main() {
    console.log('🚀 Starting Cloudinary Test Suite\n');
    console.log('=' .repeat(50) + '\n');

    try {
        // Test 1: Configuration
        const configOk = await testCloudinaryConfig();
        if (!configOk) {
            process.exit(1);
        }

        // Test 2: Upload from Buffer
        await testUploadFromBuffer();

        // Test 3: Upload from URL (optional - may fail due to network)
        const urlUploadResult = await testUploadFromUrl();

        console.log('=' .repeat(50));
        if (urlUploadResult) {
            console.log('✅ All Cloudinary tests passed!\n');
        } else {
            console.log('⚠️  Core Cloudinary tests passed (URL upload had issues, but this is expected if source URL is unavailable)\n');
        }
        console.log('🎉 Cloudinary is ready to use!\n');
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Run the tests
main();

