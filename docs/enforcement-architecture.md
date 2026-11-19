# Enforcement Architecture: Specs, Not Heuristics

Status: **proposal** (2026-11-17). Prototype measurements are in
`docs/enforcement-architecture/measurements/`; every number below can be reproduced with them.

## 1. Diagnosis

The project has a lot of gates: 15 conformance check modules, 11 ESLint rules,
and the validation harness. Consistency still isn't enforced, and the cause is
structural, not a lack of effort.

**Every checker re-guesses each routine's shape from parameter names.** No
artifact *declares* that `dgetrf` has a matrix `A` with `M` rows and a leading
dimension that must be `>= max(1,M)`. `conventions.js`,
`signature-conformance.cjs`, `gen_ndarray_validation.py`, `gen_wrapper.py`, and
the harness each infer that on their own, with their own regexes. A guess can't
be strict, so the checks end up lenient:

| Check | What it actually tests |
|---|---|
| `conventions.routine-dimension-validation` | the file contains *some* `RangeError` |
| `conventions.routine-ld-validation` | a regex matches, **or** throw count ≥ expected (warn-only) |
| `conventions.ndarray-string-validation` | the validator is *imported* (warn-only) |
| `signature-conformance` | warn-only; flags 538 modules, mixing real and false hits |

**The generators were one-shot.** `gen_ndarray_validation.py` and
`gen_wrapper.py` ran at scaffold time. After that the code was hand-edited and
drifted. Nothing checks that the code still matches what the generator would
produce.

### Measured drift (899 modules)

Error handling (`survey-validation.mjs`, `fortran-arg-checks.py`):

- **184 distinct error-message shapes** for what are about 10 semantic kinds of
  check. For example, the LD check appears as "must be greater than or equal to
  max(..)", "(LDC) must be …", "`X` must satisfy LDX >= max(..)", and
  "max(..))" (with an unbalanced paren).
- **49 `ndarray.js` and 39 `<routine>.js` throw nothing at all.**
- **Vector strides are checked for zero 218 times out of ~4,700 stride
  parameters.** There is no stated policy, so whether a check exists depends on
  who translated the routine.
- **97 `ndarray.js` dimension params and 97 string params are never
  validated.** Examples: `dgebak.job` and `dgesvx.fact`.
- **3 ordinals name the wrong argument** (`dlaswp.js` says "Fourth" for `N`,
  which is the 2nd argument; `dtrsna.js` ×2). Another **~72 are written in a
  non-canonical style** ("21th", "11th").
- Quick returns are inconsistent. `dgetrf/ndarray.js` returns early on
  `M===0||N===0`, but `dgetrf/dgetrf.js` does not.

BLIS indexing (`stride-provenance.mjs`, a dataflow analysis over `base.js`):

- **19 call sites pass a literal stride for a strided parameter.** These are
  real bugs that break row-major or non-unit-stride inputs:
  - `ztgsna` ×6: `dznrm2( N, VR, 1, offsetVR + ks*strideVR2 )` walks a
    *column* with stride 1, which only works for column-major input. The
    sibling `zgemv`/`zdotc` calls do the same.
  - `dgees` ×4, `zgees`: `dlascl( 'general', …, N, 1, WR, 1, strideWR, … )`
    passes the row stride of an N×1 view as `1` instead of `strideWR`.
  - `zgbbrd`: `zrot( …, AB, 1, … )`.
  - (`zhgeqz zscal(1, …, H, 1, …)` is harmless because n=1. A rule can say
    so explicitly.)
- **5 accesses ignore the array's offset** (`zhpev`, `zhpevx`).
- **All of these routines are outside the harness.** It covers 345/899
  routines at L3 (layout-fuzzed), and none of the routines above are among
  them. Where the harness does reach (`ztrmm`, `dgtsv`), the static hits are
  false positives caused by index-variable reuse (see P2).

## 2. North star: a target you can check against

The missing piece so far is a **target**. Translations were written, then
patched as problems turned up. The conventions they were patched toward lived
in prose spread across skills, docs, `CLAUDE.md` and `CONVENTIONS.md`, and
that prose contradicted itself and the code. For example (all fixed in Step 1):

- `blahpack-review/SKILL.md` and `docs/ndarray-conformance.md` still prescribe
  CJS `var x = require( … )` in an ESM codebase.
- They also prescribe `isMatrixTranspose`, which stdlib is replacing.
- `ndarray-conformance.md` puts quick returns in `ndarray.js`, while the
  translate skill is silent.

No module can be judged right or wrong objectively.

The target is three **normative** artifacts. Everything else (generators,
linters, skills, tests) is subordinate to them:

| Artifact | Scope | Source | Who may edit |
|---|---|---|---|
| **Spec** (`spec/<routine>.json`) | one routine: params, roles, dtypes, intent, shapes, argument checks, quick return, return value, workspace | generated from Fortran | regenerated only; a hand **override** (`spec/overrides/<routine>.json`, with a reason) is the exceptional case |
| **Conventions** (`CONVENTIONS.md`) | project-wide rules mapping spec → code: projections to base/ndarray/strided forms, naming, validation policy, message catalog, stdlib alignment | written | deliberate edits; each rule has an ID and names its enforcer |
| **Message DB** | every permitted error message | stdlib DB + local supplement | append-only |

