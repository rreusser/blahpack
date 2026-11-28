# dorbdb3: differences from the reference

## `X21` is rotated with its own stride

The reference rotates `X21` with `X11`'s leading dimension:

```fortran
CALL DROT( Q-I+1, X11(I-1,I), LDX11, X21(I,I), LDX11, C, S )
```

`X21(I,I), LDX11` walks row `I` of `X21` with `X11`'s column stride. That is only
correct when `LDX11 = LDX21`. The reference's own caller (`xORCSD2BY1`) passes
`X11` and `X21` as blocks of one array, so it always holds there.

`base.js` uses `strideX212` (`X21`'s own column stride). This gives the reference
result whenever the reference is right (equal strides), and stays correct when
the strides differ. That includes row-major storage, where the two blocks'
strides are never related by a single leading dimension. A faithful copy of the
typo can't be layout-independent at all.

Found by `lint/rules/stride-provenance` (CONVENTIONS S13). Regression test:
`test/test.layout.js`. See `test/harness/LEARNINGS.md`, 2026-11-20.
