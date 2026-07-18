/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

const SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general matrix to calculate error bounds.
*
* ## Notes
*
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (all multiplications involved in computing an entry have at least one zero multiplicand) are not perturbed.
*
* @private
* @param {string} trans - specifies whether `A` should be transposed (`'no-transpose'` or `'transpose'`)
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {number} alpha - scalar constant
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dla_geamv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let symbZero, temp, lenx, leny, yiy, iy, jx, ia, i, j;

	// Quick return if possible...
	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}
	const noTrans = ( trans === 'no-transpose' );
	if ( noTrans ) {
		lenx = N;
		leny = M;
	} else {
		lenx = M;
		leny = N;
	}
	const sa1 = strideA1;
	const sa2 = strideA2;

	// Set the safe1 perturbation guard...
	const safe1 = ( N + 1 ) * SAFMIN;

	iy = offsetY;
	if ( noTrans ) {
		// Form y := alpha*|A|*|x| + beta*|y|
		for ( i = 0; i < leny; i++ ) {
			if ( beta === 0.0 ) {
				symbZero = true;
				y[ iy ] = 0.0;
			} else if ( y[ iy ] === 0.0 ) {
				symbZero = true;
			} else {
				symbZero = false;
				y[ iy ] = beta * Math.abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = offsetX;
				ia = offsetA + ( i * sa1 );
				for ( j = 0; j < lenx; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa2;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	} else {
		// Form y := alpha*|A^T|*|x| + beta*|y|
		for ( i = 0; i < leny; i++ ) {
			if ( beta === 0.0 ) {
				symbZero = true;
				y[ iy ] = 0.0;
			} else if ( y[ iy ] === 0.0 ) {
				symbZero = true;
			} else {
				symbZero = false;
				y[ iy ] = beta * Math.abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = offsetX;
				ia = offsetA + ( i * sa2 );
				for ( j = 0; j < lenx; j++ ) {
					temp = Math.abs( A[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
					ia += sa1;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dla_geamv;