The definition of done follows from these:

> **A module is correct iff** its spec exists, every `lint:` rule passes for
> it, its fixtures pass, and its harness level is ≥ L3.

All four are binary. Nothing in that sentence requires reading prose.

**How enforcement is assigned:**

- **Linters first.** Any rule that can be decided from the code plus the spec
  is a lint rule, and it is an error.
- **Skills only for judgment.** Examples: is the algorithm a faithful
  translation, are GOTO restructurings sound, are local names and comments
  meaningful, does an optimization respect `optimization-policy.md`.
- **Skills never restate a lintable rule.** They cite convention IDs instead,
  so there's one source and nothing to drift.
- **A convention with no named enforcer is a defect** in `CONVENTIONS.md`.

### Declare once, derive everything, verify by regeneration

```
           Fortran source (authoritative)
                     │  generate (always re-runnable; overrides are the exception)
                     ▼
     spec/<routine>.json (+ overrides) ◄── the ONLY place shape/constraints live
        │            │             │              │
        ▼            ▼             ▼              ▼
   generated     static type   layout fuzz    docs/JSDoc @throws,
   validation    check of      (dynamic,      README, TS types
   prologues     base.js       every routine)
        │            │             │
        └──── check = regenerate & diff / provenance-typecheck / bit-exact ────┘
                     │
                     ▼
         one registry · no 'warn' · ratcheting baseline
```

Four rules make this robust instead of incremental:

1. **One declared spec per routine.** Every tool reads it, and no tool
   infers shape from names.
2. **Mechanical code is generated continuously, never hand-written.** The
   check is "regenerate and byte-compare", like `prettier --check`. Drift
   can't happen silently because it is a diff.
3. **No exemptions; facts are data.** Following `lint/README.md`, there is no
   allowlist. When a routine fails, either the rule is missing a real
   subtlety (fix the rule and pin it with a fixture) or the code is wrong (fix
   it). Legitimate per-routine differences, such as `dlacpy`'s `uplo` accepting
   any value as "full", are *facts in the spec* derived from Fortran. They
   are not waivers.
4. **Severity is binary, with a ratchet.** `warn` is how rules quietly die.
   Every rule is `error`. Known violations live in a checked-in baseline that
   can only shrink.

## 3. The spec

Example for `dgetrf`, generated from the Fortran signature plus its own
`INFO = -k` argument checks:

```json
{
  "routine": "dgetrf",
  "returns": "info",
  "params": [
    { "js": "M", "role": "dim" },
    { "js": "N", "role": "dim" },
    { "js": "A", "role": "matrix", "dtype": "float64", "rows": "M", "cols": "N" },
    { "js": "IPIV", "role": "vector", "dtype": "int32", "length": "min(M,N)" }
  ],
  "checks": [
    { "kind": "nonnegative", "param": "M", "fortranInfo": -1 },
    { "kind": "nonnegative", "param": "N", "fortranInfo": -2 },
    { "kind": "ld", "matrix": "A", "fortranInfo": -4 }
  ],
  "quickReturn": "M === 0 || N === 0"
}
```

From `params`, the tooling derives three signatures: base
(`A, strideA1, strideA2, offsetA`), ndarray (identical), and layout
(`order, …, A, LDA`). Ordinals are computed per signature, so they can't be
wrong.

**Feasibility, measured.** 647 routines have Fortran arg checks, 3,517 checks
in total:

- 2,551 (73%) match one of four exact templates: `X<0`, `LDX<MAX(1,Y)`,
  `INC==0`, or `LSAME` enum.
- The remaining 966 are small boolean expressions over params and flags (e.g.
  `LDU.LT.1 .OR. (WANTU .AND. LDU.LT.M)`). `bin/fortran_to_estree.py` already
  translates these.
- `LWORK` checks drop out (`no-lwork-param`).
- 250 routines (level-1 BLAS, auxiliaries) have no checks. Their spec says
  so explicitly.

## 4. Layer A: error handling

- **Error catalog** (`lint/lib/errors.cjs`): one message template per
  check `kind`, with the stdlib wording. The 184 shapes collapse to roughly 12.
- **Generated prologue** between markers in `<routine>.js` and `ndarray.js`:

  ```js
  // <validate:begin> generated from the spec — do not edit
  …
  // <validate:end>
  ```

  The body below the markers stays hand-written (offset/stride conversion,
  quick-return call into base).
- **Check `validation-sync`:** regenerate the region and compare bytes. A
  mismatch fails, and `--fix` rewrites it. This replaces
  `conventions.*-validation`, the throw-count heuristics, and `jsdoc @throws`
  checking (the `@throws` lines are generated from the same spec).
- **Policy is set once in the generator, not per routine**: which checks go in
  ndarray vs layout wrapper, where quick-return lives, and the stride-zero
  rule. Changing a policy is one generator edit plus `--fix --all`.
