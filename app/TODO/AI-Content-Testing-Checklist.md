# AI Content Generator - Manual Testing Checklist

This checklist covers manual testing of the AI Content Generator feature (Phases 1-13).

## Prerequisites

- [x] Ensure you're logged in to the dashboard
- [x] Verify environment variables are set:
  - [x] `ANTHROPIC_API_KEY` is configured
  - [x] `UNSPLASH_ACCESS_KEY` is configured (optional, for images)
  - [x] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are configured (optional, for images)

---

## Phase 1: Navigation & UI Setup

### Navigation
- [x] Navigate to dashboard
- [x] Verify "✨ AI Content Generator" appears in sidebar between "Blogs" and "Scheduled Publishing"
- [x] Verify sparkle icon is displayed
- [x] Click "AI Content Generator" navigation item
- [x] Verify page navigates to `/dashboard/ai-generate`
- [x] Verify page title/heading shows "AI Content Generator"
- [x] Verify navigation item shows active state when on the page

---

## Phase 2-3: Form Fields & Validation

### Content Type Selection
- [x] Verify three radio button options are visible:
  - [x] "Standalone Article" (should be selected by default)
  - [x] "New Pillar Page"
  - [x] "Add Cluster Pages"
- [x] Click "New Pillar Page"
  - [x] Verify form fields change (pillar-specific fields appear)
- [x] Click "Add Cluster Pages"
  - [x] Verify form fields change (cluster-specific fields appear)
  - [x] Verify pillar pages dropdown loads
- [x] Click "Standalone Article"
  - [x] Verify form fields change back to standalone fields

### Common Fields (Always Visible)
- [x] **Article Format**: Verify dropdown has options (Complete Guide, Listicle, etc.)
- [x] **Writing Tone**: Verify dropdown has options (Friendly, Professional, etc.)
- [x] **Target Audience**: Verify dropdown has options (First-time Travelers, etc.)
- [x] **Word Count**: Verify radio buttons work (Short, Medium, Long, etc.)
- [x] **Images**: Verify checkboxes work:
  - [x] "Include images every 400 words"
  - [x] "Generate hero image"
- [x] **SEO Keywords**: Verify text inputs work (optional fields)
  - [x] Primary keyword input
  - [x] Secondary keywords input
- [x] **Advanced Options**: Click to expand/collapse
  - [x] Verify Disclosure component works
  - [x] Verify checkboxes inside work (FAQ, Comparison Table, Pros & Cons)

### Standalone Article Fields
- [x] Select "Standalone Article"
- [x] Verify "Article Topic *" field appears
- [x] Enter topic (e.g., "Tokyo Food Guide")
- [x] Leave topic empty and submit → verify error message appears
- [x] Enter topic with less than 3 characters → verify error message appears
- [x] Enter valid topic → verify no error

### Pillar Page Fields
- [ ] Select "New Pillar Page"
- [ ] Verify "Pillar Topic *" field appears
- [ ] Verify "Auto-suggest cluster topics after generation" checkbox appears
- [ ] Enter pillar topic (e.g., "Complete Tokyo Travel Guide")
- [ ] Toggle "Auto-suggest cluster topics" checkbox
- [ ] Leave topic empty and submit → verify error message appears

### Cluster Pages Fields
- [ ] Select "Add Cluster Pages"
- [ ] Verify "Select Pillar Page *" dropdown appears
- [ ] Verify dropdown loads pillar pages (if any exist)
- [ ] Select a pillar page
- [ ] Verify "Cluster Topics" section appears with two options:
  - [ ] "Let AI suggest topics" (selected by default)
  - [ ] "Enter custom topics"
- [ ] With "Let AI suggest topics" selected:
  - [ ] Verify "Number of clusters" dropdown appears
  - [ ] Verify options: 3, 5, 8, 10
- [ ] Switch to "Enter custom topics":
  - [ ] Verify input fields appear
  - [ ] Verify "Add another topic" button works (up to 10 topics)
  - [ ] Verify "Remove" button works
  - [ ] Enter custom topics (at least one required)
  - [ ] Leave all topics empty and submit → verify error message
  - [ ] Enter topic with less than 3 characters → verify error message

