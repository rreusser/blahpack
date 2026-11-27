# Blahpack — Fortran BLAS/LAPACK to JavaScript

Semi-automated translation of reference BLAS/LAPACK to idiomatic JavaScript,
conforming to [stdlib-js](https://github.com/stdlib-js/stdlib) conventions.

stdlib-js reference clone: `/Users/rreusser/gh/stdlib-js/stdlib/`

> ## ⚠️ BATCH DISPATCH RULE — READ FIRST
>
> When dispatching background agents for batch work (translation OR validation),
> dispatch a **SMALL, REASONABLE NUMBER PER WAVE (~3–5 agents)** and let them
> finish before launching the next wave. **NEVER fan out 12+ (let alone dozens)
> at once** — with too many concurrent agents the work fails / never completes.
> Break a large batch (e.g. ~75 BLAS routines) into sequential waves of ~4:
> dispatch a wave → review results → run regression check → dispatch the next.

## Project Structure

```
CONVENTIONS.md                 # THE rules (IDs S/D/W/V/N/C/F/J/T/X), each with its enforcer
bin/                           # Pipeline scripts
  conformance.js               #   THE conformance check — all checks in one command
  conformance/                 #   Conformance check modules (file-structure, scaffolding, etc.)
  init_routine.py              #   Single command: scaffold + deps + test scaffold
  scaffold.py                  #   Module scaffold generator (stdlib-js structure)
  signature.py                 #   Fortran → stdlib-js signature generator
  deps.py                      #   Dependency tree analyzer
  transform.py                 #   Composable code-mod pipeline
  fortran_body.py              #   Strip Fortran to executable body only
  gen_test.py                  #   Generate JS test scaffold from fixtures
  lint.sh                      #   Lint gate: one ESLint run over lib/ (sources + tests) and test/harness/
  lint-fix.sh                  #   Full fix pipeline (codemods + eslint + test verify)
  build-dist.mjs               #   Browser/CDN build into dist/ (vendors stdlib); run by prepack
  codemod-tests.js             #   Test file mechanical fixes
  codemod-index.js             #   Index.js mechanical fixes
lint/                          # THE rule library: one dir per rule (rule, README, fixtures, test)
  plugin.cjs                   #   Registers lint/rules/* under `blahpack/` (loaded by eslint.config.cjs)
  lib/                         #   Shared helpers (fortran-data cache, naming, fixture-test runner)
  verify-corpus.cjs            #   Per-rule violation summary over the whole corpus
  lib/spec.cjs, prologue.cjs   #   Spec projections + generated prologue (rules spec-*)
data/                          # Reference Fortran source + parsed-Fortran cache (fortran-signatures.json)
  BLAS-3.12.0/
  lapack-3.12.0/
lib/                           # Output: stdlib-js conformant modules
  blas/base/<routine>/         #   e.g. lib/blas/base/ddot/
  lapack/base/<routine>/       #   e.g. lib/lapack/base/dpotf2/
test/                          # Fortran tests and fixtures
  fortran/                     #   Test programs (test_<routine>.f90)
  fortran/deps_<routine>.txt   #   LAPACK link dependencies
  fixtures/                    #   Reference outputs from Fortran (JSONL)
  run_fortran.sh               #   Compile + run a Fortran test program → fixture
  harness/                     #   Property-based validation harness (see below)
docs/                          # Reference documentation
  complex-numbers.md           #   Complex128Array patterns, arithmetic rules
  dependency-conventions.md    #   Calling convention gotchas
  enforcement-architecture.md  #   Plan: per-routine specs, CONVENTIONS.md, one tool per job
  goto-patterns.md             #   Fortran GOTO → JS restructuring
  performance-patterns.md      #   Optimization patterns with code examples
  optimization-policy.md       #   What may change when optimizing; faithfulness & provenance rules
  ndarray-layer.md             #   Proposal: ndarray-object API layer + piecemeal CDN distribution
bench/                         # Performance benchmarks
```

**Conventions:** `CONVENTIONS.md` owns every rule; skills and docs cite its IDs
rather than restating them.

## Commands

```bash
python                          # Use venv python (NOT python3)
gfortran                       # GNU Fortran compiler (Homebrew)
node                            # Node.js v24+ (node:test built-in)
node bin/conformance.js <module-path>  # Conformance check for one module (all checks)
node bin/conformance.js --all --fast   # Fast conformance on all modules (file checks only)
node bin/conformance.js --all          # Full conformance on all modules (includes lint)
npm run report                  # Generate progress.html with conformance checks
bin/lint-fix.sh <module-path>   # Auto-fix (codemods + eslint + test verify)
bin/lint.sh lib/<path>/base.js  # Lint a single file
bin/lint.sh lib/<path>/test/    # Lint a module's tests (test rule set: parse, no-undef,
                                #   no-unused-vars, no-nan-blind-comparison, ...)
node bin/wrapper-replay.mjs --all     # Per-module corpus checks (also coverage.mjs,
                                      #   workspace-guard.mjs, break-mutants.mjs): results
                                      #   are cached in .cache/checks/ per module, keyed on
                                      #   every input; reruns redo only what changed.
                                      #   --no-cache, --jobs <n>, --slowest <n>
npm run check:modules                 # The per-module CI gates (incl. benchmark smoke) on modules changed vs origin/main
node bin/fortran-docs.mjs <routine>           # Reference BLAS/LAPACK docs as Markdown + KaTeX math
node bin/fortran-docs.mjs --readme --all      # Refresh the generated reference-docs block in every module README
                                              #   (between <!-- fortran-docs:start/end --> markers; bin/docs renders it)
npm run build:dist                    # Browser/CDN build: dist/_stdlib.js + one ES module per routine
npm run check:dist                    # dist/ is self-contained, loads in Chromium, matches Node, fits its budget
```

## Context Efficiency

**NEVER run these commands directly** — they produce 12,000+ lines of output:
- `npm test` — use per-module test runs with `| tail -20` instead
- `npm run check` — use `node bin/conformance.js <module>` instead

**ALWAYS pipe test/lint/coverage through `tail` or `grep`:**
```bash
node --test lib/<pkg>/base/<routine>/test/test*.js 2>&1 | tail -20
bin/test-failures.sh              # Full suite — shows ONLY summary + failures
```

## Batch Translation Workflow

When translating multiple routines, **always dispatch each routine to its
own background agent**. Do NOT translate routines in the main context. Do
NOT use worktrees (they fail in this environment). The main context is for
coordination: checking dependencies, triaging results, reviewing conformance
output, and dispatching follow-up work.

**How to dispatch a translation agent:**

```
Agent({
  description: "Translate <routine> to JavaScript",
  run_in_background: true,
  prompt: "<self-contained prompt with routine name, Fortran source path, deps, and conventions>"
})
```

Each agent prompt must be **self-contained** — agents have no memory of
prior conversation. Include:
1. The routine name and what it does (one line)
2. Commands to run: `python bin/signature.py`, `python bin/fortran_body.py`
3. The full translation checklist steps (scaffold → implement → test →
   lint → conformance)
4. Key conventions for this routine type (string mappings, complex number
   rules for z-prefix, etc.)
5. Context efficiency rules (pipe through `tail -20`, never `npm test`)

The `/blahpack-translate` skill contains the complete checklist and
conventions reference — read it once in the main context, then embed
the relevant parts into each agent prompt. Do NOT invoke the skill
inside an agent (skills are not available to agents).

**Dispatch a wave of ~3–5 agents in a single message** (see the BATCH
DISPATCH RULE at the top of this file) using multiple Agent tool calls.
**Do NOT dispatch more than ~5 at once** — too many concurrent agents fail
to complete. Let a wave finish, review, then dispatch the next wave.

**When a wave completes**, review their results and run
`bin/test-failures.sh 2>&1 | tail -30` to check for regressions before
dispatching the next wave.

## Skills

Use these skills for translation and review workflows:

- `/blahpack-translate <routine>` — Full end-to-end translation checklist
  with all conventions, pitfalls, string tables, and conformance checks.
  This is the primary workflow for translating a new routine.

- `/blahpack-review [module-path]` — Review a module (or full codebase)
  for convention violations, scaffolding remnants, and quality issues.
  Runs `node bin/conformance.js` and applies the full review checklist.

- `/blahpack-validate <routine>` — Rigorously validate a routine's
  correctness with the property-based harness (`test/harness/`). Fixed,
  repeatable procedure: classify the routine, pick generator/scheme/property
  from tables, sweep sizes + flags, fuzz storage layouts (bit-exact), and
  record a validation level (L0–L4). Use this to prove correctness — the
  conformance check and lint check conformance, not correctness.

- `/blahpack-scaffold <package> <routine>` — Generate module scaffold
- `/blahpack-signature <routine>` — Generate stdlib-js call signature
- `/blahpack-deps <routine>` — Show dependency tree
- `/blahpack-status` — Show translation status
- `/blahpack-coverage` — Run test coverage analysis

## Automation-First Mindset

Any manual work that repeats across routines is a bug in the tooling. If you
perform the same mechanical transformation twice, stop and automate it (new
transform in `bin/transform.py` or script in `bin/`) before continuing.

## Known problems

Every known problem is a ticket (`tickets/`, `node bin/tickets.js new "<problem>"`),
never only prose (CONVENTIONS P1–P5). CI enforces most of this:

- **One ticket per problem:** `tickets.js new` lists the open tickets most like
  the new one; read them, add evidence to the matching one, and pass
  `--reviewed` only when none matches. A verified defect confined to a module or
  two, found while doing other work, is fixed in that PR with its regression
  test rather than ticketed (P5).

- **PR descriptions:** a "not in this PR" / "known gaps" / "follow-up" line, and
  each list item under such a heading, cites `ticket NNNN`
  (`.github/workflows/pr-body.yml`). Open the ticket first.
- **New check script or npm script:** classify it in `bin/checks.json`. If it
  passes, add it to CI. If it fails and you can't fix it now, open a ticket.
- **New kind of module file:** classify it in `bin/checks.json` `artifacts`.
- **Delegating work** (agent or session) for a known problem: cite the ticket in
  the brief. If the work stops unfinished, record in the ticket what is left and
  where it lives (branch, worktree, uncommitted files).

`node bin/tickets.js check` runs all of the repo-side checks locally.

## Validation Harness (correctness, not just coverage)

Fixture tests and coverage % do NOT prove correctness — tests that assert
nothing meaningful inflate both. For rigorous validation use the
property-based harness in `test/harness/` (see its `README.md`):

- **Generate structured inputs, validate by mathematical property** against an
  independent oracle: reconstruction (`A = UᴴU`, `PA = LU`, `A = QR`), residual
  (`Ax = b`), structural (zeros produced), orthogonality (`QᴴQ = I`).
- **Three orthogonal layers**: scalar trait (`real`/`complex`), storage-agnostic
  `logical` matrices, and pluggable storage `schemes` (`dense`/`banded`/`packed`
  + vectors). Works across the full `[d|z] × structure × storage` taxonomy.
- **Poisoned storage** (unused slots = NaN) turns off-by-one/out-of-bounds reads
  into loud failures. **Layout invariance** asserts bit-exact output across
  offsets, strides, leading dims, and row/col-major — the highest-signal test for
  the offset/stride bug class. ALWAYS fuzz layouts for any routine with a working
  property check.
- **Validation levels** are recorded honestly at runtime (only passing checks
  count): `node bin/validation-level.js [--badges|--md]`. Ladder L0–L4 in the
  README. L3 (layout-fuzzed) is the definition of done (CONVENTIONS T7); not
  yet gated.

**MANDATORY: when the harness catches ANY bug (in a routine OR the harness),
add an entry to `test/harness/LEARNINGS.md` before/with the fix** — with the
reproducing seed, scalar type, storage scheme, flags, dimensions, root cause,
bug class, and where else it might hide. Never fix silently; the learning is the
most valuable output. This overrides any inclination to "just fix it."
(CONVENTIONS T8.)

## Known Limitations

- Fortran `.f90` sources that `USE la_constants` / `la_xisnan` (e.g.
  `dnrm2.f90`, `dlassq.f90`) compile with `test/run_fortran.sh` only when
  those modules are listed first in `deps_<routine>.txt` (see
  `deps_dgels.txt`); the script builds the `.mod` files in a per-routine dir.
- **`deps.py` misses transitive Fortran-only dependencies.** Routines
  that call `ILAENV` transitively need `ilaenv`, `ieeeck`, `iparmq` in
  their Fortran deps file for test compilation. In JS they are ordinary
  modules too (`lib/lapack/base/ilaenv`, CONVENTIONS X3), but `deps.py` does
  not list them for the Fortran side, so `deps_<routine>.txt` must include
  them for `test/run_fortran.sh` to link.
  Check the deps files of similar routines when compilation fails with
  undefined references.
