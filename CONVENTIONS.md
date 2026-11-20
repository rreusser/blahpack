# CONVENTIONS.md — v1

The normative conventions for every module under `lib/`. Each rule has an ID, a
one-line statement, a rationale, and an **enforcer**. Skills and docs cite these
IDs; they don't restate the rules.

Process (`docs/enforcement-architecture.md` §2):

1. **Define** the rule here.
2. **Check** it with an exact enforcer. Prefer a lint rule.
3. **Conform** the corpus.
4. **No exemptions.** If a routine fails, either the rule is missing a real
   subtlety (fix the rule and pin it with a fixture) or the code is wrong (fix
   the code).

A rule with no named enforcer is a defect in this file.

## Enforcer notation

| Tag | Meaning | Gate in CI? |
|---|---|---|
| `lint:<rule>` | ESLint rule in `lint/rules/<rule>/`; always `error` | yes (`npm run test:lint`) |
| `hatch` | `lint/verify-no-escape-hatches.cjs` | yes (`npm run lint:escape-hatches`) |
| `conf:<id>` | `bin/conformance.js` result at **fail** level | yes (`npm run conformance:fast`), except `tests.coverage-*` (needs `--coverage`) |
| `ci:<job>` | another CI step (`package`, `tickets`, `pr-body`, `test:unit`, `test:lint-rules`) | yes |
| `harness:<check>` | property-based harness (`test/harness/`) | per-routine tests only; levels are not gated [ticket 0034] |
| `skill:<file>#<section>` | judgment, applied in review by a skill | no (judgment) |

Marks on an enforcer:
- **(warn)**: the check exists but only warns, so it gates nothing.
- **(unbuilt)**: no check exists yet. These are the worklist for Steps 3–4
  of the architecture plan.
- **(dup)**: a second enforcer for the same rule. It gets deleted in Step 3.

---

## S: Signatures and the three forms

A module states its routine in three places. Two of them are exact projections
of the third:

```
     spec/<routine>.json (generated from the reference Fortran)
                │  authority
                ▼
            base.js  ── offset form
          ┌─────┴──────┐
          ▼            ▼
     ndarray.js    <routine>.js
     (≡ base.js)   (≡ strided projection of base.js)
```

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| S1 | `base.js` params expand the Fortran signature. A 1-D array becomes `x, strideX, offsetX`. A 2-D array becomes `A, strideA1, strideA2, offsetA`. A complex scalar becomes `x, offsetX`. A complex FUNCTION adds `out, offsetOut`, except the level-1 BLAS dot products `zdotc`/`zdotu`, which return a `Complex128` like stdlib's (ruled 2026-11-19). `INFO` is the return value, not a parameter. | Fortran is the authority. | `lint:spec-signature` |
| S2 | Every `stride*`/`offset*` param names an array that really exists (`strideA1`, `offsetA`). On a name collision, a 1-D array takes a trailing `1` (`strideQ21`). | Stride/offset bindings stay legible and checkable. | `lint:spec-signature` |
| S3 | `ndarray.js` params ≡ `base.js` params, exactly. No renames; nothing added or dropped (workspace included). | `ndarray.js` is the public offset form. | `lint:spec-signature` |
| S4 | `<routine>.js` params ≡ the strided projection of `base.js` (`lint/lib/strided-projection.cjs`): 1-D `x, strideX, offsetX` → `x, strideX`; 2-D/banded → `A, LDA`; packed → `AP`; workspace → `WORK`; complex scalar → `x`. | stdlib's BLAS/LAPACK-classic API. | `lint:spec-signature` |
| D1 | `order` (`'row-major'`/`'column-major'`) appears **only** in `<routine>.js`, and only when the routine takes a non-workspace matrix (LD or packed). It is the first param. It never appears in `base.js`/`ndarray.js`. A Fortran argument literally named `ORDER` (`dstebz`, `dlarrd`: `'block'`/`'entire'`) is not the layout flag and keeps its name. | Two strides already encode the layout. Matches stdlib `dgemm`/`dgemv`/`dlaswp`. | `lint:spec-signature`; `lint:spec-prologue` (layout check) |
| D2 | In the strided form, data vectors and index arrays keep a stride. 2-D/banded matrices take `LD<A>`. Packed matrices and workspace take no stride. | stdlib; a stride on caller-owned scratch means nothing. | `lint:spec-signature` |
| D3 | The strided form has no `offset*` params. The offset comes from `stride2offset( len, stride )`. | stdlib. | `lint:spec-signature` |
| S5 | No leading-dimension (`LDA`, `ld*`) params in `base.js`/`ndarray.js`. | Strides replace them. | `lint:spec-signature` |
| S6 | Column-major `<routine>.js` → base strides `(1, LDA)`; row-major → `(LDA, 1)`. | Definition of `order`. | `harness:layout-invariance` |
| S7 | Names are canonical everywhere: `DA → alpha`, `DB → beta`, and the level-1 vectors `DX`/`SX → x`, `DY`/`SY → y`, `DPARAM → param` (unless the alias collides with another argument). Otherwise params keep their Fortran names (case-insensitive). | One name per concept, matching stdlib. | `lint:spec-signature` (names from `spec/<routine>.json`; alias table in `bin/spec-gen/build.cjs`) |
| S8 | `<routine>.js` calls `base.js`, never `ndarray.js`. `ndarray.js` calls `base.js`. | One validation layer per entry point. | `conf:conventions.routine-calls-base`, `conf:conventions.ndarray-calls-base` |
| S9 | Every `base(...)` call passes exactly `base.length` args. | Catches argument drift after a signature change. | `conf:base-arity` |
| S10 | Each output scalar (a Fortran out/inout non-array argument other than `INFO`) is its own caller-provided length-1 typed array param (`Float64Array`/`Int32Array`), named after the Fortran argument and in its Fortran position. A complex one is `x, offsetX` (S1). So is a scalar that callers pass as an element of their own array, read or updated in place (`alpha`/`tau` of dlarfg, dlarfgp; `f`, `g`, `c` of zlartg; `b`, `c` of zrotg; the inputs `x`, `y` of zladiv and `tau` of zlarf, zlarz), marked `element` by a spec override with its reason (ruled 2026-11-19). Output scalars are never returned in a result object or packed into a shared `out` array. A CHARACTER output (`EQUED`) is a caller-provided single-element `Array` (ruled 2026-11-19). A scalar index the JS takes 0-based is marked `base: 0` by a spec override (its reference checks are restated 1-based). Reverse-communication (IDO) routines take a leading state object. | JS has no by-reference scalars. One derivable form (from the spec) instead of per-routine result shapes. | `lint:spec-signature` (shape); `lint:spec-jsdoc` (typed-array kind, `@param` type) |
| S11 | Return value: `INFO` (integer) for LAPACK subroutines; the result for FUNCTIONs; otherwise the primary (last) output array (BLAS, stdlib style). An in/out `INFO` (ARPACK) also enters as the param `infoIn`. | stdlib return conventions. | `spec.returns`; `lint:spec-jsdoc` (`@returns`) |
| S12 | Public pivot/index arrays (`IPIV`, `JPVT`, `IBLOCK`, …) are **0-based**. Fortran's 1-based values are converted inside `base.js`. `ndarray.js` passes them through. | JS indexing; same meaning across both entry points. | `harness:reconstruction` (pivot round-trip) |
| S13 | `base.js` honors every array's full addressing. Each element index is computed from the array's own offset, and an array passed to a callee carries strides computed from *its own* strides (never a literal, never another array's) and an offset computed from its own offset. A Fortran `X(1,K), 1` becomes `strideX1`, not `1`. Workspace is D5's. | Any layout the caller describes is honored: row-major, padded, offset, negative stride. A literal stride is a hidden column-major assumption. | `lint:stride-provenance`; `harness:layout-invariance` (`test/harness/spec-layout.js`) |

## W: Workspace

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| D4 | `base.js`/`ndarray.js` never allocate a problem-sized workspace. The caller owns it, and `base.js` takes every Fortran workspace array (`WORK`, `RWORK`, `IWORK`, `BWORK`, `SWORK`) as a parameter. | Drivers reuse one buffer across callees; no hidden allocation. | `lint:no-internal-workspace-alloc`; `conf:workspace.caller-provided`; `conf:workspace.no-internal-alloc` (dup) [ticket 0031] |
| D5a | The workspace **offset** is honored by `base.js` and forwarded to callees, never replaced by a literal `0`. | Drivers sub-allocate one buffer by offset (`zggevx` → `ztgevc`). | `lint:workspace-addressing-honored` |
| D5b | The workspace **stride** is unit-only. `ndarray.js` throws `RangeError` unless it is `1`, except where `base.js` really honors it (a `WORK` that is a documented output, e.g. `dlasd5`). A stride is never silently ignored. | Supported ⇒ honored; unsupported ⇒ rejected. | `lint:workspace-addressing-honored`; `harness:unitStride` (offset varies, outputs bit-identical) |
| D5c | `<routine>.js` takes workspace with no stride. It **must** accept `null` and then allocate a sufficient workspace, passing `WORK, 1, 0` to `base.js`. | Convenience lives in the wrapper only. | `lint:spec-signature` (no stride); `lint:spec-jsdoc` (`(T\|null)`); `conf:work-autoalloc` (null branch) |
| W1 | No workspace-length param (`LWORK`, `LRWORK`, `LIWORK`, …): a typed array carries `.length`. ARPACK's `LWORKL` is the one exception. It is a Fortran *partition size* of `workl`, not an allocation query. | Redundant, and invites mismatch. | `lint:no-lwork-param`; `conf:workspace.naming` (dup, lwork half) [ticket 0031] |
| W2 | Workspace stride/offset names use stdlib camel case: `strideWork`, `offsetWork`, `strideIWork`, `offsetRWork`. Never `strideWORK`. The array keeps its Fortran name (`WORK`, `IWORK`). | stdlib naming. | `conf:workspace.naming` |
| W3 | `ndarray.js` checks the workspace length and throws `RangeError` when it's too small: `WORK.length - offsetWork < required`. Zero-dimension quick returns come **before** that check. | A short buffer must fail loudly, not read past the end. Empty problems need no workspace. | `conf:work-assert`, `conf:work-assert.early-return-order` (only `WORK`; `IWORK`/`RWORK` unbuilt); `harness:assertWorkspaceSufficient` (the advertised minimum suffices) [ticket 0016] |
| W4 | In z/c routines, a complex workspace allocated by the wrapper is a `Complex128Array`/`Complex64Array`, unless `base.js` documents a `Float64Array`. | Matches the Fortran type; `reinterpret` works on it. | `conf:workspace.complex-workspace-type` |
| W5 | The required workspace size is documented in the `@param` JSDoc. | Replaces LWORK queries. | sizes: `spec` `minLength`; JSDoc text (unbuilt) [ticket 0016] |

## V: Argument validation

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| V1 | Public entry points (`ndarray.js`, `<routine>.js`) reject what the reference rejects (its `INFO = -k` checks), with `TypeError` for options and `RangeError` for numbers. | Supported ⇒ honored, unsupported ⇒ rejected, with Fortran as the arbiter. | `lint:spec-prologue` (generated from the spec's checks) |
| V2 | `base.js` does no argument validation and imports no validators. | Validate once, at the boundary. Internal callers pass known-good args. | `conf:conventions.base-no-param-validation` (warn) [ticket 0024] |
| V3 | Each option param is validated, and accepts exactly the values the reference accepts. `ndarray.js` and `<routine>.js` accept the same set. | No silently-misread flags. | `lint:spec-prologue` |
| V4 | Dimension params (`M`, `N`, `K`, `nrhs`, …) are checked `≥ 0` with `RangeError` in both entry points. | Reference `INFO` checks. | `lint:spec-prologue` |
| V5 | `<routine>.js` checks leading dimensions exactly as the reference does (column-major: `LDA < max(1, rows)`; row-major uses columns), with no extra checks. | Reference-derived; no invented constraints. | `lint:spec-prologue` (row-major bound: `spec` `rowMajor`); `harness:assertLeadingDimGuard` (output-inclusive extent) |
| V6 | `<routine>.js` validates `order` with `isLayout` (`TypeError`, "First argument must be a valid order") whenever it takes `order` (D1). | stdlib. | `lint:spec-prologue` |
| V7 | A vector stride is rejected (`RangeError`) when it is zero exactly where the reference rejects `INCX = 0` (level-2/3 BLAS). Matrix strides are not checked. | V1 applied to strides. | `lint:spec-prologue` (`nonzero` checks on INC arguments) |
| V8 | Error messages use stdlib wording through `format()`: `'invalid argument. <Ordinal> argument must be <constraint>. Value: \`%s\`.'`. No string concatenation. | One message catalog (Message DB, §2). | `lint:spec-messages` |
| V9 | Validators come from stdlib assert packages, bound to their package name: `isLayout`, `isTransposeOperation`, `isMatrixTriangle`, `isOperationSide`, `isDiagonalType`. Use `isTransposeOperation`, not `isMatrixTranspose`. Options without a stdlib helper use an explicit whitelist. | stdlib is moving off `isMatrixTranspose`; one binding name per package. | `lint:spec-prologue` (generated validators) |
| V10 | Quick returns are written in `base.js`, mirroring the Fortran. `ndarray.js` may repeat a zero-dimension quick return, and must if it checks workspace (W3). | Fortran faithfulness; empty problems must not fail the workspace check. | `conf:work-assert.early-return-order`; `conf:implementation.ndarray-early-return` (warn) [ticket 0024] |

## N: Names, strings, and imports

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| N1 | Option params take long-form stdlib strings: `'no-transpose'`/`'transpose'`/`'conjugate-transpose'`, `'upper'`/`'lower'`/`'all'`, `'left'`/`'right'`, `'unit'`/`'non-unit'`, `'row-major'`/`'column-major'`, and the other canonical values in [Appendix A](#appendix-a-canonical-option-strings). Never single-char codes in code, tests, examples, or benchmarks. | stdlib public API. | `conf:strings.no-single-char-code`, `conf:scaffold-noise.no-single-char-in-examples` |
| N2 | d-prefix (real) routines never use `'conjugate-transpose'`. | It is meaningless for real data. | `lint:no-dprefix-conjugate-transpose`; `conf:strings.no-dprefix-conjtrans` (dup) [ticket 0031] |
| N3 | Single-char flag values in `@param` text are backticked. | Doc consistency. | `lint:jsdoc-backtick-params`; `conf:strings.no-single-char-param` (dup) [ticket 0031] |
| N4 | ESM only: `import … from '…/lib/index.js'` (deep path to stdlib packages and to `../../<dep>/lib/base.js` for internal deps), `export default`. Use `const`/`let`, never `var`, and never `require()`. | The codebase is ESM. | (unbuilt; Step 4 ESM-style rule) [ticket 0032] |
| N5 | Fortran-only spellings (`LDA`, `INCX`, `LDZ`, …) don't appear in `base.js` JSDoc. | The JS form has strides, not LDs. | `conf:jsdoc.no-stale-fortran` |
| N6 | Local names and comments are meaningful and faithful to the Fortran's variables. | Readability; reviewability against the reference. | `skill:blahpack-translate#naming-and-comments` |
| N8 | One vocabulary per option: the strings `ndarray.js` and `<routine>.js` validate are exactly the strings `base.js` dispatches on. Validators are positive whitelists of every legal value. No translation tables (`*_MAP`) and no aliases. A new option reuses its sister routine's canonical values (Appendix A), or picks the most specific name (`'all-columns'` over `'all'`). | A validator/base mismatch passes validation and then takes a wrong branch silently (dgesvd, dorgbr, dormbr, dlascl). | `lint:spec-prologue` (both entry points validate the spec's Appendix A set); validator ≡ base-dispatch set (unbuilt); `conf:scaffold-noise.no-wrapper-string-map` (dead: matches only `var`) [ticket 0022, ticket 0025] |
| N7 | stdlib `max`/`min` take exactly two args. | The stdlib functions are binary; a third arg is silently dropped. | `lint:no-nary-stdlib-minmax` |

## C: Complex (z/c-prefix)

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| C1 | Complex arrays cross the API as `Complex128Array` (`Complex64Array` for c). Strides and offsets are in **complex elements**. | stdlib. | `lint:spec-jsdoc` (`@param` types) |
| C2 | `base.js` indexes complex data through `reinterpret()` Float64 views. Strides and offsets are doubled once, at the top. | Fast, allocation-free access. | `lint:z-prefix-reinterpret`; `conf:complex.reinterpret` (dup) [ticket 0031] |
| C3 | Complex division, `abs`, and `sqrt` go through `lib/cmplx.js` (`cmplx.div`, `cmplx.abs`, `cmplx.abs1At`, …). They are never inlined. Mul/add/conj may be inlined. | Inline forms overflow/underflow where the robust algorithms don't. | `conf:complex.no-inline-division` (warn); `skill:blahpack-translate#complex-arithmetic` [ticket 0024] |
| C4 | Complex scalar params are `Complex128`, read with `real()`/`imag()`. | stdlib. | `lint:spec-signature` (shape); `lint:spec-jsdoc` (type) |
| C5 | Hermitian vs symmetric, conj vs no-conj, `zrot`'s complex sine: follow the Fortran exactly. | Silent wrong answers otherwise. | `skill:blahpack-translate#complex-arithmetic`; `harness:reconstruction` |

## F: Files and module surface

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| F1 | Every module has the full stdlib file set: `package.json`, `README.md`, `lib/{index,main,base,ndarray,<routine>}.js`, `test/{test,test.ndarray,test.<routine>}.js`, `docs/types/{index.d.ts,test.ts}`, `docs/repl.txt`, `examples/index.js`, `benchmark/{benchmark,benchmark.ndarray}.js`, `LEARNINGS.md` (or `.integrated.md`). | The stdlib package layout. | `conf:file-structure.all-files` |
| F2 | `package.json` is valid and has `name`, `description`, `license`, and `keywords`. | Packaging. | `conf:file-structure.package-fields` |
| F3 | `main.js` imports `<routine>.js` and `ndarray.js`, attaches `.ndarray` with `setReadOnly`, and default-exports. `index.js` re-exports `main`. There's no native-addon loading. | stdlib surface; there are no native addons. | `lint:module-exports`; `conf:conventions.main-requires-both`; `conf:conventions.main-setreadonly` (warn: `module-exports` also accepts plain assignment; tighten it) [ticket 0024] |
| F4 | Every source file starts with the `@license MIT` header. | Repo license (912/912 today). | (unbuilt) [ticket 0032] |
| F5 | Every `lib/*.js` parses (`node --check`). | Basic hygiene. | `conf:syntax.lib-parse` |
| F6 | Root `index.js` and `package.json` `exports`/`files` are generated by `bin/gen-exports.js` and committed in sync. | Generated, never hand-edited. | `ci:package` |
| F7 | Modules mirror their reference's package: `lib/<blas|lapack|arpack>/base/<routine>`. | Provenance. | (unbuilt; path ↔ `data/` package check) [ticket 0032] |

## J: JSDoc

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| J1 | `base.js` is `@private`; `ndarray.js` is not. | `ndarray.js` is public; `base.js` is internal. | `conf:implementation.ndarray-not-private`; `conf:implementation.base-is-private` (warn) [ticket 0024] |
| J2 | Public functions document `@param`, `@returns`, and one `@throws` per validation. | stdlib docs. | `lint:spec-jsdoc` |
| J3 | `base.js` and `ndarray.js` carry a runnable `@example`. | stdlib docs. | `conf:jsdoc.base-example`, `conf:jsdoc.ndarray-example` (warn; 1,716 missing) [ticket 0024] |
| J4 | No scaffold noise: no `TODO` in `@param`, `{TODO}`, `@returns {*}`, `,.` typos, stray `//` copyright lines, or "not yet implemented" stubs. | Leftover scaffold reads as documentation. | `lint:no-todo-params`, `lint:no-stub-wrappers`, `conf:scaffold-noise.*`, `conf:scaffolding.no-stub-wrappers` (dup) [ticket 0031] |
| J5 | No `TODO` in `base.js`, `README.md`, or examples. An uncoverable branch gets a plain comment saying why (e.g. `// Unreachable for finite input: …`). Known divergences from the reference go in `DIFFERENCES.md` or a ticket. | TODOs rot; the gate rejects them. | `conf:scaffolding.no-todo-base`, `conf:scaffolding.no-todo-readme`, `conf:scaffolding.examples-filled`, `conf:scaffolding.index-example` |

## T: Tests and validation

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| T1 | Fixtures come from the reference Fortran (`test/fortran/test_<r>.f90` → `test/fixtures/<r>.jsonl`). The JS must reproduce them, **including pivots and tie-breaks**. A difference is a bug, not a tolerance. The one exception is a non-unique, ill-conditioned output (rank-deficient QR, GSVD, near-tied eigenvectors), where the test compares the invariant and says why. | Fortran is the correctness baseline. | `ci:test:unit` |
| T2 | Tests assert something meaningful: more than 2 assertions, no `assert.fail('TODO')` markers, no always-true asserts. | Vacuous tests inflate coverage. | `conf:tests.assertion-count`, `conf:scaffolding.no-assert-fail`, `conf:tests.no-scaffold-markers` (dup); always-true (unbuilt) [ticket 0031, ticket 0032] |
| T3 | `test.ndarray.js` exercises `ndarray.js` (not `base.js`), including each `TypeError`/`RangeError` path. `test.<routine>.js` exercises the strided wrapper and both `order`s. | Validation must be tested where it lives. | `conf:scaffold-noise.ndarray-test-routes-through-validator` (dead: matches only `require(`; unbuilt in effect) [ticket 0025] |
| T4 | Coverage of `base.js`: ≥ 90% lines, ≥ 85% branches. | Floor on untested code. | `conf:tests.coverage-line`, `conf:tests.coverage-branch` (not in CI: needs `--coverage`) [ticket 0033] |
| T5 | No skipped/only/todo tests, no `continue-on-error`, no baselines or allowlists, no `eslint-disable` of `blahpack/` rules. | No escape hatches. | `hatch`; `conf:lint.eslint-disable-whitelist` |
| T6 | CI code never reads the vendored Fortran under `data/`. It reads the committed caches (`data/fortran-signatures.json`). | CI has no sources; skipping silently is the failure mode. | `ci:test:lint-rules` (`lint/no-fortran-source.test.cjs`) |
| T7 | A routine is **correct** iff its spec exists, every lint rule passes, its fixtures pass, and its harness level is ≥ **L3** (layout-fuzzed, bit-exact). | §2 definition of done. | `harness:validation-level` (`node bin/validation-level.js`; not gated) [ticket 0034] |
| T8 | Every bug the harness catches gets a `test/harness/LEARNINGS.md` entry (seed, dtype, scheme, flags, dims, root cause, bug class, where else it may hide) with the fix. | The learning outlives the fix. | `skill:blahpack-validate` (Step 7) |
| T9 | Harness tests build storage through the harness schemes, never by hand. | Poisoning and layout fuzzing need it. | `skill:blahpack-validate` |

## X: Translation faithfulness (judgment)

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| X1 | `base.js` is a faithful translation: same algorithm, same branch structure, same floating-point operation order. | Bit-level agreement with the reference (T1). | `skill:blahpack-translate#faithfulness` |
| X2 | GOTOs are restructured into loops/labeled blocks without changing control flow. A `GO TO` out of a loop is a `break` only when nothing sits between the loop end and its label. | No semantic drift. The `break`-runs-skipped-code bug was found in 11 routines, all fully line-covered. | `ci:mutants` (`bin/break-mutants.mjs --changed --check`: in every changed module, each early loop exit is pinned by a test or a proven equivalence; untriaged survivors in unchanged modules: ticket 0045); `skill:blahpack-translate#goto-restructuring` (patterns: `docs/goto-patterns.md`; inventory: `bin/goto-exits.py`) |
| X3 | `ILAENV` becomes hardcoded block sizes. `XERBLA` is not translated; public entry points throw (V1). XBLAS (`*_x`) routines are not translated. | No machine-query plumbing in JS. | `skill:blahpack-translate#faithfulness` |
| X4 | `DLAMCH` constants are hoisted to module scope. `DLAMCH('S')` is the smallest *normal* (`2.2e-308`), never `Number.MIN_VALUE`. | Correct constants; no per-call cost. | `skill:blahpack-translate#fortran-idioms` |
| X5 | Optimizations follow `docs/optimization-policy.md`: measured, faithful in results, with provenance. Unit-stride specializations are not ported by default; add one only as a measured optimization. | Speed without silent divergence. | `skill:blahpack-translate#performance` |
| X6 | A module that deviates from the reference documents the deviation in `DIFFERENCES.md`. | Divergence is visible. | `skill:blahpack-review` |
| X7 | Dependencies are called through their `base.js` with offset-form args. Callee calling-convention surprises are in `docs/dependency-conventions.md`. | One internal ABI. | `conf:base-arity` (arity); `skill:blahpack-translate#dependencies` |

---

## P: Known problems and gates

A gap written only in prose (a PR's deferral list, a doc admitting a check isn't in CI, a
session's summary) has no owner and no check, so it gets dropped. These rules
make an untracked gap fail CI.

| ID | Rule | Rationale | Enforcer |
|---|---|---|---|
| P1 | Every known problem is a ticket (`tickets/`, `bin/tickets.js`). Anything that admits work is unenforced, failing or deferred cites an open ticket as `ticket NNNN`, and the ticket names it. This covers a CONVENTIONS enforcer marked (warn), (unbuilt), (dup), dead, "not gated" or "not in CI" (the ticket names the rule ID). It covers a line in CONVENTIONS.md, CLAUDE.md, `docs/` or a skill that says "not gated" or "not in CI". And it covers a PR description line that defers work ("not in this PR", "known gaps", "follow-up", "out of scope", ...), with each list item under such a heading. | PRs #19, #20 and #26–#28 deferred about twenty items in prose, and several were dropped. | `ci:tickets` (CONVENTIONS rows, docs and skills); `ci:pr-body` (`bin/tickets.js pr-body`, `.github/workflows/pr-body.yml`) |
| P2 | Every check runs in CI. Each top-level file in `bin/`, each `lint/*.cjs` and each npm script is classified in `bin/checks.json` `scripts` as `gate` (CI runs it), `part` (a module of a gated check), `alias` (a shortcut for gated scripts), `tool` (not a check; `why` required; a name like `check-*`, `verify-*` or `*-smoke` can't be one) or `ticket` (a failing check CI does not run, tracked by an open ticket that names it). A passing check outside CI is not a legal state: gate it. | `bin/bench-smoke.sh` was clean when PR #20 merged and had 90 failures two days later, because CI didn't run it. | `ci:tickets` (`bin/tickets-coverage.js` `checkRegistry`) |
| P3 | Every kind of file in a module (`lib/<pkg>/base/<r>/...`: `examples/index.js`, `benchmark/*.js`, `docs/repl.txt`, ...) is classified in `bin/checks.json` `artifacts`. It is `gate` (`by` the gated checks that cover it), `ticket` (an open ticket names it) or `unchecked` (`why` required). A new kind of file fails CI until it is classified. | 335 examples and 640 documented signatures went wrong because nothing runs or compares them. | `ci:tickets` (`checkArtifacts`) |
| P4 | Work delegated to an agent or session for a known problem cites its ticket in the brief. Work that ends unfinished updates the ticket with what is left and where it is (branch, worktree, uncommitted files). | A delegated benchmark regeneration left 431 uncommitted files in a worktree and no record anywhere (ticket 0028). | `skill:CLAUDE.md#known-problems` (judgment) |

## Appendix A: canonical option strings

Used everywhere: `base.js` dispatch, both validators, tests, examples, and the README (N1, N8).
Fortran letters map to these values. The machine-readable letter → value map is
`spec/options.json` (read by `bin/gen_spec`); `lint/spec-schema.test.cjs` fails if it uses
a value this table doesn't list. Option families missing here (BALANC, SENSE, JOB in
trsen/trsna, INITV, EIGSRC, PIVOT, TYPE in lascl, ID in lasrt, VECT in sbgst, JOBV in gsvj0/1)
are listed in each spec's `notes`.

| Param family | Canonical values |
|--------------|------------------|
| `order` | `'row-major'`, `'column-major'` |
| `uplo` | `'upper'`, `'lower'` |
| `trans`, `transa`, `transb`, `transr` | `'no-transpose'`, `'transpose'`, `'conjugate-transpose'` |
| `side` | `'left'`, `'right'`; `'both'` (trevc/tgevc/hsein) |
| `diag` | `'unit'`, `'non-unit'` |
| `direct` | `'forward'`, `'backward'` |
| `storev` | `'columnwise'`, `'rowwise'` |
| `norm` | `'max'`, `'one-norm'`, `'inf-norm'`, `'frobenius'` |
| `compz`, `compq` | `'none'`, `'initialize'`, `'update'` |
| `jobz`, `jobvl`, `jobvr`, `jobvs`, `jobvsl`, `jobvsr` | `'no-vectors'`, `'compute-vectors'` |
| `jobu` (gesvd family) | `'all-columns'`, `'economy'`, `'overwrite'`, `'none'` |
| `jobvt` (gesvd family) | `'all-rows'`, `'economy'`, `'overwrite'`, `'none'` |
| `jobu`, `jobv`, `jobq` (ggsvd3/ggsvp3 family) | `'compute-U'`/`'compute-V'`/`'compute-Q'`, `'none'` |
| `jobu`, `jobv`, `jobq` (tgsja family) | `'compute-vectors'`, `'initialize'`, `'none'` |
| `vect` (orgbr/ormbr/ungbr/unmbr) | `'apply-Q'`, `'apply-P'` |
| `vect` (sbtrd/hbtrd) | `'none'`, `'initialize'`, `'update'` |
| `vect` (gbbrd) | `'no-vectors'`, `'q-only'`, `'p-only'`, `'both'` |
| `range` (eigenvalue selection) | `'all'`, `'value'`, `'index'` |
| `howmny` | `'all'`, `'backtransform'`, `'selected'` |
| `range` (dlarrd, dstebz block selection — not the eigenvalue range) | `'all'`, `'value'`, `'index'` |
| `order` (dlarrd, dstebz — block ordering, NOT the layout `order`) | `'block'`, `'entire'` |
| `fact` (svx family) | `'not-factored'`, `'equilibrate'`, `'factored'` |
| `equed` (gesvx/gbsvx/laqge/laqsy family) | `'none'`, `'row'`, `'column'`, `'both'` |
| `equed` (pbsvx/ppsvx/posvx family) | `'yes'`, `'none'` |
| `sort` | `'none'`, `'sort'` |
| `normin` | `'no'`, `'yes'` |
| `signs` | `'no-signs'`, `'compute-signs'` |
| `way` | `'convert'`, `'revert'` |
| `job` (gebal) | `'none'`, `'permute'`, `'scale'`, `'both'` |
| `job` (hseqr) | `'eigenvalues'`, `'schur'` |
| `job` (ddisna) | `'eigenvalues'`, `'left-vectors'`, `'right-vectors'` |
| `cmach` (dlamch) | `'epsilon'`, `'safe-minimum'`, `'precision'`, `'base'`, `'digits'`, `'rounding'`, `'min-exponent'`, `'underflow'`, `'max-exponent'`, `'overflow'` |

## Rulings log (Step 1 conflicts)

These conflicts came up while harvesting the prose. Each was resolved above, and
the prose has been corrected.

| Conflict | Ruling |
|---|---|
| `WORK` as "strided" param with offset `N*strideWORK` (translate skill) | D2/D5/W2: the strided form takes no stride; `base.js` uses `strideWork`/`offsetWork` (stride 1 enforced). |
| ndarray.js signature = base "minus internal workspace" (review guidelines, `fortran-signature` README "elided") | S3/D4: exact equality; workspace is always a param. |
| `<routine>.js` always validates `order` (review/scaffold skills) | D1/V6: only when it takes a non-workspace matrix. |
| `<routine>.js` has "no strides/offsets" (translate skill) | D2/D3: vectors keep strides; only offsets are dropped. |
| ndarray.js should not validate (`CHECKLIST.template.md`) | V1/V3: `ndarray.js` validates (fail-level gate). |
| Wrapper "commonly" accepts `null` (D5 text) | D5c: **must** (`work-autoalloc` is fail-level). |
| `setReadOnly` vs plain assignment (`main-setreadonly` vs `module-exports`) | F3: `setReadOnly` (912/912 today). |
| `isMatrixTranspose` vs `isTransposeOperation` | V9: `isTransposeOperation`. |
| Apache license header (`ndarray-conformance.md`) | F4: MIT. |
| TODO comments for known issues/uncoverable branches (translate skill) vs `no-todo-base` | J5: no TODO; plain comment, `DIFFERENCES.md`, or a ticket. |
| Pivoting tests: verify residuals, not fixture pivots (translate skill) | T1: match Fortran exactly. The exception is a non-unique, ill-conditioned output, which compares the invariant. **Ratified 2026-11-19.** |
| Use stdlib `is-almost-equal-float64array` in tests (translate skill; 0 modules do) | Dropped. Not a convention; local tolerance helpers stand. |
| CommonJS `require` / "base.js is CommonJS" (translate skill, blis doc) | N4: ESM. |
| index.js native-addon fallback | F3: none. |
| "Only base.js + test.js required initially" | F1: full file set. |
| Quick return in ndarray.js (open ruling) | V10: in `base.js`; `ndarray.js` may repeat it, and must before the workspace check. **Ratified 2026-11-19.** |
| Stride-zero policy (open ruling) | V7: reject iff the reference rejects. **Ratified 2026-11-19.** |
| Complex strides in doubles for some routines (`complex-numbers.md`) | C1/C2: always complex elements, doubled internally. |
| Inline complex `abs` "safe to inline" (translate skill) | C3: never; use `cmplx.abs`. |
| `DLAMCH('S') → Number.MIN_VALUE` | X4: smallest normal. |
| ndarray.js converts IPIV from 1-based | S12: public API is 0-based, passed through. |
| Undersized WORK makes the callee allocate (`dependency-conventions.md`) | W3/D4: it throws. |
| `LWORKL` vs no-LWORK | W1: named exception. |
| Output scalars: own length-1 array, result object, or packed `out` (S10 allowed both; 135 / 66 / 21 routines, 7 mixed) | S10: own length-1 array per scalar, named after the Fortran argument; complex keeps `x, offsetX`. **Ratified 2026-11-19.** |
| EQUED (CHARACTER output) container: returned string (laq*), string in + result object out (gesvx/gbsvx/posvx), single-element Array (pbsvx/ppsvx) | S10: single-element `Array` in/out; laq* return their primary array, svx drivers return INFO with RPVGRW in WORK(1)/RWORK(1) as in the reference. **Ratified 2026-11-19.** |
| Packed matrices in `<routine>.js`: `strideAP` kept, `order` missing in 10 wrappers | D1/D2 apply: `order` first (row-major rejected: packed storage is LAPACK column-major packed), no packed stride. **Ratified 2026-11-19.** |
| Workspace without stride/offset (dgelqt, zgelqt, dpstf2, dpstrf, zpstf2, zpstrf) | S1/D5: `WORK, strideWork, offsetWork`; offset honored, stride must be 1 in `ndarray.js`. **Ratified 2026-11-19.** |
| `zdotc`/`zdotu` return a `Complex128` vs S1's `out, offsetOut` | S1 carve-out: the level-1 BLAS complex dot products return a `Complex128` (as stdlib does); the spec generator omits their `out`. **Ratified 2026-11-19.** |
| `dstebz`/`dlarrd` param `order` vs D1 | D1: D1 governs the layout flag only. **Ratified 2026-11-19.** |
| Drop vs keep `INCX==1` specializations (performance vs optimization policy) | X5. |
| "Aim for L3" vs "no routine ships below L3" | T7: L3 is the definition of done; not yet gated [ticket 0034]. |
| `wrapper-signature` README: an exact wrapper check "would be wrong" | Superseded by S4/`lint:spec-signature`. |
| `run_fortran.sh` can't compile `la_constants` modules (CLAUDE.md, translate skill) | Stale: `test/run_fortran.sh` builds them; list them in `deps_<r>.txt`. |

## Conformance standing

`node lint/verify-corpus.cjs` reports every lint rule over the corpus, and
`bin/spec xcheck` the spec ↔ signature comparison. Both are clean, and the
`spec-*` rules gate CI.
