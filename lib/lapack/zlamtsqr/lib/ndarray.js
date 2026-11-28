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
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a complex M-by-N matrix C with `op(Q)*C` or `C*op(Q)`, where Q is the complex unitary matrix from a Tall-Skinny QR factorization (`zlatsqr`).
*
* @param {OperationSide} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {('no-transpose'|'conjugate-transpose')} trans - `'no-transpose'` for Q, `'conjugate-transpose'` for Q^H
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {integer} mb - row block size used by `zlatsqr`
* @param {integer} nb - inner block size used by the compact-WY representation
* @param {Complex128Array} A - reflector vectors from `zlatsqr`
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} T - block triangular factors from `zlatsqr`
* @param {integer} strideT1 - stride of the first dimension of T (in complex elements)
* @param {integer} strideT2 - stride of the second dimension of T (in complex elements)
* @param {NonNegativeInteger} offsetT - starting index for T (in complex elements)
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @param {Complex128Array} WORK - caller-provided workspace (length `>= max(1, N)*nb` when `side='left'`, `>= max(1, M)*nb` when `side='right'`, in complex elements)
* @param {integer} strideWork - element stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} third argument is invalid (rejected when `M < K`)
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `K < nb || nb < 1`)
* @returns {integer} info status code (0 = success)
*/
function zlamtsqr( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	let need;
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( M < K ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `M < K`). Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( K < nb || nb < 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `K < nb || nb < 1`). Value: `%d`.', nb ) );
	}

	// Caller owns the workspace. A zero-dimension problem quick-returns in
	// `base` without touching WORK; otherwise the applied kernels
	// (`zgemqrt`/`ztpmqrt`) need `max(1, N)*nb` complex elements for
	// `side='left'` and `max(1, M)*nb` for `side='right'`.
	if ( M !== 0 && N !== 0 && K !== 0 ) {
		need = ( side === 'left' ) ? max( 1, N ) * nb : max( 1, M ) * nb;
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( side, trans, M, N, K, mb, nb, A, strideA1, strideA2, offsetA, T, strideT1, strideT2, offsetT, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default zlamtsqr;
