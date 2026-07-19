/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {PositiveInteger} LDRES - leading dimension of `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {PositiveInteger} LDAYB - leading dimension of `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( N, nz, nrhs, res, LDRES, ayb, LDAYB, berr ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDRES < Math.max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDRES ) );
	}
	if ( LDAYB < Math.max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAYB ) );
	}
	return base( N, nz, nrhs, res, 1, LDRES, 0, ayb, 1, LDAYB, 0, berr, 1, 0 );
}


// EXPORTS //

export default zlaLinBerr;
