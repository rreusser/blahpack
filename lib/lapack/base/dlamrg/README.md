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

# dlamrg

> Merges two sorted integer sublists into a single sorted list.

<section class="usage">

## Usage

```javascript
var dlamrg = require( '@stdlib/lapack/base/dlamrg' );
```

#### dlamrg( n1, n2, a, strideA, dtrd1, dtrd2, INDEX, strideINDEX )

Merges two sorted integer sublists into a single sorted list.

```javascript
var dlamrg = require( '@stdlib/lapack/base/dlamrg' );

var a = discreteUniform( N, -10, 10, opts );
var INDEX = discreteUniform( N, -10, 10, opts );

dlamrg.ndarray( 1, 1, a, 1, 0, 1, 1, INDEX, 1, 0 );
```

The function has the following parameters:

-   **n1**: `n1`.
-   **n2**: `n2`.
-   **a**: `a`.
-   **strideA**: stride length for `A`.
-   **dtrd1**: `dtrd1`.
-   **dtrd2**: `dtrd2`.
-   **INDEX**: input array `INDEX`.
-   **strideINDEX**: stride length for `INDEX`.

#### dlamrg.ndarray( n1, n2, a, strideA, offsetA, dtrd1, dtrd2, INDEX, strideINDEX, offsetINDEX )

Merges two sorted integer sublists into a single sorted list, using alternative indexing semantics.

```javascript
var dlamrg = require( '@stdlib/lapack/base/dlamrg' );

var a = discreteUniform( N, -10, 10, opts );
var INDEX = discreteUniform( N, -10, 10, opts );

dlamrg.ndarray( 1, 1, a, 1, 0, 1, 1, INDEX, 1, 0 );
```

The function has the following additional parameters:

-   **offsetA**: starting index for `A`.
-   **offsetINDEX**: starting index for `INDEX`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlamrg()` corresponds to the [LAPACK][lapack] level routine [`dlamrg`][lapack-dlamrg].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlamrg = require( '@stdlib/lapack/base/dlamrg' );

var a = discreteUniform( N, -10, 10, opts );
var INDEX = discreteUniform( N, -10, 10, opts );

dlamrg.ndarray( 1, 1, a, 1, 0, 1, 1, INDEX, 1, 0 );
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

[lapack-dlamrg]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlamrg.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->