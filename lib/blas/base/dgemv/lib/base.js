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

// MAIN //

/**
* Performs one of the matrix-vector operations:.
* y := alpha_A_x + beta_y,   or   y := alpha_A^T_x + beta_y
*
* ## Method
*
* With `B = op(A)` (an `leny`-by-`lenx` matrix), the kernel picks whichever
* of two forms walks B's unit-stride (or smallest-stride) dimension in the
* inner loop, and register-blocks the other dimension four wide:
*
* -   **dot form** (four rows of B per pass, four independent accumulators)
*     when B's second dimension has the smaller stride;
* -   **axpy form** (four columns of B per pass, one fused update of `y`)
*     otherwise.
*
* Both forms reorder the summation relative to the reference, so the kernel
* is verified at a backward-error tolerance against the reference variant
* (see `bench/dgemv-opt/`).
*
* @private
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {number} alpha - scalar multiplier for A*x
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {number} beta - scalar multiplier for y
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @returns {Float64Array} `y`
*/
function dgemv( trans, M, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let leny, lenx, sb1, sb2, s0, s1, s2, s3, t0, t1, t2, t3, xv, m4, a0, a1;
	let a2, a3, ix, iy, jx, jy, i, j;

	const noTrans = ( trans === 'no-transpose' );

	// Quick return if possible
	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	// B = op(A) is `leny`-by-`lenx` with strides (sb1, sb2):
	if ( noTrans ) {
		leny = M;
		lenx = N;
		sb1 = strideA1;
		sb2 = strideA2;
	} else {
		leny = N;
		lenx = M;
		sb1 = strideA2;
		sb2 = strideA1;
	}

	// First form y := beta*y
	if ( beta !== 1.0 ) {
		iy = offsetY;
		if ( beta === 0.0 ) {
			for ( i = 0; i < leny; i++ ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < leny; i++ ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	if ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) {
		// Dot form: y[i] += alpha * dot(B[i,:], x), four rows per pass
		m4 = leny - ( leny % 4 );
		iy = offsetY;
		for ( i = 0; i < m4; i += 4 ) {
			s0 = 0.0;
			s1 = 0.0;
			s2 = 0.0;
			s3 = 0.0;
			a0 = offsetA + ( i * sb1 );
			a1 = a0 + sb1;
			a2 = a1 + sb1;
			a3 = a2 + sb1;
			ix = offsetX;
			for ( j = 0; j < lenx; j++ ) {
				xv = x[ ix ];
				s0 += A[ a0 ] * xv;
				s1 += A[ a1 ] * xv;
				s2 += A[ a2 ] * xv;
				s3 += A[ a3 ] * xv;
				a0 += sb2;
				a1 += sb2;
				a2 += sb2;
				a3 += sb2;
				ix += strideX;
			}
			y[ iy ] += alpha * s0;
			y[ iy + strideY ] += alpha * s1;
			y[ iy + ( 2 * strideY ) ] += alpha * s2;
			y[ iy + ( 3 * strideY ) ] += alpha * s3;
			iy += 4 * strideY;
		}
		for ( ; i < leny; i++ ) {
			s0 = 0.0;
			a0 = offsetA + ( i * sb1 );
			ix = offsetX;
			for ( j = 0; j < lenx; j++ ) {
				s0 += A[ a0 ] * x[ ix ];
				a0 += sb2;
				ix += strideX;
			}
			y[ iy ] += alpha * s0;
			iy += strideY;
		}
	} else {
		// Axpy form: y += alpha*x[j]*B[:,j], four columns per pass
		m4 = lenx - ( lenx % 4 );
		jx = offsetX;
		for ( j = 0; j < m4; j += 4 ) {
			t0 = alpha * x[ jx ];
			t1 = alpha * x[ jx + strideX ];
			t2 = alpha * x[ jx + ( 2 * strideX ) ];
			t3 = alpha * x[ jx + ( 3 * strideX ) ];
			a0 = offsetA + ( j * sb2 );
			a1 = a0 + sb2;
			a2 = a1 + sb2;
			a3 = a2 + sb2;
			jy = offsetY;
			for ( i = 0; i < leny; i++ ) {
				y[ jy ] += ( t0 * A[ a0 ] ) + ( t1 * A[ a1 ] ) + ( t2 * A[ a2 ] ) + ( t3 * A[ a3 ] );
				a0 += sb1;
				a1 += sb1;
				a2 += sb1;
				a3 += sb1;
				jy += strideY;
			}
			jx += 4 * strideX;
		}
		for ( ; j < lenx; j++ ) {
			t0 = alpha * x[ jx ];
			a0 = offsetA + ( j * sb2 );
			jy = offsetY;
			for ( i = 0; i < leny; i++ ) {
				y[ jy ] += t0 * A[ a0 ];
				a0 += sb1;
				jy += strideY;
			}
			jx += strideX;
		}
	}
	return y;
}


// EXPORTS //

export default dgemv;
