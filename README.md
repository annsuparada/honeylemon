# Travomad

> A modern, SEO-optimized travel blog and content management system built with Next.js 14, featuring comprehensive structured data, rich text editing, and a powerful admin dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.7-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19.1-2D3748)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.8.0-47A248)](https://www.mongodb.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## 🎯 Overview

Travomad is a full-featured travel blog platform designed for content creators and travel enthusiasts. It combines a beautiful, responsive frontend with a powerful content management system, ensuring optimal SEO performance and excellent user experience.

### Key Highlights

- **SEO-First Architecture**: Comprehensive structured data (Article, BreadcrumbList, FAQPage, ItemList schemas)
- **Rich Content Creation**: Advanced WYSIWYG editor with TipTap
- **Performance Optimized**: Server-side rendering, static page generation, and image optimization
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Well-Tested**: 366+ tests covering components, APIs, and utilities

## ✨ Features

### Content Management
- 📝 **Rich Text Editor**: TipTap-powered editor with formatting, tables, images, and more
- 🏷️ **Category & Tag System**: Organize content with flexible categorization
- 📊 **Content Types**: Support for Blog Posts, Pillar Articles, Cluster Articles, Listicles, Reviews, Guides, Destinations, Deals, and Itineraries
- 💾 **Draft System**: Save and manage drafts before publishing
- 🔍 **Advanced Filtering**: Filter posts by status, category, type, date, featured, pillar pages, and trending
- 🖼️ **Image Management**: Cloudinary integration for image uploads (URL and file upload)
- ⭐ **Special Flags**: Mark posts as Featured, Pillar Pages, or Trending
- 📊 **Analytics**: View counter and read time calculation for posts
- 🎯 **SEO Optimization**: Custom meta titles, descriptions, and focus keywords per post

### SEO & Performance
- 🎯 **Structured Data**: Automatic generation of Article, BreadcrumbList, FAQPage, and ItemList schemas
- 📱 **Open Graph & Twitter Cards**: Rich social media previews
- 🔗 **Canonical URLs**: Proper URL canonicalization
- 🤖 **Robots Meta**: Dynamic robots directives based on post status
- 📑 **Table of Contents**: Auto-generated TOC with scroll tracking
- ⚡ **Static Generation**: Pre-rendered pages for optimal performance

### User Experience
- 📱 **Fully Responsive**: Mobile-first design with Tailwind CSS
- 🎨 **Modern UI**: DaisyUI component library with custom theming
- 🔐 **Authentication**: Secure JWT-based authentication system
- 👤 **User Profiles**: User management with profile customization
- 📧 **Newsletter**: Email subscription and management system
- 🔔 **Email Campaigns**: Create and send email campaigns to subscribers

### Developer Experience
- 🧪 **Comprehensive Testing**: Jest and React Testing Library
- 🔧 **Type Safety**: Full TypeScript coverage
- 📦 **Modular Architecture**: Well-organized, maintainable codebase
- 🚀 **Fast Development**: Hot reload and optimized build process

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/)
- **Rich Text Editor**: [TipTap](https://tiptap.dev/)
- **Icons**: [Heroicons](https://heroicons.com/) + [React Icons](https://react-icons.github.io/react-icons/)

### Backend
- **Database**: [MongoDB](https://www.mongodb.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (jsonwebtoken)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Image Storage**: [Cloudinary](https://cloudinary.com/) for image uploads and optimization

### Development & Testing
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Linting**: ESLint + Next.js ESLint Config

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/travomad.git
   cd travomad
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your environment variables (see [Environment Variables](#environment-variables))

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
travomad/
├── __tests__/            # Test files (at root level)
│   ├── api/              # API route tests
│   ├── components/       # Component tests
│   ├── dashboard/        # Dashboard tests
│   ├── libs/             # Library function tests
│   └── utils/            # Utility function tests
├── app/                  # Next.js App Router
│   ├── api/              # API routes (thin controllers)
│   │   ├── ai-generate/  # AI content generation
│   │   ├── campaign/     # Email campaign endpoints
│   │   ├── category/     # Category management
│   │   ├── images/       # Image upload endpoints (Cloudinary)
│   │   ├── login/        # Authentication endpoints
│   │   ├── newsletter/   # Newsletter subscription
│   │   ├── post/         # Blog post CRUD operations
│   │   └── user/         # User management
│   ├── blog/             # Blog pages
│   │   ├── [slug]/       # Individual blog post pages
│   │   └── draft/        # Draft post preview
│   ├── components/       # Reusable React components
│   │   ├── layout/       # Layout components
│   │   └── tiptap/       # TipTap editor components
│   ├── dashboard/        # Admin dashboard
│   │   ├── ai-generate/  # AI content generation UI
│   │   ├── blogs/        # Blog management
│   │   ├── email/        # Email campaign management
│   │   ├── profile/      # User profile settings
│   │   ├── scheduled/    # Scheduled posts
│   │   └── seo/          # SEO management
│   ├── destinations/     # Destination pages
│   ├── itineraries/      # Itinerary pages
│   ├── lib/              # Library/utility functions (app-specific)
│   │   ├── cloudinary.ts              # Cloudinary configuration
│   │   ├── metadata-helpers.ts        # SEO metadata generation
│   │   ├── structured-data-helpers.ts # Structured data (JSON-LD)
│   │   ├── postService.ts             # Post data access layer
│   │   ├── readTime-helpers.ts        # Read time calculation
│   │   ├── toc-helpers.ts             # Table of contents generation
│   │   └── uploadToCloudinary.ts      # Image upload utilities
│   ├── types/            # TypeScript type definitions (domain-specific)
│   │   ├── api.ts        # API response types
│   │   ├── category.ts   # Category types
│   │   ├── post.ts       # Post types
│   │   ├── user.ts       # User types
│   │   └── index.ts      # Re-exports
│   └── write/            # Content creation interface
├── lib/                  # Shared library code (root level)
│   ├── services/         # Business logic services
│   │   ├── postService.ts      # Post business logic
│   │   ├── userService.ts      # User business logic
│   │   └── categoryService.ts  # Category business logic
│   ├── middleware/       # Middleware functions
│   │   └── errorHandler.ts     # Centralized error handling
│   ├── config.ts         # Centralized configuration management
│   ├── claude.ts         # Anthropic AI client
│   └── unsplash.ts       # Unsplash API client
├── prisma/               # Database
│   ├── schema.prisma     # Prisma schema definition
│   └── client.ts         # Prisma client instance
├── schemas/              # Zod validation schemas
│   ├── categorySchema.ts
│   ├── postSchema.ts
│   └── userSchema.ts
├── utils/                # Utility functions (organized by concern)
│   ├── actions/          # Server actions
│   │   ├── postActions.ts
│   │   ├── userAction.ts
│   │   ├── categoryAction.ts
│   │   ├── tagAction.ts
│   │   └── loginAction.ts
│   ├── handlers/         # Request handlers
│   │   └── savePostHandler.ts
│   ├── helpers/          # Pure utility functions
│   │   ├── routeHelpers.ts
│   │   ├── validation.ts
│   │   ├── pillarPageHelpers.ts
│   │   ├── promptBuilder.ts
│   │   ├── auth.ts
│   │   └── aiToPostMapper.ts
│   └── services/         # Additional business services
│       ├── emailService.ts
│       └── contentAssembler.ts
└── public/               # Static assets
```

### Key Architectural Principles

1. **Separation of Concerns**: 
   - API routes are thin controllers that handle HTTP requests/responses
   - Business logic lives in service layer (`lib/services/`)
   - Data access logic is in `app/lib/postService.ts` and service files

2. **Type Safety**:
   - Domain-specific types in `app/types/`
   - Zod schemas for validation in `schemas/`

3. **Error Handling**:
   - Centralized error handling via `lib/middleware/errorHandler.ts`
   - Standardized error responses across all API routes

4. **Configuration**:
   - Centralized config management in `lib/config.ts`
   - Type-safe environment variable access

For detailed architecture documentation, see [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## 💻 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm run prisma:generate` - Generate Prisma client

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write descriptive commit messages

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: 366+ tests covering components, utilities, and API routes
- **Test Framework**: Jest with React Testing Library
- **Coverage**: Components, API routes, utilities, and helpers

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

The project includes a `vercel-build` script that automatically generates the Prisma client before building.

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/travomad"

# Next.js
NEXT_PUBLIC_API_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="your-secret-key-here"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Cloudinary (for image uploads and optimization)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 📊 SEO Features

Travomad implements comprehensive SEO best practices:

- ✅ **Structured Data**: Article, BreadcrumbList, FAQPage, ItemList schemas
- ✅ **Meta Tags**: Dynamic title, description, keywords
- ✅ **Custom SEO Fields**: Per-post meta titles, descriptions, and focus keywords
- ✅ **Open Graph**: Rich social media previews
- ✅ **Twitter Cards**: Optimized Twitter sharing
- ✅ **Canonical URLs**: Prevents duplicate content issues
- ✅ **Hero Images**: SEO-optimized hero images for each post
- ✅ **Read Time**: Automatic read time calculation for better UX
- ✅ **Sitemap**: Auto-generated sitemap (if implemented)
- ✅ **Robots.txt**: Proper search engine directives

## 🖼️ Image Management

Travomad uses Cloudinary for image management:

- **URL Upload**: Upload images directly from URLs
- **File Upload**: Upload images from your device
- **Automatic Optimization**: Images are automatically optimized for web
- **CDN Delivery**: Fast image delivery via Cloudinary CDN
- **Hero Images**: Support for hero images on blog posts
- **Image Gallery**: Multiple images per post support

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write tests for new features
- Follow existing code style
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is private and proprietary.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- TipTap for the rich text editor
- All contributors and open-source libraries used

---

**Built with ❤️ using Next.js and TypeScript**

