# ADR-0004: PostgreSQL com driver `pg` (sem ORM)

## Status
Aceito

## Contexto

O sistema precisa persistir `beach_region`, `ocean_condition` e `prediction`. A camada de persistência é um adapter externo (port `out/`) — o domínio não sabe nada sobre SQL.

Alternativas consideradas:

- **Prisma**: ORM com geração de tipos, migrações declarativas. Porém gera camada de abstração própria que vaza para o domínio e dificulta SQL customizado.
- **Drizzle**: type-safe, SQL-first, mais leve. Bom, mas adiciona DSL própria.
- **TypeORM**: decorators, ActiveRecord ou DataMapper. Pesado para MVP.
- **pg (node-postgres) puro**: SQL direto, sem mágica, sem geração de código. Máximo controle.

## Decisão

Usar **`pg` (node-postgres)** com SQL escrito manualmente nos repositórios:

```
infrastructure/database/repositories/
├── PgBeachRegionRepository.ts
└── PgPredictionRepository.ts
```

Cada repositório implementa a interface `out/` do domínio com queries SQL explícitas. Migrações gerenciadas com arquivos `.sql` versionados em `infrastructure/database/migrations/`.

Conexão via `DATABASE_URL` (env var), pool gerenciado pelo `pg.Pool`.

## Consequências

### Positivas

- Zero abstração entre o código e o banco — queries legíveis e otimizáveis.
- Sem geração de código no build — sem `prisma generate`, sem passos extras no CI.
- Repositórios completamente substituíveis (outro banco = novo adapter, mesma interface).
- SQL explícito facilita auditoria e debug de queries lentas.

### Negativas / Trade-offs

- Sem migrations automáticas — arquivos `.sql` precisam ser aplicados manualmente ou via script.
- Mais boilerplate nos repositórios (mapeamento manual row → entity).
- Sem type-safety automática dos resultados de query (cast manual necessário).
