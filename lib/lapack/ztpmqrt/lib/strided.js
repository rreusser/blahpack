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
* Applies a complex unitary matrix `Q` (or its conjugate-transpose) obtained from a triangular-pentagonal compact-WY block reflector — the output of `ztpqrt` — to a stacked matrix `C` formed by two blocks `A` and `B`.
*
* @param {OperationSide} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {('no-transpose'|'conjugate-transpose')} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {NonNegativeInteger} l - order of the trapezoidal part of V (`0 <= L <= K`)
* @param {integer} nb - block size used to construct T
* @param {Complex128Array} V - pentagonal reflector matrix produced by `ztpqrt`
* @param {integer} strideV1 - stride of the first dimension of V (in complex elements)
* @param {integer} strideV2 - stride of the second dimension of V (in complex elements)
* @param {NonNegativeInteger} offsetV - starting index for V (in complex elements)
* @param {Complex128Array} T - block triangular factor produced by `ztpqrt`
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} A - upper (left) or left (right) block of C, modified in-place
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - lower (left) or right (right) block of C, modified in-place
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128Array} WORK - workspace buffer (in complex elements)
* @param {integer} strideWork - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `l < 0 || l > K`)
* @throws {RangeError} seventh argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`)
* @throws {RangeError} M, N, K must be nonnegative integers
* @throws {RangeError} L must satisfy `0 <= L <= K`
* @throws {RangeError} nb must be a positive integer satisfying `nb <= K` when `K > 0`
* @returns {integer} info status code (0 = success)
*/
function ztpmqrt( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork ) {
	let need;
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( l < 0 || l > K ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `l < 0 || l > K`). Value: `%d`.', l ) );
	}
	if ( nb < 1 || ( nb > K && K > 0 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `nb < 1 || ( nb > K && K > 0 )`). Value: `%d`.', nb ) );
	}

	// Caller owns the workspace; assert it is a sufficiently large array so an
	// under-sized (or non-array) buffer is a loud RangeError, not a silent NaN
	// from an out-of-bounds read. WORK is only touched when M>0, N>0, and K>0;
	// it needs `N*nb` complex elements for a left apply and `M*nb` for a right
	// apply.
	if ( M > 0 && N > 0 && K > 0 ) {
		need = ( side === 'left' ) ? N*nb : M*nb;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( side, trans, M, N, K, l, nb, V, strideV1, strideV2, offsetV, T, strideT1, strideT2, offsetT, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default ztpmqrt;
