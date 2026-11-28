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

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the inverse of a complex symmetric matrix in packed storage using the factorization `A = U * D * U^T` or `A = L * D * L^T` computed by `zsptrf`.
*
* @param {MatrixTriangle} uplo - specifies whether upper or lower triangle is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} AP - packed symmetric matrix (overwritten with inverse)
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zsptrf
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace array of length `N`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {TypeError} first argument must be a valid matrix triangle
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import zsptri from '@rreusser/blahpack/lapack/zsptri';
*
* var AP = new Complex128Array( [ 4.0, 2.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zsptri.ndarray( 'upper', 1, AP, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zsptri( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Caller owns the workspace; assert it is a sufficiently large array so an under-sized (or non-array) buffer is a loud RangeError, not a silent NaN. The routine quick-returns for `N === 0` before touching `WORK`, so only guard when work is actually needed.
	if ( N > 0 ) {
		const minWork = N;
		if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	if ( strideWork !== 1 ) {
		throw new RangeError( format( 'invalid argument. `strideWork` must be 1 (only contiguous workspace is supported). Value: `%d`.', strideWork ) );
	}
	return base( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zsptri;
