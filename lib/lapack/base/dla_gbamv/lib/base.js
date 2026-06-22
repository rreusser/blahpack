/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general band matrix to calculate error bounds.
*
* ## Notes
*
* -   The band storage follows the same convention as `dgbmv`: element `A(i,j)` of the full matrix (0-based) is located at band-storage row `ku+i-j`, column `j`, i.e. at offset `offsetAB + (ku+i-j)*strideAB1 + j*strideAB2`.
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (all multiplications involved in computing an entry have at least one zero multiplicand) are not perturbed.
*
* @private
* @param {string} trans - specifies whether `A` should be transposed (`'no-transpose'` or `'transpose'`)
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {number} alpha - scalar constant
* @param {Float64Array} AB - banded input matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dla_gbamv( trans, M, N, kl, ku, alpha, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var symbZero;
	var noTrans;
	var safe1;
	var temp;
	var lenx;
	var leny;
	var sab1;
	var sab2;
	var yiy;
	var iy;
	var jx;
	var ia;
	var j0;
	var j1;
	var i;
	var j;

	// Quick return if possible...
	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}
	noTrans = ( trans === 'no-transpose' );
	if ( noTrans ) {
		lenx = N;
		leny = M;
	} else {
		lenx = M;
		leny = N;
	}
	sab1 = strideAB1;
	sab2 = strideAB2;

	// Set SAFE1 to be the underflow threshold times the number of additions in each row...
	safe1 = ( N + 1 ) * SAFMIN;

	iy = offsetY;
	if ( strideX === 1 ) {
		// Unit-stride branch: x is indexed by the matrix column index j
		// (mirrors Fortran's `X(J)` in the INCX=1 branch).
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
					j0 = ( i - kl < 0 ) ? 0 : i - kl;
					j1 = ( i + ku < lenx - 1 ) ? i + ku : lenx - 1;
					for ( j = j0; j <= j1; j++ ) {
						// A(i,j) at band offset (ku+i-j, j):
						ia = offsetAB + ( ( ku + i - j ) * sab1 ) + ( j * sab2 );
						temp = Math.abs( AB[ ia ] );
						jx = offsetX + j;
						symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
						y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
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
					j0 = ( i - kl < 0 ) ? 0 : i - kl;
					j1 = ( i + ku < lenx - 1 ) ? i + ku : lenx - 1;
					for ( j = j0; j <= j1; j++ ) {
						// Mirrors Fortran AB(KE-I+J, I) with KE = KL+1.
						ia = offsetAB + ( ( kl + j - i ) * sab1 ) + ( i * sab2 );
						temp = Math.abs( AB[ ia ] );
						jx = offsetX + j;
						symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
						y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					}
				}
				if ( !symbZero ) {
					yiy = y[ iy ];
					y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
				}
				iy += strideY;
			}
		}
	} else if ( noTrans ) {
		// Non-unit-stride, no transpose: JX starts at the beginning of x
		// Each row (mirrors the Fortran `JX = KX` behavior).
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
				j0 = ( i - kl < 0 ) ? 0 : i - kl;
				j1 = ( i + ku < lenx - 1 ) ? i + ku : lenx - 1;
				jx = offsetX;
				for ( j = j0; j <= j1; j++ ) {
					ia = offsetAB + ( ( ku + i - j ) * sab1 ) + ( j * sab2 );
					temp = Math.abs( AB[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	} else {
		// Non-unit-stride, transpose.
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
				j0 = ( i - kl < 0 ) ? 0 : i - kl;
				j1 = ( i + ku < lenx - 1 ) ? i + ku : lenx - 1;
				jx = offsetX;
				for ( j = j0; j <= j1; j++ ) {
					ia = offsetAB + ( ( kl + j - i ) * sab1 ) + ( i * sab2 );
					temp = Math.abs( AB[ ia ] );
					symbZero = symbZero && ( x[ jx ] === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * Math.abs( x[ jx ] ) * temp;
					jx += strideX;
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

export default dla_gbamv;
