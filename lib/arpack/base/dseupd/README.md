<!--

@license Apache-2.0

Copyright (c) 2025 The Stdlib Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

-->

# dseupd

> Return the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization.

<section class="usage">

## Usage

```javascript
import dseupd from '@stdlib/arpack/base/dseupd/lib/index.js';
```

#### dseupd( rvec, howmny, select, strideSelect, d, strideD, z, ldz, sigma, bmat, N, which, nev, tol, resid, strideResid, ncv, v, ldv, iparam, strideIparam, ipntr, strideIpntr, workd, strideWorkd, workl, strideWorkl, lworkl )

Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem `A*z = lambda*B*z` from the Lanczos factorization computed by `dsaupd`.

`dseupd` is the ARPACK symmetric eigenvector-extraction / post-processing step. It is **not** a reverse-communication routine and holds no internal state; it is called once, after the `dsaupd` iteration converges, and consumes the internal state (`v`, `workl`, `iparam`, `ipntr`) that `dsaupd` produced. On exit, `d` holds the `iparam[4]` (`nconv`) converged Ritz values in ascending order and, when `rvec` is `true` and `howmny` is `'all'`, the first `nconv` columns of `z` hold the corresponding B-orthonormal Ritz vectors. The arrays `v` and `workl` are overwritten.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

// nconv (iparam[4]) is 0 here, which triggers an immediate normal return:
var iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
var ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
var select = new Array( 4 );
var d = new Float64Array( 2 );
var z = new Float64Array( 8 );
var v = new Float64Array( 8 );
var resid = new Float64Array( 2 );
var workd = new Float64Array( 4 );
var workl = new Float64Array( 48 );

var info = dseupd( true, 'all', select, 1, d, 1, z, 2, 0.0, 'standard', 2, 'LM', 2, 0.0, resid, 1, 4, v, 2, iparam, 1, ipntr, 1, workd, 1, workl, 1, 48 );
// info => 0
```

The function has the following parameters:

-   **rvec**: if `true`, compute Ritz vectors; if `false`, compute Ritz values only.
-   **howmny**: `'all'`, `'partial'`, or `'select'` (only `'all'` is implemented).
-   **select**: logical work array of length `ncv`.
-   **strideSelect**: stride length for `select`.
-   **d**: output `Float64Array` for the Ritz values (length `nev`).
-   **strideD**: stride length for `d`.
-   **z**: output `Float64Array` matrix of Ritz vectors (`N`-by-`nev` when `howmny='all'`).
-   **ldz**: leading dimension of `z`.
-   **sigma**: shift used when the mode (`iparam[6]`) is 3, 4, or 5.
-   **bmat**: `'standard'` for a standard problem, `'generalized'` for a generalized problem.
-   **N**: dimension of the eigenproblem.
-   **which**: eigenvalue selection: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`.
-   **nev**: number of eigenvalues requested.
-   **tol**: relative accuracy tolerance used by `dsaupd`.
-   **resid**: final residual `Float64Array` (length `N`).
-   **strideResid**: stride length for `resid`.
-   **ncv**: number of Lanczos basis vectors.
-   **v**: Lanczos basis matrix (`N`-by-`ncv`); overwritten on exit.
-   **ldv**: leading dimension of `v`.
-   **iparam**: ARPACK parameter array (`iparam[4]` = `nconv`, `iparam[6]` = mode).
-   **strideIparam**: stride length for `iparam`.
-   **ipntr**: ARPACK pointer array into `workl`.
-   **strideIpntr**: stride length for `ipntr`.
-   **workd**: work `Float64Array` of length `2*N`.
-   **strideWorkd**: stride length for `workd`.
-   **workl**: private work `Float64Array` set by `dsaupd` (length `lworkl`); modified on exit.
-   **strideWorkl**: stride length for `workl`.
-   **lworkl**: length of `workl`.

The function returns `info`: `0` on success, otherwise a negative error code (matching the ARPACK convention).

#### dseupd.ndarray( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, z, strideZ1, strideZ2, offsetZ, sigma, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, v, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl )

Returns the converged Ritz values and (optionally) Ritz vectors, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
var ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
var select = new Array( 4 );
var d = new Float64Array( 2 );
var z = new Float64Array( 8 );
var v = new Float64Array( 8 );
var resid = new Float64Array( 2 );
var workd = new Float64Array( 4 );
var workl = new Float64Array( 48 );

var info = dseupd.ndarray( true, 'all', select, 1, 0, d, 1, 0, z, 1, 2, 0, 0.0, 'standard', 2, 'LM', 2, 0.0, resid, 1, 0, 4, v, 1, 2, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, 48 );
// info => 0
```

The `ndarray` method accepts the same arguments but with an explicit starting index (offset) for each array argument and two strides for each matrix argument (`z`, `v`).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dseupd` corresponds to the ARPACK routine `dseupd`, translated from the reference Fortran (arpack-ng 3.9.1). Only `howmny = 'all'` is implemented (matching the reference). For modes 3, 4, and 5 (`SHIFTI`, `BUCKLE`, `CAYLEY`) the Ritz values are transformed back to the original system and the Ritz vectors are purified via one step of inverse subspace iteration.
-   Because `dseupd` consumes the internal state produced by `dsaupd`, meaningful inputs come from a converged `dsaupd` run. The package tests drive the full `dsaupd` + `dseupd` Fortran pipeline and verify the JavaScript translation number-for-number against the recorded reference outputs.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dseupd from '@stdlib/arpack/base/dseupd/lib/index.js';

var iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
var ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
var select = new Array( 4 );
var d = new Float64Array( 2 );
var z = new Float64Array( 8 );
var v = new Float64Array( 8 );
var resid = new Float64Array( 2 );
var workd = new Float64Array( 4 );
var workl = new Float64Array( 48 );

var info = dseupd( true, 'all', select, 1, d, 1, z, 2, 0.0, 'standard', 2, 'LM', 2, 0.0, resid, 1, 4, v, 2, iparam, 1, ipntr, 1, workd, 1, workl, 1, 48 );

console.log( info );
// => 0
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
