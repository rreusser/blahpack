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
* Computes the inverse of a complex Hermitian indefinite matrix `A` using the factorization `A = U*D*U**H` or `A = L*D*L**H` computed by `zhetrf`.
*
* @param {string} uplo - specifies whether the upper or lower triangle of `A` is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace (sized to fit the dispatched path)
* @param {integer} strideWork - row stride of `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} Second argument must be a nonnegative integer
* @returns {integer} status code (`0` = success; `> 0` = `D(k,k)` is singular)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( [ 4.0, 0.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( 1 );
*
* var info = zhetri2( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0 );
* // returns 0
*/
function zhetri2( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len, max-params
	var need;

	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}

	// Caller owns WORK; assert it is large enough for whichever path base() dispatches (>= N complex elements when N <= NBMAX=32, else >= (N+NBMAX+1)*(NBMAX+3)) so an undersized buffer is a loud RangeError, not a silent NaN. N===0 is a quick return that needs no workspace.
	if ( N > 0 ) {
		need = ( N <= 32 ) ? N : ( ( N + 33 ) * 35 );
		if ( !WORK || ( WORK.length - offsetWork ) < need ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', need, offsetWork, ( WORK ) ? WORK.length : 0 ) );
		}
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhetri2;
