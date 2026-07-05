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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Counts the number of "converged" Ritz values for the symmetric Lanczos/Arnoldi eigenvalue iteration.
*
* @param {NonNegativeInteger} N - number of Ritz values to check for convergence
* @param {Float64Array} ritz - Ritz values to be checked for convergence
* @param {integer} strideRITZ - stride length for `ritz`
* @param {Float64Array} bounds - Ritz estimates associated with the Ritz values in `ritz`
* @param {integer} strideBOUNDS - stride length for `bounds`
* @param {number} tol - desired relative accuracy for a Ritz value to be considered "converged"
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {NonNegativeInteger} number of "converged" Ritz values
*/
function dsconv( N, ritz, strideRITZ, bounds, strideBOUNDS, tol ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, ritz, strideRITZ, stride2offset( N, strideRITZ ), bounds, strideBOUNDS, stride2offset( N, strideBOUNDS ), tol );
}


// EXPORTS //

export default dsconv;
