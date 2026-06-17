# ADR-0001: Arquitetura Hexagonal (Ports & Adapters)

## Status
Aceito

## Contexto

O MarineFlow precisa calcular scores de risco ambiental a partir de variáveis oceânicas. A lógica de negócio (pesos, thresholds, explicação) é o coração do produto — não pode vazar para frameworks ou banco de dados.

Alternativas consideradas:

- **MVC tradicional** (controller → service → model): simples, mas acopla lógica de negócio ao framework HTTP e ao ORM.
- **Arquitetura em camadas (layered)**: melhor que MVC, mas a regra de dependência é fraca — camadas inferiores ainda podem ser referenciadas por qualquer camada acima.
- **Hexagonal (Ports & Adapters)**: domínio no centro, frameworks e banco são adaptadores externos. Domínio não depende de nada externo.

## Decisão

Adotar **Arquitetura Hexagonal** com a seguinte estrutura de camadas e regra de dependência estrita:

```
domain      ←  application  ←  infrastructure
(nada)         (domain)        (application + domain)
```

**Ports** definem contratos:
- `ports/in/`  — interfaces dos casos de uso (driven side / entrada)
- `ports/out/` — interfaces dos repositórios (driving side / saída)

**Adapters** implementam os ports:
- `infrastructure/http/controllers/` — adapta HTTP → domínio
- `infrastructure/database/repositories/` — adapta PostgreSQL → domínio

**Regra absoluta:** `domain/` e `application/` jamais importam de `infrastructure/`.

## Consequências

### Positivas

- Domínio testável sem banco, sem HTTP, sem Docker.
- Trocar PostgreSQL por outro banco = criar novo adapter, sem tocar domínio.
- `RiskCalculatorService` é lógica pura — testável como função simples.
- SOLID naturalmente aplicado: DIP resolvido pelos ports, SRP por camada.

### Negativas / Trade-offs

- Mais arquivos e interfaces para um MVP simples.
- Curva de aprendizado para quem vem de MVC.
- Injeção de dependência manual (sem contêiner IoC) — `server.ts` instancia tudo.