### Form Validation
- [ ] Try submitting empty form → verify validation errors appear
- [ ] Fill required fields incorrectly → verify specific error messages
- [ ] Fill all fields correctly → verify no errors
- [ ] Verify "Cancel" button navigates back
- [ ] Verify "✨ Generate Content" button is enabled when form is valid
- [ ] Verify button shows disabled state visually (custom CSS class)

---

## Phase 4-6: Content Generation

### API Integration Test (Standalone Article)
- [ ] Fill form for Standalone Article:
  - [ ] Topic: "Best Travel Destinations in 2024"
  - [ ] Article Format: Complete Guide
  - [ ] Writing Tone: Friendly
  - [ ] Target Audience: First-time Travelers
  - [ ] Word Count: Medium
  - [ ] Include images: checked
  - [ ] Generate hero image: checked
- [ ] Click "✨ Generate Content"
- [ ] Verify loading/progress UI appears immediately
- [ ] Verify progress steps are displayed
- [ ] Wait for generation to complete (may take 30-60 seconds)
- [ ] Verify no error messages appear in console
- [ ] Verify review screen appears after generation

### Progress UI (Phase 10)
- [ ] While generating, verify progress bar updates
- [ ] Verify step-by-step checklist shows:
  - [ ] "Building your prompt..." (completes quickly)
  - [ ] "Writing article content..." (takes longest)
  - [ ] "Generating SEO metadata..."
  - [ ] "Finding perfect images..."
  - [ ] "Uploading images..."
  - [ ] "Optimizing content..."
  - [ ] "Finalizing..."
  - [ ] "Complete!"
- [ ] Verify completed steps show checkmark
- [ ] Verify active step shows spinner
- [ ] Verify estimated time displays (if implemented)

### Error Handling
- [ ] Test with invalid API key (if possible) → verify error message
- [ ] Test network error (disable internet) → verify error message
- [ ] Verify error state shows in progress UI

---

## Phase 7-9: Image Integration

### Hero Image
- [ ] Generate article with "Generate hero image" checked
- [ ] Verify hero image is fetched from Unsplash
- [ ] Verify hero image URL is returned in response
- [ ] Verify hero image appears in review screen (if implemented)

### Content Images
- [ ] Generate article with "Include images every 400 words" checked
- [ ] Verify images are searched from Unsplash
- [ ] Verify images are uploaded to Cloudinary
- [ ] Verify images are inserted into content at appropriate positions
- [ ] Verify images appear in article preview in review screen
- [ ] Verify image captions with photographer credits appear

### Image Edge Cases
- [ ] Generate article without images → verify no errors
- [ ] Test with image API failure (if possible) → verify graceful handling

---

## Phase 11: Review & Save Screen

### Article Preview
- [ ] Verify generated article preview displays correctly
- [ ] Verify HTML content renders properly
- [ ] Verify word count displays (e.g., "1,234 words")
- [ ] Verify read time displays (e.g., "5 min read")
- [ ] Verify preview is scrollable if content is long
- [ ] Verify images appear in preview (if included)

### Metadata Summary (Sidebar)
- [ ] Verify title displays correctly
- [ ] Verify meta description displays
- [ ] Verify focus keyword displays
- [ ] Verify tags display as chips/badges
- [ ] Verify category dropdown is populated
- [ ] Verify category can be selected

### Inline Editing
- [ ] Click on title → verify becomes editable input
- [ ] Edit title and blur → verify saves
- [ ] Click on meta description → verify becomes editable textarea
- [ ] Edit meta description and blur → verify saves

### Internal Links (Phase 12)
- [ ] If article contains `[LINK NEEDED: ...]` placeholders:
  - [ ] Verify warning banner appears: "X internal links need attention"
  - [ ] Click "Fix Internal Links First" button
  - [ ] Verify InternalLinkModal opens
  - [ ] Search for a post
  - [ ] Select a post
  - [ ] Verify placeholder is replaced with link (if implemented)
  - [ ] Verify modal closes
- [ ] If no links need fixing, verify no warning appears

