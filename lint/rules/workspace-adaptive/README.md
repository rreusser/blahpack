# `workspace-adaptive`

`base.js` picks its path from the workspace it is given, wherever the reference
picks it from LWORK (`CONVENTIONS.md` W6).

**Files:** `base.js`

The reference's blocked routines (DGEQRF, DORMQR, DGEHRD, DSYTRF_RK, ...) take
NB from ILAENV, then shrink it, or fall back to unblocked code, when LWORK is
smaller than the blocked path needs. Drivers such as DGESVD, DSYSV and DTREVC3
choose an algorithm by the space they have. That is what lets their callers
document small minimums (DGEEV needs 4N). A `base.js` that hard-codes NB and
partitions WORK on it, whatever WORK's length, overruns a workspace of the
reference's minimum once the problem passes the blocking threshold. A typed
array drops the writes past its end and reads `undefined` there, which becomes
NaN; an iterative caller then spins to its iteration limit (ticket 0100).

The JS LWORK is the workspace's length (W1):
`Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) )`.

Reported: a workspace the spec marks `adaptive` whose `.length` the file never
reads. The spec property is generated from the reference
(`data/fortran-checks.json` `adaptive`, `bin/spec-gen/extract.cjs`): the
reference tests that workspace's LWORK in an IF after its argument checks,
other than to reject it (`INFO = -k`) or to answer a workspace query (`LQUERY`).
A routine whose reference only rejects a short LWORK (DSYTRI2) or has no LWORK
(DPSTRF) may use a fixed block size, provided `ndarray.js` demands what it uses.

The rule checks that the length is read, not that the path chosen from it is
the reference's; each module's tests past the blocking threshold, at the
reference's minimum, check that.

Examples are in [`fixtures/pass`](fixtures/pass) and [`fixtures/fail`](fixtures/fail).
Run `node --test lint/rules/workspace-adaptive/test.cjs`.
