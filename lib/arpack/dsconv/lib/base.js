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

import dlamch from '../../../lapack/dlamch/lib/base.js';


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
* @param {Int32Array} nconv - output (length-1 array): `nconv`
*
* @example
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dsconv from '@rreusser/blahpack/arpack/dsconv';
*
* var ritz = new Float64Array( [ 1.0, 2.0, 0.5 ] );
* var bounds = new Float64Array( [ 1.0e-14, 0.5, 1.0e-16 ] );
*
* var nconv = dsconv.ndarray( 3, ritz, 1, 0, bounds, 1, 0, 1.0e-6 );
* // returns 2
*/
function dsconv( N, ritz, strideRITZ, offsetRITZ, bounds, strideBOUNDS, offsetBOUNDS, tol, nconv ) {
	let nconvLocal, temp, ir, ib, i;

	const eps23 = Math.pow( dlamch( 'epsilon' ), 2.0 / 3.0 );

	nconvLocal = 0;
	ir = offsetRITZ;
	ib = offsetBOUNDS;
	for ( i = 0; i < N; i++ ) {
		temp = Math.max( eps23, Math.abs( ritz[ ir ] ) );
		if ( bounds[ ib ] <= tol * temp ) {
			nconvLocal += 1;
		}
		ir += strideRITZ;
		ib += strideBOUNDS;
	}
	nconv[ 0 ] = nconvLocal;
}


// EXPORTS //

export default dsconv;
