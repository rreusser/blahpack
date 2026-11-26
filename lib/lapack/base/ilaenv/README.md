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

# ilaenv

> Returns problem-dependent parameters for the local environment.

<section class="usage">

## Usage

```javascript
import ilaenv from '@rreusser/blahpack/lapack/base/ilaenv';
```

#### ilaenv( ispec, name, opts, n1, n2, n3, n4 )

Returns problem-dependent parameters for the local environment.

```javascript
var v = ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
// returns 32
```

The function has the following parameters:

-   **ispec**: parameter to return: `1` (optimal block size), `2` (minimum block size), `3` (crossover point), `4` (number of shifts), `5` (minimum column dimension), `6` (SVD crossover point), `7` (number of processors), `8` (multishift QR crossover point), `9` (divide-and-conquer leaf size), `10`/`11` (NaN/infinity arithmetic is safe), `12`-`17` (multishift QR parameters, from `iparmq`); any other value returns `-1`.
-   **name**: name of the calling routine (e.g. `'DGEQRF'`), in any case: as in the reference, its first six characters are upper-cased when the first is a lower-case letter.
-   **opts**: character options of the calling routine, concatenated (not read).
-   **n1**: first problem dimension.
-   **n2**: second problem dimension.
-   **n3**: third problem dimension.
-   **n4**: fourth problem dimension.

The function returns the parameter value.

#### ilaenv.ndarray( ispec, name, opts, n1, n2, n3, n4 )

Returns problem-dependent parameters for the local environment, using alternative indexing semantics. The routine takes no arrays, so the parameters are the same as above.

```javascript
var v = ilaenv.ndarray( 1, 'DGEQRF', ' ', 100, 100, -1, -1 );
// returns 32
```

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   `ilaenv()` corresponds to the [LAPACK][lapack] routine `ILAENV`, with the reference's tuning values: callers query it with the reference's arguments, so their block sizes and crossover points match the reference by construction.
-   `name` is decoded by character, as in the reference: character 1 is the precision (`S`, `D`, `C` or `Z`; for `ispec` `1`-`3`, any other returns `1`), characters 2-3 the matrix type and 4-6 the operation. Names are blank-padded to 16 characters (longer names are truncated), and character 11 being `2` selects the two-stage block sizes.
-   The dimensions mean what the calling routine passes: `-1` for an unused one, as in the reference.

</section>

<!-- /.notes -->

<section class="examples">

## Examples

<!-- eslint no-undef: "error" -->

```javascript
import ilaenv from '@rreusser/blahpack/lapack/base/ilaenv';

console.log( ilaenv( 1, 'DGEQRF', ' ', 100, 100, -1, -1 ) );
// => 32
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
