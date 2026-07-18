/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MAIN //

/**
* Performs the matrix-vector operation:.
* `y := alpha*A*x + beta * y`
* where A is an N-by-N symmetric matrix, x and y are N-element vectors,
* and alpha and beta are scalars.
*
* ## Method
*
* Because `A` is symmetric, reading its stored triangle with strides
* `(sa1, sa2)` as the *opposite* triangle with strides `(sa2, sa1)` visits
* the same stored elements with the same values. The kernel uses this to
* pick, for either `uplo` value and either storage order, the triangle
* orientation whose inner (row) stride is the smaller of the two, then
* blocks four columns per pass: a fused four-column sweep over the
* rectangular part of the triangle (four register accumulators for the dot
* parts and a fused four-term update for the axpy parts), reference-style
* scalar code for the 4x4 diagonal corner, and a scalar remainder for the
* trailing `N % 4` columns.
*
* The blocked passes reorder the summation relative to the reference, so
* the kernel is verified at a backward-error tolerance against the
* preserved reference variant (see `bench/dsymv-opt/`).
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangular part of A is stored (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier for A*x
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} x - input vector
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} beta - scalar multiplier for y
* @param {Float64Array} y - input/output vector
* @param {integer} strideY - stride length for `y`
* @param {NonNegativeInteger} offsetY - starting index for `y`
* @returns {Float64Array} `y`
*/
function dsymv( uplo, N, alpha, A, strideA1, strideA2, offsetA, x, strideX, offsetX, beta, y, strideY, offsetY ) {
	let temp1, temp2, a0v, a1v, a2v, a3v, ia0, ia1, ia2, ia3, sa1, sa2, xv, s0;
	let s1, s2, s3, t0, t1, t2, t3, ia, ix, iy, jx, jy, i, j;

	// Quick return if possible:
	if ( N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return y;
	}

	// First form y := beta * y:
	if ( beta !== 1.0 ) {
		iy = offsetY;
		if ( beta === 0.0 ) {
			for ( i = 0; i < N; i++ ) {
				y[ iy ] = 0.0;
				iy += strideY;
			}
		} else {
			for ( i = 0; i < N; i++ ) {
				y[ iy ] *= beta;
				iy += strideY;
			}
		}
	}
	if ( alpha === 0.0 ) {
		return y;
	}

	// Normalize via symmetry to whichever triangle orientation has the
	// smaller inner (row) stride. `(sa1, sa2)` below are the strides of the
	// upper-triangle view of the stored data:
	if ( uplo === 'upper' ) {
		sa1 = strideA1;
		sa2 = strideA2;
	} else {
		sa1 = strideA2;
		sa2 = strideA1;
	}
	const n4 = N - ( N % 4 );
	jx = offsetX;
	jy = offsetY;
	if ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) {
		// Upper-triangle kernel: stored element (i, j), i <= j, at `offsetA + (i * sa1) + (j * sa2)`. Four columns per pass:
		for ( j = 0; j < n4; j += 4 ) {
			t0 = alpha * x[ jx ];
			t1 = alpha * x[ jx + strideX ];
			t2 = alpha * x[ jx + ( 2 * strideX ) ];
			t3 = alpha * x[ jx + ( 3 * strideX ) ];
			s0 = 0.0;
			s1 = 0.0;
			s2 = 0.0;
			s3 = 0.0;
			ia0 = offsetA + ( j * sa2 );
			ia1 = ia0 + sa2;
			ia2 = ia1 + sa2;
			ia3 = ia2 + sa2;
			ix = offsetX;
			iy = offsetY;

			// Rectangular part: rows strictly above the 4x4 diagonal corner:
			for ( i = 0; i < j; i++ ) {
				xv = x[ ix ];
				a0v = A[ ia0 ];
				a1v = A[ ia1 ];
				a2v = A[ ia2 ];
				a3v = A[ ia3 ];
				y[ iy ] += ( t0 * a0v ) + ( t1 * a1v ) + ( t2 * a2v ) + ( t3 * a3v );
				s0 += a0v * xv;
				s1 += a1v * xv;
				s2 += a2v * xv;
				s3 += a3v * xv;
				ia0 += sa1;
				ia1 += sa1;
				ia2 += sa1;
				ia3 += sa1;
				ix += strideX;
				iy += strideY;
			}
			// 4x4 diagonal corner (pointers now sit at row `j` of each column). Column j: diagonal only:
			y[ jy ] += ( t0 * A[ ia0 ] ) + ( alpha * s0 );

			// Column j+1: row j, then diagonal:
			a0v = A[ ia1 ];
			y[ jy ] += t1 * a0v;
			s1 += a0v * x[ ix ];
			y[ jy + strideY ] += ( t1 * A[ ia1 + sa1 ] ) + ( alpha * s1 );

			// Column j+2: rows j, j+1, then diagonal:
			a0v = A[ ia2 ];
			a1v = A[ ia2 + sa1 ];
			y[ jy ] += t2 * a0v;
			y[ jy + strideY ] += t2 * a1v;
			s2 += ( a0v * x[ ix ] ) + ( a1v * x[ ix + strideX ] );
			y[ jy + ( 2 * strideY ) ] += ( t2 * A[ ia2 + ( 2 * sa1 ) ] ) + ( alpha * s2 );

			// Column j+3: rows j, j+1, j+2, then diagonal:
			a0v = A[ ia3 ];
			a1v = A[ ia3 + sa1 ];
			a2v = A[ ia3 + ( 2 * sa1 ) ];
			y[ jy ] += t3 * a0v;
			y[ jy + strideY ] += t3 * a1v;
			y[ jy + ( 2 * strideY ) ] += t3 * a2v;
			s3 += ( a0v * x[ ix ] ) + ( a1v * x[ ix + strideX ] ) + ( a2v * x[ ix + ( 2 * strideX ) ] );
			y[ jy + ( 3 * strideY ) ] += ( t3 * A[ ia3 + ( 3 * sa1 ) ] ) + ( alpha * s3 );

			jx += 4 * strideX;
			jy += 4 * strideY;
		}
		// Scalar remainder columns (reference upper loop):
		for ( ; j < N; j++ ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			ix = offsetX;
			iy = offsetY;
			ia = offsetA + ( j * sa2 );
			for ( i = 0; i < j; i++ ) {
				y[ iy ] += temp1 * A[ ia ];
				temp2 += A[ ia ] * x[ ix ];
				ia += sa1;
				ix += strideX;
				iy += strideY;
			}
			y[ jy ] += ( temp1 * A[ ia ] ) + ( alpha * temp2 );
			jx += strideX;
			jy += strideY;
		}
	} else {
		// Lower-triangle kernel: stored element (i, j), i >= j, at `offsetA + (i * sa2) + (j * sa1)`. Four columns per pass:
		for ( j = 0; j < n4; j += 4 ) {
			t0 = alpha * x[ jx ];
			t1 = alpha * x[ jx + strideX ];
			t2 = alpha * x[ jx + ( 2 * strideX ) ];
			t3 = alpha * x[ jx + ( 3 * strideX ) ];
			s0 = 0.0;
			s1 = 0.0;
			s2 = 0.0;
			s3 = 0.0;

			// 4x4 diagonal corner, reference-style scalar. Column j: diagonal, then rows j+1..j+3:
			ia = offsetA + ( j * sa1 ) + ( j * sa2 );
			y[ jy ] += t0 * A[ ia ];
			a0v = A[ ia + sa2 ];
			a1v = A[ ia + ( 2 * sa2 ) ];
			a2v = A[ ia + ( 3 * sa2 ) ];
			y[ jy + strideY ] += t0 * a0v;
			y[ jy + ( 2 * strideY ) ] += t0 * a1v;
			y[ jy + ( 3 * strideY ) ] += t0 * a2v;
			s0 += ( a0v * x[ jx + strideX ] ) + ( a1v * x[ jx + ( 2 * strideX ) ] ) + ( a2v * x[ jx + ( 3 * strideX ) ] );

			// Column j+1: diagonal, then rows j+2, j+3:
			ia += sa1 + sa2;
			y[ jy + strideY ] += t1 * A[ ia ];
			a0v = A[ ia + sa2 ];
			a1v = A[ ia + ( 2 * sa2 ) ];
			y[ jy + ( 2 * strideY ) ] += t1 * a0v;
			y[ jy + ( 3 * strideY ) ] += t1 * a1v;
			s1 += ( a0v * x[ jx + ( 2 * strideX ) ] ) + ( a1v * x[ jx + ( 3 * strideX ) ] );

			// Column j+2: diagonal, then row j+3:
			ia += sa1 + sa2;
			y[ jy + ( 2 * strideY ) ] += t2 * A[ ia ];
			a0v = A[ ia + sa2 ];
			y[ jy + ( 3 * strideY ) ] += t2 * a0v;
			s2 += a0v * x[ jx + ( 3 * strideX ) ];

			// Column j+3: diagonal only:
			ia += sa1 + sa2;
			y[ jy + ( 3 * strideY ) ] += t3 * A[ ia ];

			// Rectangular part: rows strictly below the 4x4 diagonal corner:
			ia0 = offsetA + ( j * sa1 ) + ( ( j + 4 ) * sa2 );
			ia1 = ia0 + sa1;
			ia2 = ia1 + sa1;
			ia3 = ia2 + sa1;
			ix = jx + ( 4 * strideX );
			iy = jy + ( 4 * strideY );
			for ( i = j + 4; i < N; i++ ) {
				xv = x[ ix ];
				a0v = A[ ia0 ];
				a1v = A[ ia1 ];
				a2v = A[ ia2 ];
				a3v = A[ ia3 ];
				y[ iy ] += ( t0 * a0v ) + ( t1 * a1v ) + ( t2 * a2v ) + ( t3 * a3v );
				s0 += a0v * xv;
				s1 += a1v * xv;
				s2 += a2v * xv;
				s3 += a3v * xv;
				ia0 += sa2;
				ia1 += sa2;
				ia2 += sa2;
				ia3 += sa2;
				ix += strideX;
				iy += strideY;
			}
			y[ jy ] += alpha * s0;
			y[ jy + strideY ] += alpha * s1;
			y[ jy + ( 2 * strideY ) ] += alpha * s2;
			y[ jy + ( 3 * strideY ) ] += alpha * s3;

			jx += 4 * strideX;
			jy += 4 * strideY;
		}
		// Scalar remainder columns (reference lower loop):
		for ( ; j < N; j++ ) {
			temp1 = alpha * x[ jx ];
			temp2 = 0.0;
			ia = offsetA + ( j * sa1 ) + ( j * sa2 );
			y[ jy ] += temp1 * A[ ia ];
			ix = jx;
			iy = jy;
			for ( i = j + 1; i < N; i++ ) {
				ia += sa2;
				ix += strideX;
				iy += strideY;
				y[ iy ] += temp1 * A[ ia ];
				temp2 += A[ ia ] * x[ ix ];
			}
			y[ jy ] += alpha * temp2;
			jx += strideX;
			jy += strideY;
		}
	}
	return y;
}


// EXPORTS //

export default dsymv;
