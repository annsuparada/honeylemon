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

## PHASE 6: UPDATE ADMIN POST LIST
- [ ] Add filter state
- [ ] Add type filter dropdown
- [ ] Add status filter dropdown
- [ ] Add special flags filters
- [ ] Update posts query with filters
- [ ] Display hero image thumbnails
- [ ] Display type badges
- [ ] Display status badges
- [ ] Display special flag badges
- [ ] Show view counts
- [ ] Add bulk actions (optional)
- [ ] Test all filters

## PHASE 7: UPDATE FRONTEND POST DISPLAY
- [ ] Update post query to include new fields
- [ ] Display hero image
- [ ] Add read time indicator
- [ ] Add trending badge
- [ ] Update SEO metadata function
- [ ] Add JSON-LD structured data
- [ ] Create view counter API route
- [ ] Create ViewCounter component
- [ ] Add ViewCounter to post page
- [ ] Test view counter increments
- [ ] Test on mobile

## PHASE 8: HOMEPAGE FEATURED SECTION
- [ ] Create components/home/FeaturedPosts.tsx
- [ ] Add FeaturedPosts to homepage
- [ ] Create TrendingPosts component (optional)
- [ ] Create PillarPages component (optional)
- [ ] Mark some posts as featured
- [ ] Test featured section displays
- [ ] Test responsive layout

## PHASE 9: ENVIRONMENT & CONFIG
- [ ] Verify all env variables in .env
- [ ] Update .env.example
- [ ] Update .gitignore
- [ ] Add scripts to package.json
- [ ] Install missing dependencies

## PHASE 10: SEED DATA & TESTING
- [ ] Create prisma/seed.ts
- [ ] Run seed script
- [ ] Verify data in Prisma Studio
- [ ] Test create new post
- [ ] Test edit post
- [ ] Test image uploads
- [ ] Test homepage displays
- [ ] Test post pages
- [ ] Test filters work
- [ ] Test view counter
- [ ] Test SEO metadata
- [ ] Test mobile responsive
- [ ] Check for console errors

## PHASE 11: DEPLOYMENT PREP
- [ ] Prepare production env variables
- [ ] Run `npm run build`
- [ ] Fix build errors
- [ ] Test production build locally
- [ ] Run prisma generate on production
- [ ] Push database schema to production
- [ ] Git commit all changes
- [ ] Git push to repository
- [ ] Deploy to hosting platform
- [ ] Add env variables to hosting
- [ ] Test live site
- [ ] Verify Cloudinary works in production

## PHASE 12: DOCUMENTATION
- [ ] Update README.md
- [ ] Create/update CHANGELOG.md
- [ ] Delete test files
- [ ] Clean up console.logs
- [ ] Verify file structure
- [ ] Final git commit

## PHASE 13: OPTIONAL ENHANCEMENTS
- [ ] Add table of contents for pillar articles
- [ ] Add related posts section
- [ ] Add social sharing buttons
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