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

# dlanst

> Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric tridiagonal matrix.

<section class="usage">

## Usage

```javascript
var dlanst = require( '@stdlib/lapack/base/dlanst' );
```

#### dlanst( norm, N, d, strideD, e, strideE )

Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric tridiagonal matrix.

```javascript
var dlanst = require( '@stdlib/lapack/base/dlanst' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dlanst.ndarray( '1', N, d, 1, 0, e, 1, 0 );
```

The function has the following parameters:

-   **norm**: `norm`.
-   **N**: number of columns.
-   **d**: `d`.
-   **strideD**: stride length for `D`.
-   **e**: `e`.
-   **strideE**: stride length for `E`.

#### dlanst.ndarray( norm, N, d, strideD, offsetD, e, strideE, offsetE )

Returns the value of the 1-norm, or the Frobenius norm, or the infinity norm, or the element of largest absolute value of a real symmetric tridiagonal matrix, using alternative indexing semantics.

```javascript
var dlanst = require( '@stdlib/lapack/base/dlanst' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dlanst.ndarray( '1', N, d, 1, 0, e, 1, 0 );
```

The function has the following additional parameters:

-   **offsetD**: starting index for `D`.
-   **offsetE**: starting index for `E`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlanst()` corresponds to the [LAPACK][lapack] level routine [`dlanst`][lapack-dlanst].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlanst = require( '@stdlib/lapack/base/dlanst' );

var N = 3;
var d = discreteUniform( N, -10, 10, opts );
var e = discreteUniform( N, -10, 10, opts );

dlanst.ndarray( '1', N, d, 1, 0, e, 1, 0 );
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

[lapack-dlanst]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlanst.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->