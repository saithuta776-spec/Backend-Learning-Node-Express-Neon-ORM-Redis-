# Backend Template — Express + TypeScript + Prisma 7 + Neon

A reusable backend starter template built with **Node.js, Express, TypeScript, Prisma 7, and PostgreSQL hosted on Neon**.

The purpose of this repository is to provide a clean backend foundation that can be cloned and reused for future projects without repeating the complete backend setup process.

## Tech Stack

* **Node.js** — JavaScript runtime for the backend
* **Express** — Backend web framework
* **TypeScript** — Type-safe JavaScript
* **Prisma 7** — ORM for database access
* **PostgreSQL** — Relational database
* **Neon** — Cloud-hosted PostgreSQL database
* **tsx** — Runs TypeScript during development

## Project Structure

```text
template-prisma-7/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── generated/
│   │   └── prisma/
│   ├── lib/
│   │   └── prisma.ts
│   ├── index.ts
│   └── script.ts
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── prisma.config.ts
└── tsconfig.json
```

## Requirements

Before using this template, install:

* Node.js
* npm
* A Neon account
* Git

No local PostgreSQL installation is required because the database is hosted by Neon.

## Installation

Clone the repository:

```bash
git clone git@github.com:saithuta776-spec/Backend-Template-Express-TypeScript-Prisma-7-Neon.git
```

Enter the project:

```bash
cd Backend-Template-Express-TypeScript-Prisma-7-Neon
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```bash
touch .env
```

Add your Neon PostgreSQL connection string:

```env
DATABASE_URL="your-neon-postgresql-connection-string"
```

Do not commit `.env` to GitHub.

## Prisma Setup

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply the existing migrations to your database:

```bash
npx prisma migrate deploy
```

For local development when creating a new migration:

```bash
npx prisma migrate dev --name init
```

## Database Seeding

Run the seed script:

```bash
npx prisma db seed
```

The seed file is located at:

```text
prisma/seed.ts
```

## Development

Start the development server:

```bash
npm run dev
```

The server runs on:

```text
http://localhost:5000
```

## Testing the Database Connection

Run:

```bash
npx tsx src/script.ts
```

This executes a simple Prisma query and displays the users stored in the PostgreSQL database.

## Prisma Studio

To open Prisma Studio:

```bash
npx prisma studio
```

Then open:

```text
http://localhost:5555
```

Prisma Studio allows you to view and manage your database records through a browser interface.

Press `Control + C` in the terminal to stop Prisma Studio.

## Build

Compile the TypeScript project:

```bash
npm run build
```

The compiled JavaScript files are generated inside:

```text
dist/
```

## Production Start

After building the project:

```bash
npm start
```

This runs:

```bash
node dist/index.js
```

## Available Scripts

| Command                                | Purpose                                         |
| -------------------------------------- | ----------------------------------------------- |
| `npm run dev`                          | Start development server with automatic restart |
| `npm run build`                        | Compile TypeScript into JavaScript              |
| `npm start`                            | Run the compiled production server              |
| `npx prisma generate`                  | Generate Prisma Client                          |
| `npx prisma migrate dev --name <name>` | Create and apply a development migration        |
| `npx prisma migrate deploy`            | Apply existing migrations                       |
| `npx prisma db seed`                   | Seed the database                               |
| `npx prisma studio`                    | Open Prisma Studio                              |
| `npx tsx src/script.ts`                | Run the database test script                    |

## Adding Packages for Individual Projects

This template intentionally contains only the core backend technologies.

Additional packages can be installed when a particular project requires them.

For example, CORS:

```bash
npm install cors
npm install -D @types/cors
```

Jest and Supertest:

```bash
npm install -D jest ts-jest supertest @types/jest @types/supertest
```

Authentication:

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken
```

Other commonly used packages such as Helmet, Morgan, Multer, Express Validator, and Express Rate Limit can also be added according to the requirements of the individual project.

## Reusing This Template

For a new backend project:

1. Clone this repository.
2. Change the project name in `package.json`.
3. Create a new Neon PostgreSQL database.
4. Replace `DATABASE_URL` in `.env`.
5. Modify `prisma/schema.prisma` for the new project's database models.
6. Generate Prisma Client.
7. Create migrations for the new schema.
8. Update `prisma/seed.ts` if seed data is required.
9. Add additional packages required by the project.
10. Build and test the application.

Example:

```bash
git clone git@github.com:saithuta776-spec/Backend-Template-Express-TypeScript-Prisma-7-Neon.git my-new-project

cd my-new-project

npm install
```

Then create a new `.env` file with the new Neon database connection string.

## Important

Never commit your `.env` file.

Your Neon database connection string contains credentials and should remain private.

This repository is intended to be a **starting template**, not a complete application. Project-specific functionality such as authentication, validation, testing, security middleware, file uploads, and API routes should be added according to the requirements of each project.
