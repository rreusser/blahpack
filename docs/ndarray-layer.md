# ndarray-Object Layer and Piecemeal Distribution

**Status.** The browser build (`dist/`, below) is built and checked in CI; it
is not yet on a CDN because the package is not published (ticket 0112). The
ndarray-object layer is a proposal; nothing of it is built (ticket 0111).
Ticket 0110 tracks the per-routine bundle floor. Measurements were taken on
2026-11-27 with esbuild (minified, ESM, gzipped) against `@stdlib/*` 0.3.3.

## Why

The library follows stdlib's split: `base` packages hold the numerics behind
inconvenient strided interfaces, and convenience layers sit on top. Today
every public entry point still takes raw storage:

| Layer | File | Takes |
| --- | --- | --- |
| kernel | `base.js` | data, strides, offsets, dimensions, workspace; no validation |
| offset form | `ndarray.js` (exposed as `routine.ndarray`) | same parameters as `base.js`, validated (S3) |
| BLAS form | `<routine>.js` | `order`, leading dimensions, `null` workspace (D1, D5c) |

zggbal's `ndarray.js` takes 21 positional arguments. Its ndarray-object form
needs 3: `zggbal( job, A, B )`.

## Naming

In stdlib and here, "ndarray" already means the offset/stride form
(`dgemm.ndarray( … )`). stdlib's ndarray-object packages sit one level above
`base`. `@stdlib/blas/ddot` takes ndarrays, contracts the last dimension and
loops over broadcast batch dimensions. Mirroring that:

```
lib/lapack/base/zggbal/   strided kernel + offset form + BLAS form (today)
lib/lapack/zggbal/        ndarray-object form (new)
```

exported as `@rreusser/blahpack/lapack/zggbal` next to the existing
`@rreusser/blahpack/lapack/base/zggbal`. A `lib/lapack/ndarray/zggbal` path is
avoided because it suggests the offset form.

## API rules

These are written as candidate CONVENTIONS rules. They would get an ID family
and enforcers when adopted.

1. **Drop what an ndarray carries.** Parameters with spec roles `dim`, `ld`,
   `inc` and `lwork`, every stride and offset, and `order` disappear. The
   wrapper reads `data`, `shape`, `strides` and `offset` from each argument.
2. **Infer dimensions from shapes.** Each `dim` is bound by the first array
   whose spec `rows`/`cols`/`length` expression names it. Every later array
   is checked against that binding: `RangeError` on mismatch, `TypeError` on
   wrong dtype or rank. Dimensions that no shape determines stay explicit
   (see Hard cases).
3. **Validate structurally, not by class.** Accept anything ndarray-like
   (`{ dtype, data, shape, strides, offset, order }`), so stdlib ndarrays,
   views and plain objects all work. The dtype must match the spec exactly;
   no silent conversion or copying.
4. **In-place semantics stay.** `intent: in`/`inout` arrays are passed
   through and overwritten as in LAPACK.
5. **Allocate pure outputs.** `intent: out` arrays (scaling vectors, `IPIV`,
   eigenvalues, `TAU`) are allocated when absent and returned. A caller may
   supply them in an `out` options object to reuse storage.
6. **Return scalars in an object.** Scalar outputs and `info` come back
   together, e.g. `{ info, ilo, ihi, lscale, rscale }`. A positive `info` is
   returned, not thrown: it is data (singular pivot, convergence failure
   count). Negative `info` cannot occur because the offset form validates first.
7. **Allocate workspace internally.** Use the size the `<routine>.js` `null`
   branch already computes (D5c, W6), then call `ndarray.js` so the workspace
   guard (W3) still runs.
8. **Options are unchanged.** Option strings stay positional, with the same
   vocabulary as the other two forms (N8).

Two existing conventions make this zero-copy. Complex strides and offsets are
counted in complex elements (C1), as stdlib's complex128 ndarrays count them,
and public index arrays are 0-based (S12).

### Sketch (zggbal)

This is what a generator would emit from `spec/zggbal.json`. A hand-written
version of it gave bit-identical `ilo`, `ihi`, `lscale` and `rscale` to a
direct strided call for a column-major ndarray and for a strided, offset,
row-major slice view of a larger matrix. The overwritten `A` and `B` were not
compared.

```js
function zggbal( job, A, B, out = {} ) {
	assertComplex128Matrix( A, 'A' );               // dtype + rank (rule 3)
	assertComplex128Matrix( B, 'B' );
	const N = A.shape[ 0 ];                         // binds N (rule 2)
	assertShape( A, [ N, N ], 'A' );
	assertShape( B, [ N, N ], 'B' );
	const lscale = out.lscale ?? float64Vector( N ); // rule 5
	const rscale = out.rscale ?? float64Vector( N );
	assertShape( lscale, [ N ], 'lscale' );
	assertShape( rscale, [ N ], 'rscale' );
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const WORK = new Float64Array( Math.max( 1, 6 * N ) ); // rule 7
	const info = zggbalNdarray( job, N, // lib/lapack/base/zggbal/lib/ndarray.js
		A.data, A.strides[ 0 ], A.strides[ 1 ], A.offset,
		B.data, B.strides[ 0 ], B.strides[ 1 ], B.offset,
		ilo, ihi,
		lscale.data, lscale.strides[ 0 ], lscale.offset,
		rscale.data, rscale.strides[ 0 ], rscale.offset,
		WORK, 1, 0 );
	return { info, ilo: ilo[ 0 ], ihi: ihi[ 0 ], lscale, rscale }; // rule 6
}
```