- **Tests are generated too.** For each spec check, one test passes the
  violating value and asserts the error *class* and *message*. This turns the
  "write the TypeError/RangeError tests" step in `ndarray-conformance.md` into
  generated tests.

## 5. Layer B: BLIS indexing

Two independent nets: a static one that is fast and gives a line number, and a
dynamic one that is ground truth.

### B1. Static stride-provenance typing (ESLint rule `blahpack/stride-provenance`)

Each integer in `base.js` gets a provenance tag: `offset(A)`, `stride(A,k)`,
`dim`, or `const`. Tags propagate through assignments and local helpers (e.g.
`tij()` in `dlaexc`). Rules:

| ID | Rule | Prototype hits |
|---|---|---|
| P1 | `A[expr]`: `expr` must carry `offset(A)` | 5 (all real) |
| P2 | `A[expr]`: `expr` must not carry another array's offset/stride. A value *read from* an index array (`IPIV[k]`) is data and does not inherit `IPIV`'s provenance, so pivoted indexing (stdlib `claswp`) is legal | 2,204, mostly variable reuse (see below) |
| P3 | call `f(…, A, s, …)`: `s` must carry `stride(A,·)`; a literal is an error unless the callee spec says the slot is irrelevant (e.g. n=1) | 19: 14 real, 3 harmless (n=1), 2 tool false positives (`reinterpret128`) |
| P4 | role-checked calls: use the *callee's* spec to know which argument slots are `stride(X)`/`offset(X)` for which array | removes the 60 E4 false positives (e.g. `dlarfg`'s alpha slot takes offset only) |
| P5 | `base.js` has no `LDx` params; matrices are `(s1,s2,off)` triples, vectors `(s,off)` | from spec |

P2 is noisy for one reason: the code reuses the same index variable for
different arrays (`ztrmm`, which passes the harness). The fix is a **policy,
not smarter analysis**: *an index variable indexes exactly one array*
(`ia`/`ib`/`ic`). That makes code easier to read, and it makes the
flow-insensitive analysis sound. The rule's autofix can split reused
variables.

### B2. Universal layout fuzz (dynamic)

The harness gets to L3 by writing a property check per routine. A layout
invariance check doesn't need a property: given any valid input (the
**existing Fortran fixtures**), the spec says which arguments are
matrices/vectors and their shapes. A generic driver can then re-materialize
each one in different layouts:

- row-major and column-major
- padded leading dimension
- random offset
- negative vector stride, where the spec allows it
- NaN-poisoned slack

It then requires bit-exact outputs. That gives **L3-equivalent layout coverage
for all 899 routines** without per-routine harness code, and it would have
caught every P3 bug above.

## 6. Plumbing

- **One registry: `lint/`.** There are currently three rule systems:
  `tools/eslint/rules/` (11 rules), `bin/conformance/checks/` (15 modules), and
  the newer `lint/` (one directory per rule, with spec, pass/fail fixtures, a
  test, and the `verify-corpus.cjs` gate). `lint/` has the right structure, so
  it becomes the only home.
  - Every surviving rule from the other two moves into it.
  - The rest are deleted as the spec-based rules replace them.
  - `data/fortran-signatures.json` is already the Fortran-facts half of the
    spec. Step 2 extends it with the `INFO = -k` checks and JS roles
    rather than creating a parallel file.
- **No `warn`.** Today `signature-conformance` and `vars-order` warn, and
  half of `conventions.js` warns.
- **Worklist, not allowlist.** A rule that can't yet run clean over the corpus
  publishes its violation count via `verify-corpus`, and CI fails if that
  count rises. Nothing is suppressed per module; the count can only go down,
  and the rule becomes a hard gate when it reaches zero.
- **Pre-commit:** run the gate on the modules touched by the change.

## 7. Alignment with stdlib

**Stance:** stdlib (`@stdlib/blas/base`, `@stdlib/lapack/base`) sets the
*organization and API surface*: module layout, the two-form API, naming,
message wording, and validator helpers. It is **not** the authority on
correctness. Its LAPACK coverage is nascent (about 27 modules), and where it
is inconsistent or weaker than a principled rule, this project improves on it
and records the deviation here.

### Survey (2026-11-17, stdlib `6eb47fed797`)

The two codebases share 45 modules:

- `ndarray.js` signatures match exactly in 22.
- Strided signatures match exactly in 25.
- Validation sets match in only 3.

Scripts: `docs/enforcement-architecture/measurements/stdlib-{extract,compare,message-db}.mjs`.

