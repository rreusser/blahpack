
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a real general band matrix to upper bidiagonal form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} vect - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ncc - ncc
* @param {integer} kl - kl
* @param {integer} ku - ku
* @param {Float64Array} AB - input matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - input array
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} PT - input matrix
* @param {PositiveInteger} LDPT - leading dimension of `PT`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - output array
* @param {integer} strideWork - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of "no-vectors", "q-only", "p-only", or "both"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to max(1,N) or max(1,M)
* @throws {RangeError} fifteenth argument must be greater than or equal to max(1,N) or max(1,M)
* @throws {RangeError} seventeenth argument must be greater than or equal to max(1,N) or max(1,M)
* @throws {RangeError} nineteenth argument must be greater than or equal to max(1,N) or max(1,M)
* @returns {integer} status code (0 = success)
*/
function dgbbrd( order, vect, M, N, ncc, kl, ku, AB, LDAB, d, strideD, e, strideE, Q, LDQ, PT, LDPT, C, LDC, WORK, strideWork ) { // eslint-disable-line max-len, max-params
	var sab1;
	var sab2;
	var spt1;
	var spt2;
	var sq1;
	var sq2;
	var sc1;
	var sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( vect !== 'no-vectors' && vect !== 'q-only' && vect !== 'p-only' && vect !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of "no-vectors", "q-only", "p-only", or "both". Value: `%s`.', vect ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'column-major' && LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
	}
	if ( order === 'row-major' && LDPT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDPT ) );
	}
	if ( order === 'column-major' && LDPT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDPT ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		sq1 = 1;
		sq2 = LDQ;
		spt1 = 1;
		spt2 = LDPT;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		spt1 = LDPT;
		spt2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = 2 * Math.max( M, N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( vect, M, N, ncc, kl, ku, AB, sab1, sab2, 0, d, strideD, 0, e, strideE, 0, Q, sq1, sq2, 0, PT, spt1, spt2, 0, C, sc1, sc2, 0, WORK, strideWork, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgbbrd;
