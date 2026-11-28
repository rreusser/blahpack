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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import strided from './strided.js';
import { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Overwrites a real `M`-by-`N` matrix `C` with `op(Q)*C` or `C*op(Q)`, where `Q` is a real orthogonal matrix produced by a blocked Short-Wide LQ (SWLQ) factorization (`dlaswlq`).
*
* @param {Layout} order - storage layout (`'row-major'` or `'column-major'`)
* @param {OperationSide} side - `'left'` to apply Q from the left, `'right'` from the right
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'` for Q, `'transpose'` for Q^T
* @param {NonNegativeInteger} M - number of rows of `C`
* @param {NonNegativeInteger} N - number of columns of `C`
* @param {NonNegativeInteger} K - number of elementary reflectors
* @param {integer} mb - inner block size of the compact-WY representation
* @param {integer} nb - column block size used in the SWLQ factorization
* @param {Float64Array} A - reflector vectors from `dlaswlq`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} T - block triangular factors from `dlaswlq`
* @param {PositiveInteger} LDT - leading dimension of `T` (>= `mb`)
* @param {Float64Array} C - input/output matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {(Float64Array|null)} WORK - workspace array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {TypeError} third argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} fourth argument is invalid (rejected when `M < K`)
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `K < mb || mb < 1`)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, K )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, side === 'left' ? M : N )` (row-major)
* @throws {RangeError} twelfth argument must be greater than or equal to `max( 1, mb )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fourteenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} `K` must satisfy `K <= N` when `side = 'right'` and `N > 0` (the reference's DGEMLQT rejects it)
* @returns {integer} status code (0 = success)
*/
function dlamswlq( order, side, trans, M, N, K, mb, nb, A, LDA, T, LDT, C, LDC, WORK ) {
	let sa1, sa2, st1, st2, sc1, sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < K ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `M < K`). Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( K < mb || mb < 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `K < mb || mb < 1`). Value: `%d`.', mb ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, K ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', K, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, side === 'left' ? M : N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', side === 'left' ? M : N, LDA ) );
	}
	if ( order === 'column-major' && ( LDT < max( 1, mb ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,%d). Value: `%d`.', mb, LDT ) );
	}
	if ( order === 'column-major' && ( LDC < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDC ) );
	}
	if ( order === 'row-major' && ( LDC < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDC ) );
	}
	// The reference does not check K <= N for side = 'right' itself: past its quick return, its DGEMLQT either rejects such a K (INFO = -5, XERBLA) or (on the blocked path) addresses columns of A and C beyond N, so there is no defined result.
	if ( side === 'right' && N > 0 && K > N ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must satisfy K <= N when side = \'right\' (the reference\'s DGEMLQT rejects K > N). Value: `%d`.', K ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		// The reference's LWKOPT (equal to its minimum): N*MB for side = 'left', M*MB for side = 'right'.
		WORK = new Float64Array( computeOptimalWorkSize( side, M, N, mb ) );
	}
	return strided( side, trans, M, N, K, mb, nb, A, sa1, sa2, 0, T, st1, st2, 0, C, sc1, sc2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default dlamswlq;
