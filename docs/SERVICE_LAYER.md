# Service Layer Pattern Documentation

## 📋 Overview

The service layer (`lib/services/`) contains business logic that is independent of HTTP concerns. Services handle domain-specific operations, data transformation, validation, and business rules.

## 🎯 Principles

### 1. Business Logic Only
Services don't know about HTTP, Next.js, or request/response objects. They operate on domain models and return domain objects.

### 2. Single Responsibility
Each service handles one domain:
- `postService.ts` - Post-related business logic
- `userService.ts` - User-related business logic
- `categoryService.ts` - Category-related business logic

### 3. Error Throwing
Services throw errors, which are caught and handled by API routes or other consumers.

### 4. Reusability
Services can be used by:
- API routes (HTTP handlers)
- Server actions
- Other services
- Background jobs

### 5. Testability
Pure business logic is easy to unit test without mocking HTTP concerns.

## 📁 Service Files

### `lib/services/postService.ts`

Handles all post-related business logic.

#### Key Functions

```typescript
/**
 * Build filter object from query parameters
 */
export async function buildPostFilter(params: PostQueryParams): Promise<PostFilter | null>

/**
 * Get posts with filters
 */
export async function getPosts(filter: PostFilter, limit?: number)

/**
 * Check if a post slug already exists
 */
export async function postSlugExists(slug: string): Promise<boolean>

/**
 * Create a new post
 */
export async function createPost(data: z.infer<typeof postSchema>, authorId: string)

/**
 * Get a post by ID
 */
export async function getPostById(id: string)

/**
 * Update a post
 */
export async function updatePost(data: z.infer<typeof updatePostSchema>)

/**
 * Delete a post and all related records
 */
export async function deletePost(id: string)
```

#### Responsibilities

1. **Filter Building**: Convert query parameters into Prisma filter objects
2. **Post Creation**: Validate slug uniqueness, calculate read time, handle relationships
3. **Post Updates**: Handle partial updates, recalculate read time when content changes
4. **Post Deletion**: Cascade deletion of related records (tags, FAQs, comments, etc.)
5. **Read Time Calculation**: Automatic calculation of read time and word count
6. **Relationship Management**: Handle tags, FAQs, and ItemListItems

#### Example Usage

```typescript
// In API route
import { createPost } from "@/lib/services/postService";

export async function POST(req: Request) {
    const body = await req.json();
    const validatedData = postSchema.parse(body);
    
    // Service handles business logic
    const newPost = await createPost(validatedData, authorId);
    
    return successResponse({ post: newPost }, 201);
}
```

#### Business Rules

- **Slug Uniqueness**: Each post must have a unique slug
- **Read Time**: Automatically calculated from content length
- **Cascade Deletion**: Deleting a post removes related FAQs, ItemListItems, tags, and comments
- **Tag Management**: Tags are managed through PostTag junction table

### `lib/services/userService.ts`

Handles all user-related business logic.

#### Key Functions

```typescript
/**
 * Get all users
 */
export async function getAllUsers()

/**
 * Check if email already exists
 */
export async function emailExists(email: string): Promise<boolean>

/**
 * Check if username already exists
 */
export async function usernameExists(username: string): Promise<boolean>

/**
 * Get user by email
 */
export async function getUserByEmail(email: string)

/**
 * Create a new user
 */
export async function createUser(data: z.infer<typeof userSchema>)

/**
 * Update a user
 */
export async function updateUser(data: z.infer<typeof editUserSchema>)

/**
 * Delete a user
 */
export async function deleteUser(data: z.infer<typeof deleteUserSchema>)
```

#### Responsibilities

1. **User Creation**: Validate uniqueness (email, username), hash passwords
2. **User Updates**: Handle email changes, partial updates
3. **User Deletion**: Remove user from database
4. **Validation**: Check for duplicate emails/usernames

#### Example Usage

```typescript
// In API route
import { createUser } from "@/lib/services/userService";

export async function POST(req: Request) {
    const body = await req.json();
    const validatedData = userSchema.parse(body);
    
    // Service handles password hashing and validation
    const newUser = await createUser(validatedData);
    
    return successResponse({ user: newUser }, 201);
}
```

#### Business Rules

- **Email Uniqueness**: Each user must have a unique email
- **Username Uniqueness**: Each user must have a unique username
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Email Updates**: When updating email, system checks if new email is available

### `lib/services/categoryService.ts`

Handles all category-related business logic.

#### Key Functions

```typescript
/**
 * Get all categories
 */
export async function getAllCategories()

/**
 * Check if category already exists by name
 */
export async function categoryExistsByName(name: string): Promise<boolean>

/**
 * Generate slug from name
 */
export function generateCategorySlug(name: string): string

/**
 * Create a new category
 */
export async function createCategory(data: z.infer<typeof categorySchema>)

/**
 * Get category by ID
 */
export async function getCategoryById(id: string)

/**
 * Update a category
 */
export async function updateCategory(id: string, data: { name?: string; slug?: string })

/**
 * Delete a category
 */
export async function deleteCategory(id: string)
```

#### Responsibilities

1. **Category Creation**: Validate uniqueness, generate slugs
2. **Category Updates**: Handle name and slug updates
3. **Category Deletion**: Remove category from database
4. **Slug Generation**: Auto-generate slugs from category names

#### Example Usage

```typescript
// In API route
import { createCategory } from "@/lib/services/categoryService";

export async function POST(req: Request) {
    const body = await req.json();
    const validatedData = categorySchema.parse(body);
    
    // Service handles slug generation and validation
    const newCategory = await createCategory(validatedData);
    
    return successResponse({ category: newCategory }, 201);
}
```

#### Business Rules

