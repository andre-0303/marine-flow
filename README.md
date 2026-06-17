<div align="center">
  <img width="300" alt="image" src="./assets/logo.png" />

  <p><strong>Plataforma preditiva de monitoramento costeiro</strong></p>
  <p>Previsão de acúmulo de resíduos marinhos no litoral do Rio de Janeiro</p>

  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Fastify-4.x-000000?style=flat-square&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white" />
</div>

---

## 📋 Sobre o projeto

O MarineFlow é uma plataforma que antecipa regiões costeiras do Rio de Janeiro com maior risco de acúmulo de resíduos marinhos nas próximas **24h, 48h ou 72h**.

O lixo marinho hoje é tratado de forma **reativa** — quando os resíduos já chegaram às praias. O MarineFlow vira esse jogo: através de variáveis ambientais simuladas (vento, maré, corrente, densidade de poluição), o sistema calcula um **score de risco (0–100)** e gera uma justificativa ambiental para apoiar equipes de limpeza, ONGs e órgãos ambientais em ações **preventivas**.

> **MVP:** Sem satélites, sensores reais ou IA — simulação manual com regras de negócio bem definidas. O foco é na arquitetura e na experiência de uso.

---

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| API | Node.js + Fastify + TypeScript |
| Arquitetura API | SOLID + Arquitetura Hexagonal (Ports & Adapters) |
| Banco de Dados | PostgreSQL 16 |
| Infraestrutura | Docker + Docker Compose |

---

## 🏗️ Arquitetura

A API segue o padrão **Hexagonal (Ports & Adapters)**, mantendo o domínio completamente isolado de frameworks e infraestrutura.

```
api/src/
├── domain/
│   ├── entities/          # BeachRegion, OceanCondition, Prediction
│   ├── ports/
│   │   ├── in/            # interfaces dos casos de uso
│   │   └── out/           # interfaces dos repositórios
│   └── services/          # RiskCalculatorService (lógica pura)
├── application/
│   └── use-cases/         # CreateSimulation, GetPredictionHistory
├── infrastructure/
│   ├── http/
│   │   ├── routes/        # rotas Fastify
│   │   └── controllers/   # controllers HTTP
│   └── database/
│       └── repositories/  # implementações PostgreSQL
└── shared/
    └── errors/            # erros de domínio
```

### Princípios SOLID aplicados

| Princípio | Aplicação |
|---|---|
| **S** — Single Responsibility | Cada classe tem uma única responsabilidade |
| **O** — Open/Closed | Casos de uso abertos para extensão, fechados para modificação |
| **L** — Liskov Substitution | Repositórios substituíveis sem quebrar o domínio |
| **I** — Interface Segregation | Ports separadas por contexto (`in/` e `out/`) |
| **D** — Dependency Inversion | Domínio depende de abstrações, nunca de implementações concretas |

---

## 📐 Modelagem de dados

```text
beach_region                  1 ───────────────<  ocean_condition              1 ───────────────<  prediction
┌──────────────────────┐                         ┌─────────────────────────┐                         ┌──────────────────────┐
│ PK id                │                         │ PK id                   │                         │ PK id                │
│ name                 │                         │ FK beach_region_id      │                         │ FK beach_region_id   │
│ latitude             │                         │ wind_speed              │                         │ FK ocean_condition_id│
│ longitude            │                         │ current_strength        │                         │ risk_score (0-100)   │
│ city                 │                         │ tide_level              │                         │ risk_level           │
│ status               │                         │ pollution_density       │                         │ explanation          │
└──────────────────────┘                         │ created_at              │                         │ forecast_hours       │
                                                  └─────────────────────────┘                         │ created_at           │
                                                                                                     └──────────────────────┘
```

---

## ⚖️ Regras de negócio

| Regra | Descrição |
|---|---|
| BR-01 | Score de risco varia entre **0 e 100** |
| BR-02 | Score < 40 → risco **baixo** 🟢 |
| BR-03 | Score 40–69 → risco **médio** 🟡 |
| BR-04 | Score ≥ 70 → risco **alto** 🔴 |
| BR-05 | Maré alta **aumenta** o risco |
| BR-06 | Correntes fortes **aumentam** a probabilidade de acúmulo |

