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

# dsconv

> Count the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration.

<section class="usage">

## Usage

```javascript
import dsconv from '@stdlib/arpack/base/dsconv/lib/index.js';
```

#### dsconv( N, ritz, strideRITZ, bounds, strideBOUNDS, tol )

Counts the number of "converged" Ritz values, returning the count.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var ritz = new Float64Array( [ 1.0, 2.0, 0.5 ] );
var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16 ] );

var nconv = dsconv( 3, ritz, 1, bounds, 1, 1.0e-6 );
// returns 2
```

The `i`th Ritz value is considered "converged" when `bounds[i] <= tol*max( eps23, abs( ritz[i] ) )`, where `eps23 = eps**(2/3)` and `eps` is the machine epsilon.

The function has the following parameters:

-   **N**: number of Ritz values to check for convergence.
-   **ritz**: `Float64Array` of Ritz values to be checked for convergence.
-   **strideRITZ**: stride length for `ritz`.
-   **bounds**: `Float64Array` of Ritz estimates associated with the Ritz values in `ritz`.
-   **strideBOUNDS**: stride length for `bounds`.
-   **tol**: desired relative accuracy for a Ritz value to be considered "converged".

#### dsconv.ndarray( N, ritz, strideRITZ, offsetRITZ, bounds, strideBOUNDS, offsetBOUNDS, tol )

Counts the number of "converged" Ritz values, using alternative indexing semantics.

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';

var ritz = new Float64Array( [ 1.0, 2.0, 0.5 ] );
var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16 ] );

var nconv = dsconv.ndarray( 3, ritz, 1, 0, bounds, 1, 0, 1.0e-6 );
// returns 2
```

The function has the following additional parameters:

-   **offsetRITZ**: starting index for `ritz`.
-   **offsetBOUNDS**: starting index for `bounds`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dsconv` corresponds to the LAPACK-style ARPACK routine `dsconv`, translated from the reference Fortran (arpack-ng 3.9.1). The reference passes `nconv` as an output argument; this translation returns it instead.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsconv from '@stdlib/arpack/base/dsconv/lib/index.js';

var ritz = new Float64Array( [ 1.0, 2.0, 0.5, 3.0, 0.1 ] );
var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16, 2.0e-3, 1.0e-12 ] );

var nconv = dsconv( 5, ritz, 1, bounds, 1, 1.0e-6 );
console.log( nconv );
// => 3
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
