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

# dlatrs3

> Solve a triangular system of equations with multiple right-hand sides and scale factors set to prevent overflow.

<section class="intro">

`dlatrs3` solves one of the triangular systems

```text
A * X = B * diag(scale)  or  A**T * X = B * diag(scale)
```

where `A` is an `N`-by-`N` upper or lower triangular matrix, `X` and `B` are
`N`-by-`NRHS` matrices, and `scale` is an `NRHS`-element vector of scaling
factors. Each `scale(k)` is chosen so that the column `X(:, k)` does not
overflow. This is a BLAS-3 (multi-right-hand-side, blocked) version of
[`dlatrs`][@stdlib/lapack/base/dlatrs] that uses level-3 BLAS updates with
`dgemm` to exploit cache locality.

</section>

<!-- /.intro -->

<section class="usage">

## Usage

```javascript
var dlatrs3 = require( '@stdlib/lapack/base/dlatrs3' );
```

#### dlatrs3( order, uplo, trans, diag, normin, N, nrhs, A, LDA, X, LDX, SCALE, strideSCALE, CNORM, strideCNORM, work, strideWork )

Solves a triangular system of equations with scaling to prevent overflow.

```javascript
var Float64Array = require( '@stdlib/array/float64' );

// Column-major upper triangular A (3x3):
//   A = [[2, 1, 1],
//        [0, 3, 2],
//        [0, 0, 4]]
var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );

// Two right-hand sides:
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var scale = new Float64Array( 2 );
var cnorm = new Float64Array( 3 );

// Workspace: nba*max(nba, min(nrhs, 32)) + nba*nba + 40 (here nba=1, nrhs=2).
var work = new Float64Array( 2 + 1 + 40 );

dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 3, X, 3, scale, 1, cnorm, 1, work, 1 );
// X now contains the solution; scale[k] is the scale factor for column k.
```

The function has the following parameters:

-   **order**: storage layout (`'row-major'` or `'column-major'`).
-   **uplo**: matrix triangle (`'upper'` or `'lower'`).
-   **trans**: transpose operation (`'no-transpose'` or `'transpose'`).
-   **diag**: diagonal type (`'unit'` or `'non-unit'`).
-   **normin**: whether `CNORM` already contains column norms on input (`'yes'`) or should be computed (`'no'`).
-   **N**: order of `A`.
-   **nrhs**: number of right-hand sides.
-   **A**: input N-by-N triangular matrix.
-   **LDA**: leading dimension of `A`.
-   **X**: in/out N-by-NRHS right-hand side matrix; overwritten with the solution.
-   **LDX**: leading dimension of `X`.
-   **SCALE**: out: per-column scale factors (length `NRHS`).
-   **strideSCALE**: stride length for `SCALE`.
-   **CNORM**: in/out column-norm workspace (length `N`).
-   **strideCNORM**: stride length for `CNORM`.
-   **work**: workspace `Float64Array` of length >= `nba*max(nba, min(nrhs, 32)) + nba*nba + 40` where `nba = ceil(N/NB)` and `NB = min( 64, max( 8, ILAENV( 1, 'DLATRS', ... ) ) )` (32).
-   **strideWork**: stride length for `work` (must be `1`).

#### dlatrs3.ndarray( uplo, trans, diag, normin, N, nrhs, A, strideA1, strideA2, offsetA, X, strideX1, strideX2, offsetX, SCALE, strideSCALE, offsetSCALE, CNORM, strideCNORM, offsetCNORM, work, strideWork, offsetWork )

Same routine, with explicit strides and offsets (ndarray indexing semantics).

```javascript
var Float64Array = require( '@stdlib/array/float64' );

var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
var scale = new Float64Array( 2 );
var cnorm = new Float64Array( 3 );

var work = new Float64Array( 2 + 1 + 40 );

// Column-major: strideA1=1, strideA2=N=3
dlatrs3.ndarray( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, work, 1, 0 );
```

The function takes per-array stride and offset parameters in place of the
layout/`LD*` parameters. Strides may be negative.

</section>

<!-- /.usage -->

<section class="notes">

## Notes

-   For `NRHS < 2`, `dlatrs3` falls back to per-RHS calls of [`dlatrs`][@stdlib/lapack/base/dlatrs].
-   If `A` has off-diagonal entries large enough that the worst-case linear-update bound would overflow, `dlatrs3` also falls back to per-RHS calls of [`dlatrs`][@stdlib/lapack/base/dlatrs] with `normin='no'` to recompute the safe scaling.
-   If `A` is singular (a diagonal `A(j,j) = 0`), the corresponding output column is set so that `A * X(:,k) = 0` (a non-trivial null vector) and `SCALE(k) = 0`.
-   If the system is so badly scaled that the solution cannot be represented as `(1/SCALE) * X`, then `X(:,k) = 0` and `SCALE(k) = 0` — this deviates from `dlatrs`, which returns a non-zero meaningless vector in the same situation.
-   The internal block size matches the Fortran reference (`NB = 8`, `NBRHS = 32`).

</section>

<!-- /.notes -->

<section class="examples">

## Examples

```javascript
var Float64Array = require( '@stdlib/array/float64' );
var dlatrs3 = require( '@stdlib/lapack/base/dlatrs3' );

// Upper triangular A (column-major) and three right-hand sides:
var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0 ] );
var scale = new Float64Array( 3 );
var cnorm = new Float64Array( 3 );
var work = new Float64Array( 3 + 1 + 40 );

var info = dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, 3, A, 3, X, 3, scale, 1, cnorm, 1, work, 1 );

console.log( 'info:', info );
console.log( 'X:', X );
console.log( 'scale:', scale );
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

[@stdlib/lapack/base/dlatrs]: https://github.com/stdlib-js/stdlib

</section>

<!-- /.links -->
