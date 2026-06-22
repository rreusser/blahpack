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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );


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
	var symbZero;
	var noTrans;
	var safe1;
	var temp;
	var lenx;
	var leny;
	var sa1;
	var sa2;
	var yiy;
	var iy;
	var jx;
	var ia;
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
	sa1 = strideA1;
	sa2 = strideA2;

	// Set the safe1 perturbation guard...
	safe1 = ( N + 1 ) * SAFMIN;

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
