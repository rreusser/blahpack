/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Counts the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration.
*
* @param {NonNegativeInteger} N - number of Ritz values to check for convergence
* @param {Float64Array} ritz - Ritz values to be checked for convergence
* @param {integer} strideRITZ - stride length for `ritz`
* @param {NonNegativeInteger} offsetRITZ - starting index for `ritz`
* @param {Float64Array} bounds - Ritz estimates associated with the Ritz values in `ritz`
* @param {integer} strideBOUNDS - stride length for `bounds`
* @param {NonNegativeInteger} offsetBOUNDS - starting index for `bounds`
* @param {number} tol - desired relative accuracy for a Ritz value to be considered "converged"
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {NonNegativeInteger} number of "converged" Ritz values
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var ritz = new Float64Array( [ 1.0, 2.0, 0.5 ] );
* var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16 ] );
*
* var nconv = dsconv( 3, ritz, 1, 0, bounds, 1, 0, 1.0e-6 );
* // returns 2
*/
function dsconv( N, ritz, strideRITZ, offsetRITZ, bounds, strideBOUNDS, offsetBOUNDS, tol ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ritz, strideRITZ, offsetRITZ, bounds, strideBOUNDS, offsetBOUNDS, tol );
}


// EXPORTS //

export default dsconv;
