---
description: Run Senior Architecture Review — audits hexagonal dependency rules and SOLID violations across all layers. Usage: /arch-review [path]
---

Run a full Senior Architecture Review using the `arch-senior-reviewer` agent.

**Scope:** $ARGUMENTS (default: entire `api/src/`)

Spawn the `arch-senior-reviewer` agent to:
1. Audit dependency rule (domain → nothing, app → domain, infra → app+domain)
2. Check SOLID violations per file (SRP, OCP, LSP, ISP, DIP)
3. Verify domain purity (no framework/I/O imports in domain layer)
4. Check port contract completeness (every port has implementation)

Report all findings with file:line, severity, and concrete fix. End with PASS/FAIL/PARTIAL verdict.
