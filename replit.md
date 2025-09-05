# Overview

MCBE TIERS is a web application for managing and displaying a Minecraft Bedrock PvP tier list. The application allows users to view player rankings across different game modes (Bridge, Skywars, Crystal, Midfight, UHC, Nodebuff, Bedfight, Sumo) and provides administrative functionality for managing player data. The system tracks player performance tiers ranging from High S-tier (HT1) to D-tier (LT5) with a "Not Ranked" (NR) option.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a dark theme design system using CSS custom properties
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Handling**: React Hook Form with Zod validation resolver

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Development Tools**: TSX for development server with hot reloading
- **Build Process**: ESBuild for production bundling

## Data Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with migrations support
- **Schema**: Shared TypeScript schema definitions between client and server
- **Validation**: Zod schemas for runtime type checking and validation
- **Storage**: Currently using in-memory storage with seeded data, designed to migrate to PostgreSQL

## Authentication & Security
- **Authentication**: Simple password-based admin authentication
- **Session Management**: Placeholder for session handling (ready for connect-pg-simple integration)
- **Authorization**: Admin-only access to player management functionality

## Key Design Patterns
- **Monorepo Structure**: Organized into `client/`, `server/`, and `shared/` directories
- **Type Safety**: End-to-end TypeScript with shared interfaces and Zod validation
- **Component Architecture**: Reusable UI components with consistent design tokens
- **API Design**: RESTful endpoints with proper error handling and logging
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Data Model
The core entity is a Player with the following structure:
- Identity: id, name, title
- Game Mode Tiers: bridgeTier, skywarsTier, crystalTier, midfightTier, uhcTier, nodebuffTier, bedfightTier, sumoTier
- Status: isRetired flag for inactive players
- Tier Values: HT1-HT3 (High tiers), LT1-LT5 (Low tiers), NR (Not Ranked)

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting platform
- **Database URL**: Environment variable-based connection configuration

## UI Framework Dependencies
- **Radix UI**: Headless component primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library for consistent design
- **Lucide Icons**: Icon library for UI elements

## Development Tools
- **Vite**: Frontend build tool and development server
- **Replit Integration**: Development environment with runtime error handling
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Runtime Libraries
- **TanStack Query**: Data fetching and caching
- **Wouter**: Lightweight routing library
- **React Hook Form**: Form state management
- **date-fns**: Date manipulation utilities
- **clsx/tailwind-merge**: Conditional CSS class handling