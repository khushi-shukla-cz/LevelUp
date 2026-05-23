<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-3B82F6?style=for-the-badge&labelColor=080C14" />
<img src="https://img.shields.io/badge/license-MIT-22C55E?style=for-the-badge&labelColor=080C14" />
<img src="https://img.shields.io/badge/docker-ready-06B6D4?style=for-the-badge&labelColor=080C14" />
<img src="https://img.shields.io/badge/node-%3E%3D18.0.0-F59E0B?style=for-the-badge&labelColor=080C14" />

<br /><br />

```
  ██╗     ███████╗██╗   ██╗███████╗██╗     ██╗   ██╗██████╗
  ██║     ██╔════╝██║   ██║██╔════╝██║     ██║   ██║██╔══██╗
  ██║     █████╗  ██║   ██║█████╗  ██║     ██║   ██║██████╔╝
  ██║     ██╔══╝  ╚██╗ ██╔╝██╔══╝  ██║     ██║   ██║██╔═══╝
  ███████╗███████╗ ╚████╔╝ ███████╗███████╗╚██████╔╝██║
  ╚══════╝╚══════╝  ╚═══╝  ╚══════╝╚══════╝ ╚═════╝ ╚═╝
```

### **The Engineering Learning Engine**
*Stop watching tutorials. Start proving skills.*

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [XP Economy](#xp-economy)
- [Code Execution Engine](#code-execution-engine)
- [Database Schema](#database-schema)
- [Extending LevelUp](#extending-levelup)
- [Credits](#credits)
- [References & Research](#references--research)
- [Open Source Acknowledgements](#open-source-acknowledgements)
- [License](#license)

---

## Overview

LevelUp is a story-driven, gamified engineering platform structured around a single conviction: **the only way to prove you can build systems is to actually build them.**

Unlike passive learning platforms (Coursera, Udemy) that deliver content without validation, or competitive judges (LeetCode, Codeforces) that test isolated algorithms without context or growth structure, LevelUp combines:

- **Structured roadmap progression** — 4 narrative worlds from Foundations to Real World Simulation
- **Real code execution** — Python and Java run inside isolated Docker containers with hard resource limits
- **Gamification with depth** — XP economy, streak multipliers, boss fights, skill trees
- **Analytics feedback loop** — accuracy curves, weak area detection, activity heatmaps

The platform is fully containerized via Docker Compose, runs entirely locally with no external API dependencies, and is designed with a Prisma abstraction layer for one-line migration to PostgreSQL in production.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Compose Network                    │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────┐ │
│  │   client     │    │   server     │    │   executor    │ │
│  │  React+Vite  │◄──►│  Express API │◄──►│  Code Runner  │ │
│  │  Port: 5173  │    │  Port: 4000  │    │  Port: 5000   │ │
│  │  (Nginx prod)│    │  SQLite DB   │    │  Dockerode    │ │
│  └──────────────┘    └──────────────┘    └───────────────┘ │
│                             │                      │        │
│                    ┌────────┴────────┐    ┌────────┴──────┐ │
│                    │  Prisma ORM     │    │ Docker Socket │ │
│                    │  levelup.db     │    │ /var/run/     │ │
│                    └─────────────────┘    │ docker.sock   │ │
│                                           └───────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Services

| Service | Port | Technology | Responsibility |
|---------|------|------------|----------------|
| `client` | 5173 | React 18 + Vite → Nginx | Frontend SPA |
| `server` | 4000 | Node.js + Express | REST API, Auth, Socket.io |
| `executor` | 5000 | Node.js + Dockerode | Isolated code execution |

---

## Features

### Core Platform
- ✅ JWT authentication — register, login, token refresh
- ✅ 4-step immersive onboarding with mini calibration test
- ✅ World-based narrative progression (4 worlds, boss fights)
- ✅ XP economy with level curve, streak multipliers, coin rewards
- ✅ Quest engine — Daily, Story, Boss, Event types
- ✅ Real-time leaderboard via Socket.io
- ✅ Admin panel — user management, content CRUD, platform stats

### Learning Engine
- ✅ 13 seeded problems — CODING, MCQ, DEBUGGING problem types
- ✅ CodeMirror 6 browser editor with Python and Java syntax
- ✅ Real Docker sandbox execution — per-submission container isolation
- ✅ Full test case runner with per-case diff output
- ✅ Submission history with runtime and memory stats
- ✅ Skill tree visualization — SVG-based interactive graph

### Analytics
- ✅ XP growth chart (14-day area chart)
- ✅ Problems solved by difficulty breakdown
- ✅ Submission type distribution
- ✅ Activity heatmap, accuracy rate, level progress

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.0.10 | Build tool and dev server |
| Tailwind CSS | 3.4.0 | Utility-first styling |
| Framer Motion | 10.18.0 | Animations and transitions |
| CodeMirror 6 | via @uiw/react-codemirror | Code editor |
| Zustand | 4.4.7 | Client state management |
| Recharts | 2.10.3 | Analytics charts |
| React Router DOM | 6.21.0 | Client-side routing |
| Axios | 1.6.2 | HTTP client with interceptors |
| Socket.io Client | 4.6.2 | Real-time communication |
| Lucide React | 0.303.0 | Icon system |
| React Hot Toast | 2.4.1 | Notification toasts |
| clsx | 2.1.0 | Conditional class utility |
| date-fns | 3.1.0 | Date formatting |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | ≥18.0.0 | JavaScript runtime |
| Express | 4.18.2 | HTTP server framework |
| Prisma ORM | 5.7.0 | Database abstraction layer |
| SQLite | via Prisma | Embedded database |
| JSON Web Tokens | 9.0.2 | Stateless authentication |
| bcryptjs | 2.4.3 | Password hashing |
| Socket.io | 4.6.2 | WebSocket server |
| Winston | 3.11.0 | Structured logging |
| express-rate-limit | 7.1.5 | Rate limiting middleware |
| express-validator | 7.0.1 | Request validation |
| Helmet | 7.1.0 | HTTP security headers |
| compression | 1.7.4 | Response compression |
| Morgan | 1.10.0 | HTTP request logging |
| Axios | 1.6.2 | HTTP client (server→executor) |

### Executor (Code Sandbox)

| Technology | Version | Purpose |
|------------|---------|---------|
| Dockerode | 4.0.0 | Docker API client (Node.js) |
| Express | 4.18.2 | Microservice HTTP layer |
| uuid | 9.0.0 | Unique execution IDs |
| Python 3.11 Alpine | Docker image | Python execution environment |
| OpenJDK 17 Alpine | Docker image | Java execution environment |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Container runtime |
| Docker Compose | Multi-service orchestration |
| Nginx (Alpine) | Production static file server + SPA routing |

---

## Project Structure

```
levelup/
│
├── docker-compose.yml          # Production orchestration
├── docker-compose.dev.yml      # Development override (hot reload)
├── .env.example                # Environment variable template
├── package.json                # Root monorepo scripts
├── .gitignore
├── README.md
│
└── packages/
    │
    ├── client/                 # React + Vite Frontend
    │   ├── Dockerfile          # Multi-stage: dev → builder → Nginx
    │   ├── nginx.conf          # SPA fallback routing
    │   ├── vite.config.js
    │   ├── tailwind.config.js
    │   ├── postcss.config.js
    │   ├── index.html
    │   └── src/
    │       ├── main.jsx
    │       ├── App.jsx                    # Route tree + guards
    │       ├── styles/
    │       │   └── globals.css            # Design system + Tailwind
    │       ├── lib/
    │       │   └── api.js                 # Axios instance + interceptors
    │       ├── store/
    │       │   └── authStore.js           # Zustand auth state
    │       ├── components/
    │       │   └── layout/
    │       │       └── AppLayout.jsx      # Sidebar + HUD top bar
    │       └── pages/
    │           ├── LandingPage.jsx        # Public marketing page
    │           ├── LoginPage.jsx
    │           ├── RegisterPage.jsx
    │           ├── OnboardingPage.jsx     # 4-step immersive flow
    │           ├── DashboardPage.jsx      # Main HUD
    │           ├── WorldsPage.jsx
    │           ├── WorldDetailPage.jsx
    │           ├── ProblemsPage.jsx
    │           ├── ProblemPage.jsx        # CodeMirror editor + runner
    │           ├── QuestsPage.jsx
    │           ├── SkillTreePage.jsx      # SVG skill graph
    │           ├── LeaderboardPage.jsx
    │           ├── AnalyticsPage.jsx
    │           ├── AdminPage.jsx
    │           ├── ProfilePage.jsx
    │           └── NotFoundPage.jsx
    │
    ├── server/                 # Express API
    │   ├── Dockerfile          # Multi-stage: dev → production
    │   ├── package.json
    │   ├── prisma/
    │   │   ├── schema.prisma              # Full data model (12 models)
    │   │   └── seed.js                    # Rich seed data
    │   └── src/
    │       ├── index.js                   # Server entry + middleware
    │       ├── routes/                    # 8 route files
    │       ├── controllers/               # 8 controller files
    │       ├── middleware/
    │       │   ├── auth.js                # JWT authenticate + requireAdmin
    │       │   ├── validate.js            # express-validator wrapper
    │       │   ├── errorHandler.js
    │       │   └── notFound.js
    │       └── services/
    │           ├── prisma.js              # Prisma client singleton
    │           ├── xpEngine.js            # XP economy + leveling + streaks
    │           ├── socket.js              # Socket.io event handlers
    │           └── logger.js              # Winston logger
    │
    └── executor/               # Code Execution Microservice
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js                   # Express server + rate limiting
            ├── runner.js                  # Dockerode sandbox engine
            └── logger.js
```

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine + Docker Compose
- Docker socket accessible at `/var/run/docker.sock`
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/levelup.git
cd levelup
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and update at minimum:

```env
JWT_SECRET=your_long_random_secret_here_change_this
```

### 3. Start (production mode)

```bash
docker-compose up --build
```

First boot pulls `python:3.11-alpine` and `openjdk:17-alpine` images (~300MB combined), runs Prisma migrations, and seeds the database automatically.

### 4. Start (development mode with hot reload)

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 5. Access the platform

| URL | Service |
|-----|---------|
| http://localhost:5173 | Frontend |
| http://localhost:4000 | API |
| http://localhost:4000/health | Health check |
| http://localhost:5000/health | Executor health |

### Demo credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@levelup.dev | admin123 |
| User | demo@levelup.dev | demo123 |

### Useful commands

```bash
# View all logs
docker-compose logs -f

# View logs for one service
docker-compose logs -f server

# Reset and re-seed database
docker-compose exec server npx prisma migrate reset --force

# Open Prisma Studio (database browser UI)
docker-compose exec server npx prisma studio

# Stop all services
docker-compose down

# Stop and remove volumes (full clean slate)
docker-compose down -v
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `JWT_SECRET` | *(required)* | Secret key for JWT signing — change in production |
| `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
| `BCRYPT_ROUNDS` | `12` | bcrypt hashing rounds |
| `EXECUTION_TIMEOUT` | `10000` | Max execution time per submission in ms |
| `MAX_MEMORY` | `128m` | Docker memory limit per execution container |
| `VITE_API_URL` | `http://localhost:4000` | API base URL for frontend |
| `VITE_WS_URL` | `ws://localhost:4000` | WebSocket URL for Socket.io |

---

## API Reference

### Authentication

```
POST   /api/auth/register          Register new account
POST   /api/auth/login             Login, receive JWT
GET    /api/auth/me                Get current user (auth required)
POST   /api/auth/refresh           Refresh token (auth required)
PATCH  /api/auth/onboarding        Complete onboarding (auth required)
```

### Content

```
GET    /api/worlds                 List all worlds (with unlock status)
GET    /api/worlds/:slug           World detail + quests + user progress

GET    /api/problems               List problems (filter: worldId, type, difficulty, page)
GET    /api/problems/:slug         Problem detail with test cases and starter code

GET    /api/quests                 List quests (filter: worldId, type)
GET    /api/quests/daily           Today's daily quests with completion status
POST   /api/quests/:id/complete    Mark quest complete, receive XP + coins
```

### Submissions

```
POST   /api/submissions            Submit code → executor → results + XP award
POST   /api/submissions/mcq        Submit MCQ answer
GET    /api/submissions            User's submission history (filter by problemId)
```

### User & Analytics

```
GET    /api/users/me/skill-tree              Full skill tree with user unlock state
POST   /api/users/me/skill-tree/:id/unlock  Unlock a skill node (costs XP)
GET    /api/users/me/progress               User progress summary
GET    /api/analytics/me                    Full analytics dashboard data
GET    /api/leaderboard                     Global XP leaderboard
```

### Admin *(ADMIN role required)*

```
GET    /api/admin/stats            Platform-wide statistics
GET    /api/admin/users            Paginated user list with search
PATCH  /api/admin/users/:id        Update user (role, xp, level, coins)
DELETE /api/admin/users/:id        Delete user and cascade relations

POST   /api/admin/worlds           Create world
PATCH  /api/admin/worlds/:id       Update world
DELETE /api/admin/worlds/:id       Delete world

GET    /api/admin/problems         All problems with submission stats
POST   /api/admin/problems         Create problem
PATCH  /api/admin/problems/:id     Update problem
DELETE /api/admin/problems/:id     Delete problem

POST   /api/admin/quests           Create quest
PATCH  /api/admin/quests/:id       Update quest
DELETE /api/admin/quests/:id       Delete quest
```

---

## XP Economy

All reward calculations are centralised in `packages/server/src/services/xpEngine.js`.

### Reward Formula

```
XP Earned = baseXP × difficultyMultiplier × streakMultiplier
```

### Difficulty Multipliers

| Difficulty | Multiplier |
|------------|------------|
| EASY | 1.0× |
| MEDIUM | 1.5× |
| HARD | 2.0× |
| BOSS | 3.0× |

### Streak Multipliers

| Streak | Multiplier |
|--------|------------|
| 1–2 days | 1.0× |
| 3–6 days | 1.25× |
| 7–13 days | 1.5× |
| 14–29 days | 1.75× |
| 30+ days | 2.0× |

### Level Curve

```
XP required for level N = 100 × N^1.5

Level 1  →     100 XP per level
Level 5  →     559 XP total accumulated
Level 10 →   2,278 XP total accumulated
Level 20 →   9,329 XP total accumulated
Level 50 →  72,777 XP total accumulated
```

---

## Code Execution Engine

The executor is a standalone microservice that accepts code + test cases via HTTP, runs each test case in a dedicated Docker container, and returns structured results.

### Security Model

Each submission spawns a fresh container with:

| Constraint | Value | Purpose |
|------------|-------|---------|
| `NetworkDisabled` | `true` | No outbound network access |
| `Memory` | 128 MB | Hard memory cap |
| `MemorySwap` | 128 MB | Prevents swap usage |
| `CpuQuota` | 50,000 / 100,000 | Max 50% of one CPU core |
| `PidsLimit` | 50 | Prevents fork bombs |
| `SecurityOpt` | `no-new-privileges` | Blocks privilege escalation |
| Timeout | 10,000 ms | Force kill after 10 seconds |
| Filesystem | Bind-mounted temp dir only | No host filesystem access |

Containers are force-removed after execution regardless of outcome. Temporary source files are cleaned up in the `finally` block.

### Supported Languages

| Language | Docker Image | Command |
|----------|-------------|---------|
| Python 3.11 | `python:3.11-alpine` | `python3 -u solution.py` |
| Java 17 | `openjdk:17-alpine` | `javac Solution.java && java Solution` |

### Request / Response

```json
POST /execute
{
  "code": "def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target-n], i]\n        seen[n] = i",
  "language": "PYTHON",
  "testCases": [
    { "input": "2 7 11 15\n9", "expectedOutput": "0 1" }
  ],
  "timeoutMs": 10000,
  "memoryMb": 128
}
```

```json
{
  "passed": 1,
  "total": 1,
  "runtime": 134,
  "results": [
    {
      "testCase": 1,
      "passed": true,
      "input": "2 7 11 15\n9",
      "expectedOutput": "0 1",
      "actualOutput": "0 1",
      "runtime": 134,
      "errorMessage": null
    }
  ]
}
```

---

## Database Schema

Built with Prisma ORM on SQLite. To migrate to PostgreSQL, change one line in `schema.prisma` and update `DATABASE_URL`.

### Models

| Model | Purpose |
|-------|---------|
| `User` | Account, XP, level, streak, coins, path selection, onboarding state |
| `World` | Narrative world definition, unlock level, display order |
| `Quest` | Quest definition, type, XP/coin rewards, world + problem associations |
| `Problem` | Problem content, test cases, starter code, MCQ options, buggy code |
| `Submission` | Code submission record, result, runtime, test case pass/fail |
| `UserQuestProgress` | Per-user quest completion tracking with attempt count |
| `DailyQuestLog` | Daily XP log used for streak tracking and activity heatmap |
| `SkillNode` | Skill tree node definitions with XY layout positions and prerequisites |
| `UserSkillNode` | Per-user skill node unlock state |
| `LeaderboardEntry` | Materialised leaderboard row, auto-reranked on XP change |
| `Announcement` | Platform-wide announcement banners |

---

## Extending LevelUp

### Add a problem via API

```bash
curl -X POST http://localhost:4000/api/admin/problems \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fibonacci Sequence",
    "slug": "fibonacci-sequence",
    "description": "## Fibonacci\n\nReturn the nth Fibonacci number.",
    "type": "CODING",
    "difficulty": "EASY",
    "xpReward": 100,
    "worldId": "<world-id-from-db>",
    "tags": ["math", "recursion"],
    "starterCode": {
      "python": "n = int(input())\n# Your solution here\n",
      "java": "import java.util.Scanner;\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n    }\n}"
    },
    "testCases": [
      { "input": "0", "expectedOutput": "0", "isHidden": false },
      { "input": "10", "expectedOutput": "55", "isHidden": false },
      { "input": "20", "expectedOutput": "6765", "isHidden": true }
    ],
    "constraints": "0 ≤ n ≤ 30"
  }'
```

### Migrate to PostgreSQL

```prisma
// packages/server/prisma/schema.prisma
datasource db {
  provider = "postgresql"        // was "sqlite"
  url      = env("DATABASE_URL")
}
```

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/levelup

# Apply
docker-compose exec server npx prisma migrate dev --name postgres-migration
```

### Add a new execution language

1. Add a config entry to `LANG_CONFIG` in `packages/executor/src/runner.js`:

```js
JAVASCRIPT: {
  image: 'node:20-alpine',
  filename: 'solution.js',
  cmd: () => ['node', 'solution.js'],
}
```

2. Add the language option in `ProblemPage.jsx`:

```js
const LANG_OPTIONS = [
  { id: 'PYTHON', label: 'Python 3.11' },
  { id: 'JAVA',   label: 'Java 17' },
  { id: 'JAVASCRIPT', label: 'JavaScript (Node 20)' }, // new
]
```

3. Install the CodeMirror language extension and add it to the `cmExtensions` switch.

---

## Credits

### Project

LevelUp was designed and engineered as a complete, production-grade system covering architecture, backend API, frontend, code execution sandbox, design system, and seed content.

### Concept Inspiration

| Inspiration | What was borrowed |
|-------------|------------------|
| **Duolingo** | Streak mechanics, daily quest psychology, XP-based progression loops |
| **LeetCode** | Execution-first evaluation, test case runner, problem difficulty taxonomy |
| **Dark Souls / Hades** | Boss fight mechanic as mastery gate, narrative world progression, earned difficulty |
| **GitHub** | Activity heatmap design for the analytics dashboard |
| **VS Code** | CodeMirror editor theme, file tab UI pattern in the problem solver |

### Design System

The dark UI aesthetic — `#080C14` background, `#3B82F6` neon blue, `#8B5CF6` violet, glass card components, glow effects — was designed from scratch and implemented in Tailwind CSS with custom tokens. Typography uses Space Grotesk (display), Inter (body), and JetBrains Mono (code).

---

## References & Research

### Architecture & System Design

- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media.
  — Materialised view strategy for the leaderboard reranking service; submission data model design.

- Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
  — Service layer pattern applied in `xpEngine.js`, `socket.js`, controller/route separation.

- Richardson, C. (2018). *Microservices Patterns*. Manning Publications.
  — Executor as an isolated microservice with its own process boundary, failure domain, and HTTP interface.

### Security

- OWASP Foundation. (2021). *OWASP Top Ten*. https://owasp.org/www-project-top-ten/
  — Informed rate limiting strategy (auth: 20 req/15min, global: 500 req/15min), bcrypt rounds selection (12), JWT expiry policy, Helmet security header configuration.

- Docker, Inc. (2023). *Docker Security Best Practices*. https://docs.docker.com/engine/security/
  — Container isolation model: `NetworkDisabled`, `no-new-privileges` security option, PID limits, memory caps, bind mount scoping.

- Auth0. (2023). *JWT Best Practices*. https://auth0.com/blog/jwt-security-best-practices/
  — Token expiry design, client storage strategy, token refresh pattern.

### Game Design & Gamification

- Koster, R. (2004). *A Theory of Fun for Game Design*. Paraglyph Press.
  — XP level curve design (`100 × N^1.5`), difficulty progression philosophy, why mastery loops feel intrinsically rewarding.

- Chou, Y. (2015). *Actionable Gamification: Beyond Points, Badges and Leaderboards*. Octalysis Media.
  — Streak mechanic design and daily quest psychology; balancing intrinsic motivation (mastery) against extrinsic rewards (XP, coins).

- Deterding, S., Dixon, D., Khaled, R., & Nacke, L. (2011). From game design elements to gamefulness: Defining gamification. *Proceedings of the 15th International Academic MindTrek Conference*, 9–15. https://doi.org/10.1145/2181037.2181040
  — Academic grounding for the gamification model and its distinction from pure games.

### Frontend Engineering

- React Team. (2023). *React 18 Documentation*. https://react.dev/
- Tailwind Labs. (2023). *Tailwind CSS Documentation*. https://tailwindcss.com/docs
- Framer. (2023). *Framer Motion API Reference*. https://www.framer.com/motion/
- Haverbeke, M. (2023). *CodeMirror 6 Documentation*. https://codemirror.net/docs/
- uiw. (2023). *@uiw/react-codemirror*. https://uiwjs.github.io/react-codemirror/
- Recharts Group. (2023). *Recharts Documentation*. https://recharts.org/en-US/api

### Backend & Database

- Prisma. (2023). *Prisma ORM Documentation*. https://www.prisma.io/docs
  — Schema design patterns, upsert strategy for leaderboard entries, transaction batching for reranking, JSON field serialization.

- SQLite. (2023). *SQLite Documentation*. https://www.sqlite.org/docs.html
  — WAL journal mode behaviour under concurrent reads during submissions.

- Express.js. (2023). *Express API Reference*. https://expressjs.com/en/api.html
- Node.js Foundation. (2023). *Node.js v20 Documentation*. https://nodejs.org/en/docs
- Socket.io. (2023). *Socket.io Documentation*. https://socket.io/docs/v4/

### Code Execution & Sandboxing

- Docker, Inc. (2023). *Dockerode README*. https://github.com/apocas/dockerode
  — Container lifecycle API, stream demuxing for stdout/stderr separation.

- Docker, Inc. (2023). *Docker Engine API v1.43*. https://docs.docker.com/engine/api/v1.43/
  — `HostConfig` parameters for resource constraints: `Memory`, `CpuQuota`, `PidsLimit`, `SecurityOpt`.

- Judge0. (2023). *Judge0 Architecture Overview*. https://github.com/judge0/judge0
  — Reference architecture for open-source code execution systems; LevelUp's executor is an original implementation informed by this design.

---

## Open Source Acknowledgements

This project is built entirely on open-source software. Full credit and gratitude to every maintainer listed below.

| Package | Author / Organisation | License |
|---------|----------------------|---------|
| React | Meta (Facebook) | MIT |
| Vite | Evan You + contributors | MIT |
| Tailwind CSS | Tailwind Labs | MIT |
| Framer Motion | Framer B.V. | MIT |
| CodeMirror 6 | Marijn Haverbeke | MIT |
| @uiw/react-codemirror | uiw contributors | MIT |
| Zustand | Daishi Kato (pmndrs) | MIT |
| Recharts | Recharts Group | MIT |
| React Router | Remix Software | MIT |
| Axios | Matt Zabriskie + contributors | MIT |
| Socket.io | Guillermo Rauch (socket.io org) | MIT |
| Lucide React | Lucide contributors | ISC |
| React Hot Toast | Timo Lins | MIT |
| clsx | Luke Edwards | MIT |
| date-fns | date-fns contributors | MIT |
| Express | TJ Holowaychuk + contributors | MIT |
| Prisma ORM | Prisma Data Inc. | Apache-2.0 |
| jsonwebtoken | Auth0 Inc. | MIT |
| bcryptjs | Dominik Kundel | MIT |
| Winston | Charlie Robbins (indexzero) | MIT |
| express-rate-limit | Nathan Friedly | MIT |
| express-validator | express-validator contributors | MIT |
| Helmet | Adam Baldwin | MIT |
| Morgan | TJ Holowaychuk | MIT |
| compression | TJ Holowaychuk | MIT |
| Dockerode | Pedro Teixeira | Apache-2.0 |
| uuid | Robert Kieffer + contributors | MIT |
| nodemon | Remy Sharp | MIT |
| Nginx | Igor Sysoev / F5 Nginx Inc. | BSD-2-Clause |
| Python 3.11 | Python Software Foundation | PSF License |
| OpenJDK 17 | OpenJDK contributors | GPL-2.0 + Classpath Exception |
| Docker | Docker Inc. | Apache-2.0 |
| node:20-alpine | Node.js Foundation + Alpine Linux | MIT / Various |
| Google Fonts — Space Grotesk | Florian Karsten | OFL-1.1 |
| Google Fonts — JetBrains Mono | JetBrains s.r.o. | OFL-1.1 |
| Google Fonts — Inter | Rasmus Andersson | OFL-1.1 |

---

## License

```
MIT License

Copyright (c) 2024 LevelUp Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**LevelUp** — Built for engineers who build.

*Stop watching tutorials. Start proving skills.*

</div>

## Testing & CI

Local test commands (monorepo):

```bash
# from repo root - runs tests for packages that expose `test` scripts
npm test --workspaces --if-present

# run server tests only
cd packages/server && npm test

# run executor tests only
cd packages/executor && npm test

# run client tests placeholder (if added)
cd packages/client && npm test
```

CI

- This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` that installs dependencies and runs workspace tests on Node 18.
- There's an additional e2e/workflow planned for Docker Compose based integration tests (uses services: `server`, `executor`, `client`) — see the `/.github/workflows` folder for available workflows.

Troubleshooting

- If CI fails due to the database or Prisma migrations, ensure `DATABASE_URL` is set correctly for the runner or use the SQLite defaults for unit tests.
- To run Docker Compose e2e locally:

```bash
docker-compose up --build
# then, in another terminal, run the workspace tests or API checks
npm test --workspaces --if-present
```

