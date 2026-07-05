# NestJS Deployment Workflow

## Base Workflow
Follow `workflows/deployment.md` for general Node.js containerization. This document covers NestJS-specific build steps.

---

## Deployment Flow

```
1. Build (Nest CLI) → 2. Dockerize → 3. Database Migrations
```

---

## Step 1: Build (Nest CLI)

NestJS projects are written in TypeScript and must be compiled to JavaScript before running in production. The `nest-cli.json` manages this process.

```bash
# Deletes the /dist folder, runs TypeScript compiler, and copies assets
npx nest build
```

This creates a `dist/` directory containing the compiled `main.js`.

---

## Step 2: Dockerization

Because NestJS heavily relies on dependencies, use a Multi-Stage Docker build to ensure your production image does not include `devDependencies` (like Jest or the Nest CLI).

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for TS compilation)
COPY package*.json ./
# If using Prisma, copy schema now
COPY prisma ./prisma/
RUN npm ci

# Copy source code
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Build the application -> creates /dist
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy generated Prisma Client (if applicable)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built code
COPY --from=builder /app/dist ./dist

# Run securely as non-root user
USER node

EXPOSE 3000

# Start via the compiled main file
CMD ["node", "dist/main.js"]
```

---

## Step 3: Environment Variables & Configurations

NestJS handles configuration via `@nestjs/config`. Ensure that in production:

1. `NODE_ENV` is set to `production`.
2. All required `.env` variables are injected into the container (via Docker Compose, Kubernetes Secrets, or AWS ECS).
3. Do **NOT** commit the `.env` file to the repository.

---

## Step 4: Database Migrations (TypeORM / Prisma)

Do **NOT** use `synchronize: true` in your TypeORM config in production. It will drop/alter tables unpredictably and destroy your data.

Migrations MUST be run as a separate step in your CI/CD pipeline before deploying the new container.

```bash
# TypeORM CI/CD step
npm run typeorm migration:run -- -d ./ormconfig.ts

# Prisma CI/CD step
npx prisma migrate deploy
```

---

## Quality Checklist

- [ ] The app is compiled using `nest build`, not just raw `tsc`.
- [ ] A multi-stage Dockerfile is used to keep the final image size small.
- [ ] Production dependencies are installed via `npm ci --only=production`.
- [ ] `TypeORM` `synchronize` is strictly set to `false` in production environments.
- [ ] Database migrations are executed by the CI/CD pipeline, not automatically on app startup.
- [ ] The application is started via `node dist/main.js`.
