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

# dlar2v

> Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.

<section class="usage">

## Usage

```javascript
var dlar2v = require( '@stdlib/lapack/base/dlar2v' );
```

#### dlar2v( N, x, strideX, y, strideY, z, strideZ, c, strideC, s, strideS )

Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices.

```javascript
var dlar2v = require( '@stdlib/lapack/base/dlar2v' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dlar2v.ndarray( N, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );
```

The function has the following parameters:

-   **N**: number of columns.
-   **x**: `x`.
-   **strideX**: stride length for `X`.
-   **y**: `y`.
-   **strideY**: stride length for `Y`.
-   **z**: `z`.
-   **strideZ**: stride length for `Z`.
-   **c**: `c`.
-   **strideC**: stride length for `C`.
-   **s**: `s`.
-   **strideS**: stride length for `S`.

#### dlar2v.ndarray( N, x, strideX, offsetX, y, strideY, offsetY, z, strideZ, offsetZ, c, strideC, offsetC, s, strideS, offsetS )

Applies a vector of real plane rotations from both sides to a sequence of 2-by-2 symmetric matrices, using alternative indexing semantics.

```javascript
var dlar2v = require( '@stdlib/lapack/base/dlar2v' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dlar2v.ndarray( N, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );
```

The function has the following additional parameters:

-   **strideX**: stride length for `X`.
-   **offsetX**: starting index for `X`.
-   **strideY**: stride length for `Y`.
-   **offsetY**: starting index for `Y`.
-   **strideZ**: stride length for `Z`.
-   **offsetZ**: starting index for `Z`.
-   **strideC**: stride length for `C`.
-   **offsetC**: starting index for `C`.
-   **strideS**: stride length for `S`.
-   **offsetS**: starting index for `S`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlar2v()` corresponds to the [LAPACK][lapack] level routine [`dlar2v`][lapack-dlar2v].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlar2v = require( '@stdlib/lapack/base/dlar2v' );

var N = 3;
var x = discreteUniform( N, -10, 10, opts );
var y = discreteUniform( N, -10, 10, opts );
var z = discreteUniform( N, -10, 10, opts );
var c = discreteUniform( N, -10, 10, opts );
var s = discreteUniform( N, -10, 10, opts );

dlar2v.ndarray( N, x, 1, 0, y, 1, 0, z, 1, 0, c, 1, 0, s, 1, 0 );
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

[lapack-dlar2v]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlar2v.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->