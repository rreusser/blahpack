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

# dlaqz4

> Execute a single multishift QZ sweep on a matrix pencil `(A, B)`.

<section class="usage">

## Usage

```javascript
var dlaqz4 = require( '@stdlib/lapack/base/dlaqz4' );
```

#### dlaqz4( order, ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblock\_desired, SR, strideSR, SI, strideSI, SS, strideSS, A, LDA, B, LDB, Q, LDQ, Z, LDZ, QC, LDQC, ZC, LDZC, WORK, strideWork )

Executes a single multishift QZ sweep on the matrix pencil `(A, B)`, accumulating updates into `Q` and `Z`.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 4;
var A = new Float64Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 1.0, 0.4, 0.0, 0.2, 0.3, 1.0, 0.2, 0.1, 0.2, 0.3, 1.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 1.0, 0.0, 0.0, 0.1, 0.3, 1.0, 0.0, 0.05, 0.1, 0.2, 1.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
var QC = new Float64Array( 16 );
var ZC = new Float64Array( 16 );
var WORK = new Float64Array( 16 );

var SR = new Float64Array( [ 0.9, 0.9 ] );
var SI = new Float64Array( [ 0.1, -0.1 ] );
var SS = new Float64Array( [ 1.0, 1.0 ] );

var info = dlaqz4( 'column-major', true, true, true, N, 0, N - 1, 2, 3, SR, 1, SI, 1, SS, 1, A, N, B, N, Q, N, Z, N, QC, N, ZC, N, WORK, 1 );
// returns 0
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **ilschur**: if `true`, updates are applied to the full Schur form; otherwise updates are restricted to the active window `[ilo, ihi]`.
-   **ilq**: if `true`, accumulate left transformations into `Q`.
-   **ilz**: if `true`, accumulate right transformations into `Z`.
-   **N**: order of the matrices `A`, `B`, `Q`, `Z`.
-   **ilo**: (0-based) first index of the active Hessenberg region.
-   **ihi**: (0-based) last index of the active Hessenberg region.
-   **nshifts**: desired number of shifts to use. Must be `>= 2`; if odd, is reduced by one.
-   **nblock\_desired**: desired size of the computational windows. Must satisfy `nblockDesired >= nshifts + 1`.
-   **SR**: real parts of the shifts (length `>= nshifts`).
-   **strideSR**: stride length for `SR`.
-   **SI**: imaginary parts of the shifts. Pairs must be complex conjugates.
-   **strideSI**: stride length for `SI`.
-   **SS**: shift scales.
-   **strideSS**: stride length for `SS`.
-   **A**: matrix `A` (upper Hessenberg, modified in place).
-   **LDA**: leading dimension of `A` (`>= max(1, N)`).
-   **B**: matrix `B` (upper triangular, modified in place).
-   **LDB**: leading dimension of `B`.
-   **Q**: matrix `Q` (modified in place if `ilq`).
-   **LDQ**: leading dimension of `Q`.
-   **Z**: matrix `Z` (modified in place if `ilz`).
-   **LDZ**: leading dimension of `Z`.
-   **QC**: workspace square matrix of order `>= nblockDesired`.
-   **LDQC**: leading dimension of `QC`.
-   **ZC**: workspace square matrix of order `>= nblockDesired`.
-   **LDZC**: leading dimension of `ZC`.
-   **WORK**: caller-supplied workspace of size at least `N * nblockDesired`.
-   **strideWork**: stride length for `WORK`.

#### dlaqz4.ndarray( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblock\_desired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork )

Executes a single multishift QZ sweep on a matrix pencil, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var N = 4;
var A = new Float64Array( [ 1.0, 0.5, 0.0, 0.0, 0.3, 1.0, 0.4, 0.0, 0.2, 0.3, 1.0, 0.2, 0.1, 0.2, 0.3, 1.0 ] );
var B = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.2, 1.0, 0.0, 0.0, 0.1, 0.3, 1.0, 0.0, 0.05, 0.1, 0.2, 1.0 ] );
var Q = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
var Z = new Float64Array( [ 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0 ] );
var QC = new Float64Array( 16 );
var ZC = new Float64Array( 16 );
var WORK = new Float64Array( 16 );

var SR = new Float64Array( [ 0.9, 0.9 ] );
var SI = new Float64Array( [ 0.1, -0.1 ] );
var SS = new Float64Array( [ 1.0, 1.0 ] );

var info = dlaqz4.ndarray( true, true, true, N, 0, N - 1, 2, 3, SR, 1, 0, SI, 1, 0, SS, 1, 0, A, 1, N, 0, B, 1, N, 0, Q, 1, N, 0, Z, 1, N, 0, QC, 1, N, 0, ZC, 1, N, 0, WORK, 1, 0 );
// returns 0
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A`.
-   **strideA2**: stride of the second dimension of `A`.
-   **offsetA**: starting index for `A`.
-   (similarly for `B`, `Q`, `Z`, `QC`, `ZC`)
-   **offsetSR**: starting index for `SR`.
-   **offsetSI**: starting index for `SI`.
-   **offsetSS**: starting index for `SS`.
-   **offsetWork**: starting index for `WORK`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The active range is `[ilo, ihi]` using 0-based indices. The pencil `(A, B)` must be in upper Hessenberg / upper triangular form on this range.
-   `nshifts` is rounded down to an even number internally; if the shifts are not yet paired into complex-conjugate pairs, the routine performs a one-pass shuffle to move unpaired real shifts to the end of the active region before sweeping.
-   `QC` and `ZC` are workspace square matrices used to accumulate the local Givens rotations before applying them to the trailing pencil via `dgemm`. They are sized `nblockDesired`-by-`nblockDesired`.
-   `WORK` must hold at least `N * nblockDesired` doubles. Each `dgemm` writes its product into the leading `SHEIGHT * SWIDTH` columns of `WORK`, which is then copied back into the destination block via `dlacpy`.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaqz4 = require( '@stdlib/lapack/base/dlaqz4' );

var N = 6;
var LDA = N;
var i;
var j;
var A = new Float64Array( N * N );
var B = new Float64Array( N * N );
for ( j = 1; j <= N; j++ ) {
    for ( i = 1; i <= N; i++ ) {
        if ( i <= j + 1 ) {
            A[ (i - 1) + ((j - 1) * LDA) ] = 1.0 + ( 0.1 * ( i + ( 2 * j ) ) ) + ( 0.03 * i * j );
        }
        if ( i <= j ) {
            B[ (i - 1) + ((j - 1) * LDA) ] = 2.0 + ( 0.2 * ( j - i ) ) + ( 0.05 * j );
        }
    }
}

function eye( n, ld ) {
    var M = new Float64Array( ld * ld );
    var k;
    for ( k = 0; k < n; k++ ) {
        M[ k + ( k * ld ) ] = 1.0;
    }
    return M;
}
var Q = eye( N, N );
var Z = eye( N, N );
var QC = eye( N, N );
var ZC = eye( N, N );
var WORK = new Float64Array( N * 4 );

var SR = new Float64Array( [ 1.5, 1.5 ] );
var SI = new Float64Array( [ 0.3, -0.3 ] );
var SS = new Float64Array( [ 1.0, 1.0 ] );

var info = dlaqz4( 'column-major', true, true, true, N, 0, N - 1, 2, 4, SR, 1, SI, 1, SS, 1, A, LDA, B, LDA, Q, LDA, Z, LDA, QC, LDA, ZC, LDA, WORK, 1 );
console.log( info ); // 0
```

</section>

<!-- /.examples -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

</section>

<!-- /.links -->
