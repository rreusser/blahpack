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

# dlaeda

> Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.

<section class="usage">

## Usage

```javascript
var dlaeda = require( '@stdlib/lapack/base/dlaeda' );
```

#### dlaeda( order, N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, LDGIVNUM, q, strideQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, ZTEMP, strideZTEMP )

Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlaeda = require( '@stdlib/lapack/base/dlaeda' );

var N = 4;
var QPTR = new Int32Array( [ 1, 5, 9 ] );
var q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 ] );
var z = new Float64Array( N );
var ZTEMP = new Float64Array( N );
var prmptr = new Int32Array( 4 );
var perm = new Int32Array( 4 );
var givptr = new Int32Array( 4 );
var givcol = new Int32Array( 2 * 4 );
var givnum = new Float64Array( 2 * 4 );

dlaeda( 'row-major', N, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 2, 1, 0, givnum, N, q, 1, QPTR, 1, 0, z, 1, ZTEMP, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **N**: number of columns.
-   **tlvls**: tlvls.
-   **curlvl**: curlvl.
-   **curpbm**: curpbm.
-   **PRMPTR**: input array.
-   **stridePRMPTR**: stride length for `PRMPTR`.
-   **offsetPRMPTR**: starting index for `PRMPTR`.
-   **PERM**: input array.
-   **stridePERM**: stride length for `PERM`.
-   **offsetPERM**: starting index for `PERM`.
-   **GIVPTR**: input array.
-   **strideGIVPTR**: stride length for `GIVPTR`.
-   **offsetGIVPTR**: starting index for `GIVPTR`.
-   **GIVCOL**: input matrix.
-   **strideGIVCOL1**: stride of the first dimension of `GIVCOL`.
-   **strideGIVCOL2**: stride of the second dimension of `GIVCOL`.
-   **offsetGIVCOL**: starting index for `GIVCOL`.
-   **GIVNUM**: input matrix.
-   **LDGIVNUM**: leading dimension of `GIVNUM`.
-   **q**: input array.
-   **strideQ**: stride length for `q`.
-   **QPTR**: input array.
-   **strideQPTR**: stride length for `QPTR`.
-   **offsetQPTR**: starting index for `QPTR`.
-   **z**: input array.
-   **strideZ**: stride length for `z`.
-   **ZTEMP**: output array.
-   **strideZTEMP**: stride length for `ZTEMP`.

#### dlaeda.ndarray( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM, q, strideQ, offsetQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, offsetZ, ZTEMP, strideZTEMP, offsetZTEMP )

Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC., using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlaeda = require( '@stdlib/lapack/base/dlaeda' );

var N = 4;
var QPTR = new Int32Array( [ 1, 5, 9 ] );
var q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 ] );
var z = new Float64Array( N );
var ZTEMP = new Float64Array( N );
var prmptr = new Int32Array( 4 );
var perm = new Int32Array( 4 );
var givptr = new Int32Array( 4 );
var givcol = new Int32Array( 2 * 4 );
var givnum = new Float64Array( 2 * 4 );

dlaeda.ndarray( N, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 1, 2, 0, givnum, 1, 2, 0, q, 1, 0, QPTR, 1, 0, z, 1, 0, ZTEMP, 1, 0 );
```

The function has the following additional parameters:

-   **N**: number of columns.
-   **tlvls**: tlvls.
-   **curlvl**: curlvl.
-   **curpbm**: curpbm.
-   **PRMPTR**: input array.
-   **stridePRMPTR**: stride length for `PRMPTR`.
-   **offsetPRMPTR**: starting index for `PRMPTR`.
-   **PERM**: input array.
-   **stridePERM**: stride length for `PERM`.
-   **offsetPERM**: starting index for `PERM`.
-   **GIVPTR**: input array.
-   **strideGIVPTR**: stride length for `GIVPTR`.
-   **offsetGIVPTR**: starting index for `GIVPTR`.
-   **GIVCOL**: input matrix.
-   **strideGIVCOL1**: stride of dimension 1 of `GIVCOL`.
-   **strideGIVCOL2**: stride of dimension 2 of `GIVCOL`.
-   **offsetGIVCOL**: starting index for `GIVCOL`.
-   **GIVNUM**: input matrix.
-   **strideGIVNUM1**: stride of dimension 1 of `GIVNUM`.
-   **strideGIVNUM2**: stride of dimension 2 of `GIVNUM`.
-   **offsetGIVNUM**: starting index for `GIVNUM`.
-   **q**: input array.
-   **strideQ**: stride length for `q`.
-   **offsetQ**: starting index for `Q`.
-   **QPTR**: input array.
-   **strideQPTR**: stride length for `QPTR`.
-   **offsetQPTR**: starting index for `QPTR`.
-   **z**: input array.
-   **strideZ**: stride length for `z`.
-   **offsetZ**: starting index for `Z`.
-   **ZTEMP**: output array.
-   **strideZTEMP**: stride length for `ZTEMP`.
-   **offsetZTEMP**: starting index for `ZTEMP`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlaeda()` corresponds to the [LAPACK][lapack] level routine [`dlaeda`][lapack-dlaeda].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var Int32Array = require( '@stdlib/array/int32' );
var dlaeda = require( '@stdlib/lapack/base/dlaeda' );

var N = 4;
var QPTR = new Int32Array( [ 1, 5, 9 ] );
var q = new Float64Array( [ 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0 ] );
var z = new Float64Array( N );
var ZTEMP = new Float64Array( N );
var prmptr = new Int32Array( 4 );
var perm = new Int32Array( 4 );
var givptr = new Int32Array( 4 );
var givcol = new Int32Array( 2 * 4 );
var givnum = new Float64Array( 2 * 4 );

dlaeda( 'row-major', N, 1, 1, 0, prmptr, 1, 0, perm, 1, 0, givptr, 1, 0, givcol, 2, 1, 0, givnum, N, q, 1, QPTR, 1, 0, z, 1, ZTEMP, 1 );
console.log( z );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[lapack]: https://www.netlib.org/lapack/explore-html/

[lapack-dlaeda]: https://www.netlib.org/lapack/explore-html/d3/d2e/group__laeda.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
