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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of the current symmetric tridiagonal matrix `H` and the corresponding Ritz estimates.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {number} rnorm - residual norm of the Lanczos/Arnoldi factorization
* @param {NonNegativeInteger} N - order of the matrix `H`
* @param {Float64Array} H - symmetric tridiagonal matrix in 2-column column-major layout (subdiagonal in column 0, diagonal in column 1)
* @param {integer} LDH - leading dimension of `H`
* @param {Float64Array} eig - output array for the eigenvalues (length N)
* @param {integer} strideEig - stride length for `eig`
* @param {Float64Array} bounds - output array for the Ritz estimates (length N)
* @param {integer} strideBounds - stride length for `bounds`
* @param {Float64Array} workl - workspace array (length >= 3*N)
* @param {Int32Array} ierr - output (length-1 array): `ierr`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} workl array must have sufficient length
* @returns {Float64Array} `bounds`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var H = new Float64Array( [ 0.0, -1.0, -1.0, -1.0, 2.0, 2.0, 2.0, 2.0 ] ); // 4x2, LDH=4
* var eig = new Float64Array( 4 );
* var bounds = new Float64Array( 4 );
* var workl = new Float64Array( 12 );
*
* var ierr = dseigt( 'column-major', 0.5, 4, H, 4, eig, 1, bounds, 1, workl );
* // returns 0
*/
function dseigt( order, rnorm, N, H, LDH, eig, strideEig, bounds, strideBounds, workl, ierr ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sh1 = ( order === 'column-major' ) ? 1 : LDH;
	const sh2 = ( order === 'column-major' ) ? LDH : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( !workl || workl.length < ( 3 * N ) ) {
		throw new RangeError( format( 'invalid argument. workl array must have at least %d elements. Provided length: %d.', 3 * N, ( workl ) ? workl.length : 0 ) );
	}
	return base( rnorm, N, H, sh1, sh2, 0, eig, strideEig, stride2offset( N, strideEig ), bounds, strideBounds, stride2offset( N, strideBounds ), workl, 1, stride2offset( Math.max( 3 * N, 0 ), 1 ), ierr );
}


// EXPORTS //

export default dseigt;
