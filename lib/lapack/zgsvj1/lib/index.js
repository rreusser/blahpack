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
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* ## Notes
*
* -   `zgsvj1` is the off-diagonal-block companion to `zgsvj0`. It is invoked from `zgesvj` after `zgsvj0` has done the diagonal-block sweeps, to suppress the (1,2) off-diagonal coupling between the first `n1` columns and the remaining `N - n1` columns. There is no de Rijk pivoting, no `lkahead`, and no convergence test inside the q-loop — the routine just performs `nsweep` block-row-cyclic complex Jacobi sweeps over the off-diagonal tile grid.
* -   The complex `D` array accumulates a sequence of unit-modulus phase factors applied as part of each rotation. `A * diag(D)` (before and after) represents the same scaled input matrix, with `A` reorthogonalised toward singular vectors.
* -   `tol` must be strictly greater than `eps` (otherwise the routine returns the negative argument-error code `-21`).
* -   `lwork` must be at least `M`.
* -   Negative return values follow the Fortran reference convention: `-i` means the `i`-th argument had an illegal value.
*
* @module @rreusser/blahpack/lapack/zgsvj1
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import zgsvj1 from '@rreusser/blahpack/lapack/zgsvj1';
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* // A = [ 1, 1; 1, -1+i ] (column-major), with initial column norms in sva:
* var A = new Complex128Array( [ 1, 0, 1, 0, 1, 0, -1, 1 ] );
* var d = new Complex128Array( [ 1, 0, 1, 0 ] );
* var sva = new Float64Array( [ Math.sqrt( 2.0 ), Math.sqrt( 3.0 ) ] );
* var V = new Complex128Array( 1 );
* var work = new Complex128Array( 2 );
*
* var info = zgsvj1( 'column-major', 'no-v', 2, 2, 1, A, 2, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work );
* // returns 0
*
* // After the sweeps, sva holds the singular values of A:
* // sva => <Float64Array>[ ~1.902113, ~1.175571 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgsvj1 from './zgsvj1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgsvj1, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof zgsvj1 & { ndarray: typeof ndarray }} */ ( zgsvj1 );
export { ndarray };