## Generating it

Writing the layer by hand would repeat the same work across 900+ modules, so
it should be generated from the spec (CLAUDE.md, "Automation-First"). The spec
already has everything rules 1–8 need: each parameter's `role`, `dtype` and
`intent`, and its `rows`/`cols`/`length` in JS terms. The `null`-workspace
size expressions already exist in `<routine>.js`. A `bin/gen-ndarray.js`
would emit `lib/<pkg>/<routine>/` with the stdlib file set (F1), plus
`package.json` exports.

### Hard cases

The spec roles say where shapes alone are not enough (counts are parameters
over `spec/*.json`):

| Case | Count | Treatment |
| --- | --- | --- |
| `banded` storage | 103 | `kl`/`ku` cannot be read from `LDAB`; they stay explicit arguments. The matrix argument is the band-storage ndarray. |
| `packed` / RFP storage | 123 | `N` is solved from the length `N(N+1)/2`; `uplo` (and `transr`) stay. |
| Output count known only at run time (`dstevx`'s `M`, rank from `dgelss`) | — | Allocate the maximum, return a view sliced to the count. |
| `state` (ARPACK reverse communication) | 4 | Not wrapped mechanically; hand-written or omitted. |
| Workspace that is also a documented output (`dlasd5`, D5b) | — | Returned like an output. |
| Scalar inputs that are not dimensions (`ilo`/`ihi` into `zgghrd`, `K` in `dormqr`) | — | Stay positional; `K` is checked against `TAU`'s length. |

### Batching (later)

ndarrays of rank > 2 could be looped over their leading dimensions, as
`@stdlib/blas/ddot` does. That helps workloads with many small matrices.
It is out of scope for the first version.

### Pilot

One routine per hard case, before generating everything: zggbal
(square, complex), dgesv (rectangular RHS, `IPIV` output), dgeev (workspace,
optional eigenvectors), one banded solver (dgbsv), and dstevx (run-time
output count).

## Testing

- **Replay:** every call the existing `test.ndarray.js` files make, rebuilt as
  ndarray objects and run through the new layer, must give bit-identical
  results. This is the same mechanism as `bin/wrapper-replay.mjs`.
- **Layout invariance:** ndarray views make the harness's layout fuzzing
  (offsets, negative strides, row/column major) a one-liner per argument.
- **Typecheck:** the generated `docs/types/index.d.ts` is checked as callers
  in the same way as the existing forms (S14).

## Distribution

### What ships

| Measure | Size |
| --- | --- |
| `lib/` on disk | 145 MB (57 MB apparent; the rest is per-file block overhead) |
| npm tarball before `dist/` | 2.5 MB; 23 MB unpacked; 7,383 files |
| npm tarball with `dist/` | 6.8 MB; 36.8 MB unpacked; 8,287 files |

The `files` field excludes tests, fixtures and benchmarks, so npm users do
not download the repository. `dist/` nearly triples the download for Node and
bundler users, who never load it; publishing it as a separate package would
avoid that, at the cost of a second name to import from.

### Bundler users

The `exports` map lists every module, so a bundler already pulls in one
routine and its dependencies:

| Entry | Bundle (gz) | Own code, stdlib external (gz) |
| --- | --- | --- |
| ddot | 4 KB | 0.6 KB |
| zggbal | 25 KB | 3.4 KB |
| dgesv | 27 KB | — |
| dgesvd | 45 KB | 23 KB |
| zgeev | 53 KB | 30 KB |
| root `index.js` | 680 KB | 658 KB |

The floor for small routines is stdlib, not this code (ticket 0110). The
option asserts (`@stdlib/blas/base/assert/is-layout` and its siblings,
imported by 787 modules) reach `@stdlib/array/dtype`, which imports every
typed-array constructor. With those asserts external, zggbal drops from 25 KB
to 8 KB and zgemm from 24 KB to 6.6 KB. The option strings could instead be
checked against inline whitelists. That needs a decision against stdlib
conformance, which is why ticket 0110 is open rather than fixed.

The package also has no `"sideEffects": false`. Each module's only side
effect is attaching `.ndarray` to its own function, so the flag looks safe,
but no one has checked that yet.

### Browser / CDN users

The source cannot be loaded by a browser directly. The library imports stdlib
by bare specifier (`@stdlib/...`), which a browser cannot resolve, and stdlib
on npm is CommonJS, which a browser cannot run even with an import map.
jsDelivr's `+esm` and esm.sh convert on the fly, but are untested on this
package: it is not published, and those hosts are unreachable from the
development container.

So the package ships a build, `dist/`, made by `npm run build:dist`
(`bin/build-dist.mjs`, run by `prepack`):

| File | Contents |
| --- | --- |
| `dist/_stdlib.js` | Every stdlib module the library imports (47 specifiers from 13 packages), converted to ESM and bundled once: 21.5 KB gzipped |
| `dist/<pkg>/base/<routine>.js` | One file per `./<pkg>/base/<routine>` export (902): the routine and its in-library dependencies, importing only `../../_stdlib.js` |
| `dist/THIRD_PARTY_LICENSES.txt` | The licenses and notices of the vendored stdlib packages (Apache-2.0) |

A routine costs two requests, and `_stdlib.js` is cached across routines.
Sizes, gzipped: ddot 0.6 KB, zggbal 3.2 KB, dgesv 4.8 KB, zgeev 29 KB, the
largest (zhegvx) 33.8 KB. The paths mirror the package's subpaths, so
`dist/lapack/<routine>.js` stays free for the ndarray-object layer.

Once published, a notebook imports a routine with no bundler:

```js
// Observable notebook
dgesv = ( await import( 'https://cdn.jsdelivr.net/npm/@rreusser/blahpack@1/dist/lapack/base/dgesv.js' ) ).default

// Observable Framework, or any ESM page
import dgesv from 'https://cdn.jsdelivr.net/npm/@rreusser/blahpack@1/dist/lapack/base/dgesv.js';
```

`npm run check:dist` (`bin/check-dist.mjs`, in CI) checks that:

- the files match the exports map exactly;
- no file imports anything but the runtime, and none calls `require`;
- headless Chromium loads all 902 routines with no request outside `dist/`;
- a few calls (ddot, dgesv, dsyev and dgesvd with `WORK = null`) give
  bit-identical results in the browser and in Node;
- the gzipped sizes stay under a budget (runtime, largest routine, total).

When it was added, the check was shown to fail on a leftover bare import, a
missing file, and a one-ulp change to ddot's result.

### Shared dependencies between routines

Each routine file includes its whole dependency tree once. Two routine files
loaded on the same page repeat the dependencies they share. Measured (KB
gzipped, cold load, not counting the runtime):

| Layout | dgesv alone | zgeev alone | 5 real drivers¹ | 4 complex eigen-drivers² |
| --- | --- | --- | --- | --- |
| **One file per routine (built)** | 5 | 29 | 77 | 103 |
| Same, plus one shared "core" file³ | 22 | 41 | 67 | 86 |
| One file per module | 7 | 44 | 75 | 80 |
| No repetition (the set bundled together) | 5 | 29 | 51 | 53 |

¹ dgesv, dgeev, dgesvd, dsyev, dposv. ² zgeev, zggev, zgees, zheev.
³ the 64 modules used by 40 or more routines (20 KB).

- **The cost is bounded:** at most about twice the minimum, only on pages
  that load several large drivers with overlapping dependencies. A page with
  one or two routines pays nothing.
- **A single shared core does not work.** It adds 17 KB to every
  single-routine page and still lands well above the minimum, because no one
  core fits every combination of routines.
- **One file per module repeats nothing but costs more for one routine.**
  Each small file compresses alone and nothing is optimized across files.
  zgeev would also be 67 files in an import chain 14 levels deep: about 14
  round trips on a cold load, unless each entry imports its whole closure
  directly so the browser fetches it in parallel.
- **Repeated copies are harmless.** The 16 modules with mutable top-level
  variables hold scratch values (a packing buffer, complex-division
  temporaries), not caches.

A page that loads many drivers can install from npm and bundle the set
itself, which gives the minimum. If such pages turn out to be common, the
build can also write a one-file-per-module layout from the same script.

Other options measured: esbuild code-splitting over all entries produced 642
chunks and 29 (zggbal) to 91 (zgeev) requests per routine, which is too
fragmented to serve.

### The ndarray layer in `dist/`

The ndarray layer must stay browser-bundleable. `@stdlib/ndarray/zeros`
fails to bundle for the browser (it requires Node's `buffer`), and
`@stdlib/ndarray/ctor` is 34 KB alone. The layer should build its returned
ndarrays with `@stdlib/ndarray/base/ctor` (17 KB, largely shared with the
runtime) or return plain ndarray-like objects.

## Open questions

1. Naming: `lib/lapack/<routine>` (proposed) or another path.
2. Should rule 6 offer a throwing variant for positive `info`, or leave that
   to callers?
3. Should a reused-workspace hook (`out.work`) exist, or is internal
   allocation the whole contract for this layer?
4. Ticket 0110: keep stdlib's option asserts for conformance, or inline
   whitelists for size?
5. Ship `dist/` in the main package (built; nearly triples the npm download)
   or as a separate browser package?
