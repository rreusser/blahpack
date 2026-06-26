
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex general band matrix to real upper bidiagonal form.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} vect - one of `'no-vectors'`, `'q-only'`, `'p-only'`, or `'both'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} ncc - number of columns of C
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB` (in complex elements)
* @param {Float64Array} d - real diagonal of B
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - real superdiagonal of B
* @param {integer} strideE - stride length for `e`
* @param {Complex128Array} Q - on output, the unitary matrix Q
* @param {PositiveInteger} LDQ - leading dimension of `Q` (in complex elements)
* @param {Complex128Array} PT - on output, the unitary matrix P**H
* @param {PositiveInteger} LDPT - leading dimension of `PT` (in complex elements)
* @param {Complex128Array} C - on input m-by-ncc; on output Q**H*C
* @param {PositiveInteger} LDC - leading dimension of `C` (in complex elements)
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWORK - stride length for `RWORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to max(1,KL+KU+1)
* @returns {integer} status code (0 = success)
*/
function zgbbrd( order, vect, M, N, ncc, kl, ku, AB, LDAB, d, strideD, e, strideE, Q, LDQ, PT, LDPT, C, LDC, WORK, strideWORK, RWORK, strideRWORK ) {
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
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,KL+KU+1). Value: `%d`.', LDAB ) );
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
		var minWork = Math.max( 1, Math.max( M, N) );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, Math.max( M, N) );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	return base( vect, M, N, ncc, kl, ku, AB, sab1, sab2, 0, d, strideD, 0, e, strideE, 0, Q, sq1, sq2, 0, PT, spt1, spt2, 0, C, sc1, sc2, 0, WORK, strideWORK, 0, RWORK, strideRWORK, 0 );
}


// EXPORTS //

export default zgbbrd;
