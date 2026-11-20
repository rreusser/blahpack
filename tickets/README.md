# Tickets

One file per known **problem** with the library: `NNNN-<slug>.md`.

A ticket states something that is false, unverified, or unenforced, not a task.
The fix may take many forms, and the ticket should outlive any one plan for it.

| Ticket (a problem) | Not a ticket (a to-do) |
| --- | --- |
| Conformance does not structurally prevent inconsistent argument counts | Enforce argument counts |
| Eigenvector routines never write the `M` output count | Fix `M` in dtrevc |
| Nothing shows that harness size sweeps reach blocked code paths | Add large-N sweeps |

`node bin/tickets.js check` (run in CI) rejects titles that open with an
imperative verb, and enforces the format below.

## Format

```markdown
---
id: 0007
title: <problem statement>
status: open | resolved
area: wrappers | base | docs | harness | typecheck | ci | ...
opened: YYYY-MM-DD
resolved: YYYY-MM-DD        # resolved tickets only
---

## Problem      what is wrong, and why it matters
## Evidence     concrete instances: file:line, seeds, counts, LEARNINGS.md entries
## Reproduce    a bash block that shows the problem
## Resolution   resolved tickets only: the commit, and what now prevents a recurrence
```

## Commands

```bash
node bin/tickets.js                       # open tickets
node bin/tickets.js all                   # every ticket (also: resolved)
node bin/tickets.js show 7
node bin/tickets.js new "X is inconsistent across Y" --area base
node bin/tickets.js resolve 7 "Fixed in <sha>; the ld-rules check now rejects array-typed bounds."
node bin/tickets.js reopen 7 "Recurred in zfoo: ..."
node bin/tickets.js check
PR_BODY="$(gh pr view 42 --json body -q .body)" node bin/tickets.js pr-body
```

## Rules

- A known problem is a ticket, not prose (CONVENTIONS P1–P4). `check` fails
  when a CONVENTIONS enforcer marked (warn)/(unbuilt)/(dup)/dead, or a doc line
  that says something isn't in CI, cites no open ticket naming it. It also fails
  when a check script or a kind of module file is neither gated nor ticketed
  (`bin/checks.json`). `pr-body` fails when a PR description defers work
  without citing a ticket.

- Resolve a ticket only when the problem is gone, not when a workaround lands.
  Prefer resolutions that make the problem structurally impossible (a check, a
  lint rule, a harness property) and name that mechanism in `## Resolution`.
- A harness-found bug still gets its `test/harness/LEARNINGS.md` entry. The
  ticket tracks the open problem, and LEARNINGS records what was learned.
- Never delete a ticket. Reopen it if the problem comes back.
