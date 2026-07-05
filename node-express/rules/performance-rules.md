# Performance Rules

## Purpose

Rules to maintain high throughput and low latency in Express applications, respecting the constraints of the Node.js event loop.

---

## Event Loop Optimization — MUST (Blocking)

### 1. Offload Heavy CPU Tasks
Node.js is extremely fast at I/O (network, database, file system). It is terrible at heavy CPU computation (image processing, video encoding, massive array sorting). 
If a CPU task takes > 50ms, it blocks the event loop and no other requests can be served.

You MUST offload heavy CPU tasks to:
- Worker Threads (`worker_threads`)
- Background job queues (e.g., BullMQ + Redis)

```typescript
// VIOLATION — Blocks the event loop while resizing image
app.post('/upload', (req, res) => {
  const resized = resizeImageSynchronously(req.body.image); // Bad!
  res.send('Done');
});

// CORRECT — Send to a background worker
app.post('/upload', async (req, res) => {
  await queue.add('resize-image', req.body.image); // Instant return
  res.status(202).send('Processing');
});
```

### 2. Stream Large Files
You MUST NOT read entire large files into memory using `fs.readFile` before sending them. This will crash the server under load (Out of Memory). You MUST use Streams.

```typescript
import fs from 'fs';

// VIOLATION — Loads entire 500MB video into memory
app.get('/video', (req, res) => {
  const file = fs.readFileSync('video.mp4');
  res.send(file);
});

// CORRECT — Streams the file directly to the client
app.get('/video', (req, res) => {
  const stream = fs.createReadStream('video.mp4');
  stream.pipe(res);
});
```

---

## Database Optimization — MUST

### 3. Connection Pooling
You MUST use a connection pool to connect to your database (built into Prisma, TypeORM, and pg). Do not create a new connection for every request.

### 4. Prevent N+1 Queries
You MUST fetch related data in a single query (JOINs or `include` in Prisma) rather than looping and querying the database multiple times.

### 5. Always Paginate Lists
You MUST NOT return all rows from a table. Endpoints returning arrays of data must enforce pagination (`limit` and `offset` / `skip` and `take`).

```typescript
// VIOLATION
const users = await prisma.user.findMany(); // What if there are 1M users? Crashes server.

// CORRECT
const users = await prisma.user.findMany({
  take: 50,
  skip: (page - 1) * 50
});
```

---

## Production Optimization — SHOULD

### 6. Use Compression
Enable gzip/brotli compression for JSON responses to reduce network payload size.

```typescript
import compression from 'compression';
app.use(compression());
```

### 7. Run in Cluster Mode or via PM2
Node.js runs on a single core. To utilize a multi-core CPU in production, you SHOULD run your app using a process manager like PM2, which automatically spins up multiple instances (clusters) of your app.

```bash
# pm2 cluster mode utilizes all CPU cores
pm2 start dist/server.js -i max
```

---

## Quality Checklist

- [ ] CPU-heavy tasks are offloaded to background queues (BullMQ) or worker threads.
- [ ] Large files are handled via Streams (`createReadStream().pipe(res)`).
- [ ] Database queries use JOINs/includes instead of loops (No N+1 queries).
- [ ] All list endpoints enforce limits/pagination.
- [ ] `compression` middleware is used to reduce payload sizes.
- [ ] No synchronous `fs` or `crypto` methods are used in request handlers.
