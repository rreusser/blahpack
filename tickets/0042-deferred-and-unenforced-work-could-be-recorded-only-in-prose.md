---
id: 0042
title: Deferred and unenforced work could be recorded only in prose, so it was dropped
status: open
area: process
opened: 2026-11-20
---

## Problem

Nothing required a known gap to have a ticket. Gaps lived in PR descriptions ("Not in this PR", "Known gaps, not gated", "Follow-ups"), in CONVENTIONS enforcer marks ((warn), (unbuilt), (dup), "not gated"), and in session summaries. A check script could exist without CI running it, and a kind of module file (examples, benchmarks, docs) could exist with no check at all. Each of these let work drop silently.

## Evidence

- PRs #19, #20, #26, #27 and #28 deferred about twenty items in prose; ten were still true on 2026-11-20 with no ticket (now tickets 0028, 0034, 0035, 0037–0040, plus additions to 0002 and 0004).
- `bin/bench-smoke.sh` was clean at PR #20 and failed 90 of 1,824 two days later (ticket 0027). `npm run typecheck` fails with 75 errors (ticket 0029). Neither ran in CI.
- 335 of 912 examples throw (ticket 0041), and about 640 modules document the wrong signature (ticket 0037). Nothing runs or compares either.
- 22 CONVENTIONS rules carried gap marks with no ticket.
- A delegated session for ticket 0028's work left 431 uncommitted files in `.claude/worktrees/regen-old-benchmarks-8b5f10` and no record.

## Reproduce

```bash
git show 0be7ea7c8:bin/tickets.js | grep -c checkRegistry; gh pr view 20 --json body -q .body | grep -n -A3 'Not in this PR'
```
