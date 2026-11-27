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
* @module @rreusser/blahpack/lapack/base/dgsvj1
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgsvj1 from '@rreusser/blahpack/lapack/base/dgsvj1';
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
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgsvj1, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgsvj1 & { ndarray: typeof ndarray }} */ ( dgsvj1 );
export { ndarray };
