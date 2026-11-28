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
import strided from './strided.js';


// MAIN //

/**
* Computes a QR factorization with column pivoting of the matrix block.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {NonNegativeInteger} offset - the number of rows of the matrix A that must be pivoted but no factorized.
* @param {Float64Array} A - on entry, the M-by-N matrix A. On exit, the upper triangle of block A(OFFSET+1:M,1:N) is the triangular factor obtained; the elements in block A(OFFSET+1:M,1:N) below the diagonal, together with the array TAU, represent the orthogonal matrix Q as a product of elementary reflectors.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - on entry, if JPVT(i) .ne. 0, the i-th column of A is permuted to the front of A*P (a leading column); if JPVT(i) = 0, the i-th column of A is a free column. On exit, if JPVT(i) = k, then the i-th column of A*P was the k-th column of A (0-based).
* @param {integer} strideJPVT - stride length for `JPVT`
* @param {Float64Array} TAU - the scalar factors of the elementary reflectors.
* @param {integer} strideTAU - stride length for `TAU`
* @param {Float64Array} VN1 - the vector with the partial column norms.
* @param {integer} strideVN1 - stride length for `VN1`
* @param {Float64Array} VN2 - the vector with the exact column norms.
* @param {integer} strideVN2 - stride length for `VN2`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @returns {Float64Array} `VN2`
*/
function dlaqp2( order, M, N, offset, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const ojpvt = stride2offset( N, strideJPVT );
	const otau = stride2offset( N, strideTAU );
	const ovn1 = stride2offset( N, strideVN1 );
	const ovn2 = stride2offset( N, strideVN2 );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return strided( M, N, offset, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, VN1, strideVN1, ovn1, VN2, strideVN2, ovn2, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqp2;
