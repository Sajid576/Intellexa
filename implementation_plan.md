# Architecture & Implementation Plan: Background Job Processing

This plan clarifies the project's architecture regarding the separation of the API server and the background worker, as well as the remaining steps for a robust implementation.

## 1. Why 'server' and 'worker' are separate in Docker Compose?

The project requirements explicitly state:
> **Worker Process:** A separate Worker process (Node.js script) must be set up. This worker continuously monitors the queue...

### Benefits of this Separation:
1. **Scalability**: In a production environment (like Render or AWS), you can scale the API `server` (which handles user requests) independently from the `worker` (which performs CPU/Network intensive AI tasks).
2. **Resource Isolation**: If the AI generation process consumes a lot of memory or crashes, it won't take down the API server, ensuring the website remains accessible to other users.
3. **Queue Logic**: NestJS handles jobs via BullMQ. By running a separate container as a "worker", we follow the Microservices pattern where the "Producer" (Server) sends tasks to Redis, and the "Consumer" (Worker) processes them. The worker interacts with the local Ollama service for AI tasks.

## 2. Proposed Refinements

While the logic is already implemented in `ContentProcessor`, I will verify and ensure:
- The `server` container focuses on HTTP and WebSockets.
- The `worker` container focuses on processing the `content-generation` queue.

### [Component] Backend (NestJS)

#### [MODIFY] [content.processor.ts](file:///Users/mac/Desktop/workspace/smart-content-generator/server/src/queue/content.processor.ts)
Ensure the processor is correctly registered and handles the 1-minute delay logic specified in the requirements.

#### [MODIFY] [docker-compose.yml](file:///Users/mac/Desktop/workspace/smart-content-generator/docker-compose.yml)
Ensure environment variables (like `REDIS_HOST`) are consistent across both services.

## 3. Verification Plan

### Automated Tests
- Run `npm test` in the `server` directory to ensure existing tests pass.
- Verify job queuing: Logs in the `server` container should show "Job successfully queued".
- Verify job processing: Logs in the `worker` container should show "Job picked up" after 1 minute.

### Manual Verification
- Start the app: `docker-compose up --build`.
- Login and create content.
- Watch the **Dashboard** for real-time status updates (Pending -> Completed) after exactly 60 seconds.
