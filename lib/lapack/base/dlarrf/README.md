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

# dlarrf

> Finds a new relatively robust representation for eigenvalues

<section class="usage">

## Usage

```javascript
var dlarrf = require( '@stdlib/lapack/base/dlarrf' );
```

#### dlarrf( N, d, strideD, l, strideL, LD, strideLD, clstrt, clend, w, strideW, WGAP, strideWGAP, WERR, strideWERR, spdiam, clgapl, clgapr, pivmin, sigma, DPLUS, strideDPLUS, LPLUS, strideLPLUS, WORK, strideWORK )

Finds a new relatively robust representation `L(+) D(+) L(+)^T = L D L^T - sigma*I` for a tridiagonal eigenvalue cluster, such that at least one eigenvalue is relatively isolated.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 4;
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
var sigma = new Float64Array( 1 );
var dplus = new Float64Array( N );
var lplus = new Float64Array( N );
var work = new Float64Array( 2 * N );

var info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, lplus, 1, work, 1 );
// info => 0
```

The function has the following parameters:

-   **N**: order of the tridiagonal matrix.
-   **d**: diagonal of the parent representation.
-   **strideD**: stride length for `d`.
-   **l**: subdiagonal of the unit bidiagonal factor.
-   **strideL**: stride length for `l`.
-   **LD**: elementwise product `L*D`.
-   **strideLD**: stride length for `LD`.
-   **clstrt**: first index of the eigenvalue cluster (1-based).
-   **clend**: last index of the eigenvalue cluster (1-based).
-   **w**: approximate eigenvalues of the parent.
-   **strideW**: stride length for `w`.
-   **WGAP**: approximate gaps between eigenvalues.
-   **strideWGAP**: stride length for `WGAP`.
-   **WERR**: errors in the approximate eigenvalues.
-   **strideWERR**: stride length for `WERR`.
-   **spdiam**: estimate of the spectral diameter.
-   **clgapl**: left gap of the cluster.
-   **clgapr**: right gap of the cluster.
-   **pivmin**: minimum allowed pivot in the Sturm sequence.
-   **sigma**: output array (length 1); `sigma[0]` receives the chosen shift.
-   **DPLUS**: output diagonal of the new RRR `D(+)`.
-   **strideDPLUS**: stride length for `DPLUS`.
-   **LPLUS**: output subdiagonal of the new RRR `L(+)`.
-   **strideLPLUS**: stride length for `LPLUS`.
-   **WORK**: workspace of length `2*N`.
-   **strideWORK**: stride length for `WORK`.

Returns an integer `info` status code (`0` on success, `1` if no acceptable shift was found).

#### dlarrf.ndarray( N, d, strideD, offsetD, l, strideL, offsetL, LD, strideLD, offsetLD, clstrt, clend, w, strideW, offsetW, WGAP, strideWGAP, offsetWGAP, WERR, strideWERR, offsetWERR, spdiam, clgapl, clgapr, pivmin, sigma, DPLUS, strideDPLUS, offsetDPLUS, LPLUS, strideLPLUS, offsetLPLUS, WORK, strideWORK, offsetWORK )

Finds a new relatively robust representation for a tridiagonal cluster, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 4;
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
var sigma = new Float64Array( 1 );
var dplus = new Float64Array( N );
var lplus = new Float64Array( N );
var work = new Float64Array( 2 * N );

var info = dlarrf.ndarray( N, d, 1, 0, l, 1, 0, ld, 1, 0, 1, 4, w, 1, 0, wgap, 1, 0, werr, 1, 0, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, 0, lplus, 1, 0, work, 1, 0 );
// info => 0
```

The function has the following additional parameters:

-   **N**: number of columns.
-   **d**: input array.
-   **strideD**: stride length for `d`.
-   **offsetD**: starting index for `D`.
-   **l**: input array.
-   **strideL**: stride length for `l`.
-   **offsetL**: starting index for `L`.
-   **LD**: input array.
-   **strideLD**: stride length for `LD`.
-   **offsetLD**: starting index for `LD`.
-   **clstrt**: clstrt.
-   **clend**: clend.
-   **w**: input array.
-   **strideW**: stride length for `w`.
-   **offsetW**: starting index for `W`.
-   **WGAP**: input array.
-   **strideWGAP**: stride length for `WGAP`.
-   **offsetWGAP**: starting index for `WGAP`.
-   **WERR**: input array.
-   **strideWERR**: stride length for `WERR`.
-   **offsetWERR**: starting index for `WERR`.
-   **spdiam**: spdiam.
-   **clgapl**: clgapl.
-   **clgapr**: clgapr.
-   **pivmin**: pivmin.
-   **sigma**: sigma.
-   **DPLUS**: input array.
-   **strideDPLUS**: stride length for `DPLUS`.
-   **offsetDPLUS**: starting index for `DPLUS`.
-   **LPLUS**: input array.
-   **strideLPLUS**: stride length for `LPLUS`.
-   **offsetLPLUS**: starting index for `LPLUS`.
-   **WORK**: output array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   This is an auxiliary routine used within the MRRR eigenvalue algorithm. Given a parent `LDL^T` factorization of a symmetric tridiagonal matrix and a set of approximate eigenvalues forming a tight cluster, it selects a shift `sigma` and computes a new factorization `L(+) D(+) L(+)^T = L D L^T - sigma*I` such that at least one eigenvalue of the shifted matrix is relatively isolated.
-   Two candidate shifts derived from the outer bounds of the cluster are tested, each followed by a growth-bounded differential-stationary `qd` factorization; the first to satisfy the growth heuristic is chosen.
-   `pivmin` should be a safe pivot threshold such as a small multiple of the smallest normal double-precision number.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlarrf = require( '@stdlib/lapack/base/dlarrf' );

