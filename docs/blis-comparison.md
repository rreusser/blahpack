# BLIS vs. Blahpack: API and Architecture Comparison

[BLIS](https://github.com/flame/blis) (BLAS-like Library Instantiation Software)
modernized reference BLAS in C. Blahpack translates reference BLAS/LAPACK to
idiomatic JavaScript following stdlib-js conventions. This document compares the
two approaches.

## Shared Core Insight: Generalized Strides

Both BLIS and blahpack replace traditional BLAS's `LDA` parameter with explicit
row and column strides, enabling arbitrary storage layouts (row-major, column-major,
or general).

| | Traditional BLAS | BLIS (typed API) | Blahpack (base.js) |
|---|---|---|---|
| Matrix params | `A, LDA` | `A, rs_a, cs_a` | `A, strideA1, strideA2, offsetA` |
| Vector params | `X, INCX` | `x, incx` | `x, strideX, offsetX` |
| Storage | Column-major only | Any | Any |

BLIS uses `rs` (row stride) and `cs` (column stride). Blahpack uses `strideA1`
and `strideA2`. Same concept, different naming.

## Offsets

Blahpack adds an explicit offset parameter to every array. BLIS's typed API does
not — in C, you pass a pointer to the start of the submatrix via pointer
arithmetic (`&A[i*rs + j*cs]`). BLIS's object API stores offsets in the `obj_t`
struct's `off[2]` field (row offset, col offset), which serves a similar role.
The blahpack offset parameter is the JS equivalent, forced by the language's lack
of pointer arithmetic.

## API Layering

BLIS exposes three API layers. Blahpack has analogues for two of them.

| Layer | BLIS | Blahpack |
|---|---|---|
| **Object API** | `bli_gemm(alpha, a, b, beta, c)` — type-polymorphic, all metadata in `obj_t` | No equivalent |
| **Typed API** | `bli_dgemm(transa, transb, m, n, k, alpha, a, rs_a, cs_a, ...)` | `base.js` (same idea, with offsets added) |
| **Validation** | (none) | `strided.js` — validates params, delegates to base.js |
| **BLAS compat** | `dgemm_(transa, transb, m, n, k, alpha, a, lda, ...)` | `<routine>.js` (stdlib BLAS-classic wrapper form) |

### The object API

BLIS's most distinctive API feature. The `obj_t` struct packs type, dimensions,
strides, offsets, transpose/conjugation, triangularity, diagonal type, and
packing format into one value:

```c
// BLIS object API: 5 parameters for gemm
bli_gemm(alpha, a, b, beta, c);

// vs. blahpack base.js: 19 parameters
dgemm(transa, transb, M, N, K, alpha,
      A, strideA1, strideA2, offsetA,
      B, strideB1, strideB2, offsetB,
      beta, C, strideC1, strideC2, offsetC);
```

The object API is type-polymorphic — one `bli_gemm` handles float, double,
scomplex, and dcomplex. JS has no struct-based dispatch or function overloading,
so there's no natural equivalent.

### Expert interfaces

BLIS's typed API has `_ex` variants that accept a `cntx_t` (kernel/block-size
selection) and `rntm_t` (per-call threading control). Blahpack has no equivalent —
there's no runtime context or threading model.

## Complex Numbers

