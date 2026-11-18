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

# zgetsqrhrt

> Compute a column-blocked QR factorization of a complex `M`-by-`N` matrix using TSQR followed by Householder reconstruction.

<section class="usage">

## Usage

```javascript
var zgetsqrhrt = require( '@stdlib/lapack/base/zgetsqrhrt' );
```

#### zgetsqrhrt( order, M, N, mb1, nb1, nb2, A, LDA, T, LDT, WORK, RWORK )

Computes the QR factorization `A = Q * R` of a complex `M`-by-`N` matrix `A` (`M >= N`) using an internal TSQR factorization followed by Householder reconstruction. The output `Q` and `R` factors are stored in the same format as `zgeqrt` (`Q` in blocked compact `WY`-representation).

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( 16 );
var T = new Complex128Array( 4 );

zgetsqrhrt( 'column-major', 4, 2, 4, 2, 2, A, 4, T, 2, null, null );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows of the matrix `A` (`M >= N`).
-   **N**: number of columns of the matrix `A`.
-   **mb1**: row block size for the internal TSQR (`mb1 > N`).
-   **nb1**: column block size for the internal TSQR (`nb1 >= 1`).
-   **nb2**: block size for the output blocked QR (`nb2 >= 1`).
-   **A**: input/output matrix; on exit, the upper triangle contains `R` and the strict lower triangle contains the Householder vectors `V`.
-   **LDA**: leading dimension of `A`.
-   **T**: output upper-triangular block reflector factors, stored as a sequence of `min(nb2,N)`-by-`min(nb2,N)` blocks.
-   **LDT**: leading dimension of `T` (`LDT >= max(1, min(nb2, N))`).
-   **WORK**: complex workspace; if `null`, a workspace of the minimum required size is allocated internally.
-   **RWORK**: real workspace `Float64Array` of length at least `N`; if `null`, a workspace is allocated internally.

#### zgetsqrhrt.ndarray( M, N, mb1, nb1, nb2, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT )

Same operation, using stride/offset indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array( 16 );
var T = new Complex128Array( 4 );

zgetsqrhrt.ndarray( 4, 2, 4, 2, 2, A, 1, 4, 0, T, 1, 2, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of dimension 1 of `A`.
-   **strideA2**: stride of dimension 2 of `A`.
-   **offsetA**: starting index for `A`.
-   **strideT1**: stride of dimension 1 of `T`.
-   **strideT2**: stride of dimension 2 of `T`.
-   **offsetT**: starting index for `T`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The internal workspace required by `zlatsqr`, `zungtsqr_row`, and `zunhr_col` is allocated automatically; no external `WORK` parameter is needed.
-   `nb2` is the output block size — it controls the leading dimension of `T` and how the compact-`WY` reflectors are partitioned. It is independent of the internal TSQR block sizes `mb1` and `nb1`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zgetsqrhrt = require( '@stdlib/lapack/base/zgetsqrhrt' );

var A = new Complex128Array( [
    2.0, 0.5, 1.0, -0.2, 3.0, 0.1,
    1.0, -0.3, 4.0, 0.4, 2.0, -0.1,
    3.0, 0.2, 2.0, 0.1, 5.0, 0.3,
    1.0, -0.4, 3.0, -0.2, 1.0, 0.5
] );
var T = new Complex128Array( 6 );

zgetsqrhrt( 'column-major', 4, 3, 4, 2, 2, A, 4, T, 2, null, null );
console.log( A );
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-complex128array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
