---
name: blahpack-deps
description: Show the dependency tree for a BLAS/LAPACK routine
argument-hint: <routine>
---

Show the dependency tree for a BLAS/LAPACK routine. Run:

```
python bin/deps.py $ARGUMENTS
```

Show the tree view by default. If the user asks for implementation order, add `--order`. If they ask for JSON, add `--json`.

Summarize which dependencies are already implemented by checking which directories exist under `lib/blas/` and `lib/lapack/`.
