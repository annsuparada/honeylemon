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
- [x] Select "New Pillar Page"
- [x] Verify "Pillar Topic *" field appears
- [x] Verify "Auto-suggest cluster topics after generation" checkbox appears
- [x] Enter pillar topic (e.g., "Complete Tokyo Travel Guide")
- [x] Toggle "Auto-suggest cluster topics" checkbox
- [x] Leave topic empty and submit → verify error message appears

### Cluster Pages Fields
- [x] Select "Add Cluster Pages"
- [x] Verify "Select Pillar Page *" dropdown appears
- [x] Verify dropdown loads pillar pages (if any exist)
- [x] Select a pillar page
- [x] Verify "Cluster Topics" section appears with two options:
  - [x] "Let AI suggest topics" (selected by default)
  - [x] "Enter custom topics"
- [x] Switch to "Enter custom topics":
  - [x] Verify input fields appear
  - [x] Enter custom topics (at least one required)
  - [x] Leave all topics empty and submit → verify error message
  - [x] Enter topic with less than 3 characters → verify error message

### Form Validation
- [x] Try submitting empty form → verify validation errors appear
- [x] Fill required fields incorrectly → verify specific error messages
- [x] Fill all fields correctly → verify no errors
- [x] Verify "Cancel" button navigates back
- [x] Verify "✨ Generate Content" button is enabled when form is valid
- [x] Verify button shows disabled state visually (custom CSS class)

---

## Phase 4-6: Content Generation

### API Integration Test (Standalone Article)
- [x] Fill form for Standalone Article:
  - [x] Topic: "Best Travel Destinations in 2024"
  - [x] Article Format: Complete Guide
  - [x] Writing Tone: Friendly
  - [x] Target Audience: First-time Travelers
  - [x] Word Count: Medium
  - [x] Include images: checked
  - [x] Generate hero image: checked
- [x] Click "✨ Generate Content"
- [x] Wait for generation to complete (may take 30-60 seconds)
- [x] Verify no error messages appear in console
- [x] Verify review screen appears after generation

### Progress UI (Phase 10)
- [x] While generating, verify progress bar updates
- [x] Verify estimated time displays (if implemented)

### Error Handling
- [x] Test with invalid API key (if possible) → verify error message
- [x] Test network error (disable internet) → verify error message
- [x] Verify error state shows in progress UI

---

## Phase 7-9: Image Integration


## Phase 11: Review & Save Screen

### Article Preview
- [x] Verify generated article preview displays correctly
- [ ] Verify HTML content renders properly
- [x] Verify word count displays (e.g., "1,234 words")
- [x] Verify read time displays (e.g., "5 min read")
- [x] Verify preview is scrollable if content is long

### Metadata Summary (Sidebar)
- [x] Verify title displays correctly
- [x] Verify meta description displays
- [x] Verify focus keyword displays
- [x] Verify tags display as chips/badges
- [x] Verify category dropdown is populated
- [x] Verify category can be selected

### Inline Editing
- [x] Click on title → verify becomes editable input
- [x] Edit title and blur → verify saves
- [x] Click on meta description → verify becomes editable textarea
- [x] Edit meta description and blur → verify saves

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
- [x] Verify "Save as Draft" button is visible
- [x] Verify "Publish Now" button is visible
- [x] Verify "Regenerate" button/link is visible
- [x] Verify buttons are enabled when category is selected
- [x] Verify buttons are disabled when category is not selected

---

## Phase 13: Save to Database

### Save as Draft
- [x] Select a category in review screen
- [x] Click "Save as Draft" button
- [x] Verify loading spinner appears on button
- [x] Verify success message appears: "Article saved as draft!"
- [x] Verify redirect to `/dashboard/blogs` after ~1.5 seconds
- [x] Navigate to blog list
- [x] Verify new article appears in list
- [x] Verify article status is "DRAFT"
- [x] Click on article → verify it opens correctly
- [x] Verify all content is saved correctly (title, content, metadata, etc.)

### Publish Now
- [x] Generate a new article (or use existing one)
- [x] Select a category
- [x] Click "Publish Now" button
- [x] Verify loading spinner appears
- [x] Verify success message: "Article published successfully!"
- [x] Verify redirect to `/dashboard/blogs`
- [x] Verify article appears in blog list with "PUBLISHED" status
- [x] Verify `publishedAt` timestamp is set
- [x] Click on article → verify it opens correctly

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

- [x] Click "Regenerate" button in review screen
- [x] Verify form appears again (with previous values, if saved)
- [x] Verify review screen is hidden
- [x] Generate new content
- [x] Verify new content is different from previous

---

## Cross-Type Testing

### Standalone Article → End-to-End
- [x] Complete full flow: Fill form → Generate → Review → Save as Draft
- [x] Complete full flow: Fill form → Generate → Review → Publish

### Pillar Page → End-to-End
- [x] Complete full flow: Fill form → Generate → Review → Save
- [x] Verify pillar page flag is set correctly in database
- [x] Verify suggested cluster topics appear (if auto-suggest enabled)

### Cluster Pages → End-to-End
- [x] Complete full flow: Fill form → Generate → Review → Save
- [x] Verify cluster page is associated with pillar page
- [x] Verify cluster page flag is set correctly

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

- [x] Verify keyboard navigation works (Tab, Enter, Escape)
- [x] Verify form fields are properly labeled
- [x] Verify error messages are accessible
- [x] Verify progress indicators are accessible
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

