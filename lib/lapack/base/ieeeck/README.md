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

# ieeeck

> Checks whether infinity and NaN arithmetic is safe.

<section class="usage">

## Usage

```javascript
import ieeeck from '@rreusser/blahpack/lapack/base/ieeeck';
```

#### ieeeck( ispec, zero, one )

Checks whether infinity and NaN arithmetic is safe.

```javascript
var v = ieeeck( 1, 0.0, 1.0 );
// returns 1
```

The function has the following parameters:

-   **ispec**: `0` checks infinity arithmetic only; any other value also checks NaN arithmetic.
-   **zero**: the value `0.0` (rounded to single precision, as the reference's `REAL` argument).
-   **one**: the value `1.0` (rounded to single precision).

The function returns the `1` if the arithmetic is safe, `0` otherwise.

#### ieeeck.ndarray( ispec, zero, one )

Checks whether infinity and NaN arithmetic is safe, using alternative indexing semantics. The routine takes no arrays, so the parameters are the same as above.

```javascript
var v = ieeeck.ndarray( 1, 0.0, 1.0 );
// returns 1
```

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ieeeck()` corresponds to the [LAPACK][lapack] routine `IEEECK`. [`ilaenv`][@rreusser/blahpack/lapack/base/ilaenv] calls it for `ispec` `10` and `11`.
-   JavaScript numbers are IEEE 754 doubles, so `ieeeck( ispec, 0.0, 1.0 )` returns `1`. The checks are translated all the same; other `zero`/`one` arguments reproduce the reference's results.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
import ieeeck from '@rreusser/blahpack/lapack/base/ieeeck';

console.log( ieeeck( 1, 0.0, 1.0 ) );
// => 1
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

[@rreusser/blahpack/lapack/base/ilaenv]: ../ilaenv

</section>

<!-- /.links -->
