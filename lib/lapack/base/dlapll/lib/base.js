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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import daxpy from '../../../../blas/base/daxpy/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dlas2 from '../../dlas2/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;
const tauArr = new Float64Array( 1 );
const svdOut = new Float64Array( 2 );


// MAIN //

/**
* Measures the linear dependence of two vectors X and Y by computing the.
* QR factorization of the N-by-2 matrix (X Y) and returning the smallest
* singular value of the resulting 2-by-2 upper triangular R factor.
*
* On exit, X and Y are overwritten.
*
* @private
* @param {NonNegativeInteger} N - length of the vectors
* @param {Float64Array} x - first vector (overwritten)
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @param {Float64Array} y - second vector (overwritten)
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - starting index for y
* @param {Float64Array} ssmin - output: ssmin[0] receives the smallest singular value
*/
function dlapll( N, x, strideX, offsetX, y, strideY, offsetY, ssmin ) {

	// Quick return if possible
	if ( N <= 1 ) {
		ssmin[ 0 ] = ZERO;
		return;
	}

	// Compute the QR factorization of the N-by-2 matrix ( X Y )
	dlarfg( N, x, offsetX, x, strideX, offsetX + strideX, tauArr, 0 );
	const a11 = x[ offsetX ];
	x[ offsetX ] = ONE;

	const c = -tauArr[ 0 ] * ddot( N, x, strideX, offsetX, y, strideY, offsetY );
	daxpy( N, c, x, strideX, offsetX, y, strideY, offsetY );

	dlarfg( N - 1, y, offsetY + strideY, y, strideY, offsetY + ( 2 * strideY ), tauArr, 0 );

	const a12 = y[ offsetY ];
	const a22 = y[ offsetY + strideY ];

	// Compute the SVD of 2-by-2 upper triangular matrix.
	dlas2( a11, a12, a22, svdOut );
	ssmin[ 0 ] = svdOut[ 0 ];
}


// EXPORTS //

export default dlapll;
