
/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reconstructs the Householder vectors and block reflectors of a compact-WY TSQR factorization.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {PositiveInteger} nb - block size used to build `T`
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - output block reflector matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} d - output diagonal sign vector, length `N`
* @param {integer} strideD - stride length for `d`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer less than or equal to `M`
* @throws {RangeError} fourth argument must be a positive integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,M) (column-major) or max(1,N) (row-major)
* @throws {RangeError} eighth argument must be greater than or equal to max(1,min(nb,N))
* @returns {integer} status code (0 = success)
*/
function dorhr_col( order, M, N, nb, A, LDA, T, LDT, d, strideD ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 || N > M ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer less than or equal to `M`. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a positive integer. Value: `%d`.', nb ) );
	}
	if ( LDT < max( 1, Math.min( nb, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,min(nb,N)). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	return base( M, N, nb, A, sa1, sa2, 0, T, st1, st2, 0, d, strideD, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorhr_col;
