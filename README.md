# Ritualo Midterm Lab Work 2

A product inventory management application built with TanStack Start, React, Drizzle ORM, and SQLite.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (Full-stack React)
- **UI:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Database:** SQLite via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Testing:** [Vitest](https://vitest.dev/)
- **Linting/Formatting:** [Biome](https://biomejs.dev/)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

## Setup

### 1. Download and extract the project

1. Extract the ZIP file to your desired location.
2. Open a terminal and navigate to the extracted folder:

```bash
cd ritualo-midterm-lab-work-2-main
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create the environment file

The `.env.local` file is not included in the ZIP. Create it in the project root:

```bash
# Windows (Command Prompt)
echo DATABASE_URL="dev.db"> .env.local

# Windows (PowerShell)
'DATABASE_URL="dev.db"' | Out-File -Encoding utf8 .env.local

# macOS / Linux
echo 'DATABASE_URL="dev.db"' > .env.local
```

Or manually create a file named `.env.local` in the project root with the following content:

```
DATABASE_URL="dev.db"
```

### 4. Push the database schema

This creates the SQLite database file and sets up the tables:

```bash
npm run db:push
```

### 5. Seed the database

Populate the database with sample product data (25 products):

```bash
npm run db:seed
```

### 6. Run the development server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**.

## Quick Start (all commands)

```bash
npm install
echo 'DATABASE_URL="dev.db"' > .env.local
npm run db:push
npm run db:seed
npm run dev
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build |
| `npm run test` | Run tests with Vitest |
| `npm run lint` | Lint the codebase with Biome |
| `npm run format` | Format the codebase with Biome |
| `npm run check` | Run Biome checks (lint + format) |
| `npm run db:push` | Push the schema to the database |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run Drizzle migrations |
| `npm run db:seed` | Seed the database with sample data |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |

## Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  components/   # Reusable UI components
  data/         # Seed scripts and data utilities
  db/           # Database schema and connection
  hooks/        # Custom React hooks
  integrations/ # Third-party integrations
  lib/          # Utility functions
  routes/       # File-based routes (TanStack Router)
  server/       # Server-side logic
  styles.css    # Global styles (Tailwind CSS)
  env.ts        # Type-safe environment variables (T3 Env)
  router.tsx    # Router configuration
```
## Troubleshooting

- **`better-sqlite3` build errors:** Make sure you have the necessary build tools installed. On Windows, you may need to install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with the "Desktop development with C++" workload. On macOS, run `xcode-select --install`.
- **Database not found:** Ensure the `.env.local` file exists in the project root with `DATABASE_URL="dev.db"` and that you ran `npm run db:push` before starting the server.
- **Port 3000 already in use:** Stop any other process using port 3000, or modify the port in the `dev` script inside `package.json`.

## Learn More

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework
- [TanStack Router](https://tanstack.com/router) - Type-safe file-based routing
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Shadcn UI](https://ui.shadcn.com/) - Re-usable UI components
