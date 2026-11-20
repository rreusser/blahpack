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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a real M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is a real orthogonal matrix represented in the compact WY form returned by `dgeqrt`.
*
* @param {string} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {string} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {integer} nb - block size used to build T
* @param {Float64Array} V - reflector vectors from `dgeqrt`
* @param {integer} strideV1 - stride of the first dimension of V
* @param {integer} strideV2 - stride of the second dimension of V
* @param {NonNegativeInteger} offsetV - starting index for V
* @param {Float64Array} T - block triangular factors from `dgeqrt`
* @param {integer} strideT1 - stride of the first dimension of T
* @param {integer} strideT2 - stride of the second dimension of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace buffer
* @param {integer} strideWork - element stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`)
* @throws {RangeError} third, fourth, fifth, sixth arguments must satisfy positivity/range constraints
* @returns {integer} info status code (0 = success)
*/
function dgemqrt( side, trans, M, N, K, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {

	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nb < 1 || ( nb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`). Value: `%d`.', nb ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	const Q = ( side === 'left' ) ? M : N;
	if ( K > Q ) {
		throw new RangeError( format( 'invalid argument. Fifth argument (K) must satisfy K <= M when side=\'left\' or K <= N when side=\'right\'. Value: `%d`.', K ) );
	}
	const minWork = (M === 0 || N === 0 || K === 0) ? 0 : ( side === 'left' ) ? Math.max( 1, N ) * nb : Math.max( 1, M ) * nb;
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( side, trans, M, N, K, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dgemqrt;
