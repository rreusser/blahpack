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
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reduces a complex Hermitian matrix in packed form to real symmetric tridiagonal form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangular part of A is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} AP - packed Hermitian matrix (complex elements)
* @param {Float64Array} d - output array for diagonal elements (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - output array for off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {Complex128Array} TAU - output array for reflector scalars (length N-1, complex elements)
* @param {integer} strideTAU - stride length for `TAU`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhptrd( order, uplo, N, AP, d, strideD, e, strideE, TAU, strideTAU ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( order === 'row-major' ) {
		throw new TypeError( format( 'invalid argument. First argument must be \'column-major\'; packed storage is LAPACK column-major packed. Value: `%s`.', order ) );
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	const otau = stride2offset( N - 1, strideTAU );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, AP, 1, 0, d, strideD, od, e, strideE, oe, TAU, strideTAU, otau );
}


// EXPORTS //

export default zhptrd;
