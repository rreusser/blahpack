/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform one of the complex matrix-vector operations:.
* y := alpha*A*x + beta*y,   or   y := alpha*A**T*x + beta*y,   or
* y := alpha*A**H*x + beta*y
*
* ## Method
*
* All three ops are folded into a single layout-adaptive kernel. With
* `B = op(A)` (a `leny`-by-`lenx` logical matrix) the transpose is absorbed
* into a swap of the two logical strides `(sb1, sb2)`, and the conjugate
* (`A**H`) is absorbed by flipping the sign of the imaginary product terms in
* the inner loop — a branch hoisted out of the loop, never a per-element
* multiply. Storage is the interleaved real/imag Float64 view, so every logical
* stride is expressed in doubles (2x the complex stride).
*
* The kernel then picks whichever of two forms walks B's smaller-stride
* dimension in the inner loop and register-blocks the other dimension four
* wide (four complex accumulators = eight live doubles):
*
* -   **dot form** (four rows of B per pass, four independent complex
*     accumulators) when B's second dimension has the smaller stride;
* -   **axpy form** (four columns of B per pass, one fused complex update of
*     `y`) otherwise.
*
* Both forms reorder the summation relative to the reference, so the kernel is
* verified at a backward-error tolerance against the reference variant (see
* `bench/zgemv-opt/`).
*
* @private
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} x - complex input vector
* @param {integer} strideX - stride for x (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for x (in complex elements)
* @param {Complex128} beta - complex scalar
* @param {Complex128Array} y - complex input/output vector
* @param {integer} strideY - stride for y (in complex elements)
* @param {NonNegativeInteger} offsetY - starting index for y (in complex elements)
* @returns {Complex128Array} `y`
*/
function zgemv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var noConj;
	var leny;
	var lenx;
	var sb1;
	var sb2;
	var sx;
	var sy;
	var oA;
	var oX;
	var oY;
	var Av;
	var xv;
	var yv;
	var s0r;
	var s0i;
	var s1r;
	var s1i;
	var s2r;
	var s2i;
	var s3r;
	var s3i;
	var t0r;
	var t0i;
	var t1r;
	var t1i;
	var t2r;
	var t2i;
	var t3r;
	var t3i;
	var b0r;
	var b0i;
	var b1r;
	var b1i;
	var b2r;
	var b2i;
	var b3r;
	var b3i;
	var xr;
	var xi;
	var yr;
	var yi;
	var tR;
	var tI;
	var m4;
	var a0;
	var a1;
	var a2;
	var a3;
	var ix;
	var iy;
	var jx;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return y;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	// Quick return if alpha=0 and beta=1:
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return y;
	}

	// Get Float64Array views and convert offsets to doubles:
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	xv = reinterpret( x, 0 );
	oX = offsetX * 2;
	yv = reinterpret( y, 0 );
	oY = offsetY * 2;

	// Vector strides in complex elements -> doubles:
	sx = strideX * 2;
	sy = strideY * 2;

	// B = op(A) is `leny`-by-`lenx` with logical (double) strides (sb1, sb2);
	// `noConj` is false only for the conjugate-transpose op:
	if ( trans === 'no-transpose' ) {
		leny = M;
		lenx = N;
		sb1 = strideA1 * 2;
		sb2 = strideA2 * 2;
		noConj = true;
	} else {
		leny = N;
		lenx = M;
		sb1 = strideA2 * 2;
		sb2 = strideA1 * 2;
		noConj = ( trans === 'transpose' );
	}

	// First form y := beta*y:
	if ( betaR !== 1.0 || betaI !== 0.0 ) {
		iy = oY;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( i = 0; i < leny; i++ ) {
				yv[ iy ] = 0.0;
				yv[ iy + 1 ] = 0.0;
				iy += sy;
			}
		} else {
			for ( i = 0; i < leny; i++ ) {
				tR = ( betaR * yv[ iy ] ) - ( betaI * yv[ iy + 1 ] );
				tI = ( betaR * yv[ iy + 1 ] ) + ( betaI * yv[ iy ] );
				yv[ iy ] = tR;
				yv[ iy + 1 ] = tI;
				iy += sy;
			}
		}
	}

	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		return y;
	}

	if ( ( sb2 < 0 ? -sb2 : sb2 ) <= ( sb1 < 0 ? -sb1 : sb1 ) ) {
		// Dot form: y[k] += alpha * sum_l B[k,l]*x[l], four rows k per pass.
		m4 = leny - ( leny % 4 );
		iy = oY;
		for ( i = 0; i < m4; i += 4 ) {
			s0r = 0.0;
			s0i = 0.0;
			s1r = 0.0;
			s1i = 0.0;
			s2r = 0.0;
			s2i = 0.0;
			s3r = 0.0;
			s3i = 0.0;
			a0 = oA + ( i * sb1 );
			a1 = a0 + sb1;
			a2 = a1 + sb1;
			a3 = a2 + sb1;
			ix = oX;
			if ( noConj ) {
				for ( j = 0; j < lenx; j++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					s0r += ( b0r * xr ) - ( b0i * xi );
					s0i += ( b0r * xi ) + ( b0i * xr );
					b1r = Av[ a1 ];
					b1i = Av[ a1 + 1 ];
					s1r += ( b1r * xr ) - ( b1i * xi );
					s1i += ( b1r * xi ) + ( b1i * xr );
					b2r = Av[ a2 ];
					b2i = Av[ a2 + 1 ];
					s2r += ( b2r * xr ) - ( b2i * xi );
					s2i += ( b2r * xi ) + ( b2i * xr );
					b3r = Av[ a3 ];
					b3i = Av[ a3 + 1 ];
					s3r += ( b3r * xr ) - ( b3i * xi );
					s3i += ( b3r * xi ) + ( b3i * xr );
					a0 += sb2;
					a1 += sb2;
					a2 += sb2;
					a3 += sb2;
					ix += sx;
				}
			} else {
				// Conjugate: conj(a)*x has imag terms sign-flipped.
				for ( j = 0; j < lenx; j++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					s0r += ( b0r * xr ) + ( b0i * xi );
					s0i += ( b0r * xi ) - ( b0i * xr );
					b1r = Av[ a1 ];
					b1i = Av[ a1 + 1 ];
					s1r += ( b1r * xr ) + ( b1i * xi );
					s1i += ( b1r * xi ) - ( b1i * xr );
					b2r = Av[ a2 ];
					b2i = Av[ a2 + 1 ];
					s2r += ( b2r * xr ) + ( b2i * xi );
					s2i += ( b2r * xi ) - ( b2i * xr );
					b3r = Av[ a3 ];
					b3i = Av[ a3 + 1 ];
					s3r += ( b3r * xr ) + ( b3i * xi );
					s3i += ( b3r * xi ) - ( b3i * xr );
					a0 += sb2;
					a1 += sb2;
					a2 += sb2;
					a3 += sb2;
					ix += sx;
				}
			}
			yv[ iy ] += ( alphaR * s0r ) - ( alphaI * s0i );
			yv[ iy + 1 ] += ( alphaR * s0i ) + ( alphaI * s0r );
			yv[ iy + sy ] += ( alphaR * s1r ) - ( alphaI * s1i );
			yv[ iy + sy + 1 ] += ( alphaR * s1i ) + ( alphaI * s1r );
			yv[ iy + ( 2 * sy ) ] += ( alphaR * s2r ) - ( alphaI * s2i );
			yv[ iy + ( 2 * sy ) + 1 ] += ( alphaR * s2i ) + ( alphaI * s2r );
			yv[ iy + ( 3 * sy ) ] += ( alphaR * s3r ) - ( alphaI * s3i );
			yv[ iy + ( 3 * sy ) + 1 ] += ( alphaR * s3i ) + ( alphaI * s3r );
			iy += 4 * sy;
		}
		for ( ; i < leny; i++ ) {
			s0r = 0.0;
			s0i = 0.0;
			a0 = oA + ( i * sb1 );
			ix = oX;
			if ( noConj ) {
				for ( j = 0; j < lenx; j++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					s0r += ( b0r * xr ) - ( b0i * xi );
					s0i += ( b0r * xi ) + ( b0i * xr );
					a0 += sb2;
					ix += sx;
				}
			} else {
				for ( j = 0; j < lenx; j++ ) {
					xr = xv[ ix ];
					xi = xv[ ix + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					s0r += ( b0r * xr ) + ( b0i * xi );
					s0i += ( b0r * xi ) - ( b0i * xr );
					a0 += sb2;
					ix += sx;
				}
			}
			yv[ iy ] += ( alphaR * s0r ) - ( alphaI * s0i );
			yv[ iy + 1 ] += ( alphaR * s0i ) + ( alphaI * s0r );
			iy += sy;
		}
	} else {
		// Axpy form: y += alpha*x[l]*B[:,l], four columns l per pass.
		m4 = lenx - ( lenx % 4 );
		jx = oX;
		for ( j = 0; j < m4; j += 4 ) {
			xr = xv[ jx ];
			xi = xv[ jx + 1 ];
			t0r = ( alphaR * xr ) - ( alphaI * xi );
			t0i = ( alphaR * xi ) + ( alphaI * xr );
			xr = xv[ jx + sx ];
			xi = xv[ jx + sx + 1 ];
			t1r = ( alphaR * xr ) - ( alphaI * xi );
			t1i = ( alphaR * xi ) + ( alphaI * xr );
			xr = xv[ jx + ( 2 * sx ) ];
			xi = xv[ jx + ( 2 * sx ) + 1 ];
			t2r = ( alphaR * xr ) - ( alphaI * xi );
			t2i = ( alphaR * xi ) + ( alphaI * xr );
			xr = xv[ jx + ( 3 * sx ) ];
			xi = xv[ jx + ( 3 * sx ) + 1 ];
			t3r = ( alphaR * xr ) - ( alphaI * xi );
			t3i = ( alphaR * xi ) + ( alphaI * xr );
			a0 = oA + ( j * sb2 );
			a1 = a0 + sb2;
			a2 = a1 + sb2;
			a3 = a2 + sb2;
			iy = oY;
			if ( noConj ) {
				for ( i = 0; i < leny; i++ ) {
					yr = yv[ iy ];
					yi = yv[ iy + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					yr += ( t0r * b0r ) - ( t0i * b0i );
					yi += ( t0r * b0i ) + ( t0i * b0r );
					b1r = Av[ a1 ];
					b1i = Av[ a1 + 1 ];
					yr += ( t1r * b1r ) - ( t1i * b1i );
					yi += ( t1r * b1i ) + ( t1i * b1r );
					b2r = Av[ a2 ];
					b2i = Av[ a2 + 1 ];
					yr += ( t2r * b2r ) - ( t2i * b2i );
					yi += ( t2r * b2i ) + ( t2i * b2r );
					b3r = Av[ a3 ];
					b3i = Av[ a3 + 1 ];
					yr += ( t3r * b3r ) - ( t3i * b3i );
					yi += ( t3r * b3i ) + ( t3i * b3r );
					yv[ iy ] = yr;
					yv[ iy + 1 ] = yi;
					a0 += sb1;
					a1 += sb1;
					a2 += sb1;
					a3 += sb1;
					iy += sy;
				}
			} else {
				for ( i = 0; i < leny; i++ ) {
					yr = yv[ iy ];
					yi = yv[ iy + 1 ];
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					yr += ( t0r * b0r ) + ( t0i * b0i );
					yi += ( t0i * b0r ) - ( t0r * b0i );
					b1r = Av[ a1 ];
					b1i = Av[ a1 + 1 ];
					yr += ( t1r * b1r ) + ( t1i * b1i );
					yi += ( t1i * b1r ) - ( t1r * b1i );
					b2r = Av[ a2 ];
					b2i = Av[ a2 + 1 ];
					yr += ( t2r * b2r ) + ( t2i * b2i );
					yi += ( t2i * b2r ) - ( t2r * b2i );
					b3r = Av[ a3 ];
					b3i = Av[ a3 + 1 ];
					yr += ( t3r * b3r ) + ( t3i * b3i );
					yi += ( t3i * b3r ) - ( t3r * b3i );
					yv[ iy ] = yr;
					yv[ iy + 1 ] = yi;
					a0 += sb1;
					a1 += sb1;
					a2 += sb1;
					a3 += sb1;
					iy += sy;
				}
			}
			jx += 4 * sx;
		}
		for ( ; j < lenx; j++ ) {
			xr = xv[ jx ];
			xi = xv[ jx + 1 ];
			t0r = ( alphaR * xr ) - ( alphaI * xi );
			t0i = ( alphaR * xi ) + ( alphaI * xr );
			a0 = oA + ( j * sb2 );
			iy = oY;
			if ( noConj ) {
				for ( i = 0; i < leny; i++ ) {
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					yv[ iy ] += ( t0r * b0r ) - ( t0i * b0i );
					yv[ iy + 1 ] += ( t0r * b0i ) + ( t0i * b0r );
					a0 += sb1;
					iy += sy;
				}
			} else {
				for ( i = 0; i < leny; i++ ) {
					b0r = Av[ a0 ];
					b0i = Av[ a0 + 1 ];
					yv[ iy ] += ( t0r * b0r ) + ( t0i * b0i );
					yv[ iy + 1 ] += ( t0i * b0r ) - ( t0r * b0i );
					a0 += sb1;
					iy += sy;
				}
			}
			jx += sx;
		}
	}
	return y;
}


// EXPORTS //

export default zgemv;
