# Smart Content Generator

A full-stack AI-powered content generation application built with NestJS, Next.js, and Ollama.

## Features

- **Core MERN Stack**: Built with NestJS (Node.js), Next.js (TypeScript), and MongoDB.
- **AI Integration**: Uses Ollama (Llama 3 / DeepSeek) for content generation and sentiment analysis.
- **Delayed Jobs**: Implements a 1-minute delay for AI generation using BullMQ and Redis.
- **Real-time Updates**: Socket.io for live updates once AI generation is complete.
- **Premium UI**: Stunning dark-mode interface with Tailwind CSS and Framer Motion.
- **Predictive Search**: Real-time content filtering on the dashboard.
- **Sentiment Analysis**: Automatic sentiment scoring for all generated content.

## Prerequisites

- Node.js v20+
- Docker & Docker Compose
- Ollama (running locally or via Docker)

## Local Setup

1. **Clone the repository**
2. **Environment Variables**:
   - Create `server/.env` and add:
     ```env
     MONGODB_URI=mongodb://localhost:27017/smart-content
     REDIS_HOST=localhost
     REDIS_PORT=6379
     JWT_SECRET=your_secret_key
     OLLAMA_HOST=http://localhost:11434
     AI_MODEL=llama3
     ```
   - Create `client/.env.local` and add:
     ```env
     NEXT_PUBLIC_API_URL=http://localhost:3001
     ```
3. **Run with Docker**:
   ```bash
   docker-compose up --build
   ```
   Or run manually:
   - Server: `cd server && npm install && npm run start:dev`
   - Client: `cd client && npm install && npm run dev`

## Deployment (Render)

### 1. Database & Redis
- Deploy a **Redis** instance on Render.
- Use **MongoDB Atlas** for the database.

### 2. Backend (Server)
- New Web Service -> Connect Repository.
- Build Command: `cd server && npm install && npm run build`
- Start Command: `cd server && npm run start:prod`
- Add Environment Variables: `MONGODB_URI`, `REDIS_URL`, `JWT_SECRET`, `GEMINI_API_KEY`.

### 3. Frontend (Client)
- New Static Site -> Connect Repository.
- Build Command: `cd client && npm install && npm run build`
- Publish Directory: `client/out` (or use Next.js managed service).
- Build Command for Next.js Managed: `npm install && npm run build` (set Root Directory to `/client`).
- Add Environment Variable: `NEXT_PUBLIC_API_URL`.

## Testing

Run backend tests:
```bash
cd server && npm test
```
