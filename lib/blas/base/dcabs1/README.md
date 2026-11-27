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

# dcabs1

> Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.

<section class="usage">

## Usage

```javascript
var dcabs1 = require( '@stdlib/blas/base/dcabs1' );
```

#### dcabs1( z )

Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number.

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var dcabs1 = require( '@stdlib/blas/base/dcabs1' );

var z = new Complex128( 3.0, 4.0 );

dcabs1.ndarray( z );
```

The function has the following parameters:

-   **z**: `z`.

#### dcabs1.ndarray( z )

Computes the sum of the absolute values of the real and imaginary parts of a double-precision complex number, using alternative indexing semantics.

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var dcabs1 = require( '@stdlib/blas/base/dcabs1' );

var z = new Complex128( 3.0, 4.0 );

dcabs1.ndarray( z );
```

The function has the following additional parameters:


</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dcabs1()` corresponds to the [LAPACK][lapack] level routine [`dcabs1`][lapack-dcabs1].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var Complex128 = require( '@stdlib/complex/float64/ctor' );
var dcabs1 = require( '@stdlib/blas/base/dcabs1' );

var z = new Complex128( 3.0, 4.0 );

dcabs1.ndarray( z );
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

[lapack-dcabs1]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dcabs1.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->