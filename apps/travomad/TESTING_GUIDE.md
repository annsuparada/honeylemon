# Testing Pillar Page Improvements on Localhost

## Quick Start Guide

### Step 1: Ensure Dependencies are Installed
```bash
npm install
```

### Step 2: Set Up Database (if not already done)
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### Step 3: Start Development Server
```bash
npm run dev
```

The server will start at: **http://localhost:3000**

---

## Testing the Pillar Page Features

### Test 1: Create a BLOG_POST Pillar Page ✅

**Goal:** Verify that BLOG_POST can now be a pillar page (this was previously blocked)

1. Navigate to: `http://localhost:3000/write`
2. Login (if required)
3. Fill in the form:
   - **Title:** "Complete Guide to Budget Travel"
   - **Content:** Add some content
   - **Category:** Select any category
   - **Page Type:** Select `BLOG_POST`
   - **Pillar Page:** ✅ Check the box
   - **Tags:** (Optional for BLOG_POST)
4. Click **"Publish"** or **"Save Draft"**
5. ✅ **Expected:** Should save successfully (no error about BLOG_POST not being allowed)

---

### Test 2: Create a DESTINATION Pillar Page ✅

**Goal:** Verify basic pillar page creation works

1. Navigate to: `http://localhost:3000/write`
2. Fill in the form:
   - **Title:** "Complete Mexico Travel Guide"
   - **Content:** Add some content
   - **Category:** Select any category
   - **Page Type:** Select `DESTINATION`
   - **Tags:** Select "mexico" (or create if doesn't exist)
   - **Pillar Page:** ✅ Check the box
3. Click **"Publish"**
4. ✅ **Expected:** Should save successfully and redirect to `/destinations/mexico`

---

### Test 3: Try to Create Duplicate Pillar Page ❌

**Goal:** Verify duplicate prevention works

1. Navigate to: `http://localhost:3000/write`
2. Fill in the form:
   - **Title:** "Another Mexico Guide" (different title)
   - **Content:** Add some content
   - **Category:** Select any category
   - **Page Type:** Select `DESTINATION`
   - **Tags:** Select "mexico" (same tag as Test 2)
   - **Pillar Page:** ✅ Check the box
3. Click **"Publish"**
4. ❌ **Expected:** Should show error: "A pillar page already exists for this destination. Only one pillar page is allowed per destination..."

---

### Test 4: UI Warning Appears ⚠️

**Goal:** Verify real-time warning appears when checking pillar checkbox

1. Navigate to: `http://localhost:3000/write`
2. Select:
   - **Page Type:** `DESTINATION`
   - **Tags:** Select "mexico" (assuming you created a pillar in Test 2)
   - **Pillar Page:** ✅ Check the box
3. ⚠️ **Expected:** A warning should appear below the checkbox: "⚠️ A pillar page already exists for this destination. Creating this as a pillar will be blocked when you save..."
4. Uncheck the pillar checkbox
5. ✅ **Expected:** Warning should disappear

---

### Test 5: Create Regular (Non-Pillar) Article ✅

**Goal:** Verify non-pillar articles can be created with same tag

1. Navigate to: `http://localhost:3000/write`
2. Fill in the form:
   - **Title:** "Best Beaches in Mexico"
   - **Content:** Add some content
   - **Category:** Select any category
   - **Page Type:** Select `DESTINATION`
   - **Tags:** Select "mexico" (same as Test 2)
   - **Pillar Page:** ❌ Leave UNCHECKED
3. Click **"Publish"**
4. ✅ **Expected:** Should save successfully (no duplicate error because it's not a pillar)

---

### Test 6: Edit Existing Pillar Page ✅

**Goal:** Verify you can edit an existing pillar without duplicate error

1. Navigate to: `http://localhost:3000/dashboard/blogs`
2. Find the pillar page you created in Test 2 (should have "📚 Pillar" badge)
3. Click **"Edit"**
4. Make changes (e.g., update title or content)
5. Keep **Pillar Page** checked ✅
6. Click **"Publish"** or **"Save Draft"**
7. ✅ **Expected:** Should save successfully (no duplicate error because it's the same post)

---

### Test 7: Destinations Page Shows Only Pillars ✅

**Goal:** Verify destinations page only shows pillar pages

1. Navigate to: `http://localhost:3000/destinations`
2. ✅ **Expected:** Should only show DESTINATION posts where `pillarPage: true`
3. The regular article from Test 5 should NOT appear here
4. Only pillar pages should be displayed

---

### Test 8: Blog List Shows Pillar Indicators ✅

**Goal:** Verify pillar badges appear in dashboard

1. Navigate to: `http://localhost:3000/dashboard/blogs`
2. Look for posts with **"📚 Pillar"** badge
3. ✅ **Expected:** Pillar pages should have a purple badge showing "📚 Pillar"
4. Try filtering by "Pillar Pages Only" checkbox
5. ✅ **Expected:** Should only show pillar pages when checked

---

### Test 9: API Endpoint Works ✅

**Goal:** Verify the check-pillar API endpoint works

1. Open browser console (F12) or use curl/Postman
2. Call: `http://localhost:3000/api/check-pillar?type=DESTINATION&tagId=<tag-id>`
   - Replace `<tag-id>` with the actual ID of "mexico" tag
   - You can find tag IDs in the database or create a test post first
3. ✅ **Expected:** Should return JSON: `{ exists: true, message: "A pillar page already exists..." }` (if pillar exists)
   - Or: `{ exists: false, message: "No pillar page exists" }` (if no pillar)

---

### Test 10: Create Multiple BLOG_POST Pillars ✅

**Goal:** Verify BLOG_POST can have multiple pillars (no restriction)

1. Navigate to: `http://localhost:3000/write`
2. Create first BLOG_POST pillar:
   - **Page Type:** `BLOG_POST`
   - **Pillar Page:** ✅ Checked
   - **Title:** "Complete Guide to Budget Travel"
   - Publish
3. Navigate to: `http://localhost:3000/write`
4. Create second BLOG_POST pillar:
   - **Page Type:** `BLOG_POST`
   - **Pillar Page:** ✅ Checked
   - **Title:** "Ultimate Travel Packing Guide"
   - Publish
5. ✅ **Expected:** Both should save successfully (no duplicate error for BLOG_POST)

---

## Quick Test Checklist

- [ ] Can create BLOG_POST pillar page
- [ ] Can create DESTINATION pillar page
- [ ] Duplicate DESTINATION pillar shows error
- [ ] UI warning appears when checking pillar for existing destination
- [ ] Can create regular (non-pillar) article with same tag
- [ ] Can edit existing pillar without duplicate error
- [ ] Destinations page shows only pillar pages
- [ ] Blog list shows pillar badges
- [ ] Can filter by pillar pages in dashboard
- [ ] Multiple BLOG_POST pillars allowed

---

## Troubleshooting

### Server won't start?
- Check if port 3000 is already in use
- Ensure `.env` file exists with proper configuration
- Run `npm install` if you see module errors

### Database errors?
- Ensure MongoDB is running
- Run `npx prisma generate` and `npx prisma db push`
- Check `DATABASE_URL` in `.env` file

### Can't see pillar pages?
- Check if posts are published (not draft)
- Verify `pillarPage: true` in database
- Check browser console for errors

### API endpoint not working?
- Ensure development server is running
- Check browser Network tab for API responses
- Verify tag IDs are correct (use actual IDs from database)

---

## Additional Notes

- The `/write` page is protected - you may need to login first
- Check `/app/login` for login functionality
- Use browser DevTools (F12) to see console errors and network requests
- Check the database directly to verify `pillarPage` field values

