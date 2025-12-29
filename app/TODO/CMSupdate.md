# Travomad CMS Update - Quick Checklist

## PHASE 1: DATABASE SCHEMA
- [x] Backup current database
- [x] Update PostStatus enum (add SCHEDULED)
- [x] Update PageType enum (add PILLAR_ARTICLE, CLUSTER_ARTICLE, BLOG_POST, LISTICLE, REVIEW, GUIDE)
- [x] Add new fields to Post model (excerpt, metaTitle, metaDescription, focusKeyword, heroImage, images, featured, pillarPage, trending, views, readTime, wordCount, publishedAt)
- [x] Add indexes to Post model
- [x] Delete Article model
- [x] Run `npx prisma generate`
- [x] Run `npx prisma db push`
- [x] Create migration script for Articles (if needed)

## PHASE 2: CLOUDINARY SETUP
- [x] Create lib/cloudinary.ts config file
- [x] Create lib/uploadToCloudinary.ts helper functions
- [x] Create scripts/test-cloudinary.ts
- [x] Run cloudinary test script

## PHASE 3: IMAGE UPLOAD API ROUTES
- [x] Create app/api/images/upload-url/route.ts
- [x] Create app/api/images/upload-file/route.ts
- [x] Test URL upload API 
- [x] Test file upload API 
- [x] Verify images appear in Cloudinary dashboard

## PHASE 4: IMAGE UPLOAD COMPONENT
- [x] Create components/ImageUploader.tsx 
- [x] Create test page for ImageUploader
- [x] Test URL upload method
- [x] Test file upload method
- [x] Test preview functionality
- [x] Test copy URL button
- [x] Delete test page

## PHASE 5: UPDATE POST WRITE/EDIT PAGE
- [x] Add type selector dropdown
- [x] Add hero image upload section
- [x] Update images upload section
- [x] Add SEO fields section (collapsible)
- [x] Add special flags checkboxes
- [x] Update form state with new fields
- [x] Update submit handler
- [x] Test all new fields work

## PHASE 6: ENHANCE BLOG LIST PAGE
**File: /dashboard/blogs**

### Add Special Flags Filters (New filters below existing ones)
- [x] Add "Special Filters" section below Sort by
- [x] Add "⭐ Featured Only" checkbox
- [x] Add "📚 Pillar Pages Only" checkbox  
- [x] Add "🔥 Trending Only" checkbox
- [x] Apply these filters to existing posts query

### Enhance Blog Cards (Add to existing card display)
- [x] Add small badge row below status badge:
  - [x] Show ⭐ "Featured" badge if featured=true (yellow bg)
  - [x] Show 📚 "Pillar" badge if pillarPage=true (purple bg)
  - [x] Show 🔥 "Trending" badge if trending=true (red bg)
- [x] Add view counter below category: "👁️ 1,234 views"



### Testing
- [x] Test "Featured Only" filter
- [x] Test "Pillar Pages Only" filter
- [x] Test "Trending Only" filter
- [x] Test combining filters (Featured + Published + Destination)
- [x] Verify new badges display correctly
- [x] Verify view counts show
- [x] Test that existing filters still work
- [x] Test on mobile responsiveness

## PHASE 7: UPDATE FRONTEND POST DISPLAY
- [x] Add read time indicator
- [x] Add trending badge
- [x] Update SEO metadata function
- [x] Add JSON-LD structured data
- [x] Create view counter API route
- [x] Create ViewCounter component and add to dashboard/blog on blog cards only, not on the single blog page
- [ ] Test view counter increments
- [ ] Test on mobile

## PHASE 8: HOMEPAGE FEATURED SECTION
- [x] update bento feature component to render feature boolean, 
- [x] Create TrendingPosts component and display it on blog page
- [x] Test featured section displays
- [x] Test responsive layout


## PHASE 12: DOCUMENTATION
- [x] Update README.md
- [x] Create/update CHANGELOG.md
- [x] Delete test files (test scripts kept as utilities)
- [x] Clean up console.logs
- [x] Verify file structure
- [ ] Final git commit

## PHASE 13: OPTIONAL ENHANCEMENTS
- [ ] Add related posts section
- [ ] Add comments system
- [ ] Add search functionality
- [ ] Add analytics dashboard
- [ ] Add email notifications
- [ ] Add image optimization utilities

## FINAL VERIFICATION
- [ ] All core features working
- [ ] Tested on production
- [ ] Mobile responsive verified
- [ ] SEO verified
- [ ] No console errors
- [ ] Documentation complete
- [ ] Code pushed to repository
- [ ] Deployed successfully

🎉 PROJECT COMPLETE!