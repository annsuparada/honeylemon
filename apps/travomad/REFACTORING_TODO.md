# Refactoring & Improvement TODO List

## 🎯 Overview
This document tracks all refactoring tasks, improvements, and theme color updates needed for the Honey Lemon codebase.

---

## 📋 Refactoring & Code Organization

### High Priority

#### 1. Folder Structure & Naming
- [x] **Rename `app/lip/` folder to `app/lib/`**
  - Current: `app/lip/` (unclear naming)
  - Target: `app/lib/` (standard library folder)
  - Files to update:
    - `app/lip/postService.ts` → `app/lib/postService.ts`
    - `app/lip/cloudinary.ts` → `app/lib/cloudinary.ts`
    - `app/lip/uploadToCloudinary.ts` → `app/lib/uploadToCloudinary.ts`
    - `app/lip/readTime-helpers.ts` → `app/lib/readTime-helpers.ts`
    - `app/lip/metadata-helpers.ts` → `app/lib/metadata-helpers.ts`
    - `app/lip/structured-data-helpers.ts` → `app/lib/structured-data-helpers.ts`
    - `app/lip/toc-helpers.ts` → `app/lib/toc-helpers.ts`
    - `app/lip/tiptapExtensions.ts` → `app/lib/tiptapExtensions.ts`
  - Update all imports across codebase

- [x] **Fix file naming issues**
  - [x] `utils/categotyAction.ts` → `utils/categoryAction.ts` (fix typo)
  - [x] `app/components/layout/ConditionalLayout.tsx.tsx` → `app/components/layout/ConditionalLayout.tsx` (remove double extension)
  - Update all imports

#### 2. Code Duplication
- [x] **Extract post mapping logic into shared function**
  - Current: Duplicated mapping in `app/lib/postService.ts` (getPublishedPosts, getFeaturedPosts, getTrendingPosts, etc.)
  - Create: `app/lib/mappers/postMapper.ts` with `mapPrismaPostToBlogPost()` function
  - Refactor all post service functions to use shared mapper

#### 3. Business Logic Extraction
- [x] **Extract business logic from API routes**
  - Current: Business logic mixed in API route handlers
  - Create service layer:
    - `lib/services/postService.ts` - Post business logic
    - `lib/services/userService.ts` - User business logic
    - `lib/services/categoryService.ts` - Category business logic
  - Keep API routes as thin controllers

#### 4. Utils Folder Reorganization
- [x] **Reorganize `utils/` folder structure**
  - Current: Mixed concerns (actions, services, helpers)
  - Target structure:
    ```
    utils/
    ├── services/        # Business logic services
    │   ├── emailService.ts
    │   └── contentAssembler.ts
    ├── repositories/   # Data access layer
    │   └── (future: if needed)
    ├── actions/        # Server actions
    │   ├── postActions.ts
    │   ├── userAction.ts
    │   ├── categoryAction.ts
    │   ├── tagAction.ts
    │   └── loginAction.ts
    ├── handlers/       # Request handlers
    │   └── savePostHandler.ts
    └── helpers/        # Pure utility functions
        ├── routeHelpers.ts
        ├── validation.ts
        ├── pillarPageHelpers.ts
        ├── promptBuilder.ts
        ├── auth.ts
        └── aiToPostMapper.ts
    ```
  - ✅ All files moved to appropriate folders
  - ✅ All imports updated across codebase
  - ✅ All test files updated

### Medium Priority

#### 5. Component Organization
- [ ] **Organize components by domain**
  - Current: Flat structure in `app/components/`
  - Target structure:
    ```
    components/
    ├── blog/           # Blog-specific components
    │   ├── BlogSection.tsx
    │   ├── SinglePostPage.tsx
    │   └── TrendingPosts.tsx
    ├── dashboard/      # Dashboard components
    │   └── (move dashboard-specific components)
    ├── forms/          # Form components
    │   ├── FormInput.tsx
    │   ├── SelectInput.tsx
    │   └── TagsInput.tsx
    ├── layout/         # Layout components
    │   ├── ConditionalLayout.tsx
    │   ├── Navigation.tsx
    │   └── Footer.tsx
    ├── ui/             # Shared UI components
    │   ├── AlertMessage.tsx
    │   ├── Breadcrumb.tsx
    │   └── PaginationClient.tsx
    └── tiptap/         # Editor components (keep as is)
    ```

#### 6. Type Definitions
- [ ] **Split `app/types.ts` into domain-specific files**
  - Create `types/` folder:
    ```
    types/
    ├── post.ts         # BlogPost, BlogPostInput, etc.
    ├── user.ts         # Author, AuthorUpdateData
    ├── api.ts          # ApiResponse, ApiSuccess, ApiError
    ├── category.ts     # Category
    └── index.ts        # Re-exports
    ```

#### 7. Error Handling
- [x] **Create centralized error handling**
  - Create `lib/middleware/errorHandler.ts`
  - Standardize error responses across API routes
  - Create error utility functions
  - ✅ Created error handler with custom error classes (AppError, ValidationError, UnauthorizedError, etc.)
  - ✅ Implemented handleError() function for standardized error responses
  - ✅ Added successResponse() and errorResponse() helper functions
  - ✅ Updated API routes (category, post, login) to use centralized error handling

#### 8. Configuration Management
- [x] **Create centralized config**
  - Create `lib/config.ts` or `config/` folder
  - Move environment variable access to config
  - Add validation for required env vars
  - ✅ Created `lib/config.ts` with type-safe configuration
  - ✅ Added validation for all required environment variables
  - ✅ Updated key files to use centralized config:
    - `utils/helpers/auth.ts` - JWT secret
    - `app/api/login/route.ts` - JWT secret
    - `app/lib/cloudinary.ts` - Cloudinary config
    - `lib/claude.ts` - Anthropic API key
    - `lib/unsplash.ts` - Unsplash API key
    - `utils/services/emailService.ts` - Email config
    - `app/api/newsletter/route.ts` - JWT secret and API URL
    - `app/lib/metadata-helpers.ts` - API URL
    - `app/lib/structured-data-helpers.ts` - API URL
    - `utils/helpers/promptBuilder.ts` - Feature flags

### Low Priority

#### 9. Testing Structure
- [x] **Move tests to root level**
  - Current: `app/tests/`
  - Target: `__tests__/` or `tests/` at root
  - Update Jest configuration
  - ✅ Moved all tests from `app/tests/` to `__tests__/` at root level
  - ✅ Updated relative imports in test files (../../api → ../app/api)
  - ✅ Jest configuration works with new location (testMatch pattern finds tests)
  - ✅ Verified tests can run from new location

#### 10. Documentation
- [x] **Update README with new structure**
- [x] **Add architecture documentation**
- [x] **Document service layer patterns**

---

## 🎨 Theme Color Updates

### Priority: High

#### 1. Convert Tailwind Color Classes to DaisyUI Theme

**Files to update:**

- [ ] **`app/components/BlogSection.tsx`**
  - `text-gray-500` → `text-base-content/60`
  - `text-gray-600` → `text-base-content/80`
  - `text-gray-900` → `text-base-content`
  - `bg-gray-50` → `bg-base-200`
  - `bg-red-50` → `bg-error/10`
  - `text-red-700` → `text-error`
  - `border-gray-900/5` → `border-base-content/5`

- [ ] **`app/components/SinglePostPage.tsx`**
  - `bg-neutral-900` → `bg-base-300` or `bg-neutral`
  - `text-white` → `text-base-content` (if on dark background)

