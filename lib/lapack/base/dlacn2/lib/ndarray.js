/**
 * Estimates the 1-norm of a square matrix using reverse communication.
 *
 * This is a reverse communication interface routine. The caller must:
 *
 * 1.  Set `KASE[0]` = 0 on the first call.
 *
 * 2.  Call dlacn2 in a loop. After each return, if `KASE[0]` = 1,
 *     compute `x = A*x` and call dlacn2 again; if `KASE[0]` = 2,
 *     compute `x = A^T*x` and call dlacn2 again; if `KASE[0]` = 0,
 *     the estimate is complete and `EST[0]` holds the result.
 *
 * ISAVE is used to maintain state between calls (3 elements).
 *
 *
 * @param {NonNegativeInteger} N - order of the matrix
 * @param {Float64Array} v - workspace array of length N
 * @param {integer} strideV - stride length for `v`
 * @param {NonNegativeInteger} offsetV - starting index for `v`
 * @param {Float64Array} x - input/output vector of length N
 * @param {integer} strideX - stride length for `x`
 * @param {NonNegativeInteger} offsetX - starting index for `x`
 * @param {Int32Array} ISGN - sign array of length N
 * @param {integer} strideISGN - stride length for `ISGN`
 * @param {NonNegativeInteger} offsetISGN - starting index for `ISGN`
 * @param {Float64Array} EST - in/out: EST[0] is the estimated norm
 * @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
 * @param {Int32Array} ISAVE - state array of length 3
 * @param {integer} strideISAVE - stride length for `ISAVE`
 * @param {NonNegativeInteger} offsetISAVE - starting index for `ISAVE`
 */

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square matrix using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - workspace array of length N
* @param {integer} strideV - stride length for `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {Float64Array} x - input/output vector of length N
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {Int32Array} ISGN - sign array of length N
* @param {integer} strideISGN - stride length for `ISGN`
* @param {NonNegativeInteger} offsetISGN - starting index for `ISGN`
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @param {Int32Array} ISAVE - state array of length 3
* @param {integer} strideISAVE - stride length for `ISAVE`
* @param {NonNegativeInteger} offsetISAVE - starting index for `ISAVE`
* @throws {RangeError} first argument must be a nonnegative integer
*/
function dlacn2( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( N === 0 ) {
		return;
	}
	return base( N, v, strideV, offsetV, x, strideX, offsetX, ISGN, strideISGN, offsetISGN, EST, KASE, ISAVE, strideISAVE, offsetISAVE );
}


// EXPORTS //

export default dlacn2;
