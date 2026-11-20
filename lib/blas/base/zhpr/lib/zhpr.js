/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - uplo
* @param {NonNegativeInteger} N - N
* @param {number} alpha - alpha
* @param {Complex128Array} x - x
* @param {integer} strideX - strideX
* @param {Complex128Array} AP - AP
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be non-zero
* @throws {TypeError} if a string argument is not a valid option
* @returns {Complex128Array} output array
*/
function zhpr( order, uplo, N, alpha, x, strideX, AP ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( strideX === 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be non-zero. Value: `%d`.', strideX ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	const ox = stride2offset( N, strideX );
	return base( uplo, N, alpha, x, strideX, ox, AP, 1, 0 );
}


// EXPORTS //

export default zhpr;
