# `tuning-from-ilaenv`

`base.js` takes each tuning value (block size NB, crossover NX, NBMIN, the
QR sweep's NMIN, NWR, NSR, ...) from the `ilaenv` module, called with the
reference's arguments, wherever the reference queries ILAENV or IPARMQ
(`CONVENTIONS.md` X3).

**Files:** `base.js`

The JS used to replace ILAENV with constants copied into each module, and
several were wrong (ticket 0049): crossover points of 0 or 32 where ILAENV(3)
gives 128, dlaqr3's NMIN of 12 where ILAENV(12) gives 75, zlaqr0/4's fixed
window sizes where IPARMQ's depend on NH. A wrong tuning value still gives a
valid result, so no property test sees it; the routine just takes a different
path from the reference at some sizes, and its results differ from the
reference's fixtures there.

The spec's `tuning` list, generated from the reference
(`data/fortran-checks.json` `ilaenv`, `bin/spec-gen/extract.cjs`), records each
query: the function, ISPEC, the routine name it passes and the variable it
assigns. Reported:

1. a routine whose spec lists `tuning` queries, but whose base.js does not
   import the `ilaenv` module (or `iparmq`, for a direct IPARMQ query; ILAENV
   answers ISPEC 12–17 through IPARMQ, so importing `ilaenv` covers those);
2. a variable named after a queried value (`NB`, `NX`, `NBMIN`, `NMIN`, ...,
   in any case, optionally prefixed `DEFAULT_`) that is initialized to a number
   literal and never assigned from an `ilaenv`/`iparmq` call. A literal start
   that a query then replaces is the reference's own pattern (`NBMIN = 2`,
   then `NBMIN = MAX( 2, ILAENV( 2, ... ) )`).

A PARAMETER constant the reference itself fixes (DORMQR's `NBMAX = 64`) is not
a query, so it is not reported.

Examples are in [`fixtures/pass`](fixtures/pass) and [`fixtures/fail`](fixtures/fail).
Run `node --test lint/rules/tuning-from-ilaenv/test.cjs`.
