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

## Architecture Decisions

- Server Components by default, Client Components only when needed
- API routes for external integrations
- Prisma for type-safe database access
- Zustand for client-side state that needs persistence
- TanStack Query for server state management
