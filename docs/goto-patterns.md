# GOTO Restructuring Patterns

For routines with GOTOs, restructure them during translation:

| Pattern | Fortran | JavaScript |
|---------|---------|-----------|
| Loop continue | `IF (cond) GO TO 40` inside DO 40 | `if (cond) continue` |
| Loop break | `GO TO 30` breaks loop, `30: INFO=J` | `info = j+1; return info` |
| Loop exit past post-loop code | `IF (c) GO TO 60` in DO 40; `40 CONTINUE; X = Y; 60 CONTINUE` | `break` alone is WRONG (falls into `X = Y`); guard it: `if ( j === jlast ) { x = y; }` or a flag |
| While-loop | `10: ... IF (cond) GO TO 10` | `do { ... } while (cond)` |
| Skip-ahead | `IF (cond) GO TO 30` (30 below) | `if (!cond) { ... }` |
| Computed GOTO | `GO TO (20, 90) IFLOW` | Nested while loops with break |
| Phase jump | `IF (LSAME(JOB,'S')) GO TO 190` | Extract phases into separate functions |
| Error exit | `GO TO 180` (non-convergence) | `return info` or set `done = true` flag |
| Linked-list traversal | `60: IF (LSTICC>0) THEN ... GO TO 60` | `while (lsticc > 0) { ... }` |
| Deflation/continue | `GO TO 160` (skip step) | `continue` in main loop |

**Caution with `break`:** a `break` is equivalent to the `GO TO` only when no
statement sits between the loop's end and the target label. Check the Fortran
for code between `NN CONTINUE` and the label; the `*latrs`/`*latps`/`*latbs`
growth bounds got this wrong in all six routines (test/harness/LEARNINGS.md,
2026-11-18).

**Caution with closures:** If you extract GOTO targets into nested functions,
`return` only exits the inner function, not the outer loop. Use a `done` flag
checked after each call to propagate early exits.

Most GOTO restructuring is routine-specific and does not generalize to a
reusable automated transform. The automated transforms (`remove-trivial-goto`,
`remove-trivial-if-goto`) handle the easy cases; the complex patterns above
require manual judgment.

## Composable Code-Mod Pipeline

For routines with GOTOs that benefit from incremental Fortran restructuring:

```bash
python bin/transform.py --list                              # List transforms
python bin/transform.py pipeline/<r> --init <pkg> <r>       # Initialize
python bin/transform.py pipeline/<r> --apply <transform>    # Apply transform
python bin/transform.py pipeline/<r> --verify <step>        # Verify step
```

Available transforms: `remove-trivial-goto`, `remove-trivial-if-goto`,
`free-form`, `translate-to-js`.
