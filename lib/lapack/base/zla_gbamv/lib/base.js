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

/* eslint-disable max-len, max-params, max-statements, max-depth, camelcase */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
var abs = Math.abs;


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );


// MAIN //

/**
* Computes a matrix-vector product `y := alpha*|A|*|x| + beta*|y|` (or the transposed variant) using a general complex banded matrix to calculate error bounds.
*
* ## Notes
*
* -   `AB` and `x` are complex (`Complex128Array`); `y` is real (`Float64Array`).
* -   Absolute values of complex entries use the `CABS1` norm: `|re| + |im|`. This is not the true modulus; `|conj(z)| = |z|` so `TRANS = 'transpose'` and `TRANS = 'conjugate-transpose'` produce identical results.
* -   Band storage: `AB` has `KL+KU+1` rows by `N` columns, with `AB[ku+i-j, j] = A[i,j]` (0-based).
* -   To protect against underflow during evaluation, components in the resulting vector are perturbed away from zero by `(N+1)` times the underflow threshold. "Symbolically" zero components are not perturbed.
*
* @private
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals of `A`
* @param {NonNegativeInteger} ku - number of super-diagonals of `A`
* @param {number} alpha - scalar constant
* @param {Complex128Array} AB - input banded matrix
* @param {integer} strideAB1 - stride of the first dimension of `AB` (in complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (in complex elements)
* @param {NonNegativeInteger} offsetAB - starting index for `AB` (in complex elements)
* @param {Complex128Array} x - input vector
* @param {integer} strideX - stride length for `x` (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for `x` (in complex elements)
* @param {number} beta - scalar constant
* @param {Float64Array} y - input/output real vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function zla_gbamv( trans, M, N, kl, ku, alpha, AB, strideAB1, strideAB2, offsetAB, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var symbZero;
	var noTrans;
	var safe1;
	var temp;
	var lenx;
	var leny;
	var sab1;
	var sab2;
	var ABv;
	var yiy;
	var jlo;
	var jhi;
	var xv;
	var sx;
	var oA;
	var ox;
	var kx;
	var ky;
	var iy;
	var jx;
	var ia;
	var kd;
	var ke;
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
	ABv = reinterpret( AB, 0 );
	xv = reinterpret( x, 0 );
	sab1 = strideAB1 * 2;
	sab2 = strideAB2 * 2;
	sx = strideX * 2;
	oA = offsetAB * 2;
	ox = offsetX * 2;

	// Compute starting offsets for `x` and `y`, honoring any pre-applied offsets...
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

	// Band "center" offsets (0-based): Fortran KD = KU+1, KE = KL+1 become `ku` and `kl`.
	kd = ku;
	ke = kl;
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
				// Fortran: DO J = MAX(I-KL,1), MIN(I+KU, LENX) (1-based)
				// 0-based: j = max(i-kl,0) .. min(i+ku, lenx-1)
				jlo = max( i - kl, 0 );
				jhi = min( i + ku, lenx - 1 );

				// INCX==1 branch uses X(J); INCX!=1 branch resets JX=KX per row (so x is consumed

				// From the start of the row regardless of the band offset). This split matches the

				// Fortran reference exactly.
				if ( strideX === 1 ) {
					jx = kx + ( jlo * sx );
				} else {
					jx = kx;
				}

				// AB index at (kd+i-j, j) starts at j=jlo, then (row--, col++) each iteration.
				ia = oA + ( ( kd + i - jlo ) * sab1 ) + ( jlo * sab2 );
				for ( j = jlo; j <= jhi; j++ ) {
					// CABS1 of AB[kd+i-j, j]
					temp = abs( ABv[ ia ] ) + abs( ABv[ ia + 1 ] );
					symbZero = symbZero && ( ( xv[ jx ] === 0.0 && xv[ jx + 1 ] === 0.0 ) || temp === 0.0 );
					y[ iy ] += alpha * ( abs( xv[ jx ] ) + abs( xv[ jx + 1 ] ) ) * temp;
					jx += sx;
					ia += sab2 - sab1;
				}
			}
			if ( !symbZero ) {
				yiy = y[ iy ];
				y[ iy ] = yiy + ( ( yiy >= 0.0 ) ? safe1 : -safe1 );
			}
			iy += strideY;
		}
	} else {
		// Form y := alpha*|A^T|*|x| + beta*|y| (|conj(A)|=|A|, so 'transpose' and 'conjugate-transpose' coincide).
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
				jlo = max( i - kl, 0 );
				jhi = min( i + ku, lenx - 1 );
				if ( strideX === 1 ) {
					jx = kx + ( jlo * sx );
				} else {
					jx = kx;
				}

				// AB index at (ke-i+j, i) starts at j=jlo, then row++ each iteration, col fixed at i.
				ia = oA + ( ( ke - i + jlo ) * sab1 ) + ( i * sab2 );
				for ( j = jlo; j <= jhi; j++ ) {
					// CABS1 of AB[ke-i+j, i]
					temp = abs( ABv[ ia ] ) + abs( ABv[ ia + 1 ] );
					symbZero = symbZero && ( ( xv[ jx ] === 0.0 && xv[ jx + 1 ] === 0.0 ) || temp === 0.0 );
					y[ iy ] += alpha * ( abs( xv[ jx ] ) + abs( xv[ jx + 1 ] ) ) * temp;
					jx += sx;
					ia += sab1;
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

export default zla_gbamv;
