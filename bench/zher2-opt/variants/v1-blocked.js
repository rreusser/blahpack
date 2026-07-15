/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform Hermitian rank-2 update:.
* `A := alpha*x*conj(y)^T + conj(alpha)*y*conj(x)^T + A`
* where A is an N-by-N Hermitian matrix and x, y are N-element vectors.
*
* ## Method
*
* The kernel picks whichever traversal of the stored triangle walks A's
* smaller-stride dimension in the inner loop and register-blocks the other
* dimension four wide:
*
* -   **column form** (four columns per pass, hoisting both per-column
*     temporaries `alpha*conj(y[j+k])` and `conj(alpha)*conj(x[j+k])`) when
*     the first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisting the row operands `x[i+k]`,
*     `y[i+k]`) otherwise.
*
* Each `A[i,j]` receives exactly the reference two-term fused update
* `x[i]*temp1 + y[i]*temp2` (`temp1 = alpha*conj(y[j])`,
* `temp2 = conj(alpha)*conj(x[j])`) in the reference evaluation order, and the
* reference `x[j] !== 0 || y[j] !== 0` column guard is preserved, so the kernel
* is verified bit-identically against the reference variant
* (`bench/zher2-opt/check.mjs`).
*
* The diagonal is real by construction: the reference stores the real part of
* `x[j]*temp1 + y[j]*temp2` and zeros the imaginary part unconditionally (even
* for a zero column). This kernel reproduces that exactly — every stored
* diagonal has its imaginary part written to `0.0`, and its real part receives
* the reference update only when the column pivot is nonzero. Only the stored
* triangle is read or written.
*
* @private
* @param {string} uplo - specifies whether the upper ('upper') or lower ('lower') triangle is stored
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128Array} y - complex input vector
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @param {Complex128Array} A - Hermitian matrix (updated in place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @returns {Complex128Array} `A`
*/
function zher2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var upper;
	var alphaR;
	var alphaI;
	var base;
	var sa1;
	var sa2;
	var Av;
	var xv;
	var yv;
	var oA;
	var oX;
	var oY;
	var sx;
	var sy;
	var n4;
	var nz0;
	var nz1;
	var nz2;
	var nz3;
	var x0r;
	var x0i;
	var x1r;
	var x1i;
	var x2r;
	var x2i;
	var x3r;
	var x3i;
	var y0r;
	var y0i;
	var y1r;
	var y1i;
	var y2r;
	var y2i;
	var y3r;
	var y3i;
	var t1r0;
	var t1i0;
	var t1r1;
	var t1i1;
	var t1r2;
	var t1i2;
	var t1r3;
	var t1i3;
	var t2r0;
	var t2i0;
	var t2r1;
	var t2i1;
	var t2r2;
	var t2i2;
	var t2r3;
	var t2i3;
	var t1r;
	var t1i;
	var t2r;
	var t2i;
	var xr;
	var xi;
	var yr;
	var yi;
	var a0;
	var a1;
	var a2;
	var a3;
	var ac;
	var jx;
	var jy;
	var ix;
	var iy;
	var d;
	var i;
	var j;
	var c;

	if ( N === 0 ) {
		return A;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );

	// Quick return if alpha is zero:
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return A;
	}

	upper = ( uplo === 'upper' );
	Av = reinterpret( A, 0 );
	xv = reinterpret( x, 0 );
	yv = reinterpret( y, 0 );

	oA = offsetA * 2;
	oX = offsetX * 2;
	oY = offsetY * 2;
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sx = strideX * 2;
	sy = strideY * 2;
	n4 = N - ( N % 4 );

	if ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) {
		// Column form: inner loop over rows (stride `sa1`), four columns per pass.
		jx = oX;
		jy = oY;
		for ( j = 0; j < n4; j += 4 ) {
			x0r = xv[ jx ];
			x0i = xv[ jx + 1 ];
			x1r = xv[ jx + sx ];
			x1i = xv[ jx + sx + 1 ];
			x2r = xv[ jx + ( 2 * sx ) ];
			x2i = xv[ jx + ( 2 * sx ) + 1 ];
			x3r = xv[ jx + ( 3 * sx ) ];
			x3i = xv[ jx + ( 3 * sx ) + 1 ];
			y0r = yv[ jy ];
			y0i = yv[ jy + 1 ];
			y1r = yv[ jy + sy ];
			y1i = yv[ jy + sy + 1 ];
			y2r = yv[ jy + ( 2 * sy ) ];
			y2i = yv[ jy + ( 2 * sy ) + 1 ];
			y3r = yv[ jy + ( 3 * sy ) ];
			y3i = yv[ jy + ( 3 * sy ) + 1 ];
			nz0 = ( x0r !== 0.0 || x0i !== 0.0 || y0r !== 0.0 || y0i !== 0.0 );
			nz1 = ( x1r !== 0.0 || x1i !== 0.0 || y1r !== 0.0 || y1i !== 0.0 );
			nz2 = ( x2r !== 0.0 || x2i !== 0.0 || y2r !== 0.0 || y2i !== 0.0 );
			nz3 = ( x3r !== 0.0 || x3i !== 0.0 || y3r !== 0.0 || y3i !== 0.0 );
			if ( nz0 && nz1 && nz2 && nz3 ) {
				// temp1_k = alpha * conj(y[j+k]); temp2_k = conj(alpha) * conj(x[j+k])
				t1r0 = ( alphaR * y0r ) + ( alphaI * y0i );
				t1i0 = -( alphaR * y0i ) + ( alphaI * y0r );
				t2r0 = ( alphaR * x0r ) - ( alphaI * x0i );
				t2i0 = -( ( alphaR * x0i ) + ( alphaI * x0r ) );
				t1r1 = ( alphaR * y1r ) + ( alphaI * y1i );
				t1i1 = -( alphaR * y1i ) + ( alphaI * y1r );
				t2r1 = ( alphaR * x1r ) - ( alphaI * x1i );
				t2i1 = -( ( alphaR * x1i ) + ( alphaI * x1r ) );
				t1r2 = ( alphaR * y2r ) + ( alphaI * y2i );
				t1i2 = -( alphaR * y2i ) + ( alphaI * y2r );
				t2r2 = ( alphaR * x2r ) - ( alphaI * x2i );
				t2i2 = -( ( alphaR * x2i ) + ( alphaI * x2r ) );
				t1r3 = ( alphaR * y3r ) + ( alphaI * y3i );
				t1i3 = -( alphaR * y3i ) + ( alphaI * y3r );
				t2r3 = ( alphaR * x3r ) - ( alphaI * x3i );
				t2i3 = -( ( alphaR * x3i ) + ( alphaI * x3r ) );
				if ( upper ) {
					// Rectangular bulk: rows 0..j-1 (off-diagonal for all four columns)
					a0 = oA + ( j * sa2 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = oX;
					iy = oY;
					for ( i = 0; i < j; i++ ) {
						xr = xv[ ix ];
						xi = xv[ ix + 1 ];
						yr = yv[ iy ];
						yi = yv[ iy + 1 ];
						Av[ a0 ] += ( ( xr * t1r0 ) - ( xi * t1i0 ) ) + ( ( yr * t2r0 ) - ( yi * t2i0 ) );
						Av[ a0 + 1 ] += ( ( xr * t1i0 ) + ( xi * t1r0 ) ) + ( ( yr * t2i0 ) + ( yi * t2r0 ) );
						Av[ a1 ] += ( ( xr * t1r1 ) - ( xi * t1i1 ) ) + ( ( yr * t2r1 ) - ( yi * t2i1 ) );
						Av[ a1 + 1 ] += ( ( xr * t1i1 ) + ( xi * t1r1 ) ) + ( ( yr * t2i1 ) + ( yi * t2r1 ) );
						Av[ a2 ] += ( ( xr * t1r2 ) - ( xi * t1i2 ) ) + ( ( yr * t2r2 ) - ( yi * t2i2 ) );
						Av[ a2 + 1 ] += ( ( xr * t1i2 ) + ( xi * t1r2 ) ) + ( ( yr * t2i2 ) + ( yi * t2r2 ) );
						Av[ a3 ] += ( ( xr * t1r3 ) - ( xi * t1i3 ) ) + ( ( yr * t2r3 ) - ( yi * t2i3 ) );
						Av[ a3 + 1 ] += ( ( xr * t1i3 ) + ( xi * t1r3 ) ) + ( ( yr * t2i3 ) + ( yi * t2r3 ) );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
						iy += sy;
					}
					// Upper 4x4 diagonal corner (rows j..j+3, cols j..j+3):
					base = oA + ( j * sa1 ) + ( j * sa2 );
					// col j: diagonal (j,j)
					Av[ base ] += ( ( x0r * t1r0 ) - ( x0i * t1i0 ) ) + ( ( y0r * t2r0 ) - ( y0i * t2i0 ) );
					Av[ base + 1 ] = 0.0;
					// col j+1: (j,j+1) then diagonal (j+1,j+1)
					ac = base + sa2;
					Av[ ac ] += ( ( x0r * t1r1 ) - ( x0i * t1i1 ) ) + ( ( y0r * t2r1 ) - ( y0i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i1 ) + ( x0i * t1r1 ) ) + ( ( y0r * t2i1 ) + ( y0i * t2r1 ) );
					d = ac + sa1;
					Av[ d ] += ( ( x1r * t1r1 ) - ( x1i * t1i1 ) ) + ( ( y1r * t2r1 ) - ( y1i * t2i1 ) );
					Av[ d + 1 ] = 0.0;
					// col j+2: (j,j+2),(j+1,j+2) then diagonal (j+2,j+2)
					ac = base + ( 2 * sa2 );
					Av[ ac ] += ( ( x0r * t1r2 ) - ( x0i * t1i2 ) ) + ( ( y0r * t2r2 ) - ( y0i * t2i2 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i2 ) + ( x0i * t1r2 ) ) + ( ( y0r * t2i2 ) + ( y0i * t2r2 ) );
					ac += sa1;
					Av[ ac ] += ( ( x1r * t1r2 ) - ( x1i * t1i2 ) ) + ( ( y1r * t2r2 ) - ( y1i * t2i2 ) );
					Av[ ac + 1 ] += ( ( x1r * t1i2 ) + ( x1i * t1r2 ) ) + ( ( y1r * t2i2 ) + ( y1i * t2r2 ) );
					d = ac + sa1;
					Av[ d ] += ( ( x2r * t1r2 ) - ( x2i * t1i2 ) ) + ( ( y2r * t2r2 ) - ( y2i * t2i2 ) );
					Av[ d + 1 ] = 0.0;
					// col j+3: (j,j+3),(j+1,j+3),(j+2,j+3) then diagonal (j+3,j+3)
					ac = base + ( 3 * sa2 );
					Av[ ac ] += ( ( x0r * t1r3 ) - ( x0i * t1i3 ) ) + ( ( y0r * t2r3 ) - ( y0i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i3 ) + ( x0i * t1r3 ) ) + ( ( y0r * t2i3 ) + ( y0i * t2r3 ) );
					ac += sa1;
					Av[ ac ] += ( ( x1r * t1r3 ) - ( x1i * t1i3 ) ) + ( ( y1r * t2r3 ) - ( y1i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x1r * t1i3 ) + ( x1i * t1r3 ) ) + ( ( y1r * t2i3 ) + ( y1i * t2r3 ) );
					ac += sa1;
					Av[ ac ] += ( ( x2r * t1r3 ) - ( x2i * t1i3 ) ) + ( ( y2r * t2r3 ) - ( y2i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i3 ) + ( x2i * t1r3 ) ) + ( ( y2r * t2i3 ) + ( y2i * t2r3 ) );
					d = ac + sa1;
					Av[ d ] += ( ( x3r * t1r3 ) - ( x3i * t1i3 ) ) + ( ( y3r * t2r3 ) - ( y3i * t2i3 ) );
					Av[ d + 1 ] = 0.0;
				} else {
					// Lower 4x4 diagonal corner (rows j..j+3, cols j..j+3):
					base = oA + ( j * sa1 ) + ( j * sa2 );
					// col j: diagonal (j,j) then (j+1,j),(j+2,j),(j+3,j)
					Av[ base ] += ( ( x0r * t1r0 ) - ( x0i * t1i0 ) ) + ( ( y0r * t2r0 ) - ( y0i * t2i0 ) );
					Av[ base + 1 ] = 0.0;
					ac = base + sa1;
					Av[ ac ] += ( ( x1r * t1r0 ) - ( x1i * t1i0 ) ) + ( ( y1r * t2r0 ) - ( y1i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x1r * t1i0 ) + ( x1i * t1r0 ) ) + ( ( y1r * t2i0 ) + ( y1i * t2r0 ) );
					ac += sa1;
					Av[ ac ] += ( ( x2r * t1r0 ) - ( x2i * t1i0 ) ) + ( ( y2r * t2r0 ) - ( y2i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i0 ) + ( x2i * t1r0 ) ) + ( ( y2r * t2i0 ) + ( y2i * t2r0 ) );
					ac += sa1;
					Av[ ac ] += ( ( x3r * t1r0 ) - ( x3i * t1i0 ) ) + ( ( y3r * t2r0 ) - ( y3i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i0 ) + ( x3i * t1r0 ) ) + ( ( y3r * t2i0 ) + ( y3i * t2r0 ) );
					// col j+1: diagonal (j+1,j+1) then (j+2,j+1),(j+3,j+1)
					d = base + sa2 + sa1;
					Av[ d ] += ( ( x1r * t1r1 ) - ( x1i * t1i1 ) ) + ( ( y1r * t2r1 ) - ( y1i * t2i1 ) );
					Av[ d + 1 ] = 0.0;
					ac = d + sa1;
					Av[ ac ] += ( ( x2r * t1r1 ) - ( x2i * t1i1 ) ) + ( ( y2r * t2r1 ) - ( y2i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i1 ) + ( x2i * t1r1 ) ) + ( ( y2r * t2i1 ) + ( y2i * t2r1 ) );
					ac += sa1;
					Av[ ac ] += ( ( x3r * t1r1 ) - ( x3i * t1i1 ) ) + ( ( y3r * t2r1 ) - ( y3i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i1 ) + ( x3i * t1r1 ) ) + ( ( y3r * t2i1 ) + ( y3i * t2r1 ) );
					// col j+2: diagonal (j+2,j+2) then (j+3,j+2)
					d = base + ( 2 * sa2 ) + ( 2 * sa1 );
					Av[ d ] += ( ( x2r * t1r2 ) - ( x2i * t1i2 ) ) + ( ( y2r * t2r2 ) - ( y2i * t2i2 ) );
					Av[ d + 1 ] = 0.0;
					ac = d + sa1;
					Av[ ac ] += ( ( x3r * t1r2 ) - ( x3i * t1i2 ) ) + ( ( y3r * t2r2 ) - ( y3i * t2i2 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i2 ) + ( x3i * t1r2 ) ) + ( ( y3r * t2i2 ) + ( y3i * t2r2 ) );
					// col j+3: diagonal (j+3,j+3)
					d = base + ( 3 * sa2 ) + ( 3 * sa1 );
					Av[ d ] += ( ( x3r * t1r3 ) - ( x3i * t1i3 ) ) + ( ( y3r * t2r3 ) - ( y3i * t2i3 ) );
					Av[ d + 1 ] = 0.0;
					// Rectangular bulk: rows j+4..N-1 (off-diagonal for all four columns)
					a0 = oA + ( j * sa2 ) + ( ( j + 4 ) * sa1 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = jx + ( 4 * sx );
					iy = jy + ( 4 * sy );
					for ( i = j + 4; i < N; i++ ) {
						xr = xv[ ix ];
						xi = xv[ ix + 1 ];
						yr = yv[ iy ];
						yi = yv[ iy + 1 ];
						Av[ a0 ] += ( ( xr * t1r0 ) - ( xi * t1i0 ) ) + ( ( yr * t2r0 ) - ( yi * t2i0 ) );
						Av[ a0 + 1 ] += ( ( xr * t1i0 ) + ( xi * t1r0 ) ) + ( ( yr * t2i0 ) + ( yi * t2r0 ) );
						Av[ a1 ] += ( ( xr * t1r1 ) - ( xi * t1i1 ) ) + ( ( yr * t2r1 ) - ( yi * t2i1 ) );
						Av[ a1 + 1 ] += ( ( xr * t1i1 ) + ( xi * t1r1 ) ) + ( ( yr * t2i1 ) + ( yi * t2r1 ) );
						Av[ a2 ] += ( ( xr * t1r2 ) - ( xi * t1i2 ) ) + ( ( yr * t2r2 ) - ( yi * t2i2 ) );
						Av[ a2 + 1 ] += ( ( xr * t1i2 ) + ( xi * t1r2 ) ) + ( ( yr * t2i2 ) + ( yi * t2r2 ) );
						Av[ a3 ] += ( ( xr * t1r3 ) - ( xi * t1i3 ) ) + ( ( yr * t2r3 ) - ( yi * t2i3 ) );
						Av[ a3 + 1 ] += ( ( xr * t1i3 ) + ( xi * t1r3 ) ) + ( ( yr * t2i3 ) + ( yi * t2r3 ) );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
						iy += sy;
					}
				}
			} else {
				// One or more zero pivots in the block: reference-style scalar columns
				colScalar( j, j + 4 );
			}
			jx += 4 * sx;
			jy += 4 * sy;
		}
		// Remainder columns: reference-style scalar
		colScalar( n4, N );
	} else {
		// Row form: inner loop over columns (stride `sa2`), four rows per pass.
		ix = oX;
		iy = oY;
		for ( i = 0; i < n4; i += 4 ) {
			x0r = xv[ ix ];
			x0i = xv[ ix + 1 ];
			x1r = xv[ ix + sx ];
			x1i = xv[ ix + sx + 1 ];
			x2r = xv[ ix + ( 2 * sx ) ];
			x2i = xv[ ix + ( 2 * sx ) + 1 ];
			x3r = xv[ ix + ( 3 * sx ) ];
			x3i = xv[ ix + ( 3 * sx ) + 1 ];
			y0r = yv[ iy ];
			y0i = yv[ iy + 1 ];
			y1r = yv[ iy + sy ];
			y1i = yv[ iy + sy + 1 ];
			y2r = yv[ iy + ( 2 * sy ) ];
			y2i = yv[ iy + ( 2 * sy ) + 1 ];
			y3r = yv[ iy + ( 3 * sy ) ];
			y3i = yv[ iy + ( 3 * sy ) + 1 ];
			nz0 = ( x0r !== 0.0 || x0i !== 0.0 || y0r !== 0.0 || y0i !== 0.0 );
			nz1 = ( x1r !== 0.0 || x1i !== 0.0 || y1r !== 0.0 || y1i !== 0.0 );
			nz2 = ( x2r !== 0.0 || x2i !== 0.0 || y2r !== 0.0 || y2i !== 0.0 );
			nz3 = ( x3r !== 0.0 || x3i !== 0.0 || y3r !== 0.0 || y3i !== 0.0 );
			// Per-pivot temps for the diagonal corner (temp of column i+k):
			t1r0 = ( alphaR * y0r ) + ( alphaI * y0i );
			t1i0 = -( alphaR * y0i ) + ( alphaI * y0r );
			t2r0 = ( alphaR * x0r ) - ( alphaI * x0i );
			t2i0 = -( ( alphaR * x0i ) + ( alphaI * x0r ) );
			t1r1 = ( alphaR * y1r ) + ( alphaI * y1i );
			t1i1 = -( alphaR * y1i ) + ( alphaI * y1r );
			t2r1 = ( alphaR * x1r ) - ( alphaI * x1i );
			t2i1 = -( ( alphaR * x1i ) + ( alphaI * x1r ) );
			t1r2 = ( alphaR * y2r ) + ( alphaI * y2i );
			t1i2 = -( alphaR * y2i ) + ( alphaI * y2r );
			t2r2 = ( alphaR * x2r ) - ( alphaI * x2i );
			t2i2 = -( ( alphaR * x2i ) + ( alphaI * x2r ) );
			t1r3 = ( alphaR * y3r ) + ( alphaI * y3i );
			t1i3 = -( alphaR * y3i ) + ( alphaI * y3r );
			t2r3 = ( alphaR * x3r ) - ( alphaI * x3i );
			t2i3 = -( ( alphaR * x3i ) + ( alphaI * x3r ) );
			base = oA + ( i * sa1 ) + ( i * sa2 );
			if ( upper ) {
				// Upper 4x4 diagonal corner (rows i..i+3, cols i..i+3):
				// col i: diagonal (i,i)
				Av[ base + 1 ] = 0.0;
				if ( nz0 ) {
					Av[ base ] += ( ( x0r * t1r0 ) - ( x0i * t1i0 ) ) + ( ( y0r * t2r0 ) - ( y0i * t2i0 ) );
				}
				// col i+1: (i,i+1) then diagonal (i+1,i+1)
				ac = base + sa2;
				if ( nz1 ) {
					Av[ ac ] += ( ( x0r * t1r1 ) - ( x0i * t1i1 ) ) + ( ( y0r * t2r1 ) - ( y0i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i1 ) + ( x0i * t1r1 ) ) + ( ( y0r * t2i1 ) + ( y0i * t2r1 ) );
				}
				d = ac + sa1;
				Av[ d + 1 ] = 0.0;
				if ( nz1 ) {
					Av[ d ] += ( ( x1r * t1r1 ) - ( x1i * t1i1 ) ) + ( ( y1r * t2r1 ) - ( y1i * t2i1 ) );
				}
				// col i+2: (i,i+2),(i+1,i+2) then diagonal (i+2,i+2)
				ac = base + ( 2 * sa2 );
				if ( nz2 ) {
					Av[ ac ] += ( ( x0r * t1r2 ) - ( x0i * t1i2 ) ) + ( ( y0r * t2r2 ) - ( y0i * t2i2 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i2 ) + ( x0i * t1r2 ) ) + ( ( y0r * t2i2 ) + ( y0i * t2r2 ) );
					d = ac + sa1;
					Av[ d ] += ( ( x1r * t1r2 ) - ( x1i * t1i2 ) ) + ( ( y1r * t2r2 ) - ( y1i * t2i2 ) );
					Av[ d + 1 ] += ( ( x1r * t1i2 ) + ( x1i * t1r2 ) ) + ( ( y1r * t2i2 ) + ( y1i * t2r2 ) );
				}
				d = base + ( 2 * sa2 ) + ( 2 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz2 ) {
					Av[ d ] += ( ( x2r * t1r2 ) - ( x2i * t1i2 ) ) + ( ( y2r * t2r2 ) - ( y2i * t2i2 ) );
				}
				// col i+3: (i,i+3),(i+1,i+3),(i+2,i+3) then diagonal (i+3,i+3)
				ac = base + ( 3 * sa2 );
				if ( nz3 ) {
					Av[ ac ] += ( ( x0r * t1r3 ) - ( x0i * t1i3 ) ) + ( ( y0r * t2r3 ) - ( y0i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x0r * t1i3 ) + ( x0i * t1r3 ) ) + ( ( y0r * t2i3 ) + ( y0i * t2r3 ) );
					ac += sa1;
					Av[ ac ] += ( ( x1r * t1r3 ) - ( x1i * t1i3 ) ) + ( ( y1r * t2r3 ) - ( y1i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x1r * t1i3 ) + ( x1i * t1r3 ) ) + ( ( y1r * t2i3 ) + ( y1i * t2r3 ) );
					ac += sa1;
					Av[ ac ] += ( ( x2r * t1r3 ) - ( x2i * t1i3 ) ) + ( ( y2r * t2r3 ) - ( y2i * t2i3 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i3 ) + ( x2i * t1r3 ) ) + ( ( y2r * t2i3 ) + ( y2i * t2r3 ) );
				}
				d = base + ( 3 * sa2 ) + ( 3 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz3 ) {
					Av[ d ] += ( ( x3r * t1r3 ) - ( x3i * t1i3 ) ) + ( ( y3r * t2r3 ) - ( y3i * t2i3 ) );
				}
				// Rectangular bulk: cols i+4..N-1 (off-diagonal for all four rows)
				a0 = oA + ( i * sa1 ) + ( ( i + 4 ) * sa2 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = ix + ( 4 * sx );
				jy = iy + ( 4 * sy );
				for ( c = i + 4; c < N; c++ ) {
					xr = xv[ jx ];
					xi = xv[ jx + 1 ];
					yr = yv[ jy ];
					yi = yv[ jy + 1 ];
					if ( xr !== 0.0 || xi !== 0.0 || yr !== 0.0 || yi !== 0.0 ) {
						t1r = ( alphaR * yr ) + ( alphaI * yi );
						t1i = -( alphaR * yi ) + ( alphaI * yr );
						t2r = ( alphaR * xr ) - ( alphaI * xi );
						t2i = -( ( alphaR * xi ) + ( alphaI * xr ) );
						Av[ a0 ] += ( ( x0r * t1r ) - ( x0i * t1i ) ) + ( ( y0r * t2r ) - ( y0i * t2i ) );
						Av[ a0 + 1 ] += ( ( x0r * t1i ) + ( x0i * t1r ) ) + ( ( y0r * t2i ) + ( y0i * t2r ) );
						Av[ a1 ] += ( ( x1r * t1r ) - ( x1i * t1i ) ) + ( ( y1r * t2r ) - ( y1i * t2i ) );
						Av[ a1 + 1 ] += ( ( x1r * t1i ) + ( x1i * t1r ) ) + ( ( y1r * t2i ) + ( y1i * t2r ) );
						Av[ a2 ] += ( ( x2r * t1r ) - ( x2i * t1i ) ) + ( ( y2r * t2r ) - ( y2i * t2i ) );
						Av[ a2 + 1 ] += ( ( x2r * t1i ) + ( x2i * t1r ) ) + ( ( y2r * t2i ) + ( y2i * t2r ) );
						Av[ a3 ] += ( ( x3r * t1r ) - ( x3i * t1i ) ) + ( ( y3r * t2r ) - ( y3i * t2i ) );
						Av[ a3 + 1 ] += ( ( x3r * t1i ) + ( x3i * t1r ) ) + ( ( y3r * t2i ) + ( y3i * t2r ) );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
					jy += sy;
				}
			} else {
				// Rectangular bulk: cols 0..i-1 (off-diagonal for all four rows)
				a0 = oA + ( i * sa1 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = oX;
				jy = oY;
				for ( c = 0; c < i; c++ ) {
					xr = xv[ jx ];
					xi = xv[ jx + 1 ];
					yr = yv[ jy ];
					yi = yv[ jy + 1 ];
					if ( xr !== 0.0 || xi !== 0.0 || yr !== 0.0 || yi !== 0.0 ) {
						t1r = ( alphaR * yr ) + ( alphaI * yi );
						t1i = -( alphaR * yi ) + ( alphaI * yr );
						t2r = ( alphaR * xr ) - ( alphaI * xi );
						t2i = -( ( alphaR * xi ) + ( alphaI * xr ) );
						Av[ a0 ] += ( ( x0r * t1r ) - ( x0i * t1i ) ) + ( ( y0r * t2r ) - ( y0i * t2i ) );
						Av[ a0 + 1 ] += ( ( x0r * t1i ) + ( x0i * t1r ) ) + ( ( y0r * t2i ) + ( y0i * t2r ) );
						Av[ a1 ] += ( ( x1r * t1r ) - ( x1i * t1i ) ) + ( ( y1r * t2r ) - ( y1i * t2i ) );
						Av[ a1 + 1 ] += ( ( x1r * t1i ) + ( x1i * t1r ) ) + ( ( y1r * t2i ) + ( y1i * t2r ) );
						Av[ a2 ] += ( ( x2r * t1r ) - ( x2i * t1i ) ) + ( ( y2r * t2r ) - ( y2i * t2i ) );
						Av[ a2 + 1 ] += ( ( x2r * t1i ) + ( x2i * t1r ) ) + ( ( y2r * t2i ) + ( y2i * t2r ) );
						Av[ a3 ] += ( ( x3r * t1r ) - ( x3i * t1i ) ) + ( ( y3r * t2r ) - ( y3i * t2i ) );
						Av[ a3 + 1 ] += ( ( x3r * t1i ) + ( x3i * t1r ) ) + ( ( y3r * t2i ) + ( y3i * t2r ) );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
					jy += sy;
				}
				// Lower 4x4 diagonal corner (rows i..i+3, cols i..i+3):
				// col i: diagonal (i,i) then (i+1,i),(i+2,i),(i+3,i)
				Av[ base + 1 ] = 0.0;
				if ( nz0 ) {
					Av[ base ] += ( ( x0r * t1r0 ) - ( x0i * t1i0 ) ) + ( ( y0r * t2r0 ) - ( y0i * t2i0 ) );
					ac = base + sa1;
					Av[ ac ] += ( ( x1r * t1r0 ) - ( x1i * t1i0 ) ) + ( ( y1r * t2r0 ) - ( y1i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x1r * t1i0 ) + ( x1i * t1r0 ) ) + ( ( y1r * t2i0 ) + ( y1i * t2r0 ) );
					ac += sa1;
					Av[ ac ] += ( ( x2r * t1r0 ) - ( x2i * t1i0 ) ) + ( ( y2r * t2r0 ) - ( y2i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i0 ) + ( x2i * t1r0 ) ) + ( ( y2r * t2i0 ) + ( y2i * t2r0 ) );
					ac += sa1;
					Av[ ac ] += ( ( x3r * t1r0 ) - ( x3i * t1i0 ) ) + ( ( y3r * t2r0 ) - ( y3i * t2i0 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i0 ) + ( x3i * t1r0 ) ) + ( ( y3r * t2i0 ) + ( y3i * t2r0 ) );
				}
				// col i+1: diagonal (i+1,i+1) then (i+2,i+1),(i+3,i+1)
				d = base + sa2 + sa1;
				Av[ d + 1 ] = 0.0;
				if ( nz1 ) {
					Av[ d ] += ( ( x1r * t1r1 ) - ( x1i * t1i1 ) ) + ( ( y1r * t2r1 ) - ( y1i * t2i1 ) );
					ac = d + sa1;
					Av[ ac ] += ( ( x2r * t1r1 ) - ( x2i * t1i1 ) ) + ( ( y2r * t2r1 ) - ( y2i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x2r * t1i1 ) + ( x2i * t1r1 ) ) + ( ( y2r * t2i1 ) + ( y2i * t2r1 ) );
					ac += sa1;
					Av[ ac ] += ( ( x3r * t1r1 ) - ( x3i * t1i1 ) ) + ( ( y3r * t2r1 ) - ( y3i * t2i1 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i1 ) + ( x3i * t1r1 ) ) + ( ( y3r * t2i1 ) + ( y3i * t2r1 ) );
				}
				// col i+2: diagonal (i+2,i+2) then (i+3,i+2)
				d = base + ( 2 * sa2 ) + ( 2 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz2 ) {
					Av[ d ] += ( ( x2r * t1r2 ) - ( x2i * t1i2 ) ) + ( ( y2r * t2r2 ) - ( y2i * t2i2 ) );
					ac = d + sa1;
					Av[ ac ] += ( ( x3r * t1r2 ) - ( x3i * t1i2 ) ) + ( ( y3r * t2r2 ) - ( y3i * t2i2 ) );
					Av[ ac + 1 ] += ( ( x3r * t1i2 ) + ( x3i * t1r2 ) ) + ( ( y3r * t2i2 ) + ( y3i * t2r2 ) );
				}
				// col i+3: diagonal (i+3,i+3)
				d = base + ( 3 * sa2 ) + ( 3 * sa1 );
				Av[ d + 1 ] = 0.0;
				if ( nz3 ) {
					Av[ d ] += ( ( x3r * t1r3 ) - ( x3i * t1i3 ) ) + ( ( y3r * t2r3 ) - ( y3i * t2i3 ) );
				}
			}
			ix += 4 * sx;
			iy += 4 * sy;
		}
		// Remainder rows: reference-style scalar (row-oriented, one row at a time)
		rowScalar( n4, N );
	}
	return A;

	/**
	* Reference-style scalar update over a range of columns (column form).
	*
	* @private
	* @param {integer} lo - first column
	* @param {integer} hi - one past the last column
	*/
	function colScalar( lo, hi ) {
		var jjx;
		var jjy;
		var cxr;
		var cxi;
		var cyr;
		var cyi;
		var s1r;
		var s1i;
		var s2r;
		var s2i;
		var kk;
		var aii;
		var iix;
		var iiy;
		var rr;

		jjx = oX + ( lo * sx );
		jjy = oY + ( lo * sy );
		for ( kk = lo; kk < hi; kk++ ) {
			cxr = xv[ jjx ];
			cxi = xv[ jjx + 1 ];
			cyr = yv[ jjy ];
			cyi = yv[ jjy + 1 ];
			if ( cxr !== 0.0 || cxi !== 0.0 || cyr !== 0.0 || cyi !== 0.0 ) {
				s1r = ( alphaR * cyr ) + ( alphaI * cyi );
				s1i = -( alphaR * cyi ) + ( alphaI * cyr );
				s2r = ( alphaR * cxr ) - ( alphaI * cxi );
				s2i = -( ( alphaR * cxi ) + ( alphaI * cxr ) );
				if ( upper ) {
					iix = oX;
					iiy = oY;
					aii = oA + ( kk * sa2 );
					for ( rr = 0; rr < kk; rr++ ) {
						Av[ aii ] += ( ( xv[ iix ] * s1r ) - ( xv[ iix + 1 ] * s1i ) ) + ( ( yv[ iiy ] * s2r ) - ( yv[ iiy + 1 ] * s2i ) );
						Av[ aii + 1 ] += ( ( xv[ iix ] * s1i ) + ( xv[ iix + 1 ] * s1r ) ) + ( ( yv[ iiy ] * s2i ) + ( yv[ iiy + 1 ] * s2r ) );
						iix += sx;
						iiy += sy;
						aii += sa1;
					}
					Av[ aii ] += ( ( cxr * s1r ) - ( cxi * s1i ) ) + ( ( cyr * s2r ) - ( cyi * s2i ) );
					Av[ aii + 1 ] = 0.0;
				} else {
					aii = oA + ( kk * sa1 ) + ( kk * sa2 );
					Av[ aii ] += ( ( cxr * s1r ) - ( cxi * s1i ) ) + ( ( cyr * s2r ) - ( cyi * s2i ) );
					Av[ aii + 1 ] = 0.0;
					iix = jjx + sx;
					iiy = jjy + sy;
					aii += sa1;
					for ( rr = kk + 1; rr < N; rr++ ) {
						Av[ aii ] += ( ( xv[ iix ] * s1r ) - ( xv[ iix + 1 ] * s1i ) ) + ( ( yv[ iiy ] * s2r ) - ( yv[ iiy + 1 ] * s2i ) );
						Av[ aii + 1 ] += ( ( xv[ iix ] * s1i ) + ( xv[ iix + 1 ] * s1r ) ) + ( ( yv[ iiy ] * s2i ) + ( yv[ iiy + 1 ] * s2r ) );
						iix += sx;
						iiy += sy;
						aii += sa1;
					}
				}
			} else {
				aii = oA + ( kk * sa1 ) + ( kk * sa2 );
				Av[ aii + 1 ] = 0.0;
			}
			jjx += sx;
			jjy += sy;
		}
	}

	/**
	* Reference-style scalar update over a range of rows (row form).
	*
	* @private
	* @param {integer} lo - first row
	* @param {integer} hi - one past the last row
	*/
	function rowScalar( lo, hi ) {
		var iix;
		var iiy;
		var jjx;
		var jjy;
		var pxr;
		var pxi;
		var pyr;
		var pyi;
		var cxr;
		var cxi;
		var cyr;
		var cyi;
		var s1r;
		var s1i;
		var s2r;
		var s2i;
		var aii;
		var dd;
		var rr;
		var cc;

		iix = oX + ( lo * sx );
		iiy = oY + ( lo * sy );
		for ( rr = lo; rr < hi; rr++ ) {
			pxr = xv[ iix ];
			pxi = xv[ iix + 1 ];
			pyr = yv[ iiy ];
			pyi = yv[ iiy + 1 ];
			dd = oA + ( rr * sa1 ) + ( rr * sa2 );
			if ( upper ) {
				// diagonal (rr,rr)
				Av[ dd + 1 ] = 0.0;
				if ( pxr !== 0.0 || pxi !== 0.0 || pyr !== 0.0 || pyi !== 0.0 ) {
					s1r = ( alphaR * pyr ) + ( alphaI * pyi );
					s1i = -( alphaR * pyi ) + ( alphaI * pyr );
					s2r = ( alphaR * pxr ) - ( alphaI * pxi );
					s2i = -( ( alphaR * pxi ) + ( alphaI * pxr ) );
					Av[ dd ] += ( ( pxr * s1r ) - ( pxi * s1i ) ) + ( ( pyr * s2r ) - ( pyi * s2i ) );
				}
				// off-diagonal cols rr+1..N-1
				aii = dd + sa2;
				jjx = iix + sx;
				jjy = iiy + sy;
				for ( cc = rr + 1; cc < N; cc++ ) {
					cxr = xv[ jjx ];
					cxi = xv[ jjx + 1 ];
					cyr = yv[ jjy ];
					cyi = yv[ jjy + 1 ];
					if ( cxr !== 0.0 || cxi !== 0.0 || cyr !== 0.0 || cyi !== 0.0 ) {
						s1r = ( alphaR * cyr ) + ( alphaI * cyi );
						s1i = -( alphaR * cyi ) + ( alphaI * cyr );
						s2r = ( alphaR * cxr ) - ( alphaI * cxi );
						s2i = -( ( alphaR * cxi ) + ( alphaI * cxr ) );
						Av[ aii ] += ( ( pxr * s1r ) - ( pxi * s1i ) ) + ( ( pyr * s2r ) - ( pyi * s2i ) );
						Av[ aii + 1 ] += ( ( pxr * s1i ) + ( pxi * s1r ) ) + ( ( pyr * s2i ) + ( pyi * s2r ) );
					}
					aii += sa2;
					jjx += sx;
					jjy += sy;
				}
			} else {
				// off-diagonal cols 0..rr-1
				aii = oA + ( rr * sa1 );
				jjx = oX;
				jjy = oY;
				for ( cc = 0; cc < rr; cc++ ) {
					cxr = xv[ jjx ];
					cxi = xv[ jjx + 1 ];
					cyr = yv[ jjy ];
					cyi = yv[ jjy + 1 ];
					if ( cxr !== 0.0 || cxi !== 0.0 || cyr !== 0.0 || cyi !== 0.0 ) {
						s1r = ( alphaR * cyr ) + ( alphaI * cyi );
						s1i = -( alphaR * cyi ) + ( alphaI * cyr );
						s2r = ( alphaR * cxr ) - ( alphaI * cxi );
						s2i = -( ( alphaR * cxi ) + ( alphaI * cxr ) );
						Av[ aii ] += ( ( pxr * s1r ) - ( pxi * s1i ) ) + ( ( pyr * s2r ) - ( pyi * s2i ) );
						Av[ aii + 1 ] += ( ( pxr * s1i ) + ( pxi * s1r ) ) + ( ( pyr * s2i ) + ( pyi * s2r ) );
					}
					aii += sa2;
					jjx += sx;
					jjy += sy;
				}
				// diagonal (rr,rr)
				Av[ dd + 1 ] = 0.0;
				if ( pxr !== 0.0 || pxi !== 0.0 || pyr !== 0.0 || pyi !== 0.0 ) {
					s1r = ( alphaR * pyr ) + ( alphaI * pyi );
					s1i = -( alphaR * pyi ) + ( alphaI * pyr );
					s2r = ( alphaR * pxr ) - ( alphaI * pxi );
					s2i = -( ( alphaR * pxi ) + ( alphaI * pxr ) );
					Av[ dd ] += ( ( pxr * s1r ) - ( pxi * s1i ) ) + ( ( pyr * s2r ) - ( pyi * s2i ) );
				}
			}
			iix += sx;
			iiy += sy;
		}
	}
}


// EXPORTS //

export default zher2;
