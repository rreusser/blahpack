/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable camelcase */

// MODULES //

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a general banded matrix.
*
* @param {string} trans - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {Float64Array} AB - input matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - input matrix
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - input array
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {integer} cmode - cmode
* @param {Float64Array} c - input array
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} first argument must be a valid transpose operation
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `kl < 0 || kl > N - 1`)
* @throws {RangeError} fourth argument is invalid (rejected when `ku < 0 || ku > N - 1`)
* @returns {number} result
*/
function dla_gbrcond( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( kl < 0 || kl > N - 1 ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `kl < 0 || kl > N - 1`). Value: `%d`.', kl ) );
	}
	if ( ku < 0 || ku > N - 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `ku < 0 || ku > N - 1`). Value: `%d`.', ku ) );
	}
	const minWork = 5 * N;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	return base( trans, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_gbrcond;
