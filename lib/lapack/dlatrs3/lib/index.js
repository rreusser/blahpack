/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/**
* Solve a triangular system of equations with multiple right-hand sides and scale factors set to prevent overflow.
*
* `dlatrs3` solves one of the triangular systems
*
* ```text
* A * X = B * diag(scale)  or  A**T * X = B * diag(scale)
* ```
*
* where `A` is an `N`-by-`N` upper or lower triangular matrix, `X` and `B` are
* `N`-by-`NRHS` matrices, and `scale` is an `NRHS`-element vector of scaling
* factors. Each `scale(k)` is chosen so that the column `X(:, k)` does not
* overflow. This is a BLAS-3 (multi-right-hand-side, blocked) version of
* `dlatrs` that uses level-3 BLAS updates with
* `dgemm` to exploit cache locality.
*
* ## Notes
*
* -   For `NRHS < 2`, `dlatrs3` falls back to per-RHS calls of `dlatrs`.
* -   If `A` has off-diagonal entries large enough that the worst-case linear-update bound would overflow, `dlatrs3` also falls back to per-RHS calls of `dlatrs` with `normin='no'` to recompute the safe scaling.
* -   If `A` is singular (a diagonal `A(j,j) = 0`), the corresponding output column is set so that `A * X(:,k) = 0` (a non-trivial null vector) and `SCALE(k) = 0`.
* -   If the system is so badly scaled that the solution cannot be represented as `(1/SCALE) * X`, then `X(:,k) = 0` and `SCALE(k) = 0` — this deviates from `dlatrs`, which returns a non-zero meaningless vector in the same situation.
* -   The internal block size matches the Fortran reference (`NB = 8`, `NBRHS = 32`).
*
* @module @rreusser/blahpack/lapack/dlatrs3
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatrs3 from '@rreusser/blahpack/lapack/dlatrs3';
*
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
* var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var scale = new Float64Array( 2 );
* var cnorm = new Float64Array( 3 );
* var work = new Float64Array( 2 + 1 + 40 );
*
* dlatrs3( 'column-major', 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 3, X, 3, scale, 1, cnorm, 1, work, 1 );
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dlatrs3 from '@rreusser/blahpack/lapack/dlatrs3';
*
* var A = new Float64Array( [ 2.0, 0.0, 0.0, 1.0, 3.0, 0.0, 1.0, 2.0, 4.0 ] );
* var X = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0 ] );
* var scale = new Float64Array( 2 );
* var cnorm = new Float64Array( 3 );
* var work = new Float64Array( 2 + 1 + 40 );
*
* dlatrs3.strided( 'upper', 'no-transpose', 'non-unit', 'no', 3, 2, A, 1, 3, 0, X, 1, 3, 0, scale, 1, 0, cnorm, 1, 0, work, 1, 0 );
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlatrs3 from './dlatrs3.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dlatrs3, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dlatrs3 & { strided: typeof strided }} */ ( dlatrs3 );
export { strided };
