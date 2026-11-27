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
* Generate an M-by-N real matrix Q with orthonormal rows from an RQ factorization.
*
* @module @rreusser/blahpack/lapack/base/dorgr2
*
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgerq2 from '@rreusser/blahpack/lapack/base/dgerq2';
* import dorgr2 from '@rreusser/blahpack/lapack/base/dorgr2';
*
* var M = 2;
* var N = 3;
* var K = 2;
*
* // RQ-factor A = [ [ 1, 2, 2 ], [ 0, 3, 4 ] ] (column-major):
* var A = new Float64Array( [ 1.0, 0.0, 2.0, 3.0, 2.0, 4.0 ] );
* var TAU = new Float64Array( Math.min( M, N ) );
* var WORK = new Float64Array( M );
* dgerq2( 'column-major', M, N, A, M, TAU, 1, WORK );
*
* // Overwrite A with the M-by-N matrix Q (orthonormal rows):
* var info = dorgr2( 'column-major', M, N, K, A, M, TAU, 1, WORK );
* // returns 0
*
* // The last row of Q is -[ 0, 3, 4 ]/5:
* // [ A[ 1 ], A[ 3 ], A[ 5 ] ] => [ 0.0, ~-0.6, -0.8 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorgr2 from './dorgr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorgr2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dorgr2 & { ndarray: typeof ndarray }} */ ( dorgr2 );
export { ndarray };
