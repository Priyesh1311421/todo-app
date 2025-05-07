# Todoist Clone

A modern task management application built with Next.js, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- **User Authentication**: Secure email and password-based authentication
- **Task Management**: Create, update, and delete tasks
- **Priority Levels**: Assign priority levels to tasks (Low, Normal, High, Urgent)
- **Due Dates**: Set and track due dates for tasks
- **Categories**: Organize tasks into custom categories
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui component library
  - React-Hook-Form for form handling

- **Backend**:
  - Next.js API Routes
  - NextAuth.js for authentication
  - Prisma ORM for database operations

- **Database**:
  - PostgreSQL

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todoist?schema=public"
   NEXTAUTH_SECRET="your-nextauth-secret"
   ```
4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/src/app`: Main application code using Next.js App Router
  - `/api`: API routes for backend operations
  - `/auth`: Authentication-related pages (signin, signup)
  - `/dashboard`: Task management dashboard
- `/src/components`: Reusable React components
- `/prisma`: Prisma schema and migrations
- `/public`: Static assets

## Development

### Database

This project uses Prisma ORM to interact with the PostgreSQL database. The schema is defined in `prisma/schema.prisma`.

### Adding a New Feature

1. Create necessary database models in `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name feature-name` to update the database
3. Create API routes in `/src/app/api`
4. Create UI components in `/src/components`
5. Add pages in `/src/app`

## License

This project is licensed under the MIT License.