- **Name Uniqueness**: Each category must have a unique name
- **Slug Generation**: If slug not provided, auto-generate from name
- **Slug Format**: Lowercase, spaces replaced with hyphens

## 🔄 Service Layer Flow

### Creating a Resource

```
1. API Route receives request
   ↓
2. Validates request data with Zod schema
   ↓
3. Calls service function with validated data
   ↓
4. Service executes business logic:
   - Validates business rules
   - Transforms data
   - Calculates derived fields
   - Handles relationships
   ↓
5. Service calls Prisma to persist data
   ↓
6. Service returns domain object
   ↓
7. API route wraps in successResponse()
   ↓
8. Returns JSON to client
```

### Reading Resources

```
1. API Route receives request
   ↓
2. Parses query parameters
   ↓
3. Calls service function to build filters
   ↓
4. Service builds filter object:
   - Resolves category slugs to IDs
   - Validates filter parameters
   - Constructs Prisma where clause
   ↓
5. Service calls Prisma to query data
   ↓
6. Service transforms Prisma results to domain objects
   ↓
7. Service returns domain objects
   ↓
8. API route wraps in successResponse()
   ↓
9. Returns JSON to client
```

## 📝 Service Layer Best Practices

### 1. Error Handling

Services should throw meaningful errors:

```typescript
// ✅ Good: Throw specific errors
if (!user) {
    throw new Error("User not found");
}

// ✅ Better: Use custom error classes
if (!user) {
    throw new NotFoundError("User not found");
}

// ❌ Bad: Return null/undefined
if (!user) {
    return null; // API route doesn't know how to handle this
}
```

### 2. Validation

Services should validate business rules:

```typescript
// ✅ Good: Validate before creating
if (await emailExists(data.email)) {
    throw new Error("Email already exists");
}

// ✅ Good: Validate before updating
const user = await getUserByEmail(data.email);
if (!user) {
    throw new Error("User not found");
}
```

### 3. Data Transformation

Services should transform data as needed:

```typescript
// ✅ Good: Transform Prisma results to domain objects
const posts = rawPosts.map(post => ({
    ...post,
    tags: post.tags.map(pt => pt.tag),
}));

// ✅ Good: Calculate derived fields
const readTime = calculateReadTime(data.content);
const wordCount = calculateWordCount(data.content);
```

### 4. Relationship Handling

Services should handle related data:

```typescript
// ✅ Good: Handle relationships explicitly
if (data.tagIds && data.tagIds.length > 0) {
    await prisma.postTag.deleteMany({ where: { postId: data.id } });
    await prisma.postTag.createMany({
        data: data.tagIds.map(tagId => ({ postId: data.id, tagId })),
    });
}
```

### 5. Idempotency

Services should handle idempotent operations:

```typescript
// ✅ Good: Check before creating
if (await postSlugExists(data.slug)) {
    throw new Error("Slug already exists");
}

// ✅ Good: Update only if changed
if (data.name !== category.name) {
    // Update name
}
```

## 🧪 Testing Services

### Unit Testing Services

Services are easy to test because they don't depend on HTTP:

```typescript
// __tests__/libs/postService.test.ts
import { createPost } from "@/lib/services/postService";

describe("createPost", () => {
    it("should create a post with valid data", async () => {
        const postData = {
            title: "Test Post",
            content: "Test content",
            slug: "test-post",
            // ...
        };
        
        const post = await createPost(postData, "author-id");
        
        expect(post.title).toBe("Test Post");
        expect(post.slug).toBe("test-post");
    });
    
    it("should throw error if slug exists", async () => {
        // Create post with slug "test-post"
        await createPost({ ...postData, slug: "test-post" }, "author-id");
        
        // Try to create another post with same slug
        await expect(
            createPost({ ...postData, slug: "test-post" }, "author-id")
        ).rejects.toThrow("Slug already exists");
    });
    
    it("should calculate read time automatically", async () => {
        const longContent = "This is a long content. ".repeat(100);
        const post = await createPost(
            { ...postData, content: longContent },
            "author-id"
        );
        
        expect(post.readTime).toBeGreaterThan(0);
        expect(post.wordCount).toBeGreaterThan(0);
    });
});
```

### Mocking Dependencies

When testing services, you may need to mock Prisma:

```typescript
// Mock Prisma client
jest.mock("@/prisma/client", () => ({
    __esModule: true,
    default: {
        post: {
            findFirst: jest.fn(),
            create: jest.fn(),
            // ...
        },
    },
}));
```

## 🔗 Integration with API Routes

### Pattern

```typescript
// app/api/post/route.ts
import { createPost } from "@/lib/services/postService";
import { handleError, successResponse } from "@/lib/middleware/errorHandler";

export async function POST(req: Request) {
    try {
        // 1. Authentication (if needed)
        const token = req.headers.get("authorization")?.split(" ")[1];
        const decoded = verifyToken(token || "");
        if (!decoded) {
            throw new UnauthorizedError();
        }
        
        // 2. Parse and validate request
        const body = await req.json();
        const validatedData = postSchema.parse(body);
        
        // 3. Call service layer
        const newPost = await createPost(validatedData, decoded.userId);
        
        // 4. Return success response
        return successResponse({ post: newPost }, 201);
    } catch (error) {
        // 5. Handle errors
        return handleError(error);
    }
}
```

### Benefits

1. **Thin Controllers**: API routes are thin and focused on HTTP concerns
2. **Reusable Logic**: Services can be used from multiple places
3. **Testability**: Services can be tested independently of HTTP
4. **Maintainability**: Business logic is centralized and easy to modify

## 📚 Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): Overall architecture documentation
- [README.md](../README.md): Project overview and setup
- [TESTING_GUIDE.md](../TESTING_GUIDE.md): Testing guidelines

---

**Last Updated**: 2024
**Service Layer Version**: 1.0

