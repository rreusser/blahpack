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
* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} Z - on exit, the last row of the orthonormal eigenvector matrix (length N)
* @param {integer} strideZ - stride length for `Z`
* @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
* @param {integer} strideWork - stride length for `WORK`
* @throws {RangeError} first argument must be a nonnegative integer
* @throws {RangeError} WORK array must have sufficient length
* @returns {integer} INFO - 0 if successful, >0 if INFO eigenvalues did not converge
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var d = new Float64Array( [ 2.0, 2.0, 2.0, 2.0 ] );
* var e = new Float64Array( [ -1.0, -1.0, -1.0 ] );
* var Z = new Float64Array( 4 );
* var WORK = new Float64Array( 6 );
*
* var info = dstqrb( 4, d, 1, e, 1, Z, 1, WORK, 1 );
* // returns 0
*/
function dstqrb( N, d, strideD, e, strideE, Z, strideZ, WORK, strideWork ) {
	var minWork;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	minWork = ( N <= 1 ) ? 0 : ( 2 * ( N - 1 ) );
	if ( !WORK || WORK.length < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements. Provided length: %d.', minWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( N, d, strideD, stride2offset( N, strideD ), e, strideE, stride2offset( Math.max( N - 1, 0 ), strideE ), Z, strideZ, stride2offset( N, strideZ ), WORK, strideWork, stride2offset( Math.max( 2 * ( N - 1 ), 0 ), strideWork ) );
}


// EXPORTS //

export default dstqrb;
