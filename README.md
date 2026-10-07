# Backend Learning — Node.js, Express, TypeScript, Prisma, Neon & Redis

This repository is my personal backend development learning project. I use it to learn, practice, experiment with, and continuously improve backend development concepts by building a practical REST API with modern Node.js technologies.

The project is developed incrementally, so the codebase will continue to change as I learn new concepts and add new features.

---

## 🎯 Purpose

The main purpose of this repository is to learn backend development through practical implementation rather than only studying individual concepts.

Throughout the project, I am learning and practicing:

* Node.js and Express
* TypeScript
* REST API development
* PostgreSQL
* Neon Serverless PostgreSQL
* Prisma ORM
* Prisma Migrations
* Authentication and authorization
* JWT and HTTP-only cookies
* Middleware
* File uploads
* Image processing
* Redis
* BullMQ
* Background workers and job queues
* Internationalization (i18n)
* Error handling
* API structure and project organization

The repository is continuously updated as new concepts are learned and implemented.

---

## 🛠️ Technologies

### Backend

* Node.js
* Express
* TypeScript

### Database

* PostgreSQL
* Neon
* Prisma ORM

### Authentication

* JSON Web Tokens (JWT)
* HTTP-only cookies
* Access tokens
* Refresh tokens
* Role-based authorization

### File & Image Processing

* Multer
* Sharp

### Background Jobs

* Redis
* BullMQ
* Redis-backed job queues
* Background workers

### Development Tools

* Git
* GitHub
* VS Code
* Docker

---

## 📁 Project Structure

```text
furniture/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   │
│   ├── config/
│   │   └── errorCode.ts
│   │
│   ├── controllers/
│   │   ├── admin/
│   │   ├── api/
│   │   └── authController.ts
│   │
│   ├── jobs/
│   │   ├── queues/
│   │   │   └── imageQueue.ts
│   │   │
│   │   └── workers/
│   │       └── imageWorker.ts
│   │
│   ├── locales/
│   │   ├── en/
│   │   └── mm/
│   │
│   ├── middlewares/
│   │   ├── auth.ts
│   │   ├── authorise.ts
│   │   ├── maintenance.ts
│   │   └── uploadFilde.ts
│   │
│   ├── routes/
│   │   └── v1/
│   │
│   ├── services/
│   │
│   ├── type/
│   │
│   ├── utlis/
│   │
│   ├── app.ts
│   └── index.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## 🏗️ Current Architecture

The project follows a layered backend structure:

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Prisma ORM
  │
  ▼
Neon PostgreSQL
```

For image processing, the project also uses a background job system:

```text
Client
  │
  ▼
Upload Controller
  │
  ▼
BullMQ Queue
  │
  ▼
Redis
  │
  ▼
BullMQ Worker
  │
  ▼
Sharp
  │
  ▼
Optimized Image
```

Redis acts as the backing store and coordination system for BullMQ. BullMQ provides the queue and worker functionality.

---

## 🔐 Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL="your_neon_database_url"

JWT_SECRET="your_jwt_secret"

REDIS_HOST=localhost
REDIS_PORT=6379
```

The real `.env` file is intentionally excluded from GitHub because it contains sensitive information.

A safe `.env.example` file is included in the repository so that the required environment variables can be understood without exposing secrets.

---

## 🐘 PostgreSQL & Neon

The project uses PostgreSQL as its relational database.

The database is hosted using Neon, allowing the application to connect to a cloud PostgreSQL database without requiring a local PostgreSQL server.

Prisma is used as the ORM for:

* Database schema management
* Queries
* Relationships
* Migrations
* Type-safe database access

---

## 🔴 Redis

Redis is used as the infrastructure behind the BullMQ background job system.

For local development, Redis runs inside Docker.

Start the Redis container:

```bash
docker start redis
```

If the container has not been created yet:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:8
```

Check whether Redis is running:

```bash
docker ps
```

Test Redis:

```bash
docker exec -it redis redis-cli
```

Then:

```text
PING
```

Expected response:

```text
PONG
```

Stop Redis when finished:

```bash
docker stop redis
```

Start it again later:

```bash
docker start redis
```

---

## ⚙️ BullMQ Background Jobs

BullMQ is used to process tasks asynchronously.

For example, image optimization does not need to block the HTTP request while Sharp processes the image.

The application adds an image optimization job to the queue:

```text
Controller
    │
    ▼
Image Queue
    │
    ▼
Redis
    │
    ▼
Image Worker
    │
    ▼
Sharp
```

The queue and worker use the same queue name:

