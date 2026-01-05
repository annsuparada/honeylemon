# Pillar Pages System

## What is a Pillar Page?

A pillar page is a comprehensive, hub-style article that serves as the main resource for a topic. Cluster articles link back to pillars. Pillar pages anchor content clusters and provide a central hub for related articles.

## Rules

1. **Any page type can be a pillar** (BLOG_POST, DESTINATION, ITINERARY, GUIDE, DEAL, etc.)
   - The pillar status (`pillarPage: true`) is independent of page type
   - Page type determines where content appears (blog, destinations, itineraries)
   - Pillar status determines if it's a hub article

2. **DESTINATION/ITINERARY/GUIDE types: Only ONE pillar per tag**
   - Example: Only one "Mexico" pillar in DESTINATION type
   - This prevents duplicate destination cards on the destinations page
   - Multiple regular (non-pillar) articles with the same tag are allowed

3. **BLOG_POST type: No restriction**
   - Multiple BLOG_POST pillars are allowed
   - No duplicate prevention needed

4. **Pillars are marked with `pillarPage: true` in database**
   - Explicit flag in the Post model
   - Can be queried directly: `where: { pillarPage: true }`

## Usage

### Creating Pillar Pages

- Use "pillar" when creating comprehensive guides/hub articles
- Use "regular" for specific topic articles (clusters that link back to pillars)
- The system will prevent duplicate pillars for DESTINATION/ITINERARY/GUIDE types

### Display Rules

- **Destinations page** (`/destinations`): Displays only pillar DESTINATION posts
- **Blog page** (`/blog`): Excludes pillar pages by default (shows regular articles)
- **Dashboard**: Shows all posts, with pillar badges for easy identification

### Validation

- When saving a pillar page:
  - System checks if a pillar already exists for the same type + tag combination
  - If duplicate found, save is blocked with clear error message
  - Editing existing pillar is allowed (excludes current post from check)

- UI Warning:
  - Real-time warning appears when user checks pillar checkbox
  - Warns if a pillar already exists for selected destination
  - Prevents wasted time filling out the form

## Implementation Details

### Key Functions

- `checkPillarExists()` - Utility function to check if pillar exists
  - Location: `utils/pillarPageHelpers.ts`
  - Used by save handler and API endpoint

- `/api/check-pillar` - API endpoint for checking pillar existence
  - Used by UI for real-time warnings
  - Query params: `type`, `tagId`, `excludePostId` (optional)

### Database Schema

```prisma
model Post {
  // ...
  pillarPage  Boolean    @default(false)  // Is this pillar content?
  // ...
}
```

### Related Files

- `utils/handlers/savePostHandler.ts` - Validates duplicate pillars on save
- `utils/pillarPageHelpers.ts` - Helper function for pillar checks
- `app/api/check-pillar/route.ts` - API endpoint for pillar checks
- `app/write/page.tsx` - Post editor with pillar warning UI
- `app/lip/postService.ts` - Service functions with pillar filtering
- `app/destinations/[country]/page.tsx` - Only shows pillar destinations

## Examples

### Valid Pillar Configurations

```typescript
// ✅ OK - BLOG_POST pillar (multiple allowed)
type: BLOG_POST, pillarPage: true, tags: []

// ✅ OK - DESTINATION pillar (first one for "mexico" tag)
type: DESTINATION, pillarPage: true, tags: ["mexico"]

// ✅ OK - Regular DESTINATION article (not a pillar, can have many)
type: DESTINATION, pillarPage: false, tags: ["mexico"]

// ❌ BLOCKED - Duplicate DESTINATION pillar for "mexico" tag
type: DESTINATION, pillarPage: true, tags: ["mexico"]  // Already exists!
```

### Content Structure Example

```
Pillar Page: "Complete Mexico Travel Guide"
├── Cluster: "Best Beaches in Mexico"
├── Cluster: "Mexico City Guide"
├── Cluster: "Mexican Food Guide"
└── Cluster: "Budget Travel in Mexico"
```

All cluster articles link back to the pillar page, creating a content hub structure.

