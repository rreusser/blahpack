# dsconv: Translation Learnings

First routine of the ARPACK symmetric-eigensolver translation; several
learnings here are one-time setup that apply to the whole `lib/arpack` effort.

## Translation pitfalls

-   **Output scalar → return value.** The reference `dsconv(n, ritz, bounds,
    tol, nconv)` writes `nconv` as an output argument. Idiomatic JS returns it
    instead, matching how `idamax`/`dsteqr` handle their outputs. The signature
    generator emits `nconv` as a trailing parameter; drop it and add
    `@returns`.
-   **`dlamch` string.** ARPACK's `dlamch('Epsilon-Machine')` is LAPACK `'E'`
    (relative machine epsilon). In this repo call `dlamch('epsilon')`.
-   **Stripped legacy plumbing** per `docs/optimization-policy.md`: the
    `arscnd` timing calls and the `include 'debug.h'` / `include 'stat.h'`
    COMMON blocks carry no numerics and are omitted. See
    `docs/arpack-translation.md`.

## Dependency interface surprises

-   `dlamch` lives at `lib/lapack/base/dlamch`; the import depth from
    `lib/arpack/base/<r>/lib/base.js` is `./../../../../lapack/base/...`.

## Fixture toolchain (ARPACK, one-time infra)

-   The reference-fixture path now supports `arpack`:
    `./test/run_fortran.sh arpack <routine>` (extended `run_fortran.sh` with an
    arpack branch that resolves deps across arpack SRC/UTIL + lapack
    SRC/INSTALL + BLAS, and adds `-I data/arpack-ng-3.9.1` for the includes).
-   `deps_<routine>.txt` lists the non-BLAS Fortran dependencies. The ARPACK
    timer `arscnd` is defined in `UTIL/second.f`, so list it as **`second`**
    (the file/module name), not `arscnd`. `lsame` is BLAS and auto-linked.
-   `bin/init_routine.py` / `bin/scaffold.py` now accept `arpack` as a package
    and resolve sources from `data/arpack-ng-3.9.1/SRC` (falling back to
    `EXAMPLES/BAND` for `dsband`).

## Testing

-   Module tests are ESM (`"type": "module"`). The scaffold's fixture test
    emits CommonJS (`require`); rewrite as ESM reading the repo-level JSONL via
    `readFileSync( new URL( ..., import.meta.url ) )`.
-   `@example` blocks are linted as scripts (doctest), so use
    `var X = require( '@stdlib/...' )`, never `import`.
