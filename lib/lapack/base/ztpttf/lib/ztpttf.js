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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Copies a triangular matrix from standard packed format (TP) to Rectangular Full Packed format (RFP), complex version.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} transr - specifies whether `ARF` is in normal or conjugate-transpose format (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} uplo - specifies whether the matrix is upper or lower triangular (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - input array in standard packed format
* @param {Complex128Array} ARF - output array in RFP format
* @param {integer} strideARF - stride length for `ARF`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function ztpttf( order, transr, uplo, N, AP, ARF, strideARF ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	const oarf = stride2offset( N * ( N + 1 ) / 2, strideARF );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( transr !== 'no-transpose' && transr !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `transr` value. Value: `%s`.', transr ) );
	}
	return base( transr, uplo, N, AP, 1, 0, ARF, strideARF, oarf );
}


// EXPORTS //

export default ztpttf;
