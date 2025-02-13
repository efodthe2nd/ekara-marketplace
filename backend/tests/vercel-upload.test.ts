// tests/vercel-upload.test.ts
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testVercelUpload() {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        throw new Error('BLOB_READ_WRITE_TOKEN is not set in environment variables');
    }

    try {
        // Create a small test image if you don't have one
        const testImageBuffer = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
            'base64'
        );

        console.log('Starting upload test...');
        
        const blob = await put('test-image.png', testImageBuffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });
        
        console.log('Upload successful!');
        console.log('URL:', blob.url);
        console.log('Pathname:', blob.pathname);
        
        // Try to fetch the uploaded image
        const response = await fetch(blob.url);
        if (response.ok) {
            console.log('Image is accessible at the URL');
        } else {
            console.log('Image upload succeeded but URL is not accessible:', response.status);
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testVercelUpload();