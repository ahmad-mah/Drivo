# Node.js Bug Fixing Workflow

## Base Workflow
Follow `workflows/bug-investigation.md` as the foundation. This document adds Node.js-specific debugging techniques.

---

## Node.js Debugging Tools

### 1. Built-in Node Inspector
You can attach Chrome DevTools directly to a running Node.js process to step through code, inspect variables, and profile memory.

```bash
# Start your app with the inspect flag
node --inspect dist/server.js
# Or with ts-node/nodemon
nodemon --inspect src/server.ts
```
*Then open Chrome and navigate to `chrome://inspect` to connect to the Node process.*

### 2. Logging
If the app is in production, `console.log` is often insufficient. Look for structured logs output by a logger like Pino or Winston. Look for the `reqId` (Request ID) to trace a single request through multiple log lines.

---

## Common Node.js Bug Categories

### 1. Server Crashes (Process Exits)

```
Symptom: App stops running completely. Console says "UnhandledPromiseRejectionWarning".
Diagnosis: An async function threw an error, but it wasn't wrapped in try/catch or an async wrapper.
Fix: Find the async call, ensure it is wrapped in catchAsync or try/catch.

Symptom: App crashes with "Javascript heap out of memory".
Diagnosis: You are loading too much data into RAM at once (e.g., finding all users, reading a massive file).
Fix: Use database pagination (limit/offset) or Node.js Streams for files.
```

### 2. Hanging Requests (Client Timeout)

```
Symptom: Postman/Frontend just spins forever, eventually timing out.
Diagnosis: A middleware or controller did not call `next()` or `res.send()`. Or, a database connection is deadlocked/exhausted.
Fix: 
  - Check the route's middleware chain. Every function MUST call next() or send a response.
  - Check if a database query is hanging because `await` is waiting on a dropped connection.
```

### 3. Headers Already Sent

```
Symptom: Error: "Cannot set headers after they are sent to the client"
Diagnosis: Your code called `res.send()` or `res.json()`, but continued executing and tried to send a second response.
Fix: Always `return` when sending a response inside an if-statement.

// BAD
if (error) { res.status(400).send('Error'); }
res.status(200).send('Success'); // Throws Headers Already Sent

// GOOD
if (error) { return res.status(400).send('Error'); }
res.status(200).send('Success');
```

### 4. Event Loop Blocking (Slowness)

```
Symptom: The API normally responds in 50ms. When a specific route is hit, ALL users experience 3-second delays.
Diagnosis: The specific route is performing heavy synchronous CPU work (encryption, image processing, massive JSON parsing).
Fix: Identify the CPU heavy task. Offload it to a Worker Thread or BullMQ background job.
```

---

## Bug Fix Verification

After fixing a Node.js bug, additionally verify:

- [ ] Does the fix handle edge cases (e.g., null values, empty arrays from DB)?
- [ ] If fixing a crash, write an automated test that explicitly triggers the crashing condition to prove it now returns a 500/400 instead of dying.
- [ ] Ensure no sensitive data is leaked in the error response (e.g., verifying `NODE_ENV` check in the error handler works).
- [ ] Run the test suite (`npm run test`) to ensure the fix didn't break other endpoints relying on the same Service.
