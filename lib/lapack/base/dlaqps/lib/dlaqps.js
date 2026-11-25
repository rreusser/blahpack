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
import base from './base.js';


// MAIN //

/**
* Computes a step of QR factorization with column pivoting of a real m-by-n matrix A by using BLAS level 3.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {integer} offset - the number of rows of A that have been factorized in previous steps.
* @param {NonNegativeInteger} nb - the number of columns to factorize.
* @param {Int32Array} kb - output (length-1 array): the number of columns actually factorized
* @param {Float64Array} A - on entry, the M-by-N matrix A. On exit, block A(OFFSET+1:M,1:KB) is the triangular factor obtained and block A(1:OFFSET,1:N) has been accordingly pivoted, but no factorized.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - jPVT(I) = K <==> Column K of the full matrix A has been permuted into position I in AP (0-based).
* @param {integer} strideJPVT - stride length for `JPVT`
* @param {Float64Array} TAU - the scalar factors of the elementary reflectors.
* @param {integer} strideTAU - stride length for `TAU`
* @param {Float64Array} VN1 - the vector with the partial column norms.
* @param {integer} strideVN1 - stride length for `VN1`
* @param {Float64Array} VN2 - the vector with the exact column norms.
* @param {integer} strideVN2 - stride length for `VN2`
* @param {Float64Array} AUXV - auxiliary vector.
* @param {integer} strideAUXV - stride length for `AUXV`
* @param {Float64Array} F - matrix F**T = L*Y**T*A.
* @param {PositiveInteger} LDF - leading dimension of `F`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, nb )` (row-major)
* @throws {RangeError} twentieth argument must be greater than or equal to `max( 1, N )` (column-major)
* @returns {Float64Array} `F`
*/
function dlaqps( order, M, N, offset, nb, kb, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, AUXV, strideAUXV, F, LDF ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sf1 = ( order === 'column-major' ) ? 1 : LDF;
	const sf2 = ( order === 'column-major' ) ? LDF : 1;
	const ojpvt = stride2offset( N, strideJPVT );
	const otau = stride2offset( N, strideTAU );
	const ovn1 = stride2offset( N, strideVN1 );
	const ovn2 = stride2offset( N, strideVN2 );
	const oauxv = stride2offset( nb, strideAUXV );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDF < max( 1, nb ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,nb). Value: `%d`.', LDF ) );
	}
	if ( order === 'column-major' && LDF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDF ) );
	}
	return base( M, N, offset, nb, kb, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, VN1, strideVN1, ovn1, VN2, strideVN2, ovn2, AUXV, strideAUXV, oauxv, F, sf1, sf2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqps;