var N = 4;
var d = new Float64Array( [ 4.0, 3.0, 2.0, 1.0 ] );
var l = new Float64Array( [ 0.1, 0.1, 0.1, 0.0 ] );
var ld = new Float64Array( [ 0.4, 0.3, 0.2, 0.0 ] );
var w = new Float64Array( [ 0.95, 1.95, 2.95, 4.05 ] );
var wgap = new Float64Array( [ 0.9, 0.9, 1.0, 0.0 ] );
var werr = new Float64Array( [ 1e-3, 1e-3, 1e-3, 1e-3 ] );
var sigma = new Float64Array( 1 );
var dplus = new Float64Array( N );
var lplus = new Float64Array( N );
var work = new Float64Array( 2 * N );

var info = dlarrf( N, d, 1, l, 1, ld, 1, 1, 4, w, 1, wgap, 1, werr, 1, 4.0, 1.0, 1.0, 2.2250738585072014e-308, sigma, dplus, 1, lplus, 1, work, 1 );
console.log( 'info=' + info + ' sigma=' + sigma[ 0 ] );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dlarrf.f; do not edit) -->

<section class="fortran-docs">

## Reference documentation

From the reference LAPACK 3.12.0 source of `DLARRF`, converted to Markdown with KaTeX math. Indices are the 1-based Fortran indices of the source.

> Finds a new relatively robust representation such that at least one of the eigenvalues is relatively isolated.

### Purpose

Given the initial representation L D L^T and its cluster of close eigenvalues (in a relative measure), W( `CLSTRT` ), W( `CLSTRT`+1 ), ... W( `CLEND` ), DLARRF finds a new relatively robust representation L D L^T - `SIGMA` $I = L(+)$ `D(+)` `L(+)`^T such that at least one of the eigenvalues of `L(+)` `D(+)` `L(+)`^T is relatively isolated.

### Arguments

#### N `[in]`

_INTEGER_

The order of the matrix (subblock, if the matrix split).

#### D `[in]`

_DOUBLE PRECISION array, dimension (N)_

The N diagonal elements of the diagonal matrix D.

#### L `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (N-1) subdiagonal elements of the unit bidiagonal matrix L.

#### LD `[in]`

_DOUBLE PRECISION array, dimension (N-1)_

The (N-1) elements $L(i) \, D(i)$.

#### CLSTRT `[in]`

_INTEGER_

The index of the first eigenvalue in the cluster.

#### CLEND `[in]`

_INTEGER_

The index of the last eigenvalue in the cluster.

#### W `[in]`

_DOUBLE PRECISION array, dimension dimension is >=  (CLEND-CLSTRT+1)_

The eigenvalue APPROXIMATIONS of L D L^T in ascending order. W( `CLSTRT` ) through W( `CLEND` ) form the cluster of relatively close eigenalues.

#### WGAP `[in,out]`

_DOUBLE PRECISION array, dimension dimension is >=  (CLEND-CLSTRT+1)_

The separation from the right neighbor eigenvalue in W.

#### WERR `[in]`

_DOUBLE PRECISION array, dimension dimension is  >=  (CLEND-CLSTRT+1)_

`WERR` contain the semiwidth of the uncertainty interval of the corresponding eigenvalue APPROXIMATION in W

#### SPDIAM `[in]`

_DOUBLE PRECISION_

estimate of the spectral diameter obtained from the Gerschgorin intervals

#### CLGAPL `[in]`

_DOUBLE PRECISION_

#### CLGAPR `[in]`

_DOUBLE PRECISION_

absolute gap on each end of the cluster. Set by the calling routine to protect against shifts too close to eigenvalues outside the cluster.

#### PIVMIN `[in]`

_DOUBLE PRECISION_

The minimum pivot allowed in the Sturm sequence.

#### SIGMA `[out]`

_DOUBLE PRECISION_

The shift used to form `L(+)` `D(+)` `L(+)`^T.

#### DPLUS `[out]`

_DOUBLE PRECISION array, dimension (N)_

The N diagonal elements of the diagonal matrix `D(+)`.

#### LPLUS `[out]`

_DOUBLE PRECISION array, dimension (N-1)_

The first (N-1) elements of `LPLUS` contain the subdiagonal elements of the unit bidiagonal matrix `L(+)`.

#### WORK `[out]`

_DOUBLE PRECISION array, dimension (2\*N)_

Workspace.

#### INFO `[out]`

_INTEGER_

Signals processing OK (=0) or failure (=1)

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
