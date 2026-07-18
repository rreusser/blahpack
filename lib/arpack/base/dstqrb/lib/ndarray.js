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
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and the last components of the eigenvectors of a symmetric tridiagonal matrix using the implicit QL or QR method.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements of the tridiagonal matrix (length N-1)
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} Z - on exit, the last row of the orthonormal eigenvector matrix (length N)
* @param {integer} strideZ - stride length for `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} WORK - workspace array (length >= 2*(N-1))
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
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
* var info = dstqrb( 4, d, 1, 0, e, 1, 0, Z, 1, 0, WORK, 1, 0 );
* // returns 0
* // d now holds the eigenvalues in ascending order; Z the last eigenvector row.
*/
function dstqrb( N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ, offsetZ, WORK, strideWork, offsetWork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	const minWork = ( N <= 1 ) ? 0 : ( 2 * ( N - 1 ) );
	if ( !WORK || ( WORK.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( WORK ) ? WORK.length : 0 ) );
	}
	return base( N, d, strideD, offsetD, e, strideE, offsetE, Z, strideZ, offsetZ, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dstqrb;
