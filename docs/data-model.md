# Modelagem de Dados

## Diagrama ER

```text
beach_region              1 ─────────────────< ocean_condition           1 ─────────────────< prediction
┌──────────────────────┐                      ┌──────────────────────────┐                   ┌───────────────────────────┐
│ PK id         UUID   │                      │ PK id             UUID   │                   │ PK id              UUID   │
│    name       VC(100)│                      │ FK beach_region_id UUID  │──────────────────>│ FK beach_region_id  UUID  │
│    latitude   DEC9,6 │◄─────────────────────│    wind_speed     DEC5,2 │                   │ FK ocean_condition_id UUID│
│    longitude  DEC9,6 │                      │    current_strength DEC5,2│                  │    risk_score       INT   │
│    city       VC(80) │                      │    tide_level     DEC5,2 │                   │    risk_level       VC(10)│
│    status     VC(20) │                      │    pollution_density DEC5,2│                 │    explanation      TEXT  │
└──────────────────────┘                      │    created_at     TS     │                   │    forecast_hours   INT   │
                                              └──────────────────────────┘                   │    created_at       TS    │
                                                                                             └───────────────────────────┘
```

**Cardinalidade:**
- `beach_region` 1 → N `ocean_condition` — uma região recebe múltiplas condições ao longo do tempo
- `beach_region` 1 → N `prediction` — uma região acumula histórico de predições
- `ocean_condition` 1 → N `prediction` — uma condição pode gerar predições para horizontes diferentes (24h/48h/72h)

---

## Tabelas

### `beach_region`

Regiões costeiras monitoradas. Pré-populada via seed (imutável em runtime).

```sql
CREATE TABLE IF NOT EXISTS beach_region (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  latitude   DECIMAL(9,6) NOT NULL,   -- WGS-84, -90..90
  longitude  DECIMAL(9,6) NOT NULL,   -- WGS-84, -180..180
  city       VARCHAR(80)  NOT NULL,
  status     VARCHAR(20)  NOT NULL DEFAULT 'active'  -- 'active' | 'inactive'
);
```

| Coluna | Tipo SQL | Restrição de domínio |
|--------|----------|----------------------|
| `id` | `UUID` | gerado automaticamente |
| `name` | `VARCHAR(100)` | obrigatório |
| `latitude` | `DECIMAL(9,6)` | −90 ≤ lat ≤ 90 |
| `longitude` | `DECIMAL(9,6)` | −180 ≤ lon ≤ 180 |
| `city` | `VARCHAR(80)` | obrigatório |
| `status` | `VARCHAR(20)` | `'active'` \| `'inactive'` |

**Seed — praias do Rio de Janeiro:**

| Nome | Latitude | Longitude |
|------|----------|-----------|
| Copacabana | −22.971100 | −43.182200 |
| Ipanema | −22.986800 | −43.200500 |
| Barra da Tijuca | −23.009100 | −43.365600 |
| Leblon | −22.984800 | −43.222800 |
| Flamengo | −22.931400 | −43.173600 |
| Recreio dos Bandeirantes | −23.022500 | −43.464200 |

---

### `ocean_condition`

Snapshot das variáveis ambientais capturado no momento de cada simulação. Imutável após inserção.

```sql
CREATE TABLE IF NOT EXISTS ocean_condition (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_region_id    UUID         NOT NULL REFERENCES beach_region(id),
  wind_speed         DECIMAL(5,2) NOT NULL,   -- km/h, >= 0
  current_strength   DECIMAL(5,2) NOT NULL,   -- nós, >= 0
  tide_level         DECIMAL(5,2) NOT NULL,   -- metros (negativo = maré vazante)
  pollution_density  DECIMAL(5,2) NOT NULL,   -- g/m², >= 0
  created_at         TIMESTAMP    DEFAULT NOW()
);
```

| Coluna | Tipo SQL | Restrição de domínio |
|--------|----------|----------------------|
| `wind_speed` | `DECIMAL(5,2)` | ≥ 0 |
| `current_strength` | `DECIMAL(5,2)` | ≥ 0 |
| `tide_level` | `DECIMAL(5,2)` | qualquer real — negativo = vazante |
| `pollution_density` | `DECIMAL(5,2)` | ≥ 0 |

> `tide_level` negativo é válido. O `RiskCalculatorService` usa `max(0, tideLevel)` — maré vazante não contribui para o score.

---

### `prediction`

Resultado calculado de uma simulação. Nunca atualizada após inserção.

```sql
CREATE TABLE IF NOT EXISTS prediction (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  beach_region_id     UUID        NOT NULL REFERENCES beach_region(id),
  ocean_condition_id  UUID        NOT NULL REFERENCES ocean_condition(id),
  risk_score          INT         NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_level          VARCHAR(10) NOT NULL,   -- 'low' | 'medium' | 'high'
  explanation         TEXT        NOT NULL,
  forecast_hours      INT         NOT NULL,   -- 24 | 48 | 72
  created_at          TIMESTAMP   DEFAULT NOW()
);
```

| Coluna | Tipo SQL | Restrição de domínio |
|--------|----------|----------------------|
| `risk_score` | `INT` | 0–100, CHECK no banco |
| `risk_level` | `VARCHAR(10)` | `'low'` \| `'medium'` \| `'high'` |
| `forecast_hours` | `INT` | 24, 48 ou 72 (validado na entidade) |

---

## Invariantes de domínio

Validações aplicadas no construtor das entidades — violações lançam `DomainError` antes de tocar o banco.

| Entidade | Campo | Regra |
|----------|-------|-------|
| `BeachRegion` | `id`, `name`, `city` | obrigatório (não vazio) |
| `BeachRegion` | `latitude` | −90 ≤ x ≤ 90 |
| `BeachRegion` | `longitude` | −180 ≤ x ≤ 180 |
| `OceanCondition` | `id`, `beachRegionId` | obrigatório |
| `OceanCondition` | `windSpeed`, `currentStrength`, `pollutionDensity` | ≥ 0 |
| `Prediction` | `riskScore` | 0 ≤ x ≤ 100 |
| `Prediction` | `forecastHours` | ∈ {24, 48, 72} |

---

## Mapeamento domínio → banco

| Entidade (TypeScript) | Tabela SQL | Observação |
|-----------------------|-----------|------------|
| `BeachRegion` | `beach_region` | snake_case ↔ camelCase |
| `OceanCondition` | `ocean_condition` | `beachRegionId` → `beach_region_id` |
| `Prediction` | `prediction` | `oceanConditionId` → `ocean_condition_id` |

Mapeamento feito manualmente nos repositórios (`PgBeachRegionRepository`, `PgPredictionRepository`) — sem ORM. Ver [ADR-0004](./adr/ADR-0004-postgresql-pg-driver.md).
