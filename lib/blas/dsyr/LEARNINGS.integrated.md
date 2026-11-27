# dsyr: Learnings from blind translation vs stdlib comparison

## Exercise

Translated `dsyr` (symmetric rank-1 update, A := alpha*x*x^T + A) from
reference Fortran to JavaScript without looking at the stdlib reference, then
compared. This documents the differences to improve future translations.

## What we got right

- **Function signature** matches exactly: `dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA )`
- **0-based loop conversion** correct in both branches
- **Lower triangle ix initialization**: correctly starts `ix = jx` (not `offsetX`), matching the Fortran where `IX = JX` in the lower branch
- **Quick return**: `N === 0 || alpha === 0.0` — both versions have this (ours in base.js, stdlib in ndarray.js)
- **Dropped unit-stride optimization**: both versions correctly remove Fortran's `INCX.EQ.1` special case since stride/offset subsumes it
- **x[jx] !== 0.0 guard** preserved correctly

## Differences: correctness-neutral but important

### 1. Row-major cache optimization (biggest gap)

**stdlib** imports `isRowMajor` and remaps the triangle semantics so the inner
loop always walks contiguous memory:

```javascript
isrm = isRowMajor( [ strideA1, strideA2 ] );
if ( isrm ) {
    sa0 = strideA2; // fast stride (innermost)
    sa1 = strideA1; // slow stride (outermost)
} else {
    sa0 = strideA1;
    sa1 = strideA2;
}
// Then: (!isrm && upper) || (isrm && lower) → Pattern 1 (0..i1)
//       (isrm && upper) || (!isrm && lower) → Pattern 2 (i1..N-1)
```

**Ours** uses `sa1 = strideA1; sa2 = strideA2` directly. Correct for both
layouts, but for row-major the inner loop has stride=N (cache-unfriendly).

**Why it matters:** For large matrices in row-major layout, the performance
difference is significant. The mathematical result is identical.

**How to apply:** For any routine with upper/lower triangle dispatch, consider
the layout-aware pattern. The key insight: column-major upper and row-major
lower have the same physical access pattern (and vice versa).

### 2. Incremental matrix index tracking

**stdlib** uses an `ia` variable, updated incrementally:
```javascript
ia = offsetA + (sa1 * i1);     // set at outer loop start
ia += sa0;                      // increment in inner loop
```

**Ours** recomputes the full expression each iteration:
```javascript
A[ offsetA + i*sa1 + j*sa2 ]   // two multiplies per element
```

**Why it matters:** Avoids multiplication in the inner loop. Minor perf win.
The Fortran version also uses incremental addressing.

**How to apply:** Always use an `ia` pointer for matrix access in inner loops.
Set it at the outer loop start, increment by the inner stride.

### 3. Variable naming convention

| stdlib | ours | meaning |
|--------|------|---------|
| `i0`, `i1` | `i`, `j` | loop indices (dimension 0, dimension 1) |
| `sa0`, `sa1` | `sa1`, `sa2` | strides (fast, slow — not dim1, dim2) |
| `ix0`, `ix1` | `ix`, `jx` | vector index pointers |
| `ox` | `offsetX` | saved offset |
| `ia` | (none) | matrix pointer |
| `tmp` | `temp` | temporary scalar |

stdlib's naming is dimension-centric and decoupled from Fortran's row/column
naming. This makes the layout remapping natural. Our naming follows Fortran
more closely, which makes the layout remapping awkward.

### 4. uplo string values

**stdlib base.js** uses `'upper'`/`'lower'` (full words).
**Ours** uses `'U'`/`'u'`/`'L'`/`'l'` (Fortran convention).

The ndarray.js wrapper normalizes. This is a project-wide convention question.
Our blahpack project consistently uses single chars across all routines
(dpotf2, ztrmm, ztrmv, zlaset, dlacpy).

### 5. Early return placement

**stdlib:** early return in ndarray.js, not in base.js.
**Ours:** early return in base.js.

Both are valid. Our convention (in base.js) is simpler and matches dgemv.

### 6. No helper decomposition

Unlike dlacpy (which stdlib splits into copyAll/copyUpper/copyLower), dsyr
keeps everything in one function. The decomposition pattern seems reserved
for routines with 3+ uplo variants or more complex dispatch.

## Testing patterns (from stdlib)

- **23 fixture files** covering: row/column major × upper/lower × positive/negative strides × offsets × complex access patterns
- Separate test files: `test.dsyr.js` (BLAS-style, 18 tests) and `test.ndarray.js` (stride/offset, 32 tests)
- Fixture format: JSON with `A`, `x`, `A_out`, plus all stride/offset params
- **Key coverage gaps if we only test column-major**: row-major + upper and row-major + lower are distinct code paths in stdlib

## Actionable items

- [ ] Add `isRowMajor` detection to dsyr base.js for cache-friendly inner loops — perf optimization, deferred
- [x] Use incremental `ia` pointer for matrix access — documented in CLAUDE.md "Performance Patterns"
- [ ] Consider adopting `i0`/`i1`/`sa0`/`sa1` naming for layout-aware routines — deferred, current naming works
- [x] Ensure tests cover both row-major and column-major — noted in coverage guidance
- [x] uplo convention decided: `'U'`/`'L'` in base.js, ndarray.js normalizes — documented in CLAUDE.md

## Patterns to carry forward

1. **Layout remapping for triangular routines**: `(col-major, upper) ↔ (row-major, lower)` are the same physical access pattern. Use this to ensure inner loops always walk the fast stride.
2. **Incremental ia**: `ia = offsetA + sa1*j; ia += sa0` in inner loop.
3. **Drop Fortran stride-1 specialization**: the general stride/offset loop handles unit stride fine.
4. **Preserve the x[jx] !== 0.0 guard**: it's a meaningful optimization (skips entire column when x element is zero).
