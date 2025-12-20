# Project: Pingly

## Overview

Pingly is a SMS & Messenger Marketing Platform built with Next.js 14. It enables businesses to manage marketing campaigns, contact lists, and analytics for SMS and messaging channels.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS
- **Auth**: NextAuth.js
- **State Management**: Zustand + TanStack Query
- **Payments**: Stripe
- **Deployment**: Vercel / Docker

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── (auth)/          # Authentication pages (login, register)
│   ├── (marketing)/     # Marketing/landing pages
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   └── dashboard/       # User dashboard
├── components/          # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── lib/                 # Utilities and configurations
│   ├── prisma.ts        # Prisma client singleton
│   ├── auth.ts          # NextAuth configuration
│   ├── stripe.ts        # Stripe configuration
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
├── services/            # API client and business logic
└── styles/              # Global styles
```

## Commands

- `npm run dev` - Development server (http://localhost:3000)
- `npm run build` - Production build
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint checking
- `npm run verify` - Full verification (typecheck + lint + build)
- `npm run verify:quick` - Quick verification (typecheck + lint)
- `npx prisma studio` - Database GUI
- `npx prisma generate` - Generate Prisma client

## Coding Conventions

- Functional components with React Hooks
- Use absolute imports with `@/` prefix
- Korean comments are OK, but use English for variable names
- Follow existing component patterns in `src/components/ui/`
- Use Zod for validation schemas
- Use react-hook-form for forms

## Environment Variables

Required in `.env.local`:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXTAUTH_URL` - Application URL
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## Testing

- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- Run `npm test` for unit tests
- Run `npm run e2e` for E2E tests

## Important Notes

- Always run `npx prisma generate` after schema changes
- Run `npm run verify` before deployment
- API keys should only be in `.env.local` (never commit)
- Use `@/` path aliases for imports
- Follow conventional commits (feat:, fix:, docs:, etc.)

## Current Focus

[Update this section with your current work]

## Design System Rules

### Available Components (USE THESE, DON'T CREATE NEW ONES)
```
src/components/ui/
├── button.tsx      - Button, buttonVariants
├── card.tsx        - Card, CardHeader, CardTitle, CardContent
├── dialog.tsx      - Dialog, DialogTrigger, DialogContent
├── form.tsx        - Form, FormField, FormItem, FormLabel
├── input.tsx       - Input
├── select.tsx      - Select, SelectTrigger, SelectContent
├── skeleton.tsx    - Skeleton
├── toast.tsx       - useToast, toast
└── states/         - EmptyState, ErrorState
```

### Import Paths
```tsx
// Correct imports
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/states/empty-state"
import { ErrorState } from "@/components/ui/states/error-state"

// WRONG - never create new components when they exist
import { Button } from "./Button"
```

### Color Rules (NEVER hardcode colors)
```tsx
// Correct - use CSS variables via Tailwind
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />
<span className="text-muted-foreground" />

// WRONG - hardcoded colors
<div className="bg-white text-gray-900" />
<button className="bg-blue-500 text-white" />
```

### Spacing Rules
- Component spacing: `space-y-4` or `gap-4`
- Section spacing: `py-8` or `my-8`
- Card padding: `p-6`
- Page container: `max-w-7xl mx-auto px-4 md:px-6 lg:px-8`

### Typography
- Page title: `text-2xl font-bold` (h1), `text-xl font-semibold` (h2)
- Body: `text-base text-foreground`
- Caption: `text-sm text-muted-foreground`

## Responsive Design Rules (MOBILE-FIRST MANDATORY)

### Breakpoint Order
```tsx
// Correct - mobile first, then scale up
className="w-full sm:w-1/2 lg:w-1/3"
className="text-2xl md:text-3xl lg:text-4xl"
className="flex-col md:flex-row"

// WRONG - desktop first
className="w-1/3 md:w-1/2 sm:w-full"
```

### Standard Breakpoints
- Default: Mobile (< 640px)
- md: 768px+ (tablets)
- lg: 1024px+ (desktop)
- Use only these 3 in most cases

### Touch Targets
- Minimum 44x44px for all interactive elements
- Use `min-h-11 min-w-11` for icon buttons

## UI State Requirements (MANDATORY FOR ALL DATA COMPONENTS)

### Every data-fetching component MUST implement:
1. **Loading State** - Use Skeleton, not Spinner
2. **Success State** - Actual data display
3. **Empty State** - Icon + title + description + CTA
4. **Error State** - Error message + retry button

### State Pattern
```tsx
if (isLoading) return <Skeleton />
if (isError) return <ErrorState onRetry={refetch} />
if (!data?.length) return <EmptyState action={...} />
return <ActualContent data={data} />
```

## Accessibility Requirements

- All images: meaningful `alt` text
- All form elements: connected `<label>`
- All buttons: clear text or `aria-label`
- Focus states: always visible (`focus-visible:ring-2`)
- Color contrast: 4.5:1 minimum

## Prohibited Actions

- NO inline styles
- NO `!important`
- NO hardcoded color values
- NO creating components that already exist in ui/
- NO Desktop-first responsive code

## Architecture Decisions

- Server Components by default, Client Components only when needed
- API routes for external integrations
- Prisma for type-safe database access
- Zustand for client-side state that needs persistence
- TanStack Query for server state management
