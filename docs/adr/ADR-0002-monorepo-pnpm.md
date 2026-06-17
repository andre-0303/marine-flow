# ADR-0002: Monorepo com pnpm Workspaces

## Status
Aceito

## Contexto

O MarineFlow tem dois pacotes que evoluem juntos: API (`@marine-flow/api`) e frontend (`@marine-flow/web`). Precisamos decidir como organizar e gerenciar as dependências.

Alternativas consideradas:

- **Repos separados**: independência total, mas sem compartilhamento de tipos e CI duplicado.
- **npm workspaces**: suporte nativo, mas lento e sem hoisting eficiente.
- **yarn workspaces**: maduro, mas adiciona Yarn como dependência obrigatória.
- **pnpm workspaces**: symlinks eficientes, hoisting controlado, lockfile único, mais rápido que npm/yarn.

## Decisão

Usar **pnpm workspaces** com dois pacotes na raiz:

```
pnpm-workspace.yaml
├── api/   → @marine-flow/api
└── web/   → @marine-flow/web
```

Scripts centralizados no `package.json` raiz:

```json
"dev:api": "pnpm --filter @marine-flow/api dev",
"dev:web": "pnpm --filter @marine-flow/web dev",
"build":   "pnpm -r build",
"lint":    "pnpm -r lint",
"test":    "pnpm -r test"
```

## Consequências

### Positivas

- `pnpm install` único instala todos os workspaces.
- Lockfile único (`pnpm-lock.yaml`) — reprodutibilidade garantida.
- CI pode rodar `pnpm -r test` e testar tudo de uma vez.
- Fácil adicionar pacotes compartilhados (`packages/shared/`) no futuro.

### Negativas / Trade-offs

- pnpm precisa estar instalado na máquina do dev e no CI.
- `node_modules` com symlinks pode confundir ferramentas que não entendem pnpm hoisting.
