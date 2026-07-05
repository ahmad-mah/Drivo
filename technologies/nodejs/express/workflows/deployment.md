# Node.js Deployment Workflow

## Base Workflow
This workflow covers the steps to prepare, containerize (Docker), and deploy a Node.js/Express application to a production environment.

---

## Deployment Flow

```
1. Pre-flight Checks → 2. Build (TypeScript) → 3. Dockerize → 4. CI/CD & Database Migrations
```

---

## Step 1: Pre-flight Checks

Before building, ensure the codebase is clean and secure.

```bash
# 1. Type check
tsc --noEmit

# 2. Run all tests
npm run test

# 3. Check for vulnerable dependencies
npm audit
```

---

## Step 2: Build (TypeScript)

Node.js cannot run TypeScript natively in production (tools like `ts-node` are strictly for development). You must transpile to JavaScript.

```bash
# Cleans the dist folder and compiles TypeScript to JavaScript
rm -rf dist && tsc
```

*Ensure your `package.json` has a `"start": "node dist/server.js"` script.*

---

## Step 3: Dockerize (Containerization)

You MUST package the application into a Docker container for production to ensure environment consistency.

Create a `Dockerfile` in the root directory. Use a multi-stage build to keep the final image size small and secure.

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# If using Prisma, copy schema to generate client
COPY prisma ./prisma/ 
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy generated Prisma client (if using Prisma)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built JavaScript files
COPY --from=builder /app/dist ./dist

# Run as a non-root user for security
USER node

EXPOSE 3000

CMD ["npm", "start"]
```

Create a `.dockerignore` file:
```
node_modules
npm-debug.log
dist
.env
tests
```

---

## Step 4: CI/CD & Database Migrations

### CI/CD Pipeline
Use GitHub Actions (or similar) to automate the deployment.
1. Trigger on push to `main`.
2. Run tests.
3. Build Docker image.
4. Push image to registry (ECR, Docker Hub).
5. Trigger server to pull and restart.

### Database Migrations
NEVER run database migrations automatically on server startup (`app.listen`). If running multiple instances of your app (cluster/Kubernetes), they will try to migrate simultaneously and corrupt the database.

**Rule:** Database migrations must be run as a separate step in your CI/CD pipeline, BEFORE the new containers are deployed.

```bash
# CI/CD Script Example (Prisma)
npx prisma migrate deploy # Updates the database schema
# Only proceed to deploy new Docker containers if migration succeeds
```

---

## Common Deployment Mistakes

| Mistake | Consequence | Fix |
| :--- | :--- | :--- |
| Running `ts-node` in production | Massive memory usage, slow execution | Compile with `tsc` and run `node dist/server.js` |
| Committing `.env` files | Database passwords leaked to GitHub | Never commit `.env`. Inject them via Docker/CI |
| Running app as root in Docker | Security vulnerability if app is breached | Add `USER node` to Dockerfile |
| Migrating DB on app startup | Corrupts database in multi-instance setups | Migrate during the CI/CD pipeline step |

---

## Quality Checklist

- [ ] Application is compiled to JavaScript (`dist/`) before running in production.
- [ ] A multi-stage `Dockerfile` is used to separate build dependencies from production dependencies.
- [ ] Docker container runs as a non-root user (`USER node`).
- [ ] `.env` files and `node_modules` are added to `.dockerignore` and `.gitignore`.
- [ ] Database migrations are executed by the CI/CD pipeline, not on app startup.
- [ ] Process manager (like PM2) or orchestrator (like Kubernetes/ECS) is used to handle process crashes and restarts.
