
/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates an M-by-N real matrix Q with orthonormal columns from the output of DLATSQR using a row-block (GETT) sweep.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} mb - mb
* @param {integer} nb - nb
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} `LDA` must be greater than or equal to `max(1,M)` for column-major (or `max(1,N)` for row-major)
* @throws {RangeError} `LDT` must be greater than or equal to `max(1,nb)`
* @returns {integer} status code (0 = success)
*/
function dorgtsqr_row( order, M, N, mb, nb, A, LDA, T, LDT, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
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
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDT < max( 1, nb ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,nb). Value: `%d`.', LDT ) );
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
	return base( M, N, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, WORK, strideWORK, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorgtsqr_row;
