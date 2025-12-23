# travomad

## Table of Contents

- [Todo](#todo)
  - [Dashboard Features](#dashboard-featurs)
  - [Update Write Page](#update-write-page)
- [SingleBlogPage Tasks](#singleblogpage-tasks)
  - [SEO & Metadata](#seo--metadata)
  - [Structured Data](#structured-data)
  - [UI Components](#ui-components)
  - [Content Display](#content-display)
  - [Table of Contents](#table-of-contents)
  - [Error Handling](#error-handling)
- [Structured Data Implementation](#structured-data-implementation---quick-todo)
  - [Goal](#goal)
  - [Tasks](#tasks)
  - [Success Criteria](#success-criteria)
  - [Test URL](#test-url)
  - [Timeline](#timeline)
  - [Need Help?](#need-help)

---

## Todo
- [x] Write tests for all api
    - [x] `api/categoty`
    - [x] `api/login`
    - [x] `api/post`
    - [x] `api/user` 
- [x] write tests for front end
    - [x] test for components
    - [x] test for all pages
- [x] update UI on sigle blog page 
- [x] update share buttons, display all the buttons, remove dropdown
- [x] add dropdow to seclect pageType on write page
- [x] add pagination to blog section
- [x] add loading when fetching blogs (client side)
- [x] update logo
- [x] Write tests for api actions
- [x] Write test for libs SSR

### Dashboard Featurs
    - [x] add filter by page on dashboard
    - [x] Sorting — e.g. by date
    - [x] Post counts by status — e.g. “Draft (3)”, “Published (12)”
    - [x] write all tests

### Update Write Page
    - [x] redirect save darft on write page to dashboard/blogs
    - [x] limit description to max at 300 char   
    - [x] write all tests


- [x] remove expried login token

- [x] create admin profile
- [x] update pasword
- [x] fix  Forgot your password request. check email before send reset password

- [x] render blog by page/category
- [x] update post not found page
- [x] update something went wrong
- [] update homepage
    - [] top hotel pick 
- [] deploy travomad.com on vercel
- [] password recovery, 
- [x] create newsletters feature
- [] Scheduled publishing

- [x] fetch tags when edit blog on write page
- [] Search — full-text search (title/description)
- [] Make tags clickable
- [x] Add schema markup (Article + FAQ)
- [x] Test with Google Rich Results

---

# SingleBlogPage Tasks

## SEO & Metadata
- [x] Generate dynamic metadata (title, description, keywords)
- [x] Open Graph tags for social sharing
- [x] Twitter Card metadata
- [x] Canonical URLs
- [x] Robots metadata (based on post status)
- [x] Author information in metadata

## Structured Data
- [x] Article Schema (JSON-LD)
- [x] BreadcrumbList Schema (JSON-LD)
- [x] BreadcrumbList Schema (JSON-LD)
- [x] FAQPage Schema (JSON-LD) - conditional rendering
- [x] ItemList Schema (JSON-LD) - conditional rendering

## UI Components
- [x] HeroSection with post title, description, category, author, date
- [x] Breadcrumb navigation (Home > Blog > Article)
- [x] ShareButton component for social sharing
- [x] Category badge display
- [x] Featured image with proper aspect ratio
- [x] FAQSection component (conditional)
- [x] Tags display with formatted names
- [x] CTA section (Call-to-action)
- [x] BlogSection for related posts

## Content Display
- [x] Sanitized HTML content rendering
- [x] Prose styling for article content
- [x] Related blog posts (6 posts, excluding current)
- [x] Dynamic content loading

## Table of Contents

### Code Implementation

#### 1. Extract headings from post content
- [x] Parse HTML to find all H2 (and H3 if needed) tags
- [x] Generate slug/ID for each heading (e.g., "grand-velas-riviera-maya")
- [x] Build array of { id, text, level } objects

#### 2. Add IDs to headings in content
- [x] Modify sanitized content to inject id attributes into H2/H3 tags
- [x] Ensure IDs are URL-safe (lowercase, no spaces, dashes only)

#### 3. Create ToC component
- [x] Build `<TableOfContents>` React component
- [x] Accept headings array as prop
- [x] Render nested list with anchor links
- [x] Add smooth scroll behavior

#### 4. Style the ToC
- [x] Design box/card styling
- [x] Add hover effects on links
- [x] Make responsive (hidden on mobile, visible on desktop)
- [x] Add "sticky" positioning for sidebar version

#### 5. Add active state tracking
- [x] Use Intersection Observer to track which section is visible
- [x] Highlight current section in ToC

## Error Handling
- [x] Post Not Found page
- [x] Error state with icon and message
- [x] Static page generation for better performance

---

# Structured Data Implementation - Quick Todo

## Goal
Add structured data to increase from **1 valid item → 4 valid items**

---

## Tasks

### 1. Add Article Schema
- [x] Copy Article JSON-LD code
- [x] Add to blog post template
- [x] Update headline, dates, author, image URL
- [x] Test with Google Rich Results Test

### 2. Add BreadcrumbList Schema
- [x] Copy BreadcrumbList JSON-LD code
- [x] Add to blog post template
- [x] Update URLs for Home > Blog > Article path
- [x] Test with Google Rich Results Test

### 3. Add ItemList Schema
- [x] Copy ItemList JSON-LD code
- [x] Add all 12 resort names and URLs
- [x] Add to blog post template
- [x] Test with Google Rich Results Test

### 4. Keep Existing FAQ Schema
- [x] Verify FAQ is still working
- [x] Make sure no duplicate questions

### 5. Deploy & Test
- [ ] Deploy to production
- [ ] Run Google Rich Results Test on live URL
- [ ] Confirm 4 valid items detected
- [ ] Fix any errors

---

## Success Criteria
✅ 4 valid items showing in Google Rich Results Test:
1. Article
2. BreadcrumbList  
3. ItemList
4. FAQ

---

## Test URL
https://search.google.com/test/rich-results

---

## Timeline
- **Implementation:** 30-60 minutes
- **Google detection:** 1-7 days
- **Visible in search:** 2-4 weeks

---

## Need Help?
- Test here: https://search.google.com/test/rich-results
- Docs: https://developers.google.com/search/docs/appearance/structured-data