# LevelUp — Engineering Learning Engine

> Stop watching tutorials. Start building real skills.

A story-driven, gamified engineering platform where users progress through worlds, complete quests, execute real code, and prove skills — not just consume content.

---

## Architecture

```
levelup/
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Dev with hot reload
├── .env.example                # Environment config template
└── packages/
    ├── client/                 # React 18 + Vite + Tailwind
    ├── server/                 # Node.js + Express API
    └── executor/               # Docker-based code execution sandbox
```

### Services

| Service  | Port | Description |
|----------|------|-------------|
| client   | 5173 | React frontend (Nginx in prod) |
| server   | 4000 | Express REST API + Socket.io |
| executor | 5000 | Code execution microservice |

---

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Docker socket accessible at `/var/run/docker.sock`

### 1. Clone and configure

```bash
git clone <repo>
cd levelup
cp .env.example .env
# Edit .env — change JWT_SECRET for production!
```

### 2. Start (production mode)

```bash
docker-compose up --build
```

### 3. Start (development mode with hot reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 4. Access

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend |
| http://localhost:4000 | API |
| http://localhost:4000/health | Health check |

### Demo credentials

| Account | Email | Password |
|---------|-------|----------|
| Admin   | admin@levelup.dev | admin123 |
| Demo    | demo@levelup.dev  | demo123  |

---

## Features

### Core Platform
- ✅ JWT authentication (register, login, refresh)
- ✅ 4-step immersive onboarding with mini-test
- ✅ World-based narrative progression (4 worlds)
- ✅ XP economy with level-up system and streak multipliers
- ✅ Quest engine (Daily, Story, Boss, Event types)

### Learning Engine
- ✅ 13 problems across all worlds (CODING, MCQ, DEBUGGING)
- ✅ CodeMirror 6 editor (Python + Java)
- ✅ Real Docker sandbox code execution
- ✅ Test case runner with per-case results
- ✅ Skill tree visualization (SVG-based, interactive)

### Platform
- ✅ Real-time leaderboard (Socket.io)
- ✅ Analytics dashboard (Recharts: XP charts, pie charts, bar charts)
- ✅ Admin panel (user management, content stats)
- ✅ Responsive design (mobile + desktop)
- ✅ Dark theme with neon glow design system

---

## API Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/refresh
PATCH  /api/auth/onboarding
```

### Content
```
GET    /api/worlds
GET    /api/worlds/:slug
GET    /api/problems?worldId&type&difficulty&page
GET    /api/problems/:slug
GET    /api/quests?worldId&type
GET    /api/quests/daily
POST   /api/quests/:id/complete
```

### Submissions
```
POST   /api/submissions          { problemId, code, language }
POST   /api/submissions/mcq      { problemId, selectedOption }
GET    /api/submissions?problemId&page
```

### User
```
GET    /api/users/me/skill-tree
POST   /api/users/me/skill-tree/:nodeId/unlock
GET    /api/users/me/progress
GET    /api/analytics/me
GET    /api/leaderboard?limit
```

### Admin (requires ADMIN role)
```
GET    /api/admin/stats
GET    /api/admin/users
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/problems
PATCH  /api/admin/problems/:id
DELETE /api/admin/problems/:id
POST   /api/admin/worlds
PATCH  /api/admin/worlds/:id
POST   /api/admin/quests
PATCH  /api/admin/quests/:id
```

---

## XP Economy

```
XP Reward = baseXP × difficultyMultiplier × streakMultiplier

Difficulty multipliers:
  EASY   → 1.0×
  MEDIUM → 1.5×
  HARD   → 2.0×
  BOSS   → 3.0×

Streak multipliers:
  3+ days  → 1.25×
  7+ days  → 1.5×
  14+ days → 1.75×
  30+ days → 2.0×

Level formula: XP needed for level N = 100 × N^1.5
```

---

## Extending

### Add a new problem
```bash
# Use the admin API (auth as admin):
POST /api/admin/problems
{
  "title": "My Problem",
  "slug": "my-problem",
  "description": "## Description\n\n...",
  "type": "CODING",
  "difficulty": "MEDIUM",
  "xpReward": 200,
  "worldId": "<world-id>",
  "tags": ["arrays"],
  "starterCode": { "python": "# starter\n", "java": "// starter" },
  "testCases": [
    { "input": "5", "expectedOutput": "25", "isHidden": false }
  ]
}
```

### Migrate to PostgreSQL
1. Change `packages/server/prisma/schema.prisma`:
   ```
   provider = "postgresql"
   url      = env("DATABASE_URL")
   ```
2. Update `DATABASE_URL` in `.env`
3. Run `npm run db:migrate`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Editor | CodeMirror 6 |
| State | Zustand |
| Charts | Recharts |
| Backend | Node.js, Express |
| Database | SQLite via Prisma ORM |
| Auth | Custom JWT + bcryptjs |
| Realtime | Socket.io |
| Execution | Dockerode (Docker-in-Docker) |
| Containers | Docker Compose |