| Finding | stdlib | blahpack |
|---|---|---|
| Error messages in stdlib's error DB (`@stdlib/error/tools/database`, used for production error codes) | 327 / 327 | 3,509 / 7,454 (443 distinct strings missing) |
| Enum validation | `resolveStr` (accepts strings *and* enum ints; `dgemv` migrated Jun 2026) | `isMatrixTranspose`-style asserts (strings only) |
| LD message | `max(1,%d)` with the value substituted | literal `max(1,N)` |
| `uplo` message | "must specify whether to reference the lower or upper triangular matrix" | "must be a valid matrix triangle" (681 uses) |
| Level-1 BLAS validation | none (`N<=0` is a no-op, as in Fortran) | throws on `N<0` |
| LAPACK `ndarray.js` validation | ≈ only Fortran's own `INFO` checks (often none) | extra checks Fortran lacks (e.g. `dlacpy` M/N) and missing ones elsewhere |
| LAPACK LD check | row-major only (`dlacpy`, `dlaswp`) | both orders |
| Strided-form strides | exactly where Fortran has `INCx` (`dgttrf(N, DL, D, DU, DU2, IPIV)`) | 530 wrappers add 1,448 strides Fortran lacks (`lint/` D2) |
| Packed routines | `order` in both forms, but **no** `strideAP` | `strideAP`, but **no** `order` |
| Matrix-stride zero checks | inconsistent: `dtrmv`/`dsyr` check, `dgemv`/`dger` don't, `dgemm` checks C only | inconsistent, a different subset |
| Quick-return location | inconsistent: ndarray 35, strided 20, base 14 | inconsistent |
| Names | `x`, `y`, `alpha` in z-routines; `D`, `E` uppercase; `transA` | `zx`, `za`, `cx`, `da` leak from Fortran; `d`, `e`; `transa` |

### Rulings

**Adopt from stdlib** (organization or wording; nothing to improve on):

1. **Every message must exist verbatim in a message DB.** That is stdlib's DB
   plus a local supplemental DB for LAPACK-specific constraints, so the check
   is a set lookup instead of a heuristic. This replaces the "184 shapes"
   problem with something objective.
2. **Enum validation uses `*-resolve-str`.**
3. **Canonical names** follow stdlib (extends `CONVENTIONS.md`'s
   `DA → alpha` ruling to `zx → x`, `za → alpha`, `d → D`, `transa → transA`).
4. **Packed routines take `order`**, because packed layout cannot be expressed
   by strides. This fills a real capability gap in blahpack.

**Improve on stdlib** (a principled rule where stdlib is weak or
inconsistent):

5. **The validation set is derived, never hand-picked.** It is Fortran's
   `INFO = -k` checks remapped to JS positions, plus layout checks (`order`,
   and LD against `max(1,·)` for **both** orders). stdlib's row-major-only LD
   check and blahpack's hand-picked extras both go away.
6. **Keep BLIS strides wherever stdlib drops them.** Keep `strideAP` on packed
   arrays, and keep `lint/` D2's strided-form strides on data vectors. These
   are deliberate supersets of stdlib's surface: a stdlib-style call still
   works if the extra stride is at its default.
7. **Quick returns live in `base.js`** (wrappers may also short-circuit). This
   is enforced *behaviorally*: a generated test checks that every
   quick-return condition gives identical results through both entry points,
   rather than checking where the code sits.

**Open decisions** (stdlib gives no usable answer):

8. **Dimensions `< 0` in routines where Fortran treats them as a no-op**
   (level-1 BLAS, some auxiliaries). One option is Fortran/stdlib semantics:
   return quietly. The other is a uniform rule that *every* dimension is
   validated, which is more consistent and is what blahpack does today.
   Proposed: uniform validation.
9. **Zero matrix strides.** Proposed: throw for any array the routine
   *writes*, since a zero stride aliases outputs and silently corrupts
   results. Allow it for read-only arrays, where it acts as a legitimate
   broadcast. The spec knows each array's intent, so this is mechanical.
10. **Ordinals past 20th.** stdlib has no precedent. Proposed: spell them out
    with hyphens ("Twenty-first"), generated from a table.
11. **Generated region vs whole generated file** for the wrappers. Proposed:
    region, because the bodies carry legitimate hand logic (complex
    reinterpretation, result objects).

## 8. Consolidation: one tool per job

Adding the spec and linters on top of today's machinery would make the mess
worse. Today the tree has multiple competing tools for most jobs, and the
newest one never replaced the older ones. Audit date: 2026-11-17.

### Inventory: tools per job