| Aspect | BLIS | Blahpack |
|---|---|---|
| Complex type | `dcomplex` struct `{real, imag}` | `Complex128` object + `Complex128Array` |
| Strides | Always in complex elements | Complex elements at API boundary, doubled to Float64 internally via `reinterpret()` |
| Scalars | Passed as `const dcomplex*` (pointer) | Passed as `Complex128`, decomposed with `real()`/`imag()` at entry |
| Conjugation | Separate `conj_t` param, independent of transpose | Folded into `trans` as `'conjugate-transpose'` (matching Fortran's `'C'`) |

BLIS separates conjugation from transposition — you can conjugate without
transposing (`BLIS_CONJ_NO_TRANSPOSE`), which traditional BLAS and blahpack
don't support as a first-class operation.

## Microkernel Architecture

BLIS's central architectural contribution is the microkernel framework. This has
no analogue in blahpack and is the largest conceptual difference.

### What a microkernel is

A microkernel is a small, fixed-size computational primitive that the framework
calls repeatedly inside nested loops. The most important is the **gemm
microkernel**, which multiplies a small MR x k sliver of A by a k x NR sliver
of B, accumulating into an MR x NR output tile:

```c
void bli_dgemm_haswell_asm_d6x8(
    dim_t m, dim_t n, dim_t k,       // m <= MR=6, n <= NR=8
    double *alpha,
    double *a1,                       // MR x k, packed column-major
    double *b1,                       // k x NR, packed row-major
    double *beta,
    double *c11, inc_t rs_c, inc_t cs_c,  // MR x NR output tile
    auxinfo_t *data,                  // prefetch hints
    cntx_t *cntx
);
```

MR and NR are chosen so that the MR x NR accumulator fits entirely in CPU
registers:

| Architecture | MR x NR (double) | Reason |
|---|---|---|
| Haswell/Zen | 6 x 8 | 16 YMM (256-bit) registers |
| SKX/Zen4 | 6 x 16 or 8 x 24 | 32 ZMM (512-bit) registers |
| ARMv8 | 6 x 8 | 32 NEON (128-bit) registers |
| Reference (portable C) | 8 x 3 | Conservative, no SIMD assumptions |

### How the framework uses it

To compute a full M x N gemm, BLIS:

1. **Packs** A into column-major micropanels of width MR
2. **Packs** B into row-major micropanels of width NR
3. **Loops** over blocks sized MC x KC (L2 cache) and NC x KC (L3 cache)
4. **Tiles** each block into MR x NR chunks and calls the microkernel on each

The packing guarantees contiguous, sequential memory access inside the
microkernel, so the inner loop is pure register-level computation.

### One kernel, many operations

The same gemm microkernel powers not just `dgemm` but also `dsyrk`, `dtrmm`,
`dsyr2k`, `dhemm`, etc. The framework handles structural differences (symmetry,
triangularity) in the outer loops and packing logic. The microkernel always does
dense MR x NR multiplies.

Additional specialized microkernels:

| Kernel | What it does |
|---|---|
| `trsm_l_ukr` / `trsm_u_ukr` | Triangular solve on MR x NR tile |
| `gemmtrsm_l_ukr` | Fused gemm + trsm (avoids reload of B11) |

And level-1v/1f kernels for vector and fused vector operations:

| Kernel | Operation |
|---|---|
| `axpyv` | y := y + alpha * x |
| `dotxv` | rho := beta * rho + alpha * x^T * y |
| `scalv` | x := alpha * x |
| `amaxv` | index of max \|x_i\| |
| `axpyf` | Fused panel of axpyv (used to build gemv) |
| `dotxf` | Fused panel of dotxv (used to build gemv-transpose) |

### Why this doesn't apply to blahpack

BLIS's kernel architecture is about hardware utilization — fitting accumulators
in registers, sequential cache access via packing, SIMD instruction selection.
In scalar JavaScript:

- There are no SIMD registers to fill (no MR x NR constraint)
- There's no packing step (V8 handles memory layout opaquely)
- There's no assembly to write (JIT does instruction selection)
- The blocked algorithm's overhead would likely hurt performance for typical
  JS matrix sizes

Blahpack's performance optimizations operate at a different level: hoisting
constants to module scope, caching typed-array reads into locals, avoiding
redundant `reinterpret()` calls, and minimizing function call overhead for
routines called 100K+ times. These are V8-JIT-level concerns, not
cache-hierarchy concerns.

## Summary of Differences

| Aspect | BLIS | Blahpack |
|---|---|---|
| Language | C (with inline assembly) | JavaScript (ESM) |
| Offset mechanism | Pointer arithmetic / `obj_t.off[]` | Explicit `offset` parameter |
| Type dispatch | Object API (polymorphic) or name prefix | Name prefix only |
| Conjugation | Independent `conj_t` parameter | Folded into `trans` |
| Validation | None in typed API | `strided.js` layer |
| Threading | Per-call `rntm_t` control | None |
| Performance model | Register tiling, cache blocking, packing, SIMD | JIT-friendly patterns, allocation reduction |
| Microkernel framework | Core architecture | Not applicable |
| Expert interfaces | `cntx_t` + `rntm_t` | None |
