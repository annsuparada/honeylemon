# Image Upload API Testing Guide

## API Endpoints

### 1. Upload Image from URL
**Endpoint:** `POST /api/images/upload-url`

**Request Body (JSON):**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "fileName": "optional-custom-name"  // optional
}
```

**Success Response:**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/.../image.webp"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### 2. Upload Image File
**Endpoint:** `POST /api/images/upload-file`

**Request (multipart/form-data):**
- `file`: Image file (max 10MB)

**Success Response:**
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/.../image.webp",
  "fileName": "original-filename.jpg",
  "fileSize": 12345
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Testing Methods

### Method 1: Using curl

#### Test URL Upload:
```bash
curl -X POST http://localhost:3000/api/images/upload-url \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    "fileName": "test-image"
  }'
```

#### Test File Upload:
```bash
curl -X POST http://localhost:3000/api/images/upload-file \
  -F "file=@/path/to/your/image.jpg"
```

### Method 2: Using the test script
```bash
# Make sure dev server is running first
npm run dev

# In another terminal
npm run test:image-apis
```

### Method 3: Using the curl script
```bash
# Make sure dev server is running first
npm run dev

# In another terminal
./scripts/test-apis-curl.sh
```

### Method 4: Using Postman

1. **URL Upload:**
   - Method: POST
   - URL: `http://localhost:3000/api/images/upload-url`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "imageUrl": "https://example.com/image.jpg"
     }
     ```

2. **File Upload:**
   - Method: POST
   - URL: `http://localhost:3000/api/images/upload-file`
   - Body (form-data):
     - Key: `file` (type: File)
     - Value: Select an image file

## Verification

After uploading, verify the images in Cloudinary:
1. Go to https://cloudinary.com/console
2. Navigate to Media Library
3. Check the `mexico-travel-guide` folder
4. Images should be converted to WebP format

## Error Cases Tested

✅ Missing imageUrl parameter
✅ Invalid URL format
✅ Missing file parameter
✅ File type validation (must be image)
✅ File size validation (max 10MB)

## Notes

- All images are automatically converted to WebP format
- Images are organized in the `mexico-travel-guide` folder
- File names are sanitized (extension removed from public_id)
- Maximum file size: 10MB

