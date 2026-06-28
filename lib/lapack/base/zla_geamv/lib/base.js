/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
var abs = Math.abs;


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general complex matrix to calculate error bounds.
*
* ## Notes
*
* -   `A` and `x` are complex (`Complex128Array`), `y` is real (`Float64Array`).
* -   Absolute values of complex entries use the `CABS1` norm: `|re| + |im|`. This is not the true modulus; `|conj(z)| = |z|` so `TRANS = 'transpose'` and `TRANS = 'conjugate-transpose'` produce identical results.
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components (all multiplications involved in computing an entry have at least one zero multiplicand) are not perturbed.
*
* @private
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {number} alpha - scalar constant
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output real vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function zla_geamv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var symbZero;
	var noTrans;
	var safe1;
	var temp;
	var lenx;
	var leny;
	var sa1;
	var sa2;
	var yiy;
	var Av;
	var xv;
	var sx;
	var oA;
	var ox;
	var kx;
	var ky;
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

	// Reinterpret complex arrays as Float64 views with doubled strides/offsets...
	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	oA = offsetA * 2;
	ox = offsetX * 2;

	// Compute starting offsets, honoring any pre-applied offsets in `offsetX`/`offsetY`...
	if ( strideX > 0 ) {
		kx = ox;
	} else {
		kx = ox - ( ( lenx - 1 ) * sx );
	}
	if ( strideY > 0 ) {
		ky = offsetY;
	} else {
		ky = offsetY - ( ( leny - 1 ) * strideY );
	}

	// Set the safe1 perturbation guard...
	safe1 = ( N + 1 ) * SAFMIN;

	iy = ky;
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
				y[ iy ] = beta * abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = kx;
				ia = oA + ( i * sa1 );
				for ( j = 0; j < lenx; j++ ) {
					// CABS1 of A[i,j]
					temp = abs( Av[ ia ] ) + abs( Av[ ia + 1 ] );

					// "Symbolic zero" if every product contributing to this row has a zero operand
					symbZero = symbZero && ( ( xv[ jx ] === 0.0 && xv[ jx + 1 ] === 0.0 ) || temp === 0.0 );

					// y += alpha * CABS1(x[j]) * CABS1(A[i,j])
					y[ iy ] += alpha * ( abs( xv[ jx ] ) + abs( xv[ jx + 1 ] ) ) * temp;
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
		// Form y := alpha*|A^T|*|x| + beta*|y|
		// (|conj(A)| = |A| so 'transpose' and 'conjugate-transpose' coincide.)
		for ( i = 0; i < leny; i++ ) {
			if ( beta === 0.0 ) {
				symbZero = true;
				y[ iy ] = 0.0;
			} else if ( y[ iy ] === 0.0 ) {
				symbZero = true;
			} else {
				symbZero = false;
				y[ iy ] = beta * abs( y[ iy ] );
			}
			if ( alpha !== 0.0 ) {
				jx = kx;
				ia = oA + ( i * sa2 );
				for ( j = 0; j < lenx; j++ ) {
					// CABS1 of A[j,i]
					temp = abs( Av[ ia ] ) + abs( Av[ ia + 1 ] );
					symbZero = symbZero && ( ( xv[ jx ] === 0.0 && xv[ jx + 1 ] === 0.0 ) || temp === 0.0 );
					y[ iy ] += alpha * ( abs( xv[ jx ] ) + abs( xv[ jx + 1 ] ) ) * temp;
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

export default zla_geamv;
