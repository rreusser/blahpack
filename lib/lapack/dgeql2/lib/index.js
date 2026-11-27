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
* Compute a QL factorization of a real M-by-N matrix.
*
* ## Notes
*
* -   See LAPACK reference documentation for full algorithmic details.
*
* @module @rreusser/blahpack/lapack/base/dgeql2
*
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgeql2 from '@rreusser/blahpack/lapack/base/dgeql2';
*
* var M = 3;
* var N = 3;
* var A = new Float64Array( [ 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 10.0 ] );
* var TAU = new Float64Array( Math.min( M, N ) );
* var WORK = new Float64Array( N );
*
* var info = dgeql2( 'column-major', M, N, A, M, TAU, 1, WORK );
* // returns 0
*
* // |L[2][2]| equals the norm of the last column of A, sqrt( 213 ):
* // A[ 8 ] => ~-14.5945
* // TAU => <Float64Array>[ 0.0, ~1.6922, ~1.6852 ]
*/

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgeql2 from './dgeql2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgeql2, 'ndarray', ndarray );


// EXPORTS //

export default /** @type {typeof dgeql2 & { ndarray: typeof ndarray }} */ ( dgeql2 );
export { ndarray };
