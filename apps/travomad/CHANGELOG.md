# Changelog

All notable changes to the Honey Lemon project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - CMS Update

### Added

#### Database & Schema
- Added `SCHEDULED` status to `PostStatus` enum
- Added new `PageType` enum values: `PILLAR_ARTICLE`, `CLUSTER_ARTICLE`, `BLOG_POST`, `LISTICLE`, `REVIEW`, `GUIDE`
- Added new fields to Post model:
  - `excerpt`: Short description for previews
  - `metaTitle`: Custom SEO title
  - `metaDescription`: Custom SEO description
  - `focusKeyword`: Primary keyword for SEO
  - `heroImage`: Main hero image URL
  - `images`: Array of additional image URLs
  - `featured`: Boolean flag for featured posts
  - `pillarPage`: Boolean flag for pillar content
  - `trending`: Boolean flag for trending posts
  - `views`: View counter
  - `readTime`: Calculated read time in minutes
  - `wordCount`: Total word count
  - `publishedAt`: Publication timestamp
- Added database indexes for improved query performance
- Removed deprecated `Article` model (consolidated into Post model)

#### Cloudinary Integration
- Integrated Cloudinary for image management and optimization
- Created `app/lip/cloudinary.ts` for Cloudinary configuration
- Created `app/lip/uploadToCloudinary.ts` with helper functions:
  - `uploadImage()`: Upload images from Buffer
  - `uploadImageFromUrl()`: Upload images from URLs
- Added test scripts for Cloudinary integration

#### Image Upload API Routes
- Created `/api/images/upload-url` endpoint for URL-based image uploads
- Created `/api/images/upload-file` endpoint for file-based image uploads
- Both endpoints return Cloudinary URLs for uploaded images

#### Image Upload Component
- Created `ImageUploader` component with:
  - URL upload method
  - File upload method
  - Image preview functionality
  - Copy URL button
  - Error handling

#### Content Creation Enhancements
- Added page type selector dropdown to write/edit page
- Added hero image upload section
- Enhanced images upload section with multiple image support
- Added collapsible SEO fields section:
  - Meta title input
  - Meta description input
  - Focus keyword input
- Added special flags checkboxes:
  - Featured checkbox
  - Pillar Page checkbox
  - Trending checkbox
- Updated form state management for all new fields

#### Dashboard Enhancements
- Added special filters section to blog list page:
  - "Featured Only" filter
  - "Pillar Pages Only" filter
  - "Trending Only" filter
- Enhanced blog cards with:
  - Featured badge (⭐) with yellow background
  - Pillar badge (📚) with purple background
  - Trending badge (🔥) with red background
  - View counter display (👁️ X views)
- Filters can be combined for advanced filtering

#### Frontend Post Display
- Added read time indicator to blog posts
- Added trending badge display
- Enhanced SEO metadata generation
- Added JSON-LD structured data support
- Created view counter API route (`/api/post/[slug]/views`)
- Created `ViewCounter` component for tracking post views
- View counter displayed on dashboard blog cards

#### Homepage Features
- Updated `BentoFeature` component to render featured posts
- Created `TrendingPosts` component
- Display trending posts on blog page

### Changed

#### Database
- Migrated from `Article` model to unified `Post` model
- Updated all references from `ARTICLE` page type to `BLOG_POST`

#### Code Quality
- Removed console.log statements from production code
- Improved error handling in API routes
- Enhanced type safety with TypeScript

### Technical Details

#### New Dependencies
- `cloudinary`: Cloudinary SDK for Node.js
- `@cloudinary/url-gen`: Cloudinary URL generation utilities

#### Environment Variables
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

#### File Structure
- New files:
  - `app/lip/cloudinary.ts`
  - `app/lip/uploadToCloudinary.ts`
  - `app/lip/readTime-helpers.ts`
  - `app/api/images/upload-url/route.ts`
  - `app/api/images/upload-file/route.ts`
  - `app/components/ImageUploader.tsx`
  - `app/components/TrendingPosts.tsx`
  - `app/components/ViewCounter.tsx`
  - `scripts/test-cloudinary.ts`
  - `scripts/test-image-apis.ts`

### Migration Notes

- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to apply database changes
- Update environment variables with Cloudinary credentials
- Existing posts with null `type` will be migrated to `BLOG_POST`
- View counters start at 0 for existing posts

---

## Previous Versions

*Previous changelog entries would be listed here*

