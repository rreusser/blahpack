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

# zla_lin_berr

> Computes a component-wise relative backward error

<section class="usage">

## Usage

```javascript
var zla_lin_berr = require( '@stdlib/lapack/base/zla_lin_berr' );
```

#### zla_lin_berr( N, nz, nrhs, res, LDRES, ayb, LDAYB, berr )

Computes a component-wise relative backward error

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var res = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var ayb = new Float64Array( [ 1.0, 2.0 ] );
var berr = new Float64Array( 1 );

zlaLinBerr( 2, 2, 1, res, 1, ayb, 1, berr, 1 );
// berr[ 0 ] => 3.5
```

The function has the following parameters:

-   **N**: number of rows of `res` and `ayb`.
-   **nz**: sparsity guard parameter; `(nz+1)*safmin` is added to the numerator.
-   **nrhs**: number of right-hand sides.
-   **res**: complex residual matrix (`Complex128Array`), dimension `(N, nrhs)`.
-   **LDRES**: leading dimension of `res` (layout API); ndarray form takes strideRES1, strideRES2.
-   **ayb**: denominator matrix (`Float64Array`), dimension `(N, nrhs)`.
-   **LDAYB**: leading dimension of `ayb` (layout API); ndarray form takes strideAYB1, strideAYB2.
-   **berr**: output array (`Float64Array`), length `nrhs`.
-   **strideBERR**: stride length for `berr`.

#### zlaLinBerr.ndarray( N, nz, nrhs, res, strideRES1, strideRES2, offsetRES, ayb, strideAYB1, strideAYB2, offsetAYB, berr, strideBERR, offsetBERR )

Computes a component-wise relative backward error, using alternative indexing semantics.

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );

var res = new Complex128Array( [ 1.0, 2.0, 3.0, 4.0 ] );
var ayb = new Float64Array( [ 1.0, 2.0 ] );
var berr = new Float64Array( 1 );

zlaLinBerr.ndarray( 2, 2, 1, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
// berr[ 0 ] => 3.5
```

The function has the following additional parameters:

-   **offsetRES**: starting complex index for `res`.
-   **offsetAYB**: starting index for `ayb`.
-   **offsetBERR**: starting index for `berr`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   Computes `max(i) ( |R(i)| / ( |op(A_s)|*|Y| + |B_s| )(i) )` for each right-hand side.
-   Uses `CABS1(z) = |Re(z)| + |Im(z)|`, the LAPACK fast 1-norm modulus for error bounds (not the true complex modulus).
-   A guard term `(nz+1)*safmin` is added to the numerator to avoid spuriously zero residuals; entries where `ayb(i,j) == 0` are skipped.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Complex128Array = require( '@stdlib/array/complex128' );
var Float64Array = require( '@stdlib/array/float64' );
var zlaLinBerr = require( '@stdlib/lapack/base/zla_lin_berr' );

var res = new Complex128Array([
    1.0e-10, 2.0e-10, -3.0e-10, 4.0e-10, 5.0e-10, -6.0e-10,
    7.0e-10, -8.0e-10, 9.0e-10, 1.0e-10, -2.0e-10, 3.0e-10
]);
var ayb = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var berr = new Float64Array( 2 );

zlaLinBerr.ndarray( 3, 3, 2, res, 1, 0, ayb, 1, 0, berr, 1, 0 );
console.log( berr );
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
[mdn-float32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
[mdn-int32array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Int32Array
[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->
