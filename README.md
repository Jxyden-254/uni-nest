# UNI-NEST

UNI-NEST is a student accommodation platform that connects students with verified
landlords, universities, and property companies. Students can search, reserve, and
review accommodation near their university.

## Project Structure

```
uni-nest/
├── client/     # Next.js + React + TypeScript + Tailwind CSS frontend
├── server/     # Express.js + Prisma (MySQL) backend API
├── database/   # ER diagrams, SQL scripts, and database documentation
├── docs/       # Project documentation (API docs, manuals, guides)
└── public/     # Shared static assets
```

## Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** MySQL with Prisma ORM
- **Tooling:** ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- MySQL 8+

### 1. Install dependencies

```bash
npm install            # root tools (Prettier)
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Edit `server/.env` and set `DATABASE_URL` to your MySQL connection string.

### 3. Run the app in development

In one terminal:

```bash
cd server && npm run dev    # API on http://localhost:5000
```

In another terminal:

```bash
cd client && npm run dev    # Frontend on http://localhost:3000
```

### Useful scripts

| Location | Command             | Description                    |
| -------- | ------------------- | ------------------------------ |
| root     | `npm run format`    | Format all files with Prettier |
| client   | `npm run build`     | Production build of the client |
| client   | `npm run lint`      | Lint the client                |
| server   | `npm run build`     | Compile TypeScript             |
| server   | `npm run lint`      | Lint the server                |
| server   | `npm run typecheck` | Type-check without emitting    |

## Development Roadmap

The project is built in 15 incremental phases. See [docs/ROADMAP.md](docs/ROADMAP.md).

- [x] Phase 1 — Project initialization
- [x] Phase 2 — Database design
- [ ] Phase 3 — Authentication system
- [ ] Phase 4 — Client portal
- [ ] Phase 5 — Property search
- [ ] Phase 6 — Reservation system
- [ ] Phase 7 — Landlord portal
- [ ] Phase 8 — University portal
- [ ] Phase 9 — Company portal
- [ ] Phase 10 — Admin portal
- [ ] Phase 11 — Communication system
- [ ] Phase 12 — AI features
- [ ] Phase 13 — Testing
- [ ] Phase 14 — Documentation
- [ ] Phase 15 — Deployment
