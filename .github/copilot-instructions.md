<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Todoist Clone Coding Guidelines

This is a Next.js 14 Todo application with TypeScript, Tailwind CSS, shadcn/ui, Prisma with PostgreSQL database, and NextAuth authentication.

## Project Structure
- App Router structure with `/app` directory
- Authentication system using NextAuth
- PostgreSQL database with Prisma ORM
- shadcn/ui components for UI

## Coding Style
- Use TypeScript for all components and API routes
- Use the App Router pattern for routing
- Maintain consistent file and folder naming:
  - Components: PascalCase
  - Files and folders: kebab-case
  - API routes: camelCase
- Write clean, maintainable code with proper error handling
- Use client components only when needed (interactivity, hooks, browser APIs)
- Follow React best practices and hooks rules

## Data Models
- User: Authentication and user details
- Task: The main todo items with titles, descriptions, priorities
- Category: For grouping tasks
- Subtask: For breaking down tasks into smaller pieces

## Authentication
- NextAuth with email/password authentication
- Session management with JWT strategy
- Protected routes for authenticated users

## UI Components
- Use shadcn/ui components when possible
- Follow Tailwind CSS best practices
- Ensure consistent dark/light mode support
- Make responsive designs for mobile and desktop