# Architecture Decision Records

Registro das decisões arquiteturais do MarineFlow. Cada ADR documenta o contexto, a decisão tomada e as consequências.

| # | Título | Status |
|---|--------|--------|
| [0001](./ADR-0001-arquitetura-hexagonal.md) | Arquitetura Hexagonal (Ports & Adapters) | ✅ Aceito |
| [0002](./ADR-0002-monorepo-pnpm.md) | Monorepo com pnpm Workspaces | ✅ Aceito |
| [0003](./ADR-0003-fastify.md) | Fastify como framework HTTP | ✅ Aceito |
| [0004](./ADR-0004-postgresql-pg-driver.md) | PostgreSQL com driver `pg` (sem ORM) | ✅ Aceito |
| [0005](./ADR-0005-typescript-nodenext.md) | TypeScript com `module: NodeNext` | ✅ Aceito |

## Como criar um novo ADR

1. Copie o template abaixo
2. Numere sequencialmente (`ADR-0006-...`)
3. Adicione a entrada na tabela acima
4. Status possíveis: `Proposto` → `Aceito` → `Depreciado` / `Substituído por ADR-XXXX`

```markdown
# ADR-XXXX: Título

## Status
Proposto

## Contexto

## Decisão

## Consequências

### Positivas

### Negativas / Trade-offs
```