| Job | Today | Count |
|---|---|---|
| **Parse Fortran signatures / metadata** | `signature.py`, `extract_metadata.py` → `data/routines.json`, `gen_fortran_signatures.js` → `data/fortran-signatures.json` (+ `.supplemental.json`, `.supplemental.build.cjs`), `deps.py`, plus ad-hoc parsing in `scaffold.py`, `init_routine.py`, `report.js` | 3 metadata files, ≥6 parsers |
| **Lint / conformance rules** | `tools/eslint/rules/` (11), `bin/conformance/checks/` (15 modules; CI job is `continue-on-error: true`, i.e. not a gate), `lint/` (3 rules + 2 verifiers; its rules run in CI via ESLint, but `verify-signatures.cjs` does not), `bin/conformance/no-work-alloc.mjs`, `bin/check-stubs.sh`, `bin/check-stub-tests.sh`, `bin/triage-test-bypass.sh`, `npm run lint:learnings` | 4 systems |
| **Lint wrappers** | `bin/lint.sh`, `bin/lint-fix.sh`, `bin/fork-eslint-rule.sh`, `tools/eslint/{shims,find-jsdoc}.cjs`, `tools/eslint/config/*.json` (9 unused stdlib configs) | 5+ |
| **Generate module files** | `scaffold.py` (1,791 lines), `init_routine.py`, `gen_wrapper.py`, `gen_ndarray_validation.py`, `gen_routine_js.py`, `gen_readme.js`, `gen_repl_txt.js`, `gen_index_dts.js`, `gen_test_ts.js`, `gen_examples.js`, `gen_index_examples.js`, `gen_benchmarks.js`, `gen-exports.js`, `gen-descriptions.js`, `gen_test.py` | 15, almost all one-shot (no `--check`) |
| **Patch module files after the fact** | `fix-descriptions.js`, `fix-license-headers.js`, `fix-module-packages.js`, `fix_wrapper_docs.py`, `codemod-index.js`, `codemod-tests.js`, `codemod-work-assert.js`, `codemods/` (5 dated, already applied), `archive/bin/` (26, incl. `codemod-stride-checks`, `codemod-ld-validation`, `codemod-string-validation`, `codemod-routine-validation`, `add-throws-tags`) | ~40 |
| **Status / progress** | `report.js` → tracked `progress.html`, `audit.py` + `audit.sh`, `gen-queue.js` → `QUEUE.md`, `validation-level.js`, `test-failures.sh`, `run-tests.sh`, `bin/conformance.js` report | 6 |
| **Sandbox** | `.devcontainer/`, `Dockerfile.sandbox`, `bin/sandbox`, `bin/sandbox-worktree` (worktrees don't work here), `bin/claude-sandbox` | 5 |
| **Python env** | `env/` (the documented one) and `.venv/` | 2 |
| **Convention prose** | `.claude/skills/*` (translate skill 1,231 lines), 10 `docs/*.md`, `CLAUDE.md`, `CONVENTIONS.md`, `CONTRIBUTING.md`, `CHECKLIST.template.md`, 914 per-module `LEARNINGS*.md` (29k lines; 202 are mostly "N/A" boilerplate), 41 `DIFFERENCES.md` | — |

The "patch after the fact" row is the clearest symptom. `archive/bin/`
contains five separate sweeps over *validation code alone*. Each one fixed a
pattern the one-shot generators had baked in, and none of them stopped it
from coming back.

Known debris:
- `lib/lapack/base/zlabrd/test/debug{,_mlt,_zgemv,_zgemv2}.js`
- `lib/lapack/base/zsyconvf/test/sedHyMOqN` (a `sed -i` temp file)
- `data/extract_errors.txt` (no consumers)
- `QUESTIONS.md` (6 lines, April)
- an empty `pipeline/`
- `scaffold.py` references `bin/add_licenses.sh`, which doesn't exist

### Target end-state

| Job | One tool | Replaces |
|---|---|---|
| Fortran → spec | `bin/spec` (one parser, using `fparser` from `env/`) → `spec/<routine>.json` + `spec/overrides/`. Includes `dependencies`, so `deps.py` folds in | `signature.py`, `extract_metadata.py`, `gen_fortran_signatures.js`, `deps.py`, `data/routines.json`, `data/fortran-signatures*.{json,cjs}` |
| spec → generated files | `bin/gen <routine|--all> [--check|--write]`: package.json, index/main, validation prologues, README, repl.txt, `.d.ts`, `test.ts`, examples, benchmarks, generated tests, root exports. `--check` runs in CI | the 15 generators, the 7 `fix-*`/`codemod-*` patchers, `scaffold.py`, `init_routine.py`, `check-stubs*` |
| Body translation aids | `fortran_body.py`, `fortran_to_estree.py`, `transform.py`, `remove_goto.py`, moved to `bin/translate/` and sharing `bin/spec`'s parser | — (kept; this is the judgment-assist path) |
| Rules | `lint/` only, via `npm run lint` (ESLint + `verify-corpus`), **gating** in CI | `tools/eslint/`, `bin/conformance/`, `lint.sh`, `lint-fix.sh`, `fork-eslint-rule.sh`, `lint:learnings` |
| Correctness | `test/harness/` + spec-driven layout fuzzer; `node --test` via one `npm run test` | `run-tests.sh`, `test-failures.sh` (as a flag) |
| Status | `npm run status`: reads the lint gate and harness ledger, and prints the per-module "is it correct" verdict (§2). Output is generated and untracked | `report.js`, `progress.html`, `audit.*`, `gen-queue.js`, `QUEUE.md` |
| One-shot migrations | none tracked; git history is the archive | `codemods/`, `archive/` |
| Sandbox | `.devcontainer/` | `Dockerfile.sandbox`, `bin/sandbox*`, `bin/claude-sandbox` (after confirming none is still used) |
| Conventions | `CONVENTIONS.md` (rules) + `docs/` for *patterns* only (GOTO, complex numbers, performance, optimization policy) + slim skills that cite IDs | `ndarray-conformance.md`, `review-guidelines.md`, `stdlib-style-differences.md`, `blis-comparison.md` (folded in), `CONVENTIONS.md`, `CHECKLIST.template.md` |

Rough size: `bin/` goes from 60 scripts (~20k lines) to about 4 entry points
plus `bin/translate/`, and `archive/` and `codemods/` disappear.

Out of scope (decided 2026-11-17): `examples/`, `notebooks/`, `bench/`,
`vite.config.js` and the Pages deploy stay as they are. They are
self-contained *consumers* of the library (solvers, demos, optimization
studies) and don't interact with the translation process. The one constraint
is that they must not become inputs to the spec, lint or generation tooling.

### Per-module knowledge files

The 914 `LEARNINGS*.md` and 41 `DIFFERENCES.md` files are the per-module
version of the convention-prose problem. Step 1 harvests them:

- A learning that is a **rule** becomes a `CONVENTIONS.md` entry plus a lint
  fixture.
- A **pattern** goes to `docs/`.
- A genuine **routine-specific fact** (e.g. dasum's unroll-by-6 quirk) becomes a
  short `notes` field in the spec override, or a comment in `base.js`.

After that, the files are deleted. `test/harness/LEARNINGS.md` stays: it
records bugs the harness caught, which is a different kind of record.

## 9. Rollout (each step leaves the tree green)

### Step 0: Clean (before building anything) — DONE 2026-11-17

**Baseline before the change:**
- 20,331/20,331 unit tests passed.
- ESLint had 23 pre-existing errors (`no-internal-workspace-alloc` in 8 LAPACK
  modules; unfinished workspace migration), so CI's Lint job was already red on
  `main`.

**Deleted** (each confirmed to have no remaining consumer):
- `archive/` (26 scripts), `codemods/` (6).
- Debris: `zlabrd/test/debug*.js` (4), `zsyconvf/test/sedHyMOqN`,
  `data/extract_errors.txt`, `QUESTIONS.md`, empty `pipeline/`.
- The superseded sandbox: `bin/sandbox`, `bin/sandbox-worktree`,
  `Dockerfile.sandbox`. `.devcontainer/` + `bin/claude-sandbox` are the
  current one.
- One-shot, already-applied or duplicate scripts: `fix-descriptions.js`,
  `fix-license-headers.js`, `fix-module-packages.js`, `codemod-work-assert.js`,
  `triage-test-bypass.sh`, `conformance/no-work-alloc.mjs`,
  `gen_ndarray_validation.py`, `gen_wrapper.py`, `gen_index_examples.js`,
  `gen_benchmarks.js`, `gen_index_dts.js` (duplicated inside `scaffold.py`),
  `profile.sh`, `fork-eslint-rule.sh`.
- **All of `tools/eslint/`**: plugin, shims, `find-jsdoc`, 9 unused stdlib
  config files, and these rules:
  - `vars-order`: warn-only, hardcoded to one machine's stdlib checkout.
  - `signature-conformance`: unconfigured; superseded by `fortran-signature`.
  - `no-scaffold-assertions`: it targets test files, which ESLint 8.57 can't
    parse, so it never ran. `bin/conformance` covers the same thing.
- `docs/stdlib-style-differences.md`: an April snapshot whose headline claim
  is now false (0 single-char `uplo` compares remain, vs 327 long-form). §7
  supersedes it.

**Consolidated:**
- **`lint/` is the only rule source.** 7 rules moved into
  `lint/rules/<name>/` with README, pass/fail fixtures, and a test that uses
  the new shared runner `lint/lib/fixture-test.cjs`.
- `no-internal-workspace-alloc` now reads `lint/lib/fortran-data.cjs` instead
  of its own Fortran regex parser. That's one fewer parser, and it's more
  accurate: it now also recognizes workspace in `dstqrb`, `dsband` and
  `zlansf`, all clean.
- `eslint.config.cjs` loads only `lint/plugin.cjs`, and every rule is
  `error`. The former `no-unused-vars` warn was clean, so it's now an error.
  A configured rule missing from the library now throws instead of being
  silently dropped.
- `bin/lint.sh` makes one ESLint run instead of 899: the whole corpus in about
  4s instead of about 2 min, with identical findings.
- CI's Lint job now also runs every rule's fixture tests
  (`npm run test:lint-rules`).

**Skills and docs:**
- `/blahpack-lint` is rewritten around `lint/`.
- The translate skill's ~60-line table of stdlib rules that don't run here is
  replaced with what the gate enforces and the actual ESM style.
- The review skill's rule names and CJS imports are fixed.
- CJS/`var` examples in `docs/` are converted to ESM/`const`/`let`.
- `ndarray-conformance.md` carries a banner naming its open rulings (it was deleted in Step 1, and its rulings are now `CONVENTIONS.md` V7/V9/V10/V8).

**Corrections to the audit above:**
- The `lint/` rules *were* already gated in CI through ESLint. What wasn't
  gated is `lint/verify-signatures.cjs` (the strided-projection worklist).
- `bin/lint.sh` skipped `lib/arpack`. The single run covers it, and it's
  clean.

**CI never reads the Fortran sources** (added after PR #16's first CI run):
- The sources under `data/` are gitignored, so CI doesn't have them. Three
  checks parsed them anyway: `no-internal-workspace-alloc`, and
  `bin/conformance`'s `workspace` and `work-autoalloc`. Without the
  sources those checks silently skipped every routine, so `main`'s CI was
  green while a local run reported 23 lint errors and 15 failing modules.
- All three now read the committed `data/fortran-signatures.json`.
  `util.readFortran`/`fortranArgs` (one more regex parser) are deleted.
- `lint/no-fortran-source.test.cjs` fails if CI-run code references the
  source directories again.
- A checkout with no sources now gives results identical to a local run.
- The rule going forward: the sources are only an input to the
  developer-time cache/spec generator (Step 2). Everything downstream reads
  the generated artifact.

**Deferred, with reasons:**
- **Untracking `progress.html`:** the Pages deploy serves it, and
  regenerating it takes 7.5 min (`report.js` runs coverage). It moves with the
  status consolidation that replaces `report.js`.
- **`.venv/`:** untracked and local, so it's yours to remove
  (`env/` is the documented environment).
- **Linting test files:** needs ESLint ≥ 9 for import attributes.
- **14 test files with always-passing `assert.ok( true, … )`:** belongs to
  the Step 4 test-quality rules.
- **The workspace migration:** per-routine semantic work. 23 lint errors in 8
  modules (listed in `lint/README.md`), plus 7 wrappers
  missing the `work === null` allocation branch (`dlarfb_gett`, `dlarz`,
  `dlarzb`, `zlansf`, `zlarcm`, `zlarzb`, `ztprfb`).

*Exit (met):*
- Nothing deleted that anything references.
- Unit tests unchanged.
- Lint findings unchanged at the same 23.
- 20/20 rule fixture tests pass.

**Rule for every later step:** a step that adds machinery must name what it
deletes. Spec generation deletes the parsers, `bin/gen` deletes the generators
and patchers, and the spec linters delete `bin/conformance`.

The steps are ordered so that the target exists before anything is enforced
against it, and enforcement exists before code is conformed to it.

### Step 1: Convention inventory and rulings → `CONVENTIONS.md` v1 — DONE 2026-11-19

**Result:** `CONVENTIONS.md` at the repo root (moved from `lint/`; D1–D5 keep
their IDs). 548 statements were harvested from skills, docs, `CLAUDE.md`,
rule READMEs and `bin/conformance/checks`, and tagged keep/discard/conflict. The 54 conflicts are
resolved in its *Rulings log*. Every rule names an enforcer, marked
**(warn)** or **(unbuilt)** where nothing gates it yet; those marks are the
Step 3–4 worklist. The deletion half of Step 7 was done at the same time (see
there).


1. Harvest every convention statement from:
   - `.claude/skills/*` (the translate skill alone is 1,231 lines),
   - `docs/*.md`, `CLAUDE.md`,
   - `lint/CONVENTIONS.md`, `tools/eslint/rules`, `bin/conformance/checks`.
2. Tag each statement **keep / discard / conflict**.
3. Resolve every conflict, including the §7 rulings and open decisions.
4. Write `CONVENTIONS.md` v1. Each rule gets an ID, a one-line statement, a
   rationale, and an enforcer (`lint:<rule>` | `skill:<section>` |
   `harness:<check>`).

*Exit:* no unresolved conflicts, and every rule names an enforcer (even if that
enforcer isn't built yet).

### Step 2: Spec schema and generator — DONE 2026-11-19

**Result:** 912 specs in `spec/` (schema `spec/schema.json`, usage
`spec/README.md`). Stage A, `bin/gen_spec --extract`, is developer-time and
reads the sources into the committed `data/fortran-checks.json`. Stage B,
`bin/gen_spec`, is a pure function of committed files, so CI runs
`npm run spec:check` (regenerate and byte-compare) with no sources.

- **Content:** 3,340 argument checks (1,014 nonnegative, 889 ld, 797 enum,
  66 nonzero, 574 expr; 117 left untranslated), 575 quick returns, and
  minimum lengths for 503 of 612 workspaces.
- **What `untranslated` means:** data-dependent or `ILAENV`-driven locals, and
  doc pseudo-variables such as `KA`. These carry `js: null` and a reason.
- **Overrides:** 3 one-offs. `dlaswp` and `zlaswp`: `INCX` is a direction, not
  a consumed increment. `dsband`: the source is outside the vendored dirs.
- **Generator bugs fixed:** recurring categories that turned out to be
  generator bugs, not overrides:
  - argument order and missing args taken from the `SUBROUTINE` statement
    rather than the doc cache
  - rank taken from the declarations (the cache truncates multi-line
    dimensions)
  - INC linked by adjacency
  - the BLAS vector aliases
  - in/out `INFO` → `infoIn`
- **`bin/spec show <r>`** prints the three signatures (`lint/lib/spec.cjs`).
- **`bin/spec xcheck`:** 726/912 modules match the spec on all three forms.
  The remainder are code/convention discrepancies, listed in the PR, not
  generator bugs.

Deletes later: `data/fortran-ld-rules.json` and `data/fortran-option-rules.json`
(plus their generators) are derivable from the spec, and go with the
conformance checks that read them in Step 3.

1. Define the JSON schema.
2. Write `bin/gen_spec` with Fortran as input, using
   `data/fortran-signatures.json`, the `INFO = -k` checks, and the
   doc-comment dimensions and intents.
3. Add the override mechanism: overrides are merged on top of the generated
   spec and each carries a reason.
4. Run the generator over all 899 routines and categorize the overrides that
   turn out to be necessary. **Any override category that repeats is a
   generator bug, not an override.** Fix the generator until the remaining
   overrides are genuinely one-off.

*Exit:* 899 specs, an overrides count with a reason for each, and a
`bin/spec show <routine>` command that prints the three derived signatures.

### Step 3: Spec ↔ code linters (exact, derived)

All of these live in `lint/`. Each compares code to what the spec plus
conventions produce, with no heuristics:

- **Signatures:** `base.js` / `ndarray.js` / `<routine>.js` parameter lists
  equal the projections of the spec. This subsumes `fortran-signature`,
  `wrapper-signature` and `signature-conformance`.
- **Validation prologue:** equals the generated one (`--fix` rewrites it).
- **Messages:** every message is in the message DB.
- **JSDoc:** `@param` / `@throws` / `@returns` agree with the spec.
- **Module exports:** the existing rule.

Then delete everything this supersedes in `tools/eslint/rules` and
`bin/conformance/checks`, leaving one gate. Rules that aren't clean yet
publish worklist counts that can only fall.

*Exit:* one gate, no `warn`, and the superseded checks deleted.

### Step 4: Code-quality linters (not spec-derived, still objective)

- `stride-provenance` P1–P5 and index-variable-per-array, using the callee
  spec for role-checked calls.
- `no-internal-workspace-alloc`.
- ESM / `const` / `let` style.
- Vendored stdlib rules: `no-error-string-concat`, `format-args`,
  `new-cap-error`.
- **Skill hygiene:** code blocks inside `.claude/skills/**` and `docs/**` are
  extracted and linted with the same rules, so a skill can't teach code the
  linter rejects.

*Exit:* the 14 known stride bugs are fixed as a class, with LEARNINGS entries.

### Step 5: Conform the corpus

1. Apply spec-driven `--fix` and codemods in waves (≤5 agents, per
   `CLAUDE.md`).
2. Handle the non-mechanical residue as a named worklist.
3. Make API-breaking changes as one deliberate pass per family: `order` on
   packed routines, canonical names.

*Exit:* every Step 3 and Step 4 worklist is at zero, and every rule is a hard
gate.

### Step 6: Dynamic verification derived from the spec

- A generic layout fuzzer (§5 B2) runs over all routines with fixtures, varying
  strides, offsets, LD padding and packed `order`.
- Generated validation tests: one per spec check, asserting the error class and
  message. Quick-return parity is tested across both entry points.

*Exit:* every routine with fixtures reaches L3.

### Step 7: Rewrite the skills to match — deletions DONE 2026-11-19

**Done with Step 1:** restated and contradicted rules were stripped from the
skills, `CLAUDE.md` and `docs/`, and replaced with `CONVENTIONS.md` IDs.
`docs/ndarray-conformance.md` and `docs/review-guidelines.md` were deleted.
**Remaining:** the spec-driven translate flow (it needs Step 2) and
skill-hygiene lint (Step 4).


- **`blahpack-translate`:**
  1. generate the spec,
  2. scaffold from the spec,
  3. translate `base.js` (the judgment part: algorithm, GOTOs, complex
     arithmetic),
  4. loop on lint until clean,
  5. validate.

  Strip every restated convention and cite IDs instead. The target is a short
  skill.
- **`blahpack-review`:** only the `skill:` rules from `CONVENTIONS.md`.
  Everything objective is the linter's job.
- Delete docs whose content now lives in `CONVENTIONS.md` or in a rule's
  README, e.g. `ndarray-conformance.md`.

*Exit:* skills contain no rule that is also a lint rule, and skill hygiene
lint passes.

### Ordering notes

- **Steps 1–2 are the north star.** Everything after them is mechanical
  against that target, which is why they come first even though they produce
  no code changes.
- Step 7 can start right after Step 1, at least for deleting contradicted
  content. Contradictions in the skills keep producing bad translations until
  they're removed.
- Each step *deletes* what it supersedes. If old checks aren't deleted, the
  gates stay scattered.

## Reproducing the numbers

```bash
node docs/enforcement-architecture/measurements/survey-validation.mjs | tail -60
node docs/enforcement-architecture/measurements/stride-provenance.mjs
env/bin/python docs/enforcement-architecture/measurements/fortran-arg-checks.py
node docs/enforcement-architecture/measurements/stdlib-message-db.mjs   # STDLIB_DIR=<stdlib checkout>
```
