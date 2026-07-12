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
* Performs the symmetric rank 1 operation:.
* A := alpha_x_x**T + A,
* where alpha is a real scalar, x is an N element vector, and A is an
* N by N symmetric matrix.
*
* ## Method
*
* The kernel picks whichever traversal of the stored triangle walks A's
* smaller-stride dimension in the inner loop and register-blocks the other
* dimension four wide:
*
* -   **column form** (four columns per pass, hoisted `alpha*x[j+k]`) when
*     the first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisted `x[i+k]`) otherwise.
*
* The 4x4 diagonal corner of each pass and remainder lines are handled with
* reference-style scalar code. Every element receives exactly the reference
* update `x[i] * (alpha*x[j])` (`j` the column index) and the reference
* `x[j] !== 0` column guard is preserved, so the kernel is verified
* bit-identically against the reference variant (see `bench/dsyr-opt/`).
* Only the stored triangle is read or written.
*
* @private
* @param {string} uplo - specifies whether the upper or lower triangle is used (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - input vector
* @param {integer} strideX - `x` stride length
* @param {NonNegativeInteger} offsetX - starting `x` index
* @param {Float64Array} A - input/output symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @returns {Float64Array} `A`
*/
function dsyr( uplo, N, alpha, x, strideX, offsetX, A, strideA1, strideA2, offsetA ) {
	var upper;
	var sa1;
	var sa2;
	var sx;
	var x0;
	var x1;
	var x2;
	var x3;
	var t0;
	var t1;
	var t2;
	var t3;
	var xv;
	var a0;
	var a1;
	var a2;
	var a3;
	var n4;
	var ix;
	var jx;
	var jj;
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
	n4 = N - ( N % 4 );

	if ( Math.abs( sa1 ) <= Math.abs( sa2 ) ) {
		// Column form: inner loop over rows (stride `sa1`), four columns per pass
		jx = offsetX;
		for ( j = 0; j < n4; j += 4 ) {
			t0 = x[ jx ];
			t1 = x[ jx + sx ];
			t2 = x[ jx + ( 2 * sx ) ];
			t3 = x[ jx + ( 3 * sx ) ];
			if ( t0 !== 0.0 && t1 !== 0.0 && t2 !== 0.0 && t3 !== 0.0 ) {
				t0 *= alpha;
				t1 *= alpha;
				t2 *= alpha;
				t3 *= alpha;
				if ( upper ) {
					a0 = offsetA + ( j * sa2 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = offsetX;
					for ( i = 0; i <= j; i++ ) {
						xv = x[ ix ];
						A[ a0 ] += xv * t0;
						A[ a1 ] += xv * t1;
						A[ a2 ] += xv * t2;
						A[ a3 ] += xv * t3;
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
					}
					// Corner: rows j+1..j+3 of columns j+1..j+3 (upper part of the 4x4 diagonal block)
					x0 = x[ ix ];
					x1 = x[ ix + sx ];
					x2 = x[ ix + ( 2 * sx ) ];
					A[ a1 ] += x0 * t1;
					A[ a2 ] += x0 * t2;
					A[ a2 + sa1 ] += x1 * t2;
					A[ a3 ] += x0 * t3;
					A[ a3 + sa1 ] += x1 * t3;
					A[ a3 + ( 2 * sa1 ) ] += x2 * t3;
				} else {
					// Corner: rows j..j+2 of columns j..j+2 (lower part of the 4x4 diagonal block)
					x0 = x[ jx ];
					x1 = x[ jx + sx ];
					x2 = x[ jx + ( 2 * sx ) ];
					a0 = offsetA + ( j * sa2 ) + ( j * sa1 );
					A[ a0 ] += x0 * t0;
					A[ a0 + sa1 ] += x1 * t0;
					A[ a0 + ( 2 * sa1 ) ] += x2 * t0;
					a1 = a0 + sa2 + sa1;
					A[ a1 ] += x1 * t1;
					A[ a1 + sa1 ] += x2 * t1;
					a2 = a1 + sa2 + sa1;
					A[ a2 ] += x2 * t2;
					// Fused: rows j+3..N-1 of all four columns
					a0 = offsetA + ( j * sa2 ) + ( ( j + 3 ) * sa1 );
					a1 = a0 + sa2;
					a2 = a1 + sa2;
					a3 = a2 + sa2;
					ix = jx + ( 3 * sx );
					for ( i = j + 3; i < N; i++ ) {
						xv = x[ ix ];
						A[ a0 ] += xv * t0;
						A[ a1 ] += xv * t1;
						A[ a2 ] += xv * t2;
						A[ a3 ] += xv * t3;
						a0 += sa1;
						a1 += sa1;
						a2 += sa1;
						a3 += sa1;
						ix += sx;
					}
				}
			} else {
				// One or more zero pivots: reference-style scalar columns
				jj = jx;
				for ( k = j; k < j + 4; k++ ) {
					xv = x[ jj ];
					if ( xv !== 0.0 ) {
						t0 = alpha * xv;
						if ( upper ) {
							a0 = offsetA + ( k * sa2 );
							ix = offsetX;
							for ( i = 0; i <= k; i++ ) {
								A[ a0 ] += x[ ix ] * t0;
								a0 += sa1;
								ix += sx;
							}
						} else {
							a0 = offsetA + ( k * sa2 ) + ( k * sa1 );
							ix = jj;
							for ( i = k; i < N; i++ ) {
								A[ a0 ] += x[ ix ] * t0;
								a0 += sa1;
								ix += sx;
							}
						}
					}
					jj += sx;
				}
			}
			jx += 4 * sx;
		}
		// Remainder columns: reference-style scalar
		for ( j = n4; j < N; j++ ) {
			xv = x[ jx ];
			if ( xv !== 0.0 ) {
				t0 = alpha * xv;
				if ( upper ) {
					a0 = offsetA + ( j * sa2 );
					ix = offsetX;
					for ( i = 0; i <= j; i++ ) {
						A[ a0 ] += x[ ix ] * t0;
						a0 += sa1;
						ix += sx;
					}
				} else {
					a0 = offsetA + ( j * sa2 ) + ( j * sa1 );
					ix = jx;
					for ( i = j; i < N; i++ ) {
						A[ a0 ] += x[ ix ] * t0;
						a0 += sa1;
						ix += sx;
					}
				}
			}
			jx += sx;
		}
	} else {
		// Row form: inner loop over columns (stride `sa2`), four rows per pass
		jj = offsetX;
		for ( i = 0; i < n4; i += 4 ) {
			x0 = x[ jj ];
			x1 = x[ jj + sx ];
			x2 = x[ jj + ( 2 * sx ) ];
			x3 = x[ jj + ( 3 * sx ) ];
			if ( upper ) {
				// Corner: columns i..i+2 of rows i..i+2 (upper part of the 4x4 diagonal block)
				if ( x0 !== 0.0 ) {
					t0 = alpha * x0;
					A[ offsetA + ( i * sa1 ) + ( i * sa2 ) ] += x0 * t0;
				}
				if ( x1 !== 0.0 ) {
					t1 = alpha * x1;
					a0 = offsetA + ( i * sa1 ) + ( ( i + 1 ) * sa2 );
					A[ a0 ] += x0 * t1;
					A[ a0 + sa1 ] += x1 * t1;
				}
				if ( x2 !== 0.0 ) {
					t2 = alpha * x2;
					a0 = offsetA + ( i * sa1 ) + ( ( i + 2 ) * sa2 );
					A[ a0 ] += x0 * t2;
					A[ a0 + sa1 ] += x1 * t2;
					A[ a0 + ( 2 * sa1 ) ] += x2 * t2;
				}
				// Fused: columns i+3..N-1 of all four rows
				a0 = offsetA + ( i * sa1 ) + ( ( i + 3 ) * sa2 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = jj + ( 3 * sx );
				for ( j = i + 3; j < N; j++ ) {
					xv = x[ jx ];
					if ( xv !== 0.0 ) {
						t0 = alpha * xv;
						A[ a0 ] += x0 * t0;
						A[ a1 ] += x1 * t0;
						A[ a2 ] += x2 * t0;
						A[ a3 ] += x3 * t0;
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
				}
			} else {
				// Fused: columns 0..i of all four rows
				a0 = offsetA + ( i * sa1 );
				a1 = a0 + sa1;
				a2 = a1 + sa1;
				a3 = a2 + sa1;
				jx = offsetX;
				for ( j = 0; j <= i; j++ ) {
					xv = x[ jx ];
					if ( xv !== 0.0 ) {
						t0 = alpha * xv;
						A[ a0 ] += x0 * t0;
						A[ a1 ] += x1 * t0;
						A[ a2 ] += x2 * t0;
						A[ a3 ] += x3 * t0;
					}
					a0 += sa2;
					a1 += sa2;
					a2 += sa2;
					a3 += sa2;
					jx += sx;
				}
				// Corner: columns i+1..i+3 of rows i+1..i+3 (lower part of the 4x4 diagonal block)
				if ( x1 !== 0.0 ) {
					t1 = alpha * x1;
					a0 = offsetA + ( ( i + 1 ) * sa1 ) + ( ( i + 1 ) * sa2 );
					A[ a0 ] += x1 * t1;
					A[ a0 + sa1 ] += x2 * t1;
					A[ a0 + ( 2 * sa1 ) ] += x3 * t1;
				}
				if ( x2 !== 0.0 ) {
					t2 = alpha * x2;
					a0 = offsetA + ( ( i + 2 ) * sa1 ) + ( ( i + 2 ) * sa2 );
					A[ a0 ] += x2 * t2;
					A[ a0 + sa1 ] += x3 * t2;
				}
				if ( x3 !== 0.0 ) {
					t3 = alpha * x3;
					A[ offsetA + ( ( i + 3 ) * sa1 ) + ( ( i + 3 ) * sa2 ) ] += x3 * t3;
				}
			}
			jj += 4 * sx;
		}
		// Remainder rows: scalar along each row
		for ( i = n4; i < N; i++ ) {
			x0 = x[ jj ];
			if ( upper ) {
				a0 = offsetA + ( i * sa1 ) + ( i * sa2 );
				jx = jj;
				for ( j = i; j < N; j++ ) {
					xv = x[ jx ];
					if ( xv !== 0.0 ) {
						A[ a0 ] += x0 * ( alpha * xv );
					}
					a0 += sa2;
					jx += sx;
				}
			} else {
				a0 = offsetA + ( i * sa1 );
				jx = offsetX;
				for ( j = 0; j <= i; j++ ) {
					xv = x[ jx ];
					if ( xv !== 0.0 ) {
						A[ a0 ] += x0 * ( alpha * xv );
					}
					a0 += sa2;
					jx += sx;
				}
			}
			jj += sx;
		}
	}
	return A;
}


// EXPORTS //

export default dsyr;
