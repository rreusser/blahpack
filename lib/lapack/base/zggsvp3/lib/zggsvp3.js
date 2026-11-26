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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes unitary matrices for generalized SVD pre-processing of a complex matrix pair.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('compute-U'|'none')} jobu - specifies the operation type
* @param {('compute-V'|'none')} jobv - specifies the operation type
* @param {('compute-Q'|'none')} jobq - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} p - the number of rows of the matrix B.
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {number} tola - tOLA and TOLB are the thresholds to determine the effective numerical rank of matrix B and a subblock of A.
* @param {number} tolb - tOLA and TOLB are the thresholds to determine the effective numerical rank of matrix B and a subblock of A.
* @param {Int32Array} K - output array; K[0] set to the numerical rank dimension
* @param {Int32Array} l - output array; l[0] set to the numerical rank dimension
* @param {Complex128Array} U - input matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Complex128Array} V - input matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Complex128Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {(Int32Array|null)} IWORK - integer workspace of length at least N, or `null` to allocate it
* @param {(Float64Array|null)} RWORK - real workspace of length at least 2*N, or `null` to allocate it
* @param {Complex128Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Complex128Array|null)} WORK - complex workspace of length at least `max(1, N+1, P if jobv = 'compute-V', M if jobu = 'compute-U' or (P > 0 and N > 1))` when `N > 0` and `M + P > 0`, 1 when `M = P = 0`, 0 when `N = 0` (the reference checks only `LWORK >= 1`; `ZGEQP3` rejects less than `N+1`, and the unblocked orthogonal-factor callees write up to M or P for data of full rank); for optimum performance the reference's LWKOPT, `max((N+1)*NB, M, min(N,P), P if jobv = 'compute-V', N if jobq = 'compute-Q')` (`NB = 32`), which enables `zgeqp3`'s blocked path; if `null`, LWKOPT elements are allocated
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "none", "compute-U"
* @throws {TypeError} third argument must be one of the following: "none", "compute-V"
* @throws {TypeError} fourth argument must be one of the following: "none", "compute-Q"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, p )` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} seventeenth argument is invalid (rejected when `LDU < 1 || ( jobu === "compute-U" && LDU < M )`)
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDV < 1 || ( jobv === "compute-V" && LDV < p )`)
* @throws {RangeError} twenty-first argument is invalid (rejected when `LDQ < 1 || ( jobq === "compute-Q" && LDQ < N )`)
* @returns {integer} status code (0 = success)
*/
function zggsvp3( order, jobu, jobv, jobq, M, p, N, A, LDA, B, LDB, tola, tolb, K, l, U, LDU, V, LDV, Q, LDQ, IWORK, RWORK, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sb1, sb2, su1, su2, sv1, sv2, sq1, sq2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "none", "compute-U". Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "compute-V". Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "none", "compute-Q". Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', p, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDU < 1 || ( jobu === 'compute-U' && LDU < M ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `LDU < 1 || ( jobu === "compute-U" && LDU < M )`). Value: `%d`.', LDU ) );
	}
	if ( LDV < 1 || ( jobv === 'compute-V' && LDV < p ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDV < 1 || ( jobv === "compute-V" && LDV < p )`). Value: `%d`.', LDV ) );
	}
	if ( LDQ < 1 || ( jobq === 'compute-Q' && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `LDQ < 1 || ( jobq === "compute-Q" && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	const offsetIWork = 0;
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDV;
		sq1 = 1;
		sq2 = LDQ;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		su1 = LDU;
		su2 = 1;
		sv1 = LDV;
		sv2 = 1;
		sq1 = LDQ;
		sq2 = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
	}
	if ( WORK === null || WORK === void 0 ) {
		// The reference's LWKOPT, which enables zgeqp3's blocked path:
		WORK = new Complex128Array( computeOptimalWorkSize( jobv, jobq, M, p, N ) );
	}
	return base( jobu, jobv, jobq, M, p, N, A, sa1, sa2, 0, B, sb1, sb2, 0, tola, tolb, K, l, U, su1, su2, 0, V, sv1, sv2, 0, Q, sq1, sq2, 0, IWORK, 1, offsetIWork, RWORK, 1, 0, TAU, strideTAU, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zggsvp3;
