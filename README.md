# travomad

Todo
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

Dashboard Featurs
    - [x] add filter by page on dashboard
    - [x] Sorting — e.g. by date
    - [x] Post counts by status — e.g. “Draft (3)”, “Published (12)”
    - [x] write all tests

update write page
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
- [ ] Test with Google Rich Results Test

### 3. Add ItemList Schema
- [ ] Copy ItemList JSON-LD code
- [ ] Add all 12 resort names and URLs
- [ ] Add to blog post template
- [ ] Test with Google Rich Results Test

### 4. Keep Existing FAQ Schema
- [ ] Verify FAQ is still working
- [ ] Make sure no duplicate questions

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

## Quick Reference: JSON-LD Code

### Article Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Top 12 Best All-Inclusive Resorts in Mexico for Every Traveler (2025 Update)",
  "description": "Discover the 12 best all-inclusive resorts in Mexico for couples, families, luxury lovers, and wellness seekers.",
  "image": "YOUR_FEATURED_IMAGE_URL",
  "datePublished": "2025-12-23",
  "dateModified": "2025-12-23",
  "author": {
    "@type": "Organization",
    "name": "Travomad"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Travomad",
    "logo": {
      "@type": "ImageObject",
      "url": "https://res.cloudinary.com/dejr86qx8/image/upload/v1749171379/Travomad/Logo_Redesign_3_usuub1.png"
    }
  }
}
</script>
```

### BreadcrumbList Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://travomad.vercel.app/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://travomad.vercel.app/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Top 12 Best All-Inclusive Resorts in Mexico",
      "item": "https://travomad.vercel.app/blog/top-12-best-all-inclusive-resorts-in-mexico-for-every-traveler-2025-update-6b65cfb2"
    }
  ]
}
</script>
```

### ItemList Schema
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Grand Velas Riviera Maya",
      "url": "https://trip.tp.st/k3xThnY1"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Le Blanc Spa Resort – Cancun",
      "url": "https://trip.tp.st/P8mI8pso"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Hotel Xcaret Mexico",
      "url": "https://trip.tp.st/OJcgr9to"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Secrets Maroma Beach Riviera Cancun",
      "url": "https://trip.tp.st/qSdtbDOP"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Hyatt Ziva Los Cabos",
      "url": "https://trip.tp.st/hhWY6gzS"
    },
    {
      "@type": "ListItem",
      "position": 6,
      "name": "Dreams Tulum Resort & Spa",
      "url": "https://trip.tp.st/o6s3YWEf"
    },
    {
      "@type": "ListItem",
      "position": 7,
      "name": "Marival Distinct – Nuevo Vallarta",
      "url": "https://trip.tp.st/htECVPWr"
    },
    {
      "@type": "ListItem",
      "position": 8,
      "name": "Zoëtry Paraiso de la Bonita",
      "url": "https://trip.tp.st/L2tL6Bj6"
    },
    {
      "@type": "ListItem",
      "position": 9,
      "name": "Excellence Playa Mujeres",
      "url": "https://trip.tp.st/K549L4Wv"
    },
    {
      "@type": "ListItem",
      "position": 10,
      "name": "TRS Yucatan Hotel",
      "url": "https://trip.tp.st/a0mFgRBJ"
    },
    {
      "@type": "ListItem",
      "position": 11,
      "name": "Garza Blanca Resort & Spa",
      "url": "https://trip.tp.st/A3FTKdxH"
    },
    {
      "@type": "ListItem",
      "position": 12,
      "name": "Barceló Maya Palace",
      "url": "https://trip.tp.st/SYiQWECr"
    }
  ]
}
</script>
```

---

## Where to Add Code
Add these `<script>` tags in your blog post template, typically:
- In the `<head>` section, OR
- Just before the closing `</body>` tag

All three can go one after another.

---

## Timeline
- **Implementation:** 30-60 minutes
- **Google detection:** 1-7 days
- **Visible in search:** 2-4 weeks

---

## Need Help?
- Test here: https://search.google.com/test/rich-results
- Docs: https://developers.google.com/search/docs/appearance/structured-data