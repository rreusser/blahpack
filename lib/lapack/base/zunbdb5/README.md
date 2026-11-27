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

# zunbdb5

> Orthogonalize a complex column vector with respect to the columns of a matrix with orthonormal columns; if the projection collapses to zero, return a standard-basis vector that is orthogonal to range(Q).

<section class="usage">

## Usage

```javascript
var zunbdb5 = require( '@stdlib/lapack/base/zunbdb5' );
```

#### zunbdb5( order, m1, m2, N, X1, strideX1, X2, strideX2, Q1, LDQ1, Q2, LDQ2, WORK, strideWORK )

Orthogonalizes the complex column vector `X = [X1; X2]` against the columns of `Q = [Q1; Q2]`. If the projection is zero (i.e. `X` lies entirely in range(Q)), then a standard-basis vector orthogonal to range(Q) is returned in `X` instead.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var Q2 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var X1 = new Complex128Array( [ 1.0, 1.0, 2.0, 2.0, 3.0, 3.0, 4.0, 4.0 ] );
var X2 = new Complex128Array( [ 5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0 ] );
var WORK = new Complex128Array( 2 );

zunbdb5( 'column-major', 4, 4, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **m1**: dimension of `X1` and number of rows in `Q1`.
-   **m2**: dimension of `X2` and number of rows in `Q2`.
-   **N**: number of columns in `Q1` and `Q2`.
-   **X1**: top part of the input vector ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideX1**: stride length for `X1` (in complex elements).
-   **X2**: bottom part of the input vector ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideX2**: stride length for `X2` (in complex elements).
-   **Q1**: top part of the orthonormal basis matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDQ1**: leading dimension of `Q1`.
-   **Q2**: bottom part of the orthonormal basis matrix ([`Complex128Array`][@stdlib/array/complex128]).
-   **LDQ2**: leading dimension of `Q2`.
-   **WORK**: workspace array of length at least `N` ([`Complex128Array`][@stdlib/array/complex128]).
-   **strideWORK**: stride length for `WORK` (in complex elements).

#### zunbdb5.ndarray( m1, m2, N, X1, strideX1, offsetX1, X2, strideX2, offsetX2, Q1, strideQ11, strideQ12, offsetQ1, Q2, strideQ21, strideQ22, offsetQ2, WORK, strideWORK, offsetWORK )

Same as `zunbdb5` above, but with explicit per-array stride and offset parameters in place of the `order`/`LDQ` layout convention.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var Q1 = new Complex128Array( [ 1.0, 0.0 ] );
var Q2 = new Complex128Array( [ 0.0, 0.0 ] );
var X1 = new Complex128Array( [ 3.0, 4.0 ] );
var X2 = new Complex128Array( [ 5.0, 6.0 ] );
var WORK = new Complex128Array( 1 );

zunbdb5.ndarray( 1, 1, 1, X1, 1, 0, X2, 1, 0, Q1, 1, 1, 0, Q2, 1, 1, 0, WORK, 1, 0 );
```

The function has the following additional parameters:

-   **offsetX1**: starting index for `X1` (in complex elements).
-   **offsetX2**: starting index for `X2` (in complex elements).
-   **strideQ11**: stride of the first dimension of `Q1` (in complex elements).
-   **strideQ12**: stride of the second dimension of `Q1` (in complex elements).
-   **offsetQ1**: starting index for `Q1` (in complex elements).
-   **strideQ21**: stride of the first dimension of `Q2` (in complex elements).
-   **strideQ22**: stride of the second dimension of `Q2` (in complex elements).
-   **offsetQ2**: starting index for `Q2` (in complex elements).
-   **offsetWORK**: starting index for `WORK` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zunbdb5` is the complex analog of `dorbdb5`. The projection step uses the conjugate-transpose `Q^H` (rather than `Q^T`).
-   When the orthogonalization collapses to zero, `zunbdb5` searches the standard basis vectors `e_1, ..., e_(m1+m2)` (X1 partition first) and returns the first one whose projection onto the orthogonal complement of `Q` is nonzero.
-   `zunbdb5` is used as a kernel inside the LAPACK CS Decomposition (CSD) family of routines (notably `zunbdb1`-`zunbdb4`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zunbdb5 = require( '@stdlib/lapack/base/zunbdb5' );

var sq2 = 1.0 / Math.sqrt( 2.0 );
var Q1 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var Q2 = new Complex128Array( [ sq2, 0.0, 0.0, 0.0, 0.0, 0.0, sq2, 0.0 ] );
var X1 = new Complex128Array( [ 1.0, 1.0, 2.0, 2.0, 3.0, 3.0, 4.0, 4.0 ] );
var X2 = new Complex128Array( [ 5.0, 5.0, 6.0, 6.0, 7.0, 7.0, 8.0, 8.0 ] );
var WORK = new Complex128Array( 2 );

zunbdb5( 'column-major', 4, 4, 2, X1, 1, X2, 1, Q1, 2, Q2, 2, WORK, 1 );
console.log( X1 );
console.log( X2 );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zunbdb5.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZUNBDB5`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZUNBDB5 orthogonalizes the column vector

```text
     X = [ X1 ]
         [ X2 ]
with respect to the columns of
     Q = [ Q1 ] .
         [ Q2 ]
```

The columns of Q must be orthonormal.

If the projection is zero according to Kahan's "twice is enough" criterion, then some other vector from the orthogonal complement is returned. This vector is chosen in an arbitrary but deterministic way.

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128

</section>

<!-- /.links -->
