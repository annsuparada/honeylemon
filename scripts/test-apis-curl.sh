#!/bin/bash

# Test script for Image Upload APIs using curl
# Make sure your dev server is running: npm run dev

API_BASE_URL="${NEXT_PUBLIC_API_URL:-http://localhost:3000}"

echo "🚀 Testing Image Upload APIs with curl"
echo "======================================"
echo "API Base URL: $API_BASE_URL"
echo ""

# Test 1: URL Upload
echo "🌐 Testing URL Upload API..."
echo "POST $API_BASE_URL/api/images/upload-url"
echo ""

RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/images/upload-url" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    "fileName": "test-url-upload"
  }')

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""
echo ""

# Test 2: File Upload (requires an actual image file)
echo "📤 Testing File Upload API..."
echo "POST $API_BASE_URL/api/images/upload-file"
echo ""
echo "Note: Create a test image file first, then run:"
echo "curl -X POST $API_BASE_URL/api/images/upload-file \\"
echo "  -F 'file=@/path/to/your/image.jpg'"
echo ""

# Test 3: Error Cases
echo "🔍 Testing Error Cases..."
echo ""

echo "1. Missing imageUrl:"
curl -s -X POST "$API_BASE_URL/api/images/upload-url" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.' 2>/dev/null || echo "Response received"
echo ""

echo "2. Invalid URL:"
curl -s -X POST "$API_BASE_URL/api/images/upload-url" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "not-a-valid-url"}' | jq '.' 2>/dev/null || echo "Response received"
echo ""

echo "3. Missing file:"
curl -s -X POST "$API_BASE_URL/api/images/upload-file" | jq '.' 2>/dev/null || echo "Response received"
echo ""

echo "✅ Tests complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Check Cloudinary dashboard to verify images were uploaded"
echo "   2. Images should be in the 'mexico-travel-guide' folder"

