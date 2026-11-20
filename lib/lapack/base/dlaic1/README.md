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

# dlaic1

> Apply one step of incremental condition estimation.

<section class="usage">

## Usage

```javascript
var dlaic1 = require( '@stdlib/lapack/base/dlaic1' );
```

#### dlaic1( job, J, x, strideX, sest, w, strideW, gamma, sestpr, s, c )

Applies one step of incremental condition estimation. Given a `J`-by-`J` lower triangular matrix `L` with estimated singular value `sest` and approximate singular vector `x`, computes `sestpr`, `s`, and `c` to extend the estimate by one row/column.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var out = new Float64Array( 3 );

dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, out );
// out => <Float64Array>[ ~5.529, ~-0.987, ~-0.163 ]
```

The function has the following parameters:

-   **job**: specifies whether to estimate the largest (`'largest-singular-value'`) or smallest (`'smallest-singular-value'`) singular value.
-   **J**: length of `x` and `w`.
-   **x**: input vector of length `J`.
-   **strideX**: stride length for `x`.
-   **sest**: estimated singular value of the `J`-by-`J` matrix.
-   **w**: input vector of length `J`.
-   **strideW**: stride length for `w`.
-   **gamma**: diagonal element.
-   **out**: output [`Float64Array`][mdn-float64array]; on exit, `out[0]` is `sestpr`, `out[1]` is `s`, `out[2]` is `c`.

#### dlaic1.ndarray( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, sestpr, s, c )

Applies one step of incremental condition estimation, using alternative indexing semantics.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var x = new Float64Array( [ 0.0, 0.6, 0.8, 0.0 ] );
var w = new Float64Array( [ 0.0, 1.0, 2.0, 3.0 ] );
var out = new Float64Array( 3 );

dlaic1.ndarray( 'largest-singular-value', 3, x, 1, 1, 5.0, w, 1, 1, 2.0, out );
// out => <Float64Array>[ ~5.529, ~-0.987, ~-0.163 ]
```

The function has the following additional parameters:

-   **offsetX**: starting index for `x`.
-   **offsetW**: starting index for `w`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   The routine computes `sestpr`, `s`, and `c` such that the vector `xhat = [ s*x; c ]` is an approximate singular vector of the extended matrix `Lhat = [ L, 0; w^T, gamma ]`.
-   When `job` is `'largest-singular-value'`, an estimate for the largest singular value is computed. When `job` is `'smallest-singular-value'`, an estimate for the smallest singular value is computed.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlaic1 = require( '@stdlib/lapack/base/dlaic1' );

var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
var out = new Float64Array( 3 );

dlaic1( 'largest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, out );
console.log( 'sestpr =', out[ 0 ], ', s =', out[ 1 ], ', c =', out[ 2 ] );

dlaic1( 'smallest-singular-value', 3, x, 1, 5.0, w, 1, 2.0, out );
console.log( 'sestpr =', out[ 0 ], ', s =', out[ 1 ], ', c =', out[ 2 ] );
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
