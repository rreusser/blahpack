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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization with column pivoting of a matrix A: A·P = Q·R using Level 3 BLAS.
*
* When `WORK` is `null`, this wrapper allocates the reference's optimal workspace
* `max(1, 2*N + (N+1)*NB)` elements (with `NB = 32`), which enables the blocked
* path. Prefer passing a caller-owned buffer for batched use.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input/output matrix (M-by-N, column-major)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Int32Array} JPVT - column permutation (1-based on exit)
* @param {integer} strideJPVT - stride for JPVT
* @param {Float64Array} TAU - output reflector scalars (length >= min(M,N))
* @param {integer} strideTAU - stride for TAU
* @param {(Float64Array|null)} WORK - workspace of length at least `3*N+1` (for optimal performance at least `2*N + (N+1)*NB`, NB = 32, which enables the blocked path), or `null` to allocate the optimum
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function dgeqp3( order, M, N, A, LDA, JPVT, strideJPVT, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let lwork;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const ojpvt = stride2offset( N, strideJPVT );
	const otau = stride2offset( Math.min( M, N ), strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		lwork = max( 1, ( 2 * N ) + ( ( N + 1 ) * DEFAULT_NB ) );
		WORK = new Float64Array( lwork );
	}
	return base( M, N, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default dgeqp3;
