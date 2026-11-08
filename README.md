# 🩺 Irma Iryani Platform (Monorepo)

A full-stack healthcare and professional portfolio platform built with **Next.js 14**, **Tailwind CSS**, **Hono**, and **MongoDB**.

---

## 🏗️ Monorepo Architecture

```
irma-iryani/
├── apps/
│   ├── backend/              # Hono + MongoDB REST API backend
│   └── frontend/             # Next.js 14 App Router + Tailwind CSS frontend
├── docker-compose.yml        # Multi-service stack (MongoDB + Backend + Frontend)
└── package.json              # Monorepo Workspace configuration
```

---

## 🚀 Quick Start

### Run with Docker Compose
```bash
docker compose up -d --build
```
- **Web Frontend**: `http://localhost:3007`
- **Backend API**: `http://localhost:3006`

### Run Locally with Node.js
```bash
npm install
npm run dev
```

---

## 📄 License
MIT
