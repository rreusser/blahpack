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

# zla_gbrcond_c

> Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling

<section class="usage">

## Usage

```javascript
var zla_gbrcond_c = require( '@stdlib/lapack/base/zla_gbrcond_c' );
```

#### zla_gbrcond_c( order, trans, N, kl, ku, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, offsetIPIV, c, strideC, capply, WORK, strideWORK, RWORK, strideRWORK )

Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var AB = new Complex128Array( [ 5, 0 ] );
var AFB = new Complex128Array( [ 5, 0 ] );
var IPIV = new Int32Array( [ 1 ] );
var c = new Float64Array( [ 2.0 ] );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

var rcond = zla_gbrcond_c( 'column-major', 'no-transpose', 1, 0, 0, AB, 1, AFB, 1, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **trans**: specifies the operation type.
-   **N**: number of columns.
-   **kl**: kl.
-   **ku**: ku.
-   **AB**: input matrix.
-   **LDAB**: leading dimension of `AB`.
-   **AFB**: input matrix.
-   **LDAFB**: leading dimension of `AFB`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **capply**: capply.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.

#### zla_gbrcond_c.ndarray( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, c, strideC, offsetC, capply, WORK, strideWORK, offsetWORK, RWORK, strideRWORK, offsetRWORK )

Estimates the infinity norm condition number for a complex general banded matrix with inverse-c scaling, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );

var AB = new Complex128Array( [ 5, 0 ] );
var AFB = new Complex128Array( [ 5, 0 ] );
var IPIV = new Int32Array( [ 1 ] );
var c = new Float64Array( [ 2.0 ] );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

var rcond = zla_gbrcond_c.ndarray( 'no-transpose', 1, 0, 0, AB, 1, 1, 0, AFB, 1, 1, 0, IPIV, 1, 0, c, 1, 0, true, WORK, 1, 0, RWORK, 1, 0 );
```

The function has the following additional parameters:

-   **trans**: specifies the operation type.
-   **N**: number of columns.
-   **kl**: kl.
-   **ku**: ku.
-   **AB**: input matrix.
-   **strideAB1**: stride of dimension 1 of `AB`.
-   **strideAB2**: stride of dimension 2 of `AB`.
-   **offsetAB**: starting index for `AB`.
-   **AFB**: input matrix.
-   **strideAFB1**: stride of dimension 1 of `AFB`.
-   **strideAFB2**: stride of dimension 2 of `AFB`.
-   **offsetAFB**: starting index for `AFB`.
-   **IPIV**: input array.
-   **strideIPIV**: stride length for `IPIV`.
-   **offsetIPIV**: starting index for `IPIV`.
-   **c**: input array.
-   **strideC**: stride length for `c`.
-   **offsetC**: starting index for `C`.
-   **capply**: capply.
-   **WORK**: input array.
-   **strideWORK**: stride length for `WORK`.
-   **offsetWORK**: starting index for `WORK`.
-   **RWORK**: output array.
-   **strideRWORK**: stride length for `RWORK`.
-   **offsetRWORK**: starting index for `RWORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Requires a pre-factored input (`AFB` and `IPIV` from `zgbtrf`).
-   `WORK` must have at least `2*N` complex elements. `RWORK` must have at least `N` real elements.
-   `trans` must be `'no-transpose'` or `'conjugate-transpose'`.
-   Returns `0` if the matrix is singular or zero.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var zla_gbrcond_c = require( '@stdlib/lapack/base/zla_gbrcond_c' );

var AB = new Complex128Array( [ 5, 0 ] );
var AFB = new Complex128Array( [ 5, 0 ] );
var IPIV = new Int32Array( [ 1 ] );
var c = new Float64Array( [ 2.0 ] );
var WORK = new Complex128Array( 2 );
var RWORK = new Float64Array( 1 );

var rcond = zla_gbrcond_c( 'column-major', 'no-transpose', 1, 0, 0, AB, 1, AFB, 1, IPIV, 1, 0, c, 1, true, WORK, 1, RWORK, 1 );
console.log( rcond );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zla_gbrcond_c.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZLA_GBRCOND_C`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZLA\_GBRCOND\_C Computes the infinity norm condition number of $\operatorname{op}(A) \, \operatorname{inv}(\operatorname{diag}(C))$ where C is a DOUBLE PRECISION vector.

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
