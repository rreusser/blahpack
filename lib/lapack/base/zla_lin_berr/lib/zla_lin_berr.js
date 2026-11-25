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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes a component-wise relative backward error.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - number of rows of `res` and `ayb`
* @param {integer} nz - sparsity guard parameter
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} res - residual matrix, dimension `(N, nrhs)`
* @param {PositiveInteger} LDRES - leading dimension of `res`
* @param {Float64Array} ayb - denominator matrix, dimension `(N, nrhs)`
* @param {PositiveInteger} LDAYB - leading dimension of `ayb`
* @param {Float64Array} berr - output array, dimension `nrhs`
* @param {integer} strideBERR - stride length for `berr`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {Float64Array} `berr`
*/
function zlaLinBerr( order, N, nz, nrhs, res, LDRES, ayb, LDAYB, berr, strideBERR ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sres1 = ( order === 'column-major' ) ? 1 : LDRES;
	const sres2 = ( order === 'column-major' ) ? LDRES : 1;
	const sayb1 = ( order === 'column-major' ) ? 1 : LDAYB;
	const sayb2 = ( order === 'column-major' ) ? LDAYB : 1;
	const oberr = stride2offset( nrhs, strideBERR );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && LDRES < Math.max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDRES ) );
	}
	if ( order === 'column-major' && LDAYB < Math.max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAYB ) );
	}
	if ( order === 'row-major' && LDRES < Math.max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDRES ) );
	}
	if ( order === 'row-major' && LDAYB < Math.max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDAYB ) );
	}
	return base( N, nz, nrhs, res, sres1, sres2, 0, ayb, sayb1, sayb2, 0, berr, strideBERR, oberr );
}


// EXPORTS //

export default zlaLinBerr;