```text
imageQueue
```

The producer adds a job such as:

```text
optimize-image
```

with data containing the uploaded image path and output filename.

The worker receives the job and uses Sharp to resize and convert the image to WebP.

---

## 🖼️ Image Processing

Uploaded images are initially stored using Multer.

The original image is stored under:

```text
uploads/images/
```

The optimized image is generated under:

```text
uploads/optimize/
```

The worker currently uses Sharp to:

* Resize images
* Convert images to WebP
* Reduce image quality/file size

Example processing flow:

```text
Uploaded JPEG
      │
      ▼
uploads/images/
      │
      ▼
BullMQ Job
      │
      ▼
Redis
      │
      ▼
Image Worker
      │
      ▼
Sharp
      │
      ├── Resize: 200 × 200
      ├── Convert: WebP
      └── Quality: 50
      │
      ▼
uploads/optimize/
```

Uploaded files are excluded from Git using `.gitignore`.

---

## 🔑 Authentication

The project includes JWT-based authentication.

The authentication system is being developed around:

* Access tokens
* Refresh tokens
* HTTP-only cookies
* Authentication middleware
* Role-based authorization

The project also separates authentication and authorization responsibilities.

```text
Authentication
     │
     └── "Who are you?"

Authorization
     │
     └── "Are you allowed to do this?"
```

---

## 👥 Roles & Authorization

The backend supports role-based access control.

Example roles include:

```text
ADMIN
USER
AUTHOR
```

Authorization middleware can restrict access to particular routes based on the user's role.

Example concept:

```text
Request
  │
  ▼
Authentication
  │
  ▼
User identified
  │
  ▼
Authorization
  │
  ├── Allowed ──► Controller
  │
  └── Denied ───► Error response
```

---

## 🌍 Internationalization

The project includes multiple language translations.

Current languages include:

```text
English
Myanmar
```

Translation files are stored under:

```text
src/locales/
```

This allows application messages to be separated from the application logic.

---

## 🧪 Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Start the BullMQ image worker:

```bash
npm run worker
```

Build the TypeScript project:

```bash
npm run build
```

Start the compiled application:

```bash
npm start
```

---

## 🐳 Redis Development Setup

The local development environment can be thought of as:

```text
MacBook
│
├── Node.js / Express
│       │
│       ├── REST API
│       └── BullMQ
│
└── Docker Desktop
        │
        └── Redis Container
                │
                └── Port 6379
```

The application connects to Redis through:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📚 Learning Progress

This repository is intentionally developed step by step.

### Completed / Practiced

* [x] Node.js fundamentals
* [x] Express REST API
* [x] TypeScript
* [x] Project structure
* [x] Prisma ORM
* [x] PostgreSQL
* [x] Neon PostgreSQL
* [x] Prisma migrations
* [x] Database relationships
* [x] Database seeding
* [x] JWT authentication
* [x] HTTP-only cookies
* [x] Access and refresh tokens
* [x] Authentication middleware
* [x] Role-based authorization
* [x] File uploads with Multer
* [x] Image processing with Sharp
* [x] Redis with Docker
* [x] BullMQ queues
* [x] BullMQ workers
* [x] Background image processing
* [x] WebP image optimization
* [x] Internationalization
* [x] Git and GitHub workflow

### Currently Learning

* [ ] More advanced Redis usage
* [ ] Advanced BullMQ features
* [ ] Job retries and failure handling
* [ ] Background jobs
* [ ] Redis caching
* [ ] WebSockets
* [ ] Audit logs
* [ ] Dockerizing the complete application
* [ ] CI/CD
* [ ] Cloud deployment
* [ ] Monitoring and logging
* [ ] Production backend architecture

---

## 🚀 Future Improvements

As my backend knowledge grows, I plan to experiment with:

* Redis caching
* Job retry strategies
* Scheduled/background jobs
* WebSockets
* Real-time notifications
* Audit logging
* Rate limiting
* Advanced validation
* Docker
* CI/CD pipelines
* Cloud deployment
* Application monitoring
* Better error handling
* Automated testing
* API documentation
* Production-ready security practices

---

## 📌 Important Note

This repository is primarily a **learning and experimentation project**.

The architecture and implementation will continue to evolve as I learn new backend concepts. Some implementations may be refactored or replaced with better approaches later.

The goal is not simply to create a finished application, but to understand **why backend technologies work, how they interact, and how to build larger systems step by step.**

---

## 👨‍💻 Author

**Sai Thuta Hlaing**

GitHub:

`https://github.com/saithuta776-spec`
