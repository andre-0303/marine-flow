# ADR-0003: Fastify como framework HTTP

## Status
Aceito

## Contexto

A API precisa de um framework HTTP Node.js para registrar rotas, validar schemas e serializar respostas. O domínio deve permanecer totalmente isolado da escolha do framework.

Alternativas consideradas:

- **Express**: ecossistema enorme, familiar, mas sem validação nativa, sem tipagem de schemas, mais lento.
- **Hono**: ultraleve, edge-first, mas ecossistema menor para Node.js tradicional.
- **NestJS**: opinionated, decorators, DI container embutido — overkill para MVP, esconde a arquitetura hexagonal sob abstrações próprias.
- **Fastify**: rápido, schema-first (JSON Schema / Zod), plugins oficiais, tipagem TypeScript de primeira classe.

## Decisão

Usar **Fastify 4.x** com a seguinte convenção de organização:

```
infrastructure/http/
├── routes/      # registra plugins/rotas no servidor Fastify
└── controllers/ # funções puras: req → useCase.execute() → reply
```

Controllers não conhecem Fastify além dos tipos `FastifyRequest` / `FastifyReply` — troca de framework exigiria apenas reescrever controllers.

## Consequências

### Positivas

- Serialização automática de JSON ~2× mais rápida que Express.
- Schema de validação declarativo no registro da rota (sem middleware extra).
- TypeScript types gerados automaticamente a partir do schema da rota.
- Plugin `@fastify/cors`, `@fastify/helmet` plugáveis sem boilerplate.

### Negativas / Trade-offs

- API de plugins diferente do Express — curva de aprendizado para devs vindos de Express.
- Ecossistema menor que Express (menos exemplos disponíveis online).
