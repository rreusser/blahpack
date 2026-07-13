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
* Performs the rank 1 operation A := alpha_x_y**T + A.
*
* ## Method
*
* The kernel picks whichever traversal walks A's smaller-stride dimension in
* the inner loop and register-blocks the other dimension four wide:
*
* -   **column form** (four columns per pass, hoisted `alpha*y[j+k]`) when the
*     first dimension has the smaller stride;
* -   **row form** (four rows per pass, hoisted `x[i+k]`) otherwise.
*
* Every element receives exactly the reference update `x[i] * (alpha*y[j])`
* and the reference `y[j] !== 0` column guard is preserved, so the kernel is
* verified bit-identically against the reference variant (see
* `bench/dger-opt/`).
*
* @private
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {number} alpha - scalar multiplier
* @param {Float64Array} x - first input vector
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @param {Float64Array} y - second input vector
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - starting index for y
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of first dimension of A
* @param {integer} strideA2 - stride of second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @returns {Float64Array} A
*/
function dger( M, N, alpha, x, strideX, offsetX, y, strideY, offsetY, A, strideA1, strideA2, offsetA ) {
	var yv;
	var x0;
	var x1;
	var x2;
	var x3;
	var t0;
	var t1;
	var t2;
	var t3;
	var a0;
	var a1;
	var a2;
	var a3;
	var m4;
	var n4;
	var ix;
	var jy;
	var jj;
	var aj;
	var i;
	var j;
	var k;

	if ( M === 0 || N === 0 || alpha === 0.0 ) {
		return A;
	}

	if ( Math.abs( strideA1 ) <= Math.abs( strideA2 ) ) {
		// Column form: inner loop over rows (stride `strideA1`), four columns per pass
		n4 = N - ( N % 4 );
		jy = offsetY;
		for ( j = 0; j < n4; j += 4 ) {
			t0 = y[ jy ];
			t1 = y[ jy + strideY ];
			t2 = y[ jy + ( 2 * strideY ) ];
			t3 = y[ jy + ( 3 * strideY ) ];
			if ( t0 !== 0.0 && t1 !== 0.0 && t2 !== 0.0 && t3 !== 0.0 ) {
				t0 *= alpha;
				t1 *= alpha;
				t2 *= alpha;
				t3 *= alpha;
				a0 = offsetA + ( j * strideA2 );
				a1 = a0 + strideA2;
				a2 = a1 + strideA2;
				a3 = a2 + strideA2;
				ix = offsetX;
				for ( i = 0; i < M; i++ ) {
					x0 = x[ ix ];
					A[ a0 ] += x0 * t0;
					A[ a1 ] += x0 * t1;
					A[ a2 ] += x0 * t2;
					A[ a3 ] += x0 * t3;
					a0 += strideA1;
					a1 += strideA1;
					a2 += strideA1;
					a3 += strideA1;
					ix += strideX;
				}
			} else {
				// One or more zero columns: reference-style scalar columns
				jj = jy;
				aj = offsetA + ( j * strideA2 );
				for ( k = 0; k < 4; k++ ) {
					yv = y[ jj ];
					if ( yv !== 0.0 ) {
						t0 = alpha * yv;
						a0 = aj;
						ix = offsetX;
						for ( i = 0; i < M; i++ ) {
							A[ a0 ] += x[ ix ] * t0;
							a0 += strideA1;
							ix += strideX;
						}
					}
					jj += strideY;
					aj += strideA2;
				}
			}
			jy += 4 * strideY;
		}
		for ( ; j < N; j++ ) {
			yv = y[ jy ];
			if ( yv !== 0.0 ) {
				t0 = alpha * yv;
				a0 = offsetA + ( j * strideA2 );
				ix = offsetX;
				for ( i = 0; i < M; i++ ) {
					A[ a0 ] += x[ ix ] * t0;
					a0 += strideA1;
					ix += strideX;
				}
			}
			jy += strideY;
		}
	} else {
		// Row form: inner loop over columns (stride `strideA2`), four rows per pass
		m4 = M - ( M % 4 );
		ix = offsetX;
		for ( i = 0; i < m4; i += 4 ) {
			x0 = x[ ix ];
			x1 = x[ ix + strideX ];
			x2 = x[ ix + ( 2 * strideX ) ];
			x3 = x[ ix + ( 3 * strideX ) ];
			a0 = offsetA + ( i * strideA1 );
			a1 = a0 + strideA1;
			a2 = a1 + strideA1;
			a3 = a2 + strideA1;
			jy = offsetY;
			for ( j = 0; j < N; j++ ) {
				yv = y[ jy ];
				if ( yv !== 0.0 ) {
					t0 = alpha * yv;
					A[ a0 ] += x0 * t0;
					A[ a1 ] += x1 * t0;
					A[ a2 ] += x2 * t0;
					A[ a3 ] += x3 * t0;
				}
				a0 += strideA2;
				a1 += strideA2;
				a2 += strideA2;
				a3 += strideA2;
				jy += strideY;
			}
			ix += 4 * strideX;
		}
		for ( ; i < M; i++ ) {
			x0 = x[ ix ];
			a0 = offsetA + ( i * strideA1 );
			jy = offsetY;
			for ( j = 0; j < N; j++ ) {
				yv = y[ jy ];
				if ( yv !== 0.0 ) {
					A[ a0 ] += x0 * ( alpha * yv );
				}
				a0 += strideA2;
				jy += strideY;
			}
			ix += strideX;
		}
	}
	return A;
}


// EXPORTS //

export default dger;
