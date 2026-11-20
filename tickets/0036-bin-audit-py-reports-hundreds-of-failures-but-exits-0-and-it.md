---
id: 0036
title: "`bin/audit.py` reports hundreds of failures but exits 0, and its checks contradict CONVENTIONS"
status: open
area: conformance
opened: 2026-11-20
---

## Problem

`bin/audit.py --summary` prints per-check failure counts and always exits 0, so it cannot gate anything. Its checks also predate CONVENTIONS v1. It reports `license: 0/899 (899 failing)` while CONVENTIONS F4 says every source file has the header, and it counts module `LEARNINGS.md` and `example` gaps that no rule requires. A reader cannot tell which of its numbers are real problems. The bash `bin/audit.sh` is a separate, passing check.

## Evidence

- `python3 bin/audit.py --summary` on main: `license 0/899`, `learnings 339/899 (560 failing)`, `eslint 363/883 (520 failing)`, `example 178/899 (721 failing)`, `ndarray 856/861 (5 failing)`; exit 0.
- Not run by CI or any npm script.

## Reproduce

```bash
python3 bin/audit.py --summary | tail -8; echo "exit $?"
```
