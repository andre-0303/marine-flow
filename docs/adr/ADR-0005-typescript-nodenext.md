# ADR-0005: TypeScript com `module: NodeNext`

## Status
Aceito

## Contexto

A API é Node.js ESM puro (`"type": "module"` no `package.json`). Precisamos escolher a configuração do TypeScript que melhor reflete o comportamento real do Node.js em tempo de execução.

Alternativas consideradas:

- **`module: CommonJS`**: compatível com tudo, mas incompatível com ESM puro — exigiria `require()` e perderia tree-shaking.
- **`module: ESNext` + `bundler`**: adequado para Vite/webpack, não para Node.js nativo (não resolve extensões corretamente).
- **`module: NodeNext`**: replica exatamente a resolução de módulos do Node.js ESM — `import` com extensão obrigatória, `package.json` `exports` respeitados.

## Decisão

Usar **`"module": "NodeNext"` e `"moduleResolution": "NodeNext"`** no `tsconfig.json` da API.

**Consequência direta:** todos os imports dentro de `api/src/` **devem incluir a extensão `.js`** mesmo apontando para arquivos `.ts`:

```typescript
// correto
import { BeachRegion } from '../entities/BeachRegion.js'

// errado — falha em runtime com NodeNext
import { BeachRegion } from '../entities/BeachRegion'
```

O TypeScript resolve `.js` → `.ts` em tempo de compilação. O Node.js recebe `.js` em runtime — comportamento correto para ESM nativo.

## Consequências

### Positivas

- Paridade total entre TypeScript e Node.js ESM em runtime — sem surpresas.
- `package.json` `exports` field respeitado (permite encapsular internals de pacotes).
- Futuro-compatível com o ecossistema ESM que é o padrão do Node.js moderno.

### Negativas / Trade-offs

- **Extensão `.js` obrigatória em todos os imports** — confunde devs acostumados com `module: CommonJS` ou bundlers.
- Ferramentas antigas (jest sem config especial, ts-node sem `--esm`) não funcionam sem ajuste.
- `tsx` (usado no `dev:api`) lida corretamente — mas precisa estar documentado para novos devs.
