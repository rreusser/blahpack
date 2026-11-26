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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the Skeel condition number for a symmetric positive-definite matrix.
*
* @param {MatrixTriangle} uplo - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} AF - input matrix
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {integer} cmode - determines op2(C) in the formula op(A) * op2(C) as follows: CMODE = 1 op2(C) = C CMODE = 0 op2(C) = I CMODE = -1 op2(C) = inv(C)
* @param {Float64Array} c - input array
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} WORK - input array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {Int32Array} IWORK - output array
* @param {integer} strideIWork - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWork - starting index for `IWORK`
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} `IWORK` must have at least `N` elements from `offsetIWork`
* @returns {number} result
*/
function dla_porcond( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const minWork = 3 * N;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	if ( strideIWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideIWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideIWork ) );
	}
	const minIWork = N;
	if ( !IWORK || ( IWORK.length - offsetIWork ) < minIWork ) {
		throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements from offset %d. Provided length: %d.', minIWork, offsetIWork, ( IWORK ) ? IWORK.length : 0 ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, cmode, c, strideC, offsetC, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dla_porcond;
