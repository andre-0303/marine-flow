# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo structure

pnpm workspaces with two packages:

- `api/` — `@marine-flow/api`: Node.js + Fastify + TypeScript (ESM, `module: NodeNext`)
- `web/` — `@marine-flow/web`: React 18 + Vite + TypeScript + Tailwind CSS

## Commands

All commands run from repo root unless noted.

```bash
pnpm install          # install all workspaces
pnpm dev:api          # start API (tsx watch, http://localhost:3333)
pnpm dev:web          # start frontend (Vite, http://localhost:5173)
pnpm build            # build both workspaces
pnpm -r lint          # lint all workspaces
pnpm -r test          # test all workspaces

# workspace-scoped
pnpm --filter @marine-flow/api <script>
pnpm --filter @marine-flow/web <script>

# single test file (vitest)
pnpm --filter @marine-flow/api test -- path/to/file.test.ts
```

## API architecture — Hexagonal (Ports & Adapters)

Domain is fully isolated from frameworks and infrastructure.

```
api/src/
├── domain/
│   ├── entities/          # BeachRegion, OceanCondition, Prediction (pure TS classes)
│   ├── ports/
│   │   ├── in/            # use-case interfaces (driven side)
│   │   └── out/           # repository interfaces (driving side)
│   └── services/          # RiskCalculatorService — pure business logic, no I/O
├── application/
│   └── use-cases/         # CreateSimulation, GetPredictionHistory
├── infrastructure/
│   ├── http/
│   │   ├── routes/        # Fastify route registration
│   │   └── controllers/   # HTTP adapters — call use cases, return responses
│   └── database/
│       └── repositories/  # PostgreSQL implementations of out/ ports (pg driver)
└── shared/
    └── errors/            # domain error classes
```

**Dependency rule:** domain → nothing. application → domain. infrastructure → application + domain. Never import infrastructure into domain or application.

## Domain model

| Entity | Key fields |
|---|---|
| `BeachRegion` | id, name, latitude, longitude, city, status |
| `OceanCondition` | id, beachRegionId, windSpeed, currentStrength, tideLevel, pollutionDensity |
| `Prediction` | id, beachRegionId, oceanConditionId, riskScore (0–100), riskLevel, explanation, forecastHours (24|48|72) |

**Risk scoring (RiskCalculatorService):** score < 40 → low, 40–69 → medium, ≥ 70 → high. High tide and strong currents increase score.

## API endpoints

| Method | Route | Handler |
|---|---|---|
| GET | `/health` | health check |
| GET | `/beach-regions` | list all regions |
| POST | `/simulations` | CreateSimulation use case |
| GET | `/simulations/:beachRegionId/history` | GetPredictionHistory use case |

## Database

PostgreSQL 16 via `pg` driver. Tables: `beach_region`, `ocean_condition`, `prediction`. Connection string via `DATABASE_URL` env var. Migrations tracked in `api/src/infrastructure/database/` (issue #10).

Copy `.env.example` → `.env` before running locally.

## TypeScript notes

API uses `"module": "NodeNext"` — imports inside `api/src/` **must** include `.js` extension even for `.ts` source files (NodeNext resolution requirement).
