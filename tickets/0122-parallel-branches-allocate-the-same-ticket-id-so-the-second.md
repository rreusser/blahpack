---
id: 0122
title: Parallel branches allocate the same ticket id, so the second merge fails CI or breaks main
status: open
area: tickets
opened: 2026-11-27
---

## Problem

`bin/tickets.js new` takes the next id as one more than the highest id in the local tree. Two branches that each open a ticket pick the same id. Each PR passes `tickets.js check` on its own. Whichever merges second either fails CI, if CI runs against the updated main, or puts two tickets with the same id on main, which then fails the check for every later PR.

## Evidence

Three collisions in one session, 2026-11-27:
- PRs #61 and #62 both added a 0110 and both merged. main then failed `tickets.js check`, and PR #63 renumbered the stdlib ticket to 0114.
- PR #61's own 0109 collided with main's AAA 0109 and was renumbered to 0110 before merging.
- PR #65's 0117–0120 collided with main's notebook 0117; they were renumbered to 0118–0121.
- PR #67's 0118–0120 (fortran-docs) collided with main's 0118–0120 (dlarrd, dgeevx/dgeev fixtures, dgehrd); they were renumbered to 0127–0129.

Each renumbering also meant updating every `ticket NNNN` reference by hand: CONVENTIONS, docs and other tickets.

## Reproduce

```bash
git log --oneline --all -- 'tickets/0110-*' | head
```

## Direction

Pick ids that can't collide, for example by reading the highest id on `origin/main` and on open PR branches at allocation time, or by reserving ids on main. Otherwise, make the PR check run against the merge with the current main and require the branch to be up to date before merging.
