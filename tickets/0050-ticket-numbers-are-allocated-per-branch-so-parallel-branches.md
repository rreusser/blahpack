---
id: 0050
title: Ticket numbers are allocated per branch, so parallel branches collide and nothing detects it before merge
status: resolved
area: process
opened: 2026-11-20
resolved: 2026-11-20
---

## Problem

`bin/tickets.js new` takes the next free number in the local checkout. Two branches that each open tickets pick the same numbers. Nothing notices until a merge, and then the fix is a manual renumbering: references in tickets, LEARNINGS, code comments, `bin/checks.json` and test files must all move, and commit messages and PR descriptions keep citing the old numbers forever. A missed reference silently points at a different problem, and since tickets are the enforcement backbone (CONVENTIONS P1–P4), that undermines the gate that relies on them.

## Evidence

- Branch `slop/gracious-dijkstra-q3yg0i` opened tickets 0026–0031 while `main` opened its own 0026–0043. Every one of the six collided. They were renumbered to 0044–0049 before merging, and 13 files' references had to be rewritten. The branch's earlier commit messages still cite 0026–0031 (the renumbering commit records the mapping).
- `bin/tickets.js check` validates one checkout, so it cannot see the other branch.

## Reproduce

```bash
git log --oneline --grep="Renumber this branch's tickets"
git ls-tree --name-only origin/main tickets/ | grep -c "^tickets/00[23][0-9]"
```

## Resolution

Prevented at three points. (1) `tickets.js new` allocates past the highest id on origin/main as well as the checkout. (2) `tickets.js check` fails when an id created on the branch (absent at the merge-base) was also created on origin/main, and fails in CI if origin/main is missing instead of skipping. (3) In CI, a PR's merge commit contains both tickets, so the existing duplicate-id check blocks the merge. The Conformance job now checks out full history. Simulated: collision flagged, retitle accepted, new id allocated past the base, missing base in CI is an error.
