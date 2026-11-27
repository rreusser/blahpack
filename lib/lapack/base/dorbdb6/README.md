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

# dorbdb6

> Orthogonalize a column vector with respect to the columns of a matrix with orthonormal columns.

<section class="usage">

## Usage

```javascript
var dorbdb6 = require( '@stdlib/lapack/base/dorbdb6' );
```

#### dorbdb6( order, m1, m2, N, X1, strideX1, X2, strideX2, Q1, LDQ1, Q2, LDQ2, WORK, strideWORK )

Orthogonalizes the column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`, where the columns of `Q` are assumed to be orthonormal. On exit, `X1`/`X2` contain the projected vector and equal zero if and only if `X` lies entirely in the range of `Q`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );
var Q2 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );
var X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var X2 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var WORK = new Float64Array( 2 );

dorbdb6( 'column-major', 4, 4, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
// X1 => <Float64Array>[ -2, -2, 3, 4 ]
// X2 => <Float64Array>[ 2, 2, 7, 8 ]
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **m1**: dimension of `X1` and number of rows in `Q1`.
-   **m2**: dimension of `X2` and number of rows in `Q2`.
-   **N**: number of columns in `Q1` and `Q2`.
-   **X1**: top part of the input vector ([`Float64Array`][mdn-float64array]).
-   **strideX1**: stride length for `X1`.
-   **X2**: bottom part of the input vector ([`Float64Array`][mdn-float64array]).
-   **strideX2**: stride length for `X2`.
-   **Q1**: top part of the orthonormal basis matrix ([`Float64Array`][mdn-float64array]).
-   **LDQ1**: leading dimension of `Q1`.
-   **Q2**: bottom part of the orthonormal basis matrix ([`Float64Array`][mdn-float64array]).
-   **LDQ2**: leading dimension of `Q2`.
-   **WORK**: workspace array of length at least `N` ([`Float64Array`][mdn-float64array]).
-   **strideWORK**: stride length for `WORK`.

#### dorbdb6.ndarray( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK )

Same as `dorbdb6` above, but with explicit per-array stride and offset parameters in place of the `order`/`LDQ` layout convention.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var Q1 = new Float64Array( [ 1.0, 0.0 ] );
var Q2 = new Float64Array( [ 0.0, 0.0 ] );
var X1 = new Float64Array( [ 3.0, 4.0 ] );
var X2 = new Float64Array( [ 5.0, 6.0 ] );
var WORK = new Float64Array( 1 );

dorbdb6.ndarray( 2, 2, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 2, 0, Q2, 1, 2, 0, WORK, 1, 0 );
// X1 => <Float64Array>[ 0, 4 ]
// X2 => <Float64Array>[ 5, 6 ]
```

The function has the following additional parameters:

-   **offsetX1**: starting index for `X1`.
-   **offsetX2**: starting index for `X2`.
-   **strideQ11**: stride of dimension 1 of `Q1`.
-   **strideQ12**: stride of dimension 2 of `Q1`.
-   **offsetQ1**: starting index for `Q1`.
-   **strideQ21**: stride of dimension 1 of `Q2`.
-   **strideQ22**: stride of dimension 2 of `Q2`.
-   **offsetQ2**: starting index for `Q2`.
-   **offsetWORK**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The projection is computed with at most two iterations of classical Gram-Schmidt with reorthogonalization, following Giraud, Langou, & Rozložník (2002). On orthonormal `Q`, the second pass is rarely required and the result is accurate to working precision.
-   When the projection collapses to a norm at most `N * eps * ||X||`, `X` is truncated to zero.
-   `dorbdb6` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dorbdb6 = require( '@stdlib/lapack/base/dorbdb6' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );
var Q2 = new Float64Array( [ sq2, 0.0, 0.0, sq2 ] );
var X1 = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var X2 = new Float64Array( [ 5.0, 6.0, 7.0, 8.0 ] );
var WORK = new Float64Array( 2 );

dorbdb6( 'column-major', 4, 4, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
console.log( X1 );
console.log( X2 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/dorbdb6.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `DORBDB6`. Indices are the 1-based Fortran indices of the source.

### Purpose

DORBDB6 orthogonalizes the column vector

```text
     X = [ X1 ]
         [ X2 ]
with respect to the columns of
     Q = [ Q1 ] .
         [ Q2 ]
```

The columns of Q must be orthonormal. The orthogonalized vector will be zero if and only if it lies entirely in the range of Q.

The projection is computed with at most two iterations of the classical Gram-Schmidt algorithm, see \* L. Giraud, J. Langou, M. Rozložník. "On the round-off error

-   analysis of the Gram-Schmidt algorithm with reorthogonalization."
-   2002. CERFACS Technical Report No. TR/PA/02/33. URL:
-   https://www.cerfacs.fr/algor/reports/2002/TR\_PA\_02\_33.pdf

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
