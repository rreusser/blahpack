/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes a generalized QR factorization of an N-by-M matrix A and an N-by-P matrix B: A = Q·R, B = Q·T·Z.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the number of rows of the matrices A and B.
* @param {NonNegativeInteger} M - the number of columns of the matrix A.
* @param {NonNegativeInteger} p - the number of columns of the matrix B.
* @param {Float64Array} A - on entry, the N-by-M matrix A. On exit, the elements on and above the diagonal of the array contain the min(N,M)-by-M upper trapezoidal matrix R (R is upper triangular if N >= M); the elements below the diagonal, with the array TAUA, represent the orthogonal matrix Q as a product of min(N,M) elementary reflectors (see Further Details).
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAUA - the scalar factors of the elementary reflectors which represent the orthogonal matrix Q (see Further Details).
* @param {integer} strideTAUA - stride length for `TAUA`
* @param {Float64Array} B - on entry, the N-by-P matrix B. On exit, if N <= P, the upper triangle of the subarray B(1:N,P-N+1:P) contains the N-by-N upper triangular matrix T; if N > P, the elements on and above the (N-P)-th subdiagonal contain the N-by-P upper trapezoidal matrix T; the remaining elements, with the array TAUB, represent the orthogonal matrix Z as a product of elementary reflectors (see Further Details).
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} TAUB - the scalar factors of the elementary reflectors which represent the orthogonal matrix Z (see Further Details).
* @param {integer} strideTAUB - stride length for `TAUB`
* @param {(Float64Array|null)} WORK - workspace of length at least `max(1,N,M,P)`; for optimal performance at least `max( max(N,M,P)*NB, P*NB + TSIZE )` (`NB = 32` from `ilaenv`, `TSIZE = 4160`), the reference's `max(N,M,P)*NB` with the dormqr optimum's T part, which enables the blocked paths; or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, p )` (row-major)
* @returns {integer} info status code
*/
function dggqrf( order, N, M, p, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', p, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const otaua = stride2offset( min( N, M ), strideTAUA );
	const otaub = stride2offset( min( N, p ), strideTAUB );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( computeOptimalWorkSize( N, M, p ) );
	}
	return base( N, M, p, A, sa1, sa2, 0, TAUA, strideTAUA, otaua, B, sb1, sb2, 0, TAUB, strideTAUB, otaub, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggqrf;