- [ ] **`app/dashboard/page.tsx`**
  - `text-gray-900` → `text-base-content`
  - `text-gray-600` → `text-base-content/80`
  - `text-gray-500` → `text-base-content/60`
  - `bg-white` → `bg-base-100`
  - `bg-blue-100` → `bg-primary/20`
  - `text-blue-600` → `text-primary`
  - `bg-green-100` → `bg-success/20`
  - `text-green-600` → `text-success`
  - `bg-yellow-100` → `bg-warning/20`
  - `text-yellow-600` → `text-warning`
  - `bg-purple-100` → `bg-accent/20`
  - `text-purple-600` → `text-accent`
  - `bg-indigo-100` → `bg-info/20`
  - `text-indigo-600` → `text-info`
  - `bg-teal-100` → `bg-success/20`
  - `text-teal-600` → `text-success`
  - `bg-amber-100` → `bg-warning/20`
  - `text-amber-600` → `text-warning`
  - `bg-rose-100` → `bg-error/20`
  - `text-rose-600` → `text-error`
  - `hover:bg-gray-50` → `hover:bg-base-200`

- [ ] **`app/dashboard/blogs/components/DashboardBlogList.tsx`**
  - `text-gray-500` → `text-base-content/60`
  - `text-gray-700` → `text-base-content/90`
  - `bg-white` → `bg-base-100`
  - `text-red-500` → `text-error`

- [ ] **`app/dashboard/ai-generate/components/ArticleReview.tsx`**
  - `text-gray-600` → `text-base-content/80`
  - `text-gray-900` → `text-base-content`
  - `text-gray-700` → `text-base-content/90`
  - `text-gray-400` → `text-base-content/40`
  - `bg-gray-50` → `bg-base-200`
  - `text-blue-600` → `text-primary` or `text-info`
  - `hover:text-blue-600` → `hover:text-primary`

- [ ] **Other component files** (scan and update as needed)
  - Check all files in `app/components/` for hardcoded colors
  - Check all files in `app/dashboard/` for hardcoded colors

#### 2. Replace Inline Hex Color Styles

- [ ] **`app/dashboard/page.tsx`** (line 296)
  - `style={{ backgroundColor: '#9333ea', color: 'white', borderColor: '#9333ea' }}`
  - → `className="bg-accent text-accent-content border-accent"`

- [ ] **`app/dashboard/blogs/components/DashboardBlogList.tsx`** (line 71)
  - `style={{ backgroundColor: '#9333ea', color: 'white' }}`
  - → `className="bg-accent text-accent-content"`

- [ ] **`app/components/NewsLetterSection.tsx`** (line 129)
  - `from-[#ff80b5] to-[#9089fc]` (gradient)
  - → `from-accent to-primary` or use CSS variables

#### 3. Update CSS Files

- [ ] **`app/styles/article.css`**
  - `color: #1d4ed8;` → `color: hsl(var(--p));` (primary)
  - `color: #9333ea;` → `color: hsl(var(--a));` (accent)
  - `color: #9ca3af;` → `color: hsl(var(--bc) / 0.6);` (base-content with opacity)
  - `color: #6b7280;` → `color: hsl(var(--bc) / 0.7);`
  - `border: 1px solid #ddd;` → `border: 1px solid hsl(var(--bc) / 0.2);`
  - `background: #f4f4f4;` → `background: hsl(var(--b2));` (base-200)
  - `background: #f9f9f9;` → `background: hsl(var(--b2));`
  - `background: #1e1e1e;` → Keep as is (code blocks should stay dark)
  - `color: #ffcc66;` → Keep as is (code syntax highlighting)
  - `color: #2d2d2d;` → Keep as is (code background)

- [ ] **`app/write/styles.css`**
  - `background-color: #fff;` → `background-color: hsl(var(--b1));` (base-100)
  - `border: 1px solid #d1d5db;` → `border: 1px solid hsl(var(--bc) / 0.2);`
  - `background-color: #f3f4f6;` → `background-color: hsl(var(--b2));`
  - `color: #111827;` → `color: hsl(var(--bc));`
  - `color: #1f2937;` → `color: hsl(var(--bc));`
  - `background-color: #f9fafb;` → `background-color: hsl(var(--b2));`
  - `border-bottom: 2px solid #ddd;` → `border-bottom: 2px solid hsl(var(--bc) / 0.2);`
  - `border-left: 3px solid gray;` → `border-left: 3px solid hsl(var(--bc) / 0.3);`
  - `border-top: 1px solid gray;` → `border-top: 1px solid hsl(var(--bc) / 0.3);`
  - `color: #1d4ed8;` → `color: hsl(var(--p));` (primary)
  - `color: #9333ea;` → `color: hsl(var(--a));` (accent)
  - Code block colors: Keep dark theme as is (for syntax highlighting)

