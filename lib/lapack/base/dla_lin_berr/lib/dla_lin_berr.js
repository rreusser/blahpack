/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes component-wise relative backward error.
*
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - guard factor used in the numerator safeguard
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} res - residual matrix (column-major, dimension `N x nrhs`)
* @param {PositiveInteger} LDRES - leading dimension of `res`
* @param {Float64Array} ayb - denominator matrix (column-major, dimension `N x nrhs`)
* @param {PositiveInteger} LDAYB - leading dimension of `ayb`
* @param {Float64Array} berr - output vector of dimension `nrhs`
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `nrhs` must be a nonnegative integer
* @throws {RangeError} `LDRES` must be greater than or equal to `max(1,N)`
* @throws {RangeError} `LDAYB` must be greater than or equal to `max(1,N)`
* @returns {Float64Array} `berr`
*/
function dla_lin_berr( N, nz, nrhs, res, LDRES, ayb, LDAYB, berr ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDRES < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDRES ) );
	}
	if ( LDAYB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAYB ) );
	}
	return base( N, nz, nrhs, res, 1, LDRES, 0, ayb, 1, LDAYB, 0, berr, 1, 0 );
}


// EXPORTS //

export default dla_lin_berr;
