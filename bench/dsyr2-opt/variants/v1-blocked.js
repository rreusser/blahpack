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
* Performs the symmetric rank-2 operation:.
* A := alpha_x_y**T + alpha_y_x**T + A,
* where alpha is a real scalar, x and y are N element vectors, and A is an
* N by N symmetric matrix.
*
* ## Method
*
* The kernel picks whichever traversal of the stored triangle walks A's
* smaller-stride dimension in the inner loop and register-blocks the other
* dimension four wide:
*
* -   **column form** (four columns per pass, hoisted `alpha*y[j+k]` and
*     `alpha*x[j+k]`) when the first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisted `x[i+k]` and `y[i+k]`)
*     otherwise.
*
* The 4x4 diagonal corner of each pass and remainder lines are handled with
* reference-style scalar code. Every element receives exactly the reference
* update `(x[i]*(alpha*y[j])) + (y[i]*(alpha*x[j]))` (`j` the column index)
* and the reference `x[j] !== 0 || y[j] !== 0` column guard is preserved, so
* the kernel is verified bit-identically against the reference variant (see
* `bench/dsyr2-opt/`). Only the stored triangle is read or written.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is used (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - first input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} y - second input vector
* @param {integer} strideY - `y` stride length
* @param {NonNegativeInteger} offsetY - starting `y` index
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {Float64Array} `A`
*/
function dsyr2( uplo, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var upper;
	var sa1;
	var sa2;
	var t10;
	var t11;
	var t12;
	var t13;
	var t20;
	var t21;
	var t22;
	var t23;
	var sx;
	var sy;
	var x0;
	var x1;
	var x2;
	var x3;
	var y0;
	var y1;
	var y2;
	var y3;
	var t1;
	var t2;
	var xv;
	var yv;
	var a0;
	var a1;
	var a2;
	var a3;
	var n4;
	var ix;
	var iy;
	var jx;
	var jy;
	var kx;
	var ky;
	var i;
	var j;
	var k;

	if ( N === 0 || alpha === 0.0 ) {
		return A;
	}

	upper = ( uplo === 'upper' );
	sa1 = strideA1;
	sa2 = strideA2;
	sx = strideX;
	sy = strideY;
	n4 = N - ( N % 4 );

	if ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) {
		// Column form: inner loop over rows (stride `sa1`), four columns per pass
		jx = offsetX;
		jy = offsetY;
		for ( j = 0; j < n4; j += 4 ) {
			x0 = x[ jx ];
			x1 = x[ jx + sx ];
			x2 = x[ jx + ( 2 * sx ) ];
			x3 = x[ jx + ( 3 * sx ) ];
			y0 = y[ jy ];
			y1 = y[ jy + sy ];
			y2 = y[ jy + ( 2 * sy ) ];
			y3 = y[ jy + ( 3 * sy ) ];
			if (
				( x0 !== 0.0 || y0 !== 0.0 ) &&
				( x1 !== 0.0 || y1 !== 0.0 ) &&
				( x2 !== 0.0 || y2 !== 0.0 ) &&
				( x3 !== 0.0 || y3 !== 0.0 )
			) {
				t10 = alpha * y0;
				t11 = alpha * y1;
				t12 = alpha * y2;
				t13 = alpha * y3;
				t20 = alpha * x0;
				t21 = alpha * x1;
				t22 = alpha * x2;
				t23 = alpha * x3;
				if ( upper ) {
					a0 = offsetA + ( j * sa2 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = offsetX;
					iy = offsetY;
					for ( i = 0; i <= j; i++ ) {
						xv = x[ ix ];
						yv = y[ iy ];
						A[ a0 ] += ( xv * t10 ) + ( yv * t20 );
						A[ a1 ] += ( xv * t11 ) + ( yv * t21 );
						A[ a2 ] += ( xv * t12 ) + ( yv * t22 );
						A[ a3 ] += ( xv * t13 ) + ( yv * t23 );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
						iy += sy;
					}
					// Corner: rows j+1..j+3 of columns j+1..j+3 (upper part of the 4x4 diagonal block)
					x0 = x[ ix ];
					x1 = x[ ix + sx ];
					x2 = x[ ix + ( 2 * sx ) ];
					y0 = y[ iy ];
					y1 = y[ iy + sy ];
					y2 = y[ iy + ( 2 * sy ) ];
					A[ a1 ] += ( x0 * t11 ) + ( y0 * t21 );
					A[ a2 ] += ( x0 * t12 ) + ( y0 * t22 );
					A[ a2 + sa1 ] += ( x1 * t12 ) + ( y1 * t22 );
					A[ a3 ] += ( x0 * t13 ) + ( y0 * t23 );
					A[ a3 + sa1 ] += ( x1 * t13 ) + ( y1 * t23 );
					A[ a3 + ( 2 * sa1 ) ] += ( x2 * t13 ) + ( y2 * t23 );
				} else {
					// Corner: rows j..j+2 of columns j..j+2 (lower part of the 4x4 diagonal block)
					a0 = offsetA + ( j * sa2 ) + ( j * sa1 );
					A[ a0 ] += ( x0 * t10 ) + ( y0 * t20 );
					A[ a0 + sa1 ] += ( x1 * t10 ) + ( y1 * t20 );
					A[ a0 + ( 2 * sa1 ) ] += ( x2 * t10 ) + ( y2 * t20 );
					a1 = a0 + sa2 + sa1;
					A[ a1 ] += ( x1 * t11 ) + ( y1 * t21 );
					A[ a1 + sa1 ] += ( x2 * t11 ) + ( y2 * t21 );
					a2 = a1 + sa2 + sa1;
					A[ a2 ] += ( x2 * t12 ) + ( y2 * t22 );
					// Fused: rows j+3..N-1 of all four columns
					a0 = offsetA + ( j * sa2 ) + ( ( j + 3 ) * sa1 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = jx + ( 3 * sx );
					iy = jy + ( 3 * sy );
					for ( i = j + 3; i < N; i++ ) {
						xv = x[ ix ];
						yv = y[ iy ];
						A[ a0 ] += ( xv * t10 ) + ( yv * t20 );
						A[ a1 ] += ( xv * t11 ) + ( yv * t21 );
						A[ a2 ] += ( xv * t12 ) + ( yv * t22 );
						A[ a3 ] += ( xv * t13 ) + ( yv * t23 );
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
						iy += sy;
					}
				}
			} else {
				// One or more zero pivot pairs: reference-style scalar columns
				kx = jx;
				ky = jy;
				for ( k = j; k < j + 4; k++ ) {
					xv = x[ kx ];
					yv = y[ ky ];
					if ( xv !== 0.0 || yv !== 0.0 ) {
						t1 = alpha * yv;
						t2 = alpha * xv;
						if ( upper ) {
							a0 = offsetA + ( k * sa2 );
							ix = offsetX;
							iy = offsetY;
							for ( i = 0; i <= k; i++ ) {
								A[ a0 ] += ( x[ ix ] * t1 ) + ( y[ iy ] * t2 );
								a0 += sa1;
								ix += sx;
								iy += sy;
							}
						} else {
							a0 = offsetA + ( k * sa2 ) + ( k * sa1 );
							ix = kx;
							iy = ky;
							for ( i = k; i < N; i++ ) {
								A[ a0 ] += ( x[ ix ] * t1 ) + ( y[ iy ] * t2 );
								a0 += sa1;
								ix += sx;
								iy += sy;
							}
						}
					}
					kx += sx;
					ky += sy;
				}
			}
			jx += 4 * sx;
			jy += 4 * sy;
		}
		// Remainder columns: reference-style scalar
		for ( j = n4; j < N; j++ ) {
			xv = x[ jx ];
			yv = y[ jy ];
			if ( xv !== 0.0 || yv !== 0.0 ) {
				t1 = alpha * yv;
				t2 = alpha * xv;
				if ( upper ) {
					a0 = offsetA + ( j * sa2 );
					ix = offsetX;
					iy = offsetY;
					for ( i = 0; i <= j; i++ ) {
						A[ a0 ] += ( x[ ix ] * t1 ) + ( y[ iy ] * t2 );
						a0 += sa1;
						ix += sx;
						iy += sy;
					}
				} else {
					a0 = offsetA + ( j * sa2 ) + ( j * sa1 );
					ix = jx;
					iy = jy;
					for ( i = j; i < N; i++ ) {
						A[ a0 ] += ( x[ ix ] * t1 ) + ( y[ iy ] * t2 );
						a0 += sa1;
						ix += sx;
						iy += sy;
					}
				}
			}
			jx += sx;
			jy += sy;
		}
	} else {
		// Row form: inner loop over columns (stride `sa2`), four rows per pass
		kx = offsetX;
		ky = offsetY;
		for ( i = 0; i < n4; i += 4 ) {
			x0 = x[ kx ];
			x1 = x[ kx + sx ];
			x2 = x[ kx + ( 2 * sx ) ];
			x3 = x[ kx + ( 3 * sx ) ];
			y0 = y[ ky ];
			y1 = y[ ky + sy ];
			y2 = y[ ky + ( 2 * sy ) ];
			y3 = y[ ky + ( 3 * sy ) ];
			if ( upper ) {
				// Corner: columns i..i+2 of rows i..i+2 (upper part of the 4x4 diagonal block)
				if ( x0 !== 0.0 || y0 !== 0.0 ) {
					t1 = alpha * y0;
					t2 = alpha * x0;
					A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] += ( x0 * t1 ) + ( y0 * t2 );
				}
				if ( x1 !== 0.0 || y1 !== 0.0 ) {
					t1 = alpha * y1;
					t2 = alpha * x1;
					a0 = offsetA + ( i * sa1 ) + ( ( i + 1 ) * sa2 );
					A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
					A[ a0 + sa1 ] += ( x1 * t1 ) + ( y1 * t2 );
				}
				if ( x2 !== 0.0 || y2 !== 0.0 ) {
					t1 = alpha * y2;
					t2 = alpha * x2;
					a0 = offsetA + ( i * sa1 ) + ( ( i + 2 ) * sa2 );
					A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
					A[ a0 + sa1 ] += ( x1 * t1 ) + ( y1 * t2 );
					A[ a0 + ( 2 * sa1 ) ] += ( x2 * t1 ) + ( y2 * t2 );
				}
				// Fused: columns i+3..N-1 of all four rows
				a0 = offsetA + ( i * sa1 ) + ( ( i + 3 ) * sa2 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = kx + ( 3 * sx );
				jy = ky + ( 3 * sy );
				for ( j = i + 3; j < N; j++ ) {
					xv = x[ jx ];
					yv = y[ jy ];
					if ( xv !== 0.0 || yv !== 0.0 ) {
						t1 = alpha * yv;
						t2 = alpha * xv;
						A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
						A[ a1 ] += ( x1 * t1 ) + ( y1 * t2 );
						A[ a2 ] += ( x2 * t1 ) + ( y2 * t2 );
						A[ a3 ] += ( x3 * t1 ) + ( y3 * t2 );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
					jy += sy;
				}
			} else {
				// Fused: columns 0..i of all four rows
				a0 = offsetA + ( i * sa1 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = offsetX;
				jy = offsetY;
				for ( j = 0; j <= i; j++ ) {
					xv = x[ jx ];
					yv = y[ jy ];
					if ( xv !== 0.0 || yv !== 0.0 ) {
						t1 = alpha * yv;
						t2 = alpha * xv;
						A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
						A[ a1 ] += ( x1 * t1 ) + ( y1 * t2 );
						A[ a2 ] += ( x2 * t1 ) + ( y2 * t2 );
						A[ a3 ] += ( x3 * t1 ) + ( y3 * t2 );
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
					jy += sy;
				}
				// Corner: columns i+1..i+3 of rows i+1..i+3 (lower part of the 4x4 diagonal block)
				if ( x1 !== 0.0 || y1 !== 0.0 ) {
					t1 = alpha * y1;
					t2 = alpha * x1;
					a0 = offsetA + ( ( i + 1 ) * sa1 ) + ( ( i + 1 ) * sa2 );
					A[ a0 ] += ( x1 * t1 ) + ( y1 * t2 );
					A[ a0 + sa1 ] += ( x2 * t1 ) + ( y2 * t2 );
					A[ a0 + ( 2 * sa1 ) ] += ( x3 * t1 ) + ( y3 * t2 );
				}
				if ( x2 !== 0.0 || y2 !== 0.0 ) {
					t1 = alpha * y2;
					t2 = alpha * x2;
					a0 = offsetA + ( ( i + 2 ) * sa1 ) + ( ( i + 2 ) * sa2 );
					A[ a0 ] += ( x2 * t1 ) + ( y2 * t2 );
					A[ a0 + sa1 ] += ( x3 * t1 ) + ( y3 * t2 );
				}
				if ( x3 !== 0.0 || y3 !== 0.0 ) {
					t1 = alpha * y3;
					t2 = alpha * x3;
					A[ offsetA + ( ( i + 3 ) * sa1 ) + ( ( i + 3 ) * sa2 ) ] += ( x3 * t1 ) + ( y3 * t2 );
				}
			}
			kx += 4 * sx;
			ky += 4 * sy;
		}
		// Remainder rows: scalar along each row
		for ( i = n4; i < N; i++ ) {
			x0 = x[ kx ];
			y0 = y[ ky ];
			if ( upper ) {
				a0 = offsetA + ( i * sa1 ) + ( i * sa2 );
				jx = kx;
				jy = ky;
				for ( j = i; j < N; j++ ) {
					xv = x[ jx ];
					yv = y[ jy ];
					if ( xv !== 0.0 || yv !== 0.0 ) {
						t1 = alpha * yv;
						t2 = alpha * xv;
						A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
					}
					a0 += sa2;
					jx += sx;
					jy += sy;
				}
			} else {
				a0 = offsetA + ( i * sa1 );
				jx = offsetX;
				jy = offsetY;
				for ( j = 0; j <= i; j++ ) {
					xv = x[ jx ];
					yv = y[ jy ];
					if ( xv !== 0.0 || yv !== 0.0 ) {
						t1 = alpha * yv;
						t2 = alpha * xv;
						A[ a0 ] += ( x0 * t1 ) + ( y0 * t2 );
					}
					a0 += sa2;
					jx += sx;
					jy += sy;
				}
			}
			kx += sx;
			ky += sy;
		}
	}
	return A;
}


// EXPORTS //

export default dsyr2;
