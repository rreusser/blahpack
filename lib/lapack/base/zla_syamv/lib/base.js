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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );


// FUNCTIONS //

/**
* Returns CABS1(z) = |Re(z)| + |Im(z)| for element at index `idx` in a Float64 view.
*
* @private
* @param {Float64Array} v - Float64 view of a Complex128Array
* @param {integer} idx - index (in Float64 units) of the real part
* @returns {number} CABS1 value
*/
function cabs1At( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` using a complex symmetric matrix to calculate error bounds.
*
* ## Notes
*
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (all multiplications involved in computing an entry have at least one zero multiplicand) are not perturbed.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of `A` is referenced (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {number} alpha - scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function zla_syamv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var symbZero;
	var upper;
	var safe1;
	var temp;
	var sa1;
	var sa2;
	var yiy;
	var av;
	var xv;
	var sx;
	var iy;
	var jx;
	var ia;
	var i;
	var j;

	// Quick return if possible...
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}
	upper = ( uplo === 'upper' );

	// Reinterpret complex arrays as Float64 views and convert strides/offsets...
	av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;

	// Set the safe1 perturbation guard...
	safe1 = ( N + 1 ) * SAFMIN;

	iy = offsetY;
	if ( upper ) {
		// Form y := alpha*|A|*|x| + beta*|y| using the upper triangle of A...
		for ( i = 0; i < N; i++ ) {
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
				jx = offsetX * 2;

				// j = 0..i: access A(j,i) -- upper triangle column i, rows 0..i
				ia = ( offsetA * 2 ) + ( i * sa2 );
				for ( j = 0; j <= i; j++ ) {
					temp = cabs1At( av, ia );
					symbZero = symbZero && ( cabs1At( xv, jx ) === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * cabs1At( xv, jx ) * temp;
					jx += sx;
					ia += sa1;
				}

				// j = i+1..N-1: access A(i,j) -- mirror via symmetry (upper row i, columns i+1..N-1)
				ia = ( offsetA * 2 ) + ( i * sa1 ) + ( ( i + 1 ) * sa2 );
				for ( j = i + 1; j < N; j++ ) {
					temp = cabs1At( av, ia );
					symbZero = symbZero && ( cabs1At( xv, jx ) === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * cabs1At( xv, jx ) * temp;
					jx += sx;
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
		// Form y := alpha*|A|*|x| + beta*|y| using the lower triangle of A...
		for ( i = 0; i < N; i++ ) {
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
				jx = offsetX * 2;

				// j = 0..i: access A(i,j) -- lower triangle row i, columns 0..i
				ia = ( offsetA * 2 ) + ( i * sa1 );
				for ( j = 0; j <= i; j++ ) {
					temp = cabs1At( av, ia );
					symbZero = symbZero && ( cabs1At( xv, jx ) === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * cabs1At( xv, jx ) * temp;
					jx += sx;
					ia += sa2;
				}

				// j = i+1..N-1: access A(j,i) -- mirror via symmetry (lower column i, rows i+1..N-1)
				ia = ( offsetA * 2 ) + ( ( i + 1 ) * sa1 ) + ( i * sa2 );
				for ( j = i + 1; j < N; j++ ) {
					temp = cabs1At( av, ia );
					symbZero = symbZero && ( cabs1At( xv, jx ) === 0.0 || temp === 0.0 );
					y[ iy ] += alpha * cabs1At( xv, jx ) * temp;
					jx += sx;
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

export default zla_syamv;
