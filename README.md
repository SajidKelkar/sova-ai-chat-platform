# Sova AI

### A full-stack AI conversational platform built with React, Node.js, Express, MongoDB, Redis, and OpenRouter.

**Sova AI** is a full-stack AI chat application designed to provide a smooth conversational experience with persistent chat history, secure authentication, AI-powered responses, conversation summarization, and token usage tracking.

🔗 **Live Demo:** [Sova AI](https://sova-ai-assistant.vercel.app/)

---

## ✨ Features

### 🤖 AI-Powered Conversations

* Generate AI responses using the OpenRouter API
* Persistent conversations with stored message history
* Markdown rendering for AI responses
* Syntax highlighting for code blocks
* Support for GitHub-Flavored Markdown

### 💬 Conversation Management

* Create new conversations
* View recent conversations
* Open previous conversations
* Delete conversations
* Persistent messages stored in MongoDB
* Conversation topics/titles

### 🧠 Conversation Summarization

Sova AI includes a conversation summarization system designed to keep longer conversations manageable.

When a conversation reaches the configured message threshold:

```text
Conversation
     ↓
Message history
     ↓
Summarization
     ↓
Stored conversation summary
     ↓
Summary + recent messages
     ↓
AI context
```

This allows the application to maintain useful context without continuously sending the entire conversation history to the AI model.

### 🔐 Authentication & Security

* User registration
* User login
* JWT-based authentication
* HTTP-only authentication cookies
* Password hashing with bcrypt
* Protected API routes
* User-specific chat access
* Account deletion
* CORS configuration
* Request validation using Zod
* Rate limiting using Redis

### 📊 Token Usage Tracking

Sova AI tracks AI token usage at multiple levels:

* Prompt tokens
* Completion tokens
* Total tokens
* Per-message usage
* Per-conversation usage
* User usage statistics
* Configurable token limits

### ⚡ Redis Integration

Redis is used for:

* Token usage limiting
* Rate limiting
* Authentication/session-related controls

### 🗄️ MongoDB Database

MongoDB stores:

* Users
* Conversations
* Messages
* Conversation summaries
* Token usage information

Mongoose is used as the ODM layer.

---

# 🛠️ Tech Stack

## Frontend

| Technology       | Purpose                        |
| ---------------- | ------------------------------ |
| React            | User interface                 |
| TypeScript       | Type-safe frontend development |
| Vite             | Development and build tooling  |
| Tailwind CSS     | Styling                        |
| React Markdown   | Markdown rendering             |
| Remark GFM       | GitHub-Flavored Markdown       |
| Rehype Highlight | Code syntax highlighting       |
| Highlight.js     | Syntax highlighting            |
| Lucide React     | UI icons                       |

## Backend

| Technology    | Purpose                               |
| ------------- | ------------------------------------- |
| Node.js       | Runtime                               |
| Express.js    | REST API                              |
| MongoDB       | Database                              |
| Mongoose      | MongoDB ODM                           |
| Redis         | Rate limiting and token usage control |
| OpenRouter    | AI model access                       |
| JWT           | Authentication                        |
| bcrypt        | Password hashing                      |
| Zod           | Request validation                    |
| Cookie Parser | Authentication cookies                |
| CORS          | Cross-origin communication            |

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │      Sova AI        │
                         │   React + Vite UI   │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    │ HTTP + Cookies
                                    ▼
                         ┌─────────────────────┐
                         │    Express API      │
                         │      Node.js        │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ Authentication│  │ Chat/Message │  │ Token Usage  │
          │ JWT + bcrypt  │  │ Controllers  │  │   + Redis    │
          └──────────────┘  └───────┬──────┘  └──────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
              ┌─────────────┐              ┌──────────────┐
              │   MongoDB   │              │  OpenRouter  │
              │  Mongoose   │              │   AI Models  │
              └─────────────┘              └──────────────┘
                     │
                     ▼
              Users / Chats /
              Messages / Usage /
              Summaries
```

---

# 🔄 AI Message Flow

When a user sends a message:

```text
User
  │
  ▼
React Frontend
  │
  │ POST /api/message/:chatId
  ▼
Express Backend
  │
  ├── Authentication
  │
  ├── Rate Limiting
  │
  ├── Token Usage Check
  │
  ├── Load User
  │
  ├── Load Conversation Context
  │
  ▼
OpenRouter
  │
  ▼
AI Response
  │
  ├── Save User Message
  │
  ├── Save Assistant Message
  │
  ├── Update Conversation Usage
  │
  ├── Update User Usage
  │
  └── Trigger Conversation Summarization
  │
  ▼
React Frontend
  │
  ▼
Display AI Response
```

---

# 🧠 Conversation Context

Sova AI stores conversation information using separate database models for:

```text
User
  │
  └── Chat
       │
       ├── Message
       ├── Message
       ├── Message
       └── Summary
```

For longer conversations, the application can maintain a stored summary together with newer messages when constructing AI context.

This reduces unnecessary context growth while maintaining conversational continuity.

---

# 📁 Project Structure

```text
Sova-AI/
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── openRouter.js
│   │   │   └── redis.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── chat.controllers.js
│   │   │   ├── message.controllers.js
│   │   │   └── user.controllers.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── authenticatedRateLimiter.js
│   │   │   ├── loadUserMiddleware.js
│   │   │   ├── tokenUsageMiddleware.js
│   │   │   ├── unauthenticatedRateLimiter.js
│   │   │   └── userAuthMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── chat.model.js
│   │   │   ├── message.model.js
│   │   │   └── user.model.js
│   │   │
│   │   ├── routes/
│   │   │   ├── chat.route.js
│   │   │   ├── message.route.js
│   │   │   └── user.route.js
│   │   │
│   │   ├── service/
│   │   │   ├── openRouterService.js
│   │   │   └── summaryService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── chatContext.js
│   │   │   ├── tokenUsage.js
│   │   │   └── userUsage.js
│   │   │
│   │   └── validators/
│   │       └── user.Validator.js
│   │
│   └── server.js
│
├── frontend/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── chat.ts
│   │   │   ├── client.ts
│   │   │   ├── config.ts
│   │   │   └── message.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingIndicator.tsx
│   │   │   ├── LoginDialog.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── MessageList.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── SignupDialog.tsx
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   │
│   │   ├── pages/
│   │   │   └── ChatPage.tsx
│   │   │
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   └── package.json
│
└── README.md
```

---

# 🔐 Authentication Flow

Sova AI uses JWT authentication with HTTP-only cookies.

```text
Signup / Login
      │
      ▼
Backend validates credentials
      │
      ▼
Password hashed / verified
      │
      ▼
JWT generated
      │
      ▼
HTTP-only cookie
      │
      ▼
Authenticated API requests
```

Protected routes verify the authenticated user before allowing access to private conversations and messages.

---

# 🌐 API Overview

## Authentication

```http
POST /api/user/signup
POST /api/user/login
POST /api/user/logout
GET  /api/user/profile
POST /api/user/delete
```

## Conversations

```http
POST   /api/chat/createChat
GET    /api/chat/getRecentChats
GET    /api/chat/:chatId
DELETE /api/chat/:chatId
```

## Messages

```http
GET  /api/message/:chatId
POST /api/message/:chatId
```

The message endpoint handles authentication, token usage controls, AI generation, message persistence, and conversation usage tracking.

---

# ⚙️ Environment Variables

Create a `.env` file inside the `backend` directory.

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000

OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_AI_MODEL=your_default_model

REDIS_URL=your_redis_connection_url

TOKEN_LIMIT=your_token_limit
TOKEN_WINDOW_SECONDS=your_token_window

FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:3000
```

> **Never commit `.env` files or API keys to GitHub.**

---

# 🚀 Running Sova AI Locally

## 1. Clone the repository

```bash
git clone https://github.com/SajidKelkar/sova-ai-chat-platform.git
cd sova-ai-chat-platform
```

## 2. Install backend dependencies

```bash
cd backend
npm install
```

## 3. Configure backend environment variables

Create:

```text
backend/.env
```

and add the required variables.

## 4. Start the backend

```bash
npm start
```

The backend will run on:

```text
http://localhost:3000
```

---

## 5. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
```

## 6. Configure frontend environment

Create:

```text
frontend/.env
```

```env
VITE_API_BASE_URL=http://localhost:3000
```

## 7. Start the frontend

```bash
npm run dev
```

The Vite development server will provide the local frontend URL.

---

# 🏭 Production Build

Build the frontend:

```bash
cd frontend
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# ☁️ Deployment

The project is deployed using separate frontend and backend services.

### Frontend

**Vercel**

🔗 [Sova AI](https://sova-ai-assistant.vercel.app/)

### Backend

**Render**

The frontend communicates with the deployed Express API through the configured:

```env
VITE_API_BASE_URL
```

The backend uses the configured frontend origin through:

```env
FRONTEND_URL
```

with credentials enabled for authenticated requests.

---

# 📈 Current Project Status

### 🟢 Implemented

* [x] React frontend
* [x] Node.js + Express backend
* [x] MongoDB database
* [x] Redis integration
* [x] OpenRouter AI integration
* [x] User registration
* [x] User login/logout
* [x] JWT authentication
* [x] HTTP-only authentication cookies
* [x] Password hashing
* [x] Protected routes
* [x] Persistent conversations
* [x] Persistent messages
* [x] Conversation deletion
* [x] Conversation summarization
* [x] Token usage tracking
* [x] Token/rate limiting
* [x] Markdown rendering
* [x] Code syntax highlighting
* [x] Responsive chat interface
* [x] Production deployment

### 🔨 Future Improvements

Planned improvements may include:

* [ ] Further mobile UX improvements
* [ ] More advanced conversation controls
* [ ] Additional AI model options
* [ ] Streaming AI responses
* [ ] Expanded testing
* [ ] More detailed usage analytics
* [ ] Additional personalization features

---

# 🎯 Why I Built Sova AI

Sova AI was built as a practical full-stack project to explore how modern AI applications work beyond simply calling an AI API.

The project focuses on combining:

```text
Frontend Development
        +
Backend API Design
        +
Authentication
        +
Database Architecture
        +
Redis
        +
AI Integration
        +
Conversation Management
        +
Usage Tracking
```

The goal was to build a complete application where the AI functionality is only one part of a larger software system.

---

# 👨‍💻 Author

**Sajid Kelkar**

Computer Engineering Student
University of Mumbai

### Connect

* GitHub: [@SajidKelkar](https://github.com/SajidKelkar)
* LinkedIn: [Sajid Kelkar](https://www.linkedin.com/in/sajid-kelkar-0a62a3354/)

---

# ⭐ Support

If you find Sova AI interesting, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is currently maintained as a personal/student project.
