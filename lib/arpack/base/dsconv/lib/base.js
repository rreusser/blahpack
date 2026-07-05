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

import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// MAIN //

/**
* Counts the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration.
*
* ## Notes
*
* -   The i-th Ritz value is considered converged when `bounds[i] <= tol * max( eps23, abs( ritz[i] ) )`, where `eps23 = eps**(2/3)` and `eps` is the machine epsilon.
*
* @private
* @param {NonNegativeInteger} N - number of Ritz values to check for convergence
* @param {Float64Array} ritz - Ritz values to be checked for convergence
* @param {integer} strideRITZ - stride length for `ritz`
* @param {NonNegativeInteger} offsetRITZ - starting index for `ritz`
* @param {Float64Array} bounds - Ritz estimates associated with the Ritz values in `ritz`
* @param {integer} strideBOUNDS - stride length for `bounds`
* @param {NonNegativeInteger} offsetBOUNDS - starting index for `bounds`
* @param {number} tol - desired relative accuracy for a Ritz value to be considered "converged"
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
	var eps23;
	var nconv;
	var temp;
	var ir;
	var ib;
	var i;

	eps23 = Math.pow( dlamch( 'epsilon' ), 2.0 / 3.0 );

	nconv = 0;
	ir = offsetRITZ;
	ib = offsetBOUNDS;
	for ( i = 0; i < N; i++ ) {
		temp = Math.max( eps23, Math.abs( ritz[ ir ] ) );
		if ( bounds[ ib ] <= tol * temp ) {
			nconv += 1;
		}
		ir += strideRITZ;
		ib += strideBOUNDS;
	}
	return nconv;
}


// EXPORTS //

export default dsconv;