---

## 🧮 Fórmula de cálculo do score

```text
score = round( windScore×0.20 + currentScore×0.30 + tideScore×0.30 + pollutionScore×0.20 )

┌─────────────────────┬────────────────────────────────────────────┬────────┐
│ Fator               │ Normalização (0–100)                       │ Peso   │
├─────────────────────┼────────────────────────────────────────────┼────────┤
│ windScore           │ clamp(windSpeed / 30,      0, 1) × 100    │  20%   │
│ currentScore        │ clamp(currentStrength / 5, 0, 1) × 100    │  30%   │
│ tideScore           │ clamp(max(0, tideLevel) / 3, 0, 1) × 100  │  30%   │
│ pollutionScore      │ clamp(pollutionDensity / 100, 0, 1) × 100 │  20%   │
└─────────────────────┴────────────────────────────────────────────┴────────┘

Fatores com score ≥ 50 são listados na explicação gerada (máx. 2 dominantes).
```

---

## 🔄 Fluxo de simulação

```text
POST /simulations
        │
        ▼
┌───────────────────────┐
│  SimulationController │  valida e adapta HTTP → domínio
└──────────┬────────────┘
           │
           ▼
┌───────────────────────────┐
│  CreateSimulationUseCase  │  orquestra o fluxo completo
└──┬────────────────────┬───┘
   │                    │
   ▼                    ▼
┌──────────────────┐  ┌────────────────────────┐
│ BeachRegion      │  │  RiskCalculatorService  │
│ Repository (out) │  │  (serviço de domínio)   │
│                  │  │  → score + level +       │
│ findById()       │  │    explanation           │
└──────────────────┘  └───────────┬────────────┘
   404 se não existe              │
                                  ▼
                       ┌──────────────────────┐
                       │  Prediction          │
                       │  Repository (out)    │
                       │  save()              │
                       └──────────┬───────────┘
                                  │
                                  ▼
                           Response 201
                       { predictionId, riskScore,
                         riskLevel, explanation,
                         forecastHours, createdAt }
```

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/beach-regions` | Lista todas as regiões costeiras |
| `POST` | `/simulations` | Cria simulação e retorna predição de risco |
| `GET` | `/simulations/:beachRegionId/history` | Histórico de predições da região |

### Exemplo — POST /simulations

```json
// Request
{
  "beachRegionId": "uuid-da-praia",
  "windSpeed": 45,
  "currentStrength": 7.5,
  "tideLevel": 8.2,
  "pollutionDensity": 6.0,
  "forecastHours": 24
}

// Response
{
  "id": "uuid-da-predicao",
  "riskScore": 82,
  "riskLevel": "high",
  "explanation": "Risco elevado devido à combinação de maré alta, forte corrente marítima e alta densidade de resíduos.",
  "forecastHours": 24,
  "createdAt": "2026-06-16T22:00:00.000Z"
}
```

---

## ⚡ Como rodar

### Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)
- [Docker](https://www.docker.com/) e Docker Compose

### 1. Clone o repositório

```bash
git clone https://github.com/andre-0303/marine-flow.git
cd marine-flow
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

### 3. Suba o banco de dados

```bash
docker-compose up -d
```

### 4. Instale as dependências (raiz do monorepo)

```bash
pnpm install
```

### 5. Rode a API

```bash
pnpm dev:api
```

### 6. Rode o frontend

```bash
pnpm dev:web
```

A API estará disponível em `http://localhost:3333` e o frontend em `http://localhost:5173`.

---

## 📁 Estrutura do monorepo

```
marine-flow/
├── api/               # Node.js + Fastify + TypeScript
├── web/               # React + Vite + TypeScript
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 👥 Stakeholders

- Prefeitura do Rio de Janeiro
- ONGs ambientais
- Equipes de limpeza urbana
- Pesquisadores ambientais
- Setor de turismo local

---

<div align="center">
  <p>Desenvolvido por <a href="https://github.com/andre-0303">André Bandeira</a></p>
</div>
