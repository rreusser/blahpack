---
name: blahpack-review
description: Review a module (or the full codebase) for convention violations, scaffolding remnants, and quality issues. The argument is the module path (e.g. `lib/blas/zhpmv`) or empty for full audit.
argument-hint: [module-path]
---

# Module Review

Review `$ARGUMENTS` and fix what you find. `CONVENTIONS.md` (repo root) owns
every rule. Cite rule IDs in findings; don't restate the rules. Everything
objective is a gate's job. This skill covers the gates, the rules that have no
gate yet, and judgment.

## 1. Run the gates

Any failure is a finding. Cite the CONVENTIONS ID whose enforcer failed.

```bash
node bin/conformance.js $ARGUMENTS                     # conf:* checks
bin/lint.sh $ARGUMENTS                                 # lint:* rules (--fix for fixable ones)
bin/spec xcheck <routine>                          # spec-signature: S1–S4, D1–D3
node --test $ARGUMENTS/test/test*.js 2>&1 | tail -20   # T1, T2
```

With no argument (full audit): `node bin/conformance.js --all --fast 2>&1 | tail -30`,
`bin/lint.sh`, `bin/spec xcheck --list`, and `bin/test-failures.sh`.
Never run `npm test` or `npm run check` unpiped.

`bin/lint-fix.sh <module>` applies the mechanical fixes. `bin/fix_wrapper_docs.py`
propagates `base.js` `@param` docs to `ndarray.js` and the wrapper.

## 2. Rules with no gate yet: check by eye

These are marked (warn) or (unbuilt) in CONVENTIONS.md. Until their enforcer
exists, a reviewer checks them:

- **V2**: `base.js` validates nothing and imports no validators.
- **V4** (ndarray side): `ndarray.js` checks every dimension `≥ 0`.
- **V7**: zero-stride rejection matches the reference's `INCX = 0` checks.
- **V8**: error messages use stdlib wording through `format()`.
- **V9**: validator binding names (`isTransposeOperation`, not `isMatrixTranspose`).
- **N4**: ESM, deep `lib/index.js` imports, `const`/`let`.
- **F4**: `@license MIT` header.
- **J2**: `@param`/`@returns`/`@throws` per validation; types match actual usage.
- **J3**: runnable `@example` in `base.js` and `ndarray.js`.
- **C1**: complex data typed `Complex128Array`; stride/offset docs say "in complex elements".
- **C3**: complex division/`abs`/`sqrt` through `lib/cmplx.js` (the gate only warns).
- **S10**: output scalars are length-1 typed arrays of the right kind.
- **S11**: return value convention.
- **T3**: `test.ndarray.js` imports `ndarray.js` (never `base.js`) and covers each
  throw; `test.<routine>.js` covers both `order`s. Direct `base.js` tests go in
  `test.base.js`.

## 3. Judgment

### Faithfulness (X1–X7, N6)

Compare `base.js` against the Fortran (`python bin/fortran_body.py data/.../<routine>.f`):

- X1: same algorithm, branch structure, and floating-point operation order.
- X2: GOTOs restructured without changing control flow (`docs/goto-patterns.md`).
- X3/X4: `ILAENV` hardcoded; `DLAMCH` constants hoisted and correct.
- X5: any optimization follows `docs/optimization-policy.md`.
- X6: deviations from the reference are recorded in `DIFFERENCES.md`.
- X7: dependencies are called through `base.js` with offset-form args. Check
  `docs/dependency-conventions.md` for callee surprises.
- N6: local names and comments track the Fortran's variables.
- Docstrings describe the code as it is now, not the Fortran, the scaffold, or
  an earlier version.

### Validator strings vs `base.js` dispatch (N8)

This is the silent-corruption trap that hides behind passing tests:

```js
// ndarray.js
if ( jobu !== 'all' && jobu !== 'some' && ... ) throw ...;
return base( jobu, ... );    // BUG: passes 'all' through

// base.js
wantua = ( jobu === 'all-columns' );   // never matches; routine takes the no-op path
```

A second variant is a single-branch validator left over from a scaffold
copy-paste. It rejects legal values (real case: `dorgbr.js`/`dormbr.js`):

```js
if ( vect !== 'apply-Q' ) {  // BUG: rejects valid 'apply-P'
	throw new TypeError( ... );
}
```

For each option param, compare the values the validators accept against the
`=== '...'` keys `base.js` dispatches on. Also compare both against the values
the Fortran accepts (Appendix A). If they differ, fix the file that diverges.
Never add a translation table.

### Hermitian vs. symmetric (C5)

- Hermitian (zh): the diagonal is forced real, off-diagonal reads are conjugated,
  `trans` is `'no-transpose'`/`'conjugate-transpose'`, and alpha may be real
  (rank-k updates).
- Symmetric (zs): the diagonal stays complex, nothing is conjugated, `trans` is
  `'no-transpose'`/`'transpose'`, and alpha/beta are complex.

### Return convention (S11)

`INFO` values are 1-based, as in Fortran. A 0-based loop that finds a problem
at index `j` returns `j + 1`.

### Complex arithmetic (C3)

Inlining is fine for add, subtract, multiply, conjugate, real-scalar scaling,
and CABS1 (`|re|+|im|`). Division, overflow-safe `abs`, and `sqrt` go through
`cmplx.*`. Look for division by a complex denominator written out by hand.

## 4. Regression check

After fixing, rerun the module's tests (`2>&1 | tail -20`), then
`bin/test-failures.sh` to check the full suite for regressions.
