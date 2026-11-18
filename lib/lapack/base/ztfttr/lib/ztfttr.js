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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copies a triangular matrix from Rectangular Full Packed (RFP) format to standard full format.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} transr - specifies whether `ARF` is in normal or conjugate-transpose format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} ARF - input array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @param {Complex128Array} A - output matrix in full format
* @param {PositiveInteger} LDA - leading dimension of `A`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function ztfttr( order, transr, uplo, N, ARF, strideARF, A, LDA ) {
	let sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const oarf = stride2offset( N * ( N + 1 ) / 2, strideARF );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( transr !== 'no-transpose' && transr !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `transr` value. Value: `%s`.', transr ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	return base( transr, uplo, N, ARF, strideARF, oarf, A, sa1, sa2, 0 );
}


// EXPORTS //

export default ztfttr;
