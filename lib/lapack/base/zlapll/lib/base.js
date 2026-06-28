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

/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zlarfg from '../../zlarfg/lib/base.js';
import dlas2 from '../../dlas2/lib/base.js';
import cmplx from '../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var tauArr = new Complex128Array( 1 );
var tauv = reinterpret( tauArr, 0 );
var svdOut = new Float64Array( 2 );
var SCRATCH = new Float64Array( 2 );


// MAIN //

/**
* Measures the linear dependence of two vectors X and Y by computing the.
* QR factorization of the N-by-2 matrix `(X Y)` and returning the smallest
* singular value of the resulting 2-by-2 upper triangular R factor.
*
* On exit, X and Y are overwritten.
*
* @private
* @param {NonNegativeInteger} N - length of the vectors
* @param {Complex128Array} x - first complex vector (overwritten)
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} y - second complex vector (overwritten)
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @param {Float64Array} ssmin - output: `ssmin[0]` receives the smallest singular value
*/
function zlapll( N, x, strideX, offsetX, y, strideY, offsetY, ssmin ) {
	var absA11;
	var absA12;
	var absA22;
	var a11R;
	var a11I;
	var a12R;
	var a12I;
	var a22R;
	var a22I;
	var dotR;
	var dotI;
	var dot;
	var xv;
	var yv;
	var cR;
	var cI;
	var ix;
	var iy;
	var sy;
	var c;

	// Quick return if possible
	if ( N <= 1 ) {
		ssmin[ 0 ] = ZERO;
		return;
	}

	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );
	sy = strideY * 2;
	ix = offsetX * 2;
	iy = offsetY * 2;

	// Compute the QR factorization of the N-by-2 matrix ( X Y )

	// First Householder: CALL ZLARFG( N, X(1), X(1+INCX), INCX, TAU )
	zlarfg( N, x, offsetX, x, strideX, offsetX + strideX, tauArr, 0 );

	// A11 = X(1)
	a11R = xv[ ix ];
	a11I = xv[ ix + 1 ];

	// X(1) = CONE = (1, 0)
	xv[ ix ] = 1.0;
	xv[ ix + 1 ] = 0.0;

	// C = -DCONJG(TAU) * ZDOTC(N, X, INCX, Y, INCY)
	dot = zdotc( N, x, strideX, offsetX, y, strideY, offsetY );
	dotR = real( dot );
	dotI = imag( dot );

	// -conj(tau) * dot: conj(tau) = (tauR, -tauI), negate: (-tauR, tauI)

	// c = (-tauR, tauI) * (dotR, dotI)

	// c_real = (-tauR)*dotR - tauI*dotI

	// c_imag = (-tauR)*dotI + tauI*dotR
	cR = (( -tauv[ 0 ] ) * dotR) - (tauv[ 1 ] * dotI);
	cI = (( -tauv[ 0 ] ) * dotI) + (tauv[ 1 ] * dotR);

	c = new Complex128( cR, cI );
	zaxpy( N, c, x, strideX, offsetX, y, strideY, offsetY );

	// Second Householder: CALL ZLARFG( N-1, Y(1+INCY), Y(1+2*INCY), INCY, TAU )
	zlarfg( N - 1, y, offsetY + strideY, y, strideY, offsetY + ( 2 * strideY ), tauArr, 0 );

	// A12 = Y(1)
	a12R = yv[ iy ];
	a12I = yv[ iy + 1 ];

	// A22 = Y(1+INCY)
	a22R = yv[ iy + sy ];
	a22I = yv[ iy + sy + 1 ];

	// Compute the SVD of 2-by-2 upper triangular matrix

	// CALL DLAS2( ABS(A11), ABS(A12), ABS(A22), SSMIN, SSMAX )
	SCRATCH[ 0 ] = a11R;
	SCRATCH[ 1 ] = a11I;
	absA11 = cmplx.absAt( SCRATCH, 0 );
	SCRATCH[ 0 ] = a12R;
	SCRATCH[ 1 ] = a12I;
	absA12 = cmplx.absAt( SCRATCH, 0 );
	SCRATCH[ 0 ] = a22R;
	SCRATCH[ 1 ] = a22I;
	absA22 = cmplx.absAt( SCRATCH, 0 );
	dlas2( absA11, absA12, absA22, svdOut );
	ssmin[ 0 ] = svdOut[ 0 ];
}


// EXPORTS //

export default zlapll;
