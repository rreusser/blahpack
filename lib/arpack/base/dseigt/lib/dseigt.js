/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates.
*
* @param {number} rnorm - residual norm of the Lanczos/Arnoldi factorization
* @param {NonNegativeInteger} N - order of the matrix `H`
* @param {Float64Array} H - symmetric tridiagonal matrix in 2-column column-major layout (subdiagonal in column 0, diagonal in column 1)
* @param {integer} ldh - leading dimension of `H`
* @param {Float64Array} eig - output array for the eigenvalues (length N)
* @param {integer} strideEig - stride length for `eig`
* @param {Float64Array} bounds - output array for the Ritz estimates (length N)
* @param {integer} strideBounds - stride length for `bounds`
* @param {Float64Array} workl - workspace array (length >= 3*N)
* @param {integer} strideWorkl - stride length for `workl`
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} workl array must have sufficient length
* @returns {integer} IERR - 0 if successful, otherwise the `dstqrb` error code
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] ); // 4x2, ldh=4
* var eig = new Float64Array( 4 );
* var bounds = new Float64Array( 4 );
* var workl = new Float64Array( 12 );
*
* var ierr = dseigt( 0.5, 4, H, 4, eig, 1, bounds, 1, workl, 1 );
* // returns 0
*/
function dseigt( rnorm, N, H, ldh, eig, strideEig, bounds, strideBounds, workl, strideWorkl ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workl || workl.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', 3 * N, ( workl ) ? workl.length : 0 ) );
	}
	return base( rnorm, N, H, 1, ldh, 0, eig, strideEig, stride2offset( N, strideEig ), bounds, strideBounds, stride2offset( N, strideBounds ), workl, strideWorkl, stride2offset( Math.max( 3 * N, 0 ), strideWorkl ) );
}


// EXPORTS //

export default dseigt;