#### 4. Testing Theme Switching

- [ ] **Test all pages with different DaisyUI themes**
  - Light theme
  - Dark theme
  - Custom honeylemon theme
  - Other themes (cupcake, synthwave, etc.)
  - Verify all colors adapt correctly
  - Check contrast ratios for accessibility
  - Test on different components:
    - Blog pages
    - Dashboard pages
    - Forms
    - Buttons and badges
    - Navigation

---

## 📝 Color Conversion Reference

### Tailwind → DaisyUI Mapping

| Current Tailwind Class | DaisyUI Theme Class | Notes |
|------------------------|---------------------|-------|
| `text-gray-500` | `text-base-content/60` | 60% opacity |
| `text-gray-600` | `text-base-content/80` | 80% opacity |
| `text-gray-700` | `text-base-content/90` | 90% opacity |
| `text-gray-900` | `text-base-content` | Full opacity |
| `bg-gray-50` | `bg-base-200` | Light background |
| `bg-gray-100` | `bg-base-200` | Light background |
| `bg-white` | `bg-base-100` | Main background |
| `text-blue-600` | `text-primary` or `text-info` | Primary color |
| `bg-blue-100` | `bg-primary/20` | Primary with opacity |
| `text-red-700` | `text-error` | Error color |
| `bg-red-50` | `bg-error/10` | Error with opacity |
| `text-green-600` | `text-success` | Success color |
| `bg-green-100` | `bg-success/20` | Success with opacity |
| `text-yellow-600` | `text-warning` | Warning color |
| `bg-yellow-100` | `bg-warning/20` | Warning with opacity |
| `text-purple-600` | `text-accent` | Accent color |
| `bg-purple-100` | `bg-accent/20` | Accent with opacity |
| `#1d4ed8` (hex) | `bg-primary` or `text-primary` | Primary color |
| `#9333ea` (hex) | `bg-accent` or `text-accent` | Accent color |

### CSS Variables Reference

| CSS Variable | DaisyUI Color | Usage |
|--------------|---------------|-------|
| `hsl(var(--p))` | Primary | Main brand color |
| `hsl(var(--s))` | Secondary | Secondary brand color |
| `hsl(var(--a))` | Accent | Accent/highlight color |
| `hsl(var(--n))` | Neutral | Neutral gray |
| `hsl(var(--b1))` | Base-100 | Main background |
| `hsl(var(--b2))` | Base-200 | Secondary background |
| `hsl(var(--b3))` | Base-300 | Tertiary background |
| `hsl(var(--bc))` | Base-content | Text color (contrasts with base) |
| `hsl(var(--in))` | Info | Info color |
| `hsl(var(--su))` | Success | Success color |
| `hsl(var(--wa))` | Warning | Warning color |
| `hsl(var(--er))` | Error | Error color |

---

## ✅ Progress Tracking

### Refactoring
- **Total Tasks**: 10
- **Completed**: 7
- **In Progress**: 0
- **Pending**: 3

### Theme Colors
- **Total Tasks**: 4 main categories
- **Completed**: 0
- **In Progress**: 0
- **Pending**: 4

---

## 📌 Notes

- Test thoroughly after each change
- Ensure accessibility (contrast ratios) when switching themes
- Keep code block syntax highlighting dark (for readability)
- Some colors may need manual adjustment for specific themes
- Consider creating a theme preview page to test all components

---

**Last Updated**: 2024
**Status**: Planning Phase

