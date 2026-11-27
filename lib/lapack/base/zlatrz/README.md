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

# zlatrz

> Reduces a complex `M`-by-`N` (`M <= N`) upper trapezoidal matrix to upper triangular form by means of unitary transformations.

<section class="usage">

## Usage

```javascript
var zlatrz = require( '@stdlib/lapack/base/zlatrz' );
```

#### zlatrz( order, M, N, l, A, LDA, TAU, strideTAU, work, strideWork )

Factors the `M`-by-(`M+l`) complex upper trapezoidal matrix `[ A1 A2 ] = [ A(0:M-1,0:M-1) A(0:M-1,N-l:N-1) ]` as `( R  0 ) * Z`, where `Z` is an `(M+l)`-by-`(M+l)` unitary matrix and `R` is an `M`-by-`M` upper triangular matrix.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

// 3-by-5 column-major upper trapezoidal matrix A (l = N - M = 2):
var A = new Complex128Array([
	4.0,  0.5, 0.0, 0.0, 0.0, 0.0,
	1.0, -0.2, 5.0, 0.3, 0.0, 0.0,
	2.0,  0.3, 1.0, 0.1, 6.0, 0.4,
	3.0,  0.1, 2.0, 0.2, 1.0, -0.2,
	1.0, -0.4, 4.0, -0.5, 2.0, 0.6
]);
var TAU = new Complex128Array( 3 );
var work = new Complex128Array( 3 );

zlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, work, 1 );
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **M**: number of rows of `A` (must satisfy `M <= N`).
-   **N**: number of columns of `A`.
-   **l**: number of trailing columns containing the meaningful part of the Householder vectors (`N - M >= l >= 0`).
-   **A**: input/output [`Complex128Array`][@stdlib/array/complex128] matrix.
-   **LDA**: leading dimension of `A`.
-   **TAU**: output [`Complex128Array`][@stdlib/array/complex128] of length at least `M` containing the scalar factors of the elementary reflectors.
-   **strideTAU**: stride length for `TAU` (in complex elements).
-   **work**: [`Complex128Array`][@stdlib/array/complex128] workspace of length at least `M`.
-   **strideWork**: stride length for `work` (in complex elements).

On exit, the leading `M`-by-`M` upper triangular part of `A` contains the upper triangular matrix `R`, and the trailing entries (columns `N-l` to `N-1` of the first `M` rows) together with `TAU` represent the unitary matrix `Z` as a product of `M` elementary reflectors.

#### zlatrz.ndarray( M, N, l, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, work, strideWork, offsetWork )

Reduces a complex upper trapezoidal matrix to upper triangular form using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );

var A = new Complex128Array([
	4.0,  0.5, 0.0, 0.0, 0.0, 0.0,
	1.0, -0.2, 5.0, 0.3, 0.0, 0.0,
	2.0,  0.3, 1.0, 0.1, 6.0, 0.4,
	3.0,  0.1, 2.0, 0.2, 1.0, -0.2,
	1.0, -0.4, 4.0, -0.5, 2.0, 0.6
]);
var TAU = new Complex128Array( 3 );
var work = new Complex128Array( 3 );

zlatrz.ndarray( 3, 5, 2, A, 1, 3, 0, TAU, 1, 0, work, 1, 0 );
```

The function has the following additional parameters:

-   **strideA1**: stride of the first dimension of `A` (in complex elements).
-   **strideA2**: stride of the second dimension of `A` (in complex elements).
-   **offsetA**: starting index for `A` (in complex elements).
-   **offsetTAU**: starting index for `TAU` (in complex elements).
-   **offsetWork**: starting index for `work` (in complex elements).

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `zlatrz` is the `RZ` factorization of a trapezoidal matrix and is used by [`ztzrzf`][@stdlib/lapack/base/ztzrzf] to reduce an upper trapezoidal matrix to upper triangular form. The reflectors `H(i)` are constructed so that the first component of each reflector vector is implicitly unity and only the last `l` components are stored explicitly (in row `i` of `A`, columns `N-l` to `N-1`).
-   When `M = 0`, the routine returns immediately without modifying `A` or `TAU`. When `M = N`, the input is already upper triangular; `TAU` is zeroed and `A` is left unchanged.
-   The workspace `work` is required only when `l > 0` and `M > 1`; otherwise, its contents are not read.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var zlatrz = require( '@stdlib/lapack/base/zlatrz' );

// 3-by-5 column-major upper trapezoidal matrix A (l = 2):
var A = new Complex128Array([
	4.0,  0.5, 0.0, 0.0, 0.0, 0.0,
	1.0, -0.2, 5.0, 0.3, 0.0, 0.0,
	2.0,  0.3, 1.0, 0.1, 6.0, 0.4,
	3.0,  0.1, 2.0, 0.2, 1.0, -0.2,
	1.0, -0.4, 4.0, -0.5, 2.0, 0.6
]);
var TAU = new Complex128Array( 3 );
var work = new Complex128Array( 3 );

zlatrz( 'column-major', 3, 5, 2, A, 3, TAU, 1, work, 1 );
console.log( A );
console.log( TAU );
```

</section>

<!-- /.examples -->

<!-- fortran-docs:start (generated by bin/fortran-docs.mjs from data/lapack-3.12.0/SRC/zlatrz.f; do not edit) -->

<section class="fortran-docs">

## Reference notes

The mathematical description from the reference LAPACK 3.12.0 source of `ZLATRZ`. Indices are the 1-based Fortran indices of the source.

### Purpose

ZLATRZ factors the M-by-(M+L) complex upper trapezoidal matrix \[ A1 A2 \] = \[ `A(1:M,1:M)` `A(1:M,N-L+1:N)` \] as $( R 0 ) \, Z$ by means of unitary transformations, where Z is an (M+L)-by-(M+L) unitary matrix and, R and A1 are M-by-M upper triangular matrices.

### Further Details

The factorization is obtained by Householder's method. The kth transformation matrix, Z( k ), which is used to introduce zeros into the ( m - k + 1 )th row of A, is given in the form

$$
Z( k ) = \begin{pmatrix} I &  & 0 &  \\ 0 & T( & k & ) \end{pmatrix}
$$

where

```text
T( k ) = I - tau*u( k )*u( k )**H,   u( k ) = (   1    ),
                                            (   0    )
                                            ( z( k ) )
```

$\tau$ is a scalar and z( k ) is an l element vector. $\tau$ and z( k ) are chosen to annihilate the elements of the kth row of A2.

The scalar $\tau$ is returned in the kth element of `TAU` and the vector u( k ) in the kth row of A2, such that the elements of z( k ) are in a( k, l + 1 ), ..., a( k, n ). The elements of R are returned in the upper triangular part of A1.

Z is given by

$$
Z = Z( 1 ) \, Z( 2 ) \, \cdots \, Z( m )
$$

</section>

<!-- fortran-docs:end -->

<!-- Section for related `stdlib` packages. Do not manually edit this section, as it is automatically populated. -->

<section class="related">

</section>

<!-- /.related -->

<!-- Section for all links. Make sure to keep an empty line after the `section` element and another before the `/section` close. -->

<section class="links">

[@stdlib/array/complex128]: https://github.com/stdlib-js/array-complex128

[@stdlib/lapack/base/ztzrzf]: https://github.com/stdlib-js/lapack-base-ztzrzf

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