### Suggested Cluster Topics (Pillar Pages Only)
- [ ] Generate a Pillar Page
- [ ] Verify "Suggested Cluster Topics" section appears in review screen
- [ ] Verify list of 8-10 suggested topics displays
- [ ] Verify topics are readable and relevant

### Action Buttons
- [ ] Verify "Save as Draft" button is visible
- [ ] Verify "Publish Now" button is visible
- [ ] Verify "Regenerate" button/link is visible
- [ ] Verify buttons are enabled when category is selected
- [ ] Verify buttons are disabled when category is not selected

---

## Phase 13: Save to Database

### Save as Draft
- [ ] Select a category in review screen
- [ ] Click "Save as Draft" button
- [ ] Verify loading spinner appears on button
- [ ] Verify success message appears: "Article saved as draft!"
- [ ] Verify redirect to `/dashboard/blogs` after ~1.5 seconds
- [ ] Navigate to blog list
- [ ] Verify new article appears in list
- [ ] Verify article status is "DRAFT"
- [ ] Click on article → verify it opens correctly
- [ ] Verify all content is saved correctly (title, content, metadata, etc.)

### Publish Now
- [ ] Generate a new article (or use existing one)
- [ ] Select a category
- [ ] Click "Publish Now" button
- [ ] Verify loading spinner appears
- [ ] Verify success message: "Article published successfully!"
- [ ] Verify redirect to `/dashboard/blogs`
- [ ] Verify article appears in blog list with "PUBLISHED" status
- [ ] Verify `publishedAt` timestamp is set
- [ ] Click on article → verify it opens correctly

### Tag Creation
- [ ] Generate article with new tags (tags that don't exist)
- [ ] Save article
- [ ] Verify tags are created in database
- [ ] Verify tags are associated with article

### Error Handling
- [ ] Try saving without selecting category → verify error message
- [ ] Test with duplicate title → verify error message (if applicable)
- [ ] Test with network error → verify error message

---

## Regeneration Flow

- [ ] Click "Regenerate" button in review screen
- [ ] Verify form appears again (with previous values, if saved)
- [ ] Verify review screen is hidden
- [ ] Generate new content
- [ ] Verify new content is different from previous

---

## Cross-Type Testing

### Standalone Article → End-to-End
- [ ] Complete full flow: Fill form → Generate → Review → Save as Draft
- [ ] Complete full flow: Fill form → Generate → Review → Publish

### Pillar Page → End-to-End
- [ ] Complete full flow: Fill form → Generate → Review → Save
- [ ] Verify pillar page flag is set correctly in database
- [ ] Verify suggested cluster topics appear (if auto-suggest enabled)

### Cluster Pages → End-to-End
- [ ] Complete full flow: Fill form → Generate → Review → Save
- [ ] Verify cluster page is associated with pillar page
- [ ] Verify cluster page flag is set correctly

---

## Browser/Device Testing

- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile device (responsive design)
- [ ] Test with different screen sizes

---

## Performance Testing

- [ ] Verify generation completes within reasonable time (< 2 minutes)
- [ ] Verify UI remains responsive during generation
- [ ] Verify no memory leaks during multiple generations
- [ ] Verify images load properly (if included)

---

## Accessibility Testing

- [ ] Verify keyboard navigation works (Tab, Enter, Escape)
- [ ] Verify form fields are properly labeled
- [ ] Verify error messages are accessible
- [ ] Verify progress indicators are accessible
- [ ] Test with screen reader (if available)

---

## Notes & Issues

Use this section to document any issues found during testing:

### Issue 1:
- **Description:**
- **Steps to Reproduce:**
- **Expected Behavior:**
- **Actual Behavior:**
- **Screenshots/Logs:**

### Issue 2:
- **Description:**
- **Steps to Reproduce:**
- **Expected Behavior:**
- **Actual Behavior:**
- **Screenshots/Logs:**

---

## Testing Status Summary

- **Total Test Cases:** 
- **Passed:** 
- **Failed:** 
- **Blocked:** 
- **Not Tested:** 

**Date Completed:** _______________

**Tester Name:** _______________

**Overall Status:** ⬜ Pass ⬜ Fail ⬜ Partial

