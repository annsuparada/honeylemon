# Travomad Architecture Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture Patterns](#architecture-patterns)
- [Service Layer Pattern](#service-layer-pattern)
- [API Route Pattern](#api-route-pattern)
- [Error Handling](#error-handling)
- [Configuration Management](#configuration-management)
- [Type System](#type-system)
- [Data Flow](#data-flow)
- [Testing Strategy](#testing-strategy)

## 🎯 Overview

Travomad follows a **layered architecture** pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────┐
│          Presentation Layer (Next.js)           │
│  - API Routes (Controllers)                     │
│  - Pages & Components                           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│            Service Layer                        │
│  - Business Logic                               │
│  - Data Transformation                          │
│  - Validation                                   │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│         Data Access Layer                       │
│  - Prisma ORM                                   │
│  - Database Queries                             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│              Database (MongoDB)                  │
└─────────────────────────────────────────────────┘
```

## 🏗️ Architecture Patterns

### 1. Controller-Service-Repository Pattern

The codebase uses a simplified version of this pattern:

- **Controllers** (`app/api/*/route.ts`): Thin HTTP request handlers
- **Services** (`lib/services/*`): Business logic and orchestration
- **Data Access** (`app/lib/postService.ts`, Prisma): Database queries

### 2. Separation of Concerns

- **API Routes**: Handle HTTP requests/responses, authentication, validation
- **Service Layer**: Contains business logic, data transformation, domain rules
- **Data Layer**: Database queries, data access operations
- **Utilities**: Reusable helper functions, pure utilities

### 3. Type Safety

- **TypeScript**: Full type coverage across the codebase
- **Zod Schemas**: Runtime validation for API inputs
- **Domain Types**: Type definitions organized by domain (`app/types/`)

## 🔧 Service Layer Pattern

### Overview

The service layer (`lib/services/`) contains business logic that is independent of HTTP concerns. Services handle:

- Business rules and validation
- Data transformation
- Domain logic
- Cross-cutting concerns

### Service Files

#### `lib/services/postService.ts`

Handles post-related business logic:

```typescript
// Business logic functions
export async function buildPostFilter(params: PostQueryParams): Promise<PostFilter | null>
export async function getPosts(filter: PostFilter, limit?: number)
export async function createPost(data: PostSchema, authorId: string)
export async function updatePost(data: UpdatePostSchema)
export async function deletePost(id: string)
```

**Responsibilities:**
- Building complex filters from query parameters
- Post creation/update/delete operations
- Read time and word count calculation
- Tag, FAQ, and ItemList handling
- Cascade deletion of related records

#### `lib/services/userService.ts`

Handles user-related business logic:

```typescript
export async function getAllUsers()
export async function emailExists(email: string): Promise<boolean>
export async function usernameExists(username: string): Promise<boolean>
export async function createUser(data: UserSchema)
export async function updateUser(data: EditUserSchema)
export async function deleteUser(data: DeleteUserSchema)
```

**Responsibilities:**
- User CRUD operations
- Password hashing (bcrypt)
- Duplicate checking (email, username)
- User validation

#### `lib/services/categoryService.ts`

Handles category-related business logic:

```typescript
export async function getAllCategories()
export async function categoryExistsByName(name: string): Promise<boolean>
export async function createCategory(data: CategorySchema)
export async function updateCategory(id: string, data: { name?: string; slug?: string })
export async function deleteCategory(id: string)
```

**Responsibilities:**
- Category CRUD operations
- Slug generation
- Duplicate checking
- Category validation

### Service Layer Principles

1. **Business Logic Only**: Services don't know about HTTP, Next.js, or request/response objects
2. **Single Responsibility**: Each service handles one domain (posts, users, categories)
3. **Error Throwing**: Services throw errors, which are caught and handled by API routes
4. **Reusability**: Services can be used by API routes, server actions, or other services
5. **Testability**: Pure business logic is easy to unit test

### Example: Service Usage

```typescript
// In API route (app/api/post/route.ts)
import { createPost } from "@/lib/services/postService";
import { handleError, successResponse } from "@/lib/middleware/errorHandler";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = postSchema.parse(body);
        
        // Call service layer
        const newPost = await createPost(validatedData, authorId);
        
        // Return response
        return successResponse({ post: newPost }, 201);
    } catch (error) {
        return handleError(error);
    }
}
```

## 🌐 API Route Pattern

### Standard Structure

All API routes follow a consistent pattern:

```typescript
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/helpers/auth";
import { serviceFunction } from "@/lib/services/domainService";
import { handleError, successResponse, UnauthorizedError } from "@/lib/middleware/errorHandler";
import { domainSchema } from "@/schemas/domainSchema";

export async function GET(req: Request) {
    try {
        // 1. Parse query parameters
        const { searchParams } = new URL(req.url);
        
        // 2. Call service layer
        const data = await serviceFunction(params);
        
        // 3. Return success response
        return successResponse({ data }, 200);
    } catch (error) {
        // 4. Handle errors
        return handleError(error);
    }
}

export async function POST(req: Request) {
    try {
        // 1. Authentication (if protected)
        const token = req.headers.get("authorization")?.split(" ")[1];
        const decoded = verifyToken(token || "");
        if (!decoded) {
            throw new UnauthorizedError();
        }
        
        // 2. Parse and validate request body
        const body = await req.json();
        const validatedData = domainSchema.parse(body);
        
        // 3. Call service layer
        const result = await serviceFunction(validatedData);
        
        // 4. Return success response
        return successResponse({ result }, 201);
    } catch (error) {
        // 5. Handle errors
        return handleError(error);
    }
}
```

### API Route Responsibilities

1. **HTTP Concerns**: Handle HTTP requests and responses
2. **Authentication**: Verify JWT tokens for protected routes
3. **Validation**: Parse and validate request data using Zod schemas
4. **Delegation**: Delegate business logic to service layer
5. **Error Handling**: Catch errors and return standardized responses

### Response Format

**Success Response:**
```typescript
{
    success: true,
    data: { /* response data */ }
}
```

**Error Response:**
```typescript
{
    error: "Error message",
    details?: { /* optional error details */ }
}
```

## 🛡️ Error Handling

### Centralized Error Handler

All errors are handled centrally via `lib/middleware/errorHandler.ts`:

```typescript
import { handleError, AppError, ValidationError, NotFoundError } from "@/lib/middleware/errorHandler";

// In API routes
try {
    // ... code that might throw
} catch (error) {
    return handleError(error);
}
```

### Error Classes

The codebase uses custom error classes for different scenarios:

- `AppError`: Base error class
- `ValidationError`: Validation failures (400)
- `UnauthorizedError`: Authentication failures (401)
- `NotFoundError`: Resource not found (404)
- `ConflictError`: Resource conflicts (409)
- `RateLimitError`: Rate limiting (429)

### Error Handling Flow

```
Service throws error
    ↓
API route catches error
    ↓
handleError() processes error
    ↓
Returns standardized NextResponse
```

### Example: Custom Error Usage

```typescript
// In service layer
if (!user) {
    throw new NotFoundError("User not found");
}

// In API route
try {
    const user = await getUserService(email);
} catch (error) {
    return handleError(error); // Automatically returns 404 with proper format
}
```

## ⚙️ Configuration Management

### Centralized Config

All environment variables are accessed through `lib/config.ts`:

```typescript
import config from "@/lib/config";

// Access configuration
const dbUrl = config.database.url;
const jwtSecret = config.jwt.secret;
const apiUrl = config.nextjs.apiUrl;
```

### Config Structure

```typescript
config = {
    database: { url: string },
    nextjs: { apiUrl: string, nodeEnv: "development" | "production" | "test" },
    jwt: { secret: string },
    email: { host, port, user, password, ... },
    cloudinary: { cloudName, apiKey, apiSecret },
    apis: { anthropic: { apiKey }, unsplash: { accessKey } },
    features: { promptDebugPreview?, promptDebugFull? }
}
```

### Benefits

1. **Type Safety**: TypeScript ensures correct config access
2. **Validation**: Required variables are validated at startup
3. **Centralized**: Single source of truth for configuration
4. **Error Messages**: Helpful error messages for missing variables

## 📦 Type System

### Type Organization

Types are organized by domain in `app/types/`:

- `app/types/post.ts`: Post-related types (`BlogPost`, `BlogPostInput`, etc.)
- `app/types/user.ts`: User-related types (`Author`, `AuthorUpdateData`, etc.)
- `app/types/category.ts`: Category types
- `app/types/api.ts`: API response types (`ApiResponse`, `ApiSuccess`, `ApiError`)
- `app/types/index.ts`: Re-exports all types

### Zod Schemas

Validation schemas are in `schemas/`:

- `schemas/postSchema.ts`: Post validation schemas
- `schemas/userSchema.ts`: User validation schemas
- `schemas/categorySchema.ts`: Category validation schemas

### Type Usage Pattern

```typescript
// Define Zod schema
export const postSchema = z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    // ...
});

// Infer TypeScript type from schema
type PostInput = z.infer<typeof postSchema>;

// Use in service layer
export async function createPost(data: PostInput, authorId: string) {
    // TypeScript knows the shape of `data`
}
```

## 🔄 Data Flow

### Creating a Post (Example)

```
1. Client Request
   POST /api/post
   {
       "title": "My Post",
       "content": "...",
       ...
   }
   
2. API Route (app/api/post/route.ts)
   - Extract JWT token
   - Validate authentication
   - Parse and validate request body with Zod
   - Call service layer
   
3. Service Layer (lib/services/postService.ts)
   - Check business rules (slug uniqueness, etc.)
   - Calculate read time and word count
   - Transform data
   - Call Prisma to create post
   
4. Data Access (Prisma)
   - Execute database queries
   - Handle relationships (tags, FAQs, etc.)
   - Return created post
   
5. Response
   - Service returns post data
   - API route wraps in successResponse()
   - Returns JSON to client
```

### Reading Posts (Example)

```
1. Client Request
   GET /api/post?status=PUBLISHED&limit=10
   
2. API Route (app/api/post/route.ts)
   - Parse query parameters
   - Build filter using service function
   - Call service to get posts
   
3. Service Layer (lib/services/postService.ts)
   - Build filter object from query params
   - Handle category lookup if needed
   - Call Prisma with filter
   - Transform and return posts
   
4. Data Access (Prisma)
   - Execute filtered query
   - Include relationships (author, category, tags)
   - Return posts
   
5. Response
   - Service returns posts array
   - API route wraps in successResponse()
   - Returns JSON to client
```

## 🧪 Testing Strategy

### Test Organization

Tests are organized at the root level in `__tests__/`:

```
__tests__/
├── api/              # API route tests
├── components/       # React component tests
├── dashboard/        # Dashboard component tests
├── libs/             # Library function tests
└── utils/            # Utility function tests
```

### Testing Patterns

1. **API Route Tests**: Test HTTP handlers, authentication, validation
2. **Service Tests**: Test business logic in isolation
3. **Component Tests**: Test React components with React Testing Library
4. **Utility Tests**: Test pure utility functions

### Example: Service Test

```typescript
// __tests__/libs/postService.test.ts
import { createPost } from "@/lib/services/postService";

describe("createPost", () => {
    it("should create a post with valid data", async () => {
        const postData = {
            title: "Test Post",
            content: "Test content",
            // ...
        };
        
        const post = await createPost(postData, "author-id");
        
        expect(post.title).toBe("Test Post");
    });
    
    it("should throw error if slug exists", async () => {
        // Test duplicate slug handling
    });
});
```

## 📚 Additional Resources

- [README.md](../README.md): Project overview and setup
- [PILLAR_PAGES.md](./PILLAR_PAGES.md): Pillar page system documentation
- [TESTING_GUIDE.md](../TESTING_GUIDE.md): Testing guidelines and examples

---

**Last Updated**: 2024
**Architecture Version**: 1.0

