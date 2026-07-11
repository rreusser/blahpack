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

# dlartg

> Generates a plane rotation with real cosine and real sine.

<section class="usage">

## Usage

```javascript
var dlartg = require( '@stdlib/lapack/base/dlartg' );
```

#### dlartg( f, g )

Generates a plane rotation with real cosine and real sine.

```javascript
var dlartg = require( '@stdlib/lapack/base/dlartg' );

dlartg.ndarray( 1, 1, 1 );
```

The function has the following parameters:

-   **f**: `f`.
-   **g**: `g`.

#### dlartg.ndarray( f, g, out )

Generates a plane rotation with real cosine and real sine, using alternative indexing semantics.

```javascript
var dlartg = require( '@stdlib/lapack/base/dlartg' );

dlartg.ndarray( 1, 1, 1 );
```

The function has the following additional parameters:

-   **out**: `out`.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `dlartg()` corresponds to the [LAPACK][lapack] level routine [`dlartg`][lapack-dlartg].

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
var dlartg = require( '@stdlib/lapack/base/dlartg' );

dlartg.ndarray( 1, 1, 1 );
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

[lapack-dlartg]: https://www.netlib.org/lapack/explore-html/d5/d2f/group__dlartg.html

[mdn-float64array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

[mdn-typed-array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray

</section>

<!-- /.links -->