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
* Pre-processor for `dgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* ## Notes
*
* -   `dgsvj1` is the off-diagonal-block companion to `dgsvj0`. It is invoked from `dgesvj` after `dgsvj0` has done the diagonal-block sweeps, to suppress only the (1,2) off-diagonal coupling between the first `n1` columns and the remaining `N - n1` columns. There is no de Rijk pivoting, no `lkahead`, and no convergence test inside the q-loop — the routine just performs `nsweep` block-row-cyclic Jacobi sweeps over the off-diagonal tile grid.
* -   `tol` must be strictly greater than `eps` (otherwise the routine returns the negative argument-error code `-21`).
* -   `lwork` must be at least `M`.
*
* @module @rreusser/blahpack/lapack/dgsvj1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgsvj1 from '@rreusser/blahpack/lapack/dgsvj1';
*
* var EPS = 2.220446049250313e-16;
* var SFMIN = 2.2250738585072014e-308;
* var TOL = 1.0e-10;
*
* var A = new Float64Array( [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ] );
* var d = new Float64Array( [ 1, 1, 1 ] );
* var sva = new Float64Array( [ Math.sqrt( 30 ), Math.sqrt( 174 ), Math.sqrt( 446 ) ] );
* var V = new Float64Array( 1 );
* var work = new Float64Array( 4 );
*
* // Rotate column 0 against columns 1-2 for at most 5 sweeps (4 = nsweep-1: sweep limit reached):
* var info = dgsvj1( 'column-major', 'no-v', 4, 3, 1, A, 4, d, 1, sva, 1, 0, V, 1, EPS, SFMIN, TOL, 5, work );
* // returns 4
*
* // sva => <Float64Array>[ ~21.1206, ~14.2296, ~1.1991 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgsvj1 from './dgsvj1.js';
import strided from './strided.js';


// MAIN //

setReadOnly( dgsvj1, 'strided', strided );


// EXPORTS //

export default /** @type {typeof dgsvj1 & { strided: typeof strided }} */ ( dgsvj1 );
export { strided };
