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
* Performs one of the matrix-vector operations:.
* x := A_x,  or  x := A__T_x
* where x is an N element vector and A is an N by N unit or non-unit,
* upper or lower triangular matrix.
*
* ## Method
*
* The transpose is folded into the logical strides: `B = op(A)` has strides
* `(sb1, sb2)` equal to `(strideA1, strideA2)` (no-transpose) or swapped
* (transpose), and transposition flips which triangle `B` occupies. This
* collapses the four `(uplo, trans)` cases into two (`B` upper or lower).
* Each triangle is then computed in whichever of two four-wide blocked forms
* walks `B`'s smaller-stride dimension in the inner loop:
*
* -   **dot form** (four rows of `B` per pass, four accumulators) when `B`'s
*     second dimension has the smaller stride;
* -   **axpy form** (four columns of `B` per pass, one fused update of `x`)
*     otherwise.
*
* Per block, the 4x4 triangular diagonal corner is handled by scalar code and
* the remaining dense rectangle by the four-wide loop. Rows (dot form) are
* processed toward the triangle's empty side and columns (axpy form) away
* from it, so every `x` value is read before it is overwritten — the same
* dataflow as the reference. Both forms reorder summation, so the kernel is
* verified at a backward-error tolerance against the reference variant (see
* `bench/dtrmv-opt/`).
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} x - vector
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtrmv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	let upper, temp, sb1, sb2, id0, id1, id2, id3, x0, x1, x2, x3, s0, s1, s2;
	let s3, a0, a1, a2, a3, ia, ix, jx, xv, i, j;

	if ( N <= 0 ) {
		return x;
	}

	const nounit = ( diag === 'non-unit' );

	// Fold the transpose into the logical strides: B = op(A) with strides (sb1, sb2). Transposition flips which triangle B occupies:
	if ( trans === 'no-transpose' ) {
		sb1 = strideA1;
		sb2 = strideA2;
		upper = ( uplo === 'upper' );
	} else {
		sb1 = strideA2;
		sb2 = strideA1;
		upper = ( uplo === 'lower' );
	}
	const sd = sb1 + sb2;
	const sx = strideX;

	if ( upper ) {
		// Form x := B*x, B upper triangular: x[i] depends on original x[j], j >= i, so process rows/columns in ascending order...
		if ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) {
			// Dot form: rows in blocks of four, scalar 4x4 corner plus dense rectangle to the right...
			jx = offsetX;
			for ( i = 0; i + 3 < N; i += 4 ) {
				x0 = x[ jx ];
				x1 = x[ jx + sx ];
				x2 = x[ jx + ( 2 * sx ) ];
				x3 = x[ jx + ( 3 * sx ) ];
				id0 = offsetA + ( i * sd );
				id1 = id0 + sd;
				id2 = id1 + sd;
				id3 = id2 + sd;
				if ( nounit ) {
					s0 = A[ id0 ] * x0;
					s1 = A[ id1 ] * x1;
					s2 = A[ id2 ] * x2;
					s3 = A[ id3 ] * x3;
				} else {
					s0 = x0;
					s1 = x1;
					s2 = x2;
					s3 = x3;
				}
				s0 += ( A[ id0 + sb2 ] * x1 ) + ( A[ id0 + ( 2 * sb2 ) ] * x2 ) + ( A[ id0 + ( 3 * sb2 ) ] * x3 );
				s1 += ( A[ id1 + sb2 ] * x2 ) + ( A[ id1 + ( 2 * sb2 ) ] * x3 );
				s2 += A[ id2 + sb2 ] * x3;
				a0 = id0 + ( 4 * sb2 );
				a1 = a0 + sb1;
				a2 = a1 + sb1;
				a3 = a2 + sb1;
				ix = jx + ( 4 * sx );
				for ( j = i + 4; j < N; j++ ) {
					xv = x[ ix ];
					s0 += A[ a0 ] * xv;
					s1 += A[ a1 ] * xv;
					s2 += A[ a2 ] * xv;
					s3 += A[ a3 ] * xv;
					a0 += sb2;
					a1 += sb2;
					a2 += sb2;
					a3 += sb2;
					ix += sx;
				}
				x[ jx ] = s0;
				x[ jx + sx ] = s1;
				x[ jx + ( 2 * sx ) ] = s2;
				x[ jx + ( 3 * sx ) ] = s3;
				jx += 4 * sx;
			}
			for ( ; i < N; i++ ) {
				temp = ( nounit ) ? A[ offsetA + ( i * sd ) ] * x[ jx ] : x[ jx ];
				ia = offsetA + ( i * sd ) + sb2;
				ix = jx + sx;
				for ( j = i + 1; j < N; j++ ) {
					temp += A[ ia ] * x[ ix ];
					ia += sb2;
					ix += sx;
				}
				x[ jx ] = temp;
				jx += sx;
			}
			return x;
		}
		// Axpy form: columns in blocks of four, dense rectangle above the 4x4 corner...
		jx = offsetX;
		for ( j = 0; j + 3 < N; j += 4 ) {
			x0 = x[ jx ];
			x1 = x[ jx + sx ];
			x2 = x[ jx + ( 2 * sx ) ];
			x3 = x[ jx + ( 3 * sx ) ];
			a0 = offsetA + ( j * sb2 );
			a1 = a0 + sb2;
			a2 = a1 + sb2;
			a3 = a2 + sb2;
			ix = offsetX;
			for ( i = 0; i < j; i++ ) {
				x[ ix ] += ( x0 * A[ a0 ] ) + ( x1 * A[ a1 ] ) + ( x2 * A[ a2 ] ) + ( x3 * A[ a3 ] );
				a0 += sb1;
				a1 += sb1;
				a2 += sb1;
				a3 += sb1;
				ix += sx;
			}
			id0 = offsetA + ( j * sd );
			id1 = id0 + sd;
			id2 = id1 + sd;
			id3 = id2 + sd;
			s0 = ( ( nounit ) ? A[ id0 ] * x0 : x0 ) + ( A[ id0 + sb2 ] * x1 ) + ( A[ id0 + ( 2 * sb2 ) ] * x2 ) + ( A[ id0 + ( 3 * sb2 ) ] * x3 );
			s1 = ( ( nounit ) ? A[ id1 ] * x1 : x1 ) + ( A[ id1 + sb2 ] * x2 ) + ( A[ id1 + ( 2 * sb2 ) ] * x3 );
			s2 = ( ( nounit ) ? A[ id2 ] * x2 : x2 ) + ( A[ id2 + sb2 ] * x3 );
			s3 = ( nounit ) ? A[ id3 ] * x3 : x3;
			x[ jx ] = s0;
			x[ jx + sx ] = s1;
			x[ jx + ( 2 * sx ) ] = s2;
			x[ jx + ( 3 * sx ) ] = s3;
			jx += 4 * sx;
		}
		for ( ; j < N; j++ ) {
			if ( x[ jx ] !== 0.0 ) {
				temp = x[ jx ];
				ia = offsetA + ( j * sb2 );
				ix = offsetX;
				for ( i = 0; i < j; i++ ) {
					x[ ix ] += temp * A[ ia ];
					ia += sb1;
					ix += sx;
				}
				if ( nounit ) {
					x[ jx ] *= A[ offsetA + ( j * sd ) ];
				}
			}
			jx += sx;
		}
		return x;
	}
	// Form x := B*x, B lower triangular: x[i] depends on original x[j], j <= i, so process rows/columns in descending order...
	if ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) {
		// Dot form: rows in blocks of four, scalar 4x4 corner plus dense rectangle to the left...
		jx = offsetX + ( ( N - 4 ) * sx );
		for ( i = N - 4; i >= 0; i -= 4 ) {
			x0 = x[ jx ];
			x1 = x[ jx + sx ];
			x2 = x[ jx + ( 2 * sx ) ];
			x3 = x[ jx + ( 3 * sx ) ];
			id0 = offsetA + ( i * sd );
			id1 = id0 + sd;
			id2 = id1 + sd;
			id3 = id2 + sd;
			if ( nounit ) {
				s0 = A[ id0 ] * x0;
				s1 = A[ id1 ] * x1;
				s2 = A[ id2 ] * x2;
				s3 = A[ id3 ] * x3;
			} else {
				s0 = x0;
				s1 = x1;
				s2 = x2;
				s3 = x3;
			}
			s1 += A[ id1 - sb2 ] * x0;
			s2 += ( A[ id2 - ( 2 * sb2 ) ] * x0 ) + ( A[ id2 - sb2 ] * x1 );
			s3 += ( A[ id3 - ( 3 * sb2 ) ] * x0 ) + ( A[ id3 - ( 2 * sb2 ) ] * x1 ) + ( A[ id3 - sb2 ] * x2 );
			a0 = offsetA + ( i * sb1 );
			a1 = a0 + sb1;
			a2 = a1 + sb1;
			a3 = a2 + sb1;
			ix = offsetX;
			for ( j = 0; j < i; j++ ) {
				xv = x[ ix ];
				s0 += A[ a0 ] * xv;
				s1 += A[ a1 ] * xv;
				s2 += A[ a2 ] * xv;
				s3 += A[ a3 ] * xv;
				a0 += sb2;
				a1 += sb2;
				a2 += sb2;
				a3 += sb2;
				ix += sx;
			}
			x[ jx ] = s0;
			x[ jx + sx ] = s1;
			x[ jx + ( 2 * sx ) ] = s2;
			x[ jx + ( 3 * sx ) ] = s3;
			jx -= 4 * sx;
		}
		jx = offsetX + ( ( ( N % 4 ) - 1 ) * sx );
		for ( i = ( N % 4 ) - 1; i >= 0; i-- ) {
			temp = ( nounit ) ? A[ offsetA + ( i * sd ) ] * x[ jx ] : x[ jx ];
			ia = offsetA + ( i * sb1 );
			ix = offsetX;
			for ( j = 0; j < i; j++ ) {
				temp += A[ ia ] * x[ ix ];
				ia += sb2;
				ix += sx;
			}
			x[ jx ] = temp;
			jx -= sx;
		}
		return x;
	}
	// Axpy form: columns in blocks of four, dense rectangle below the 4x4 corner...
	jx = offsetX + ( ( N - 4 ) * sx );
	for ( j = N - 4; j >= 0; j -= 4 ) {
		x0 = x[ jx ];
		x1 = x[ jx + sx ];
		x2 = x[ jx + ( 2 * sx ) ];
		x3 = x[ jx + ( 3 * sx ) ];
		a0 = offsetA + ( ( j + 4 ) * sb1 ) + ( j * sb2 );
		a1 = a0 + sb2;
		a2 = a1 + sb2;
		a3 = a2 + sb2;
		ix = jx + ( 4 * sx );
		for ( i = j + 4; i < N; i++ ) {
			x[ ix ] += ( x0 * A[ a0 ] ) + ( x1 * A[ a1 ] ) + ( x2 * A[ a2 ] ) + ( x3 * A[ a3 ] );
			a0 += sb1;
			a1 += sb1;
			a2 += sb1;
			a3 += sb1;
			ix += sx;
		}
		id0 = offsetA + ( j * sd );
		id1 = id0 + sd;
		id2 = id1 + sd;
		id3 = id2 + sd;
		s0 = ( nounit ) ? A[ id0 ] * x0 : x0;
		s1 = ( ( nounit ) ? A[ id1 ] * x1 : x1 ) + ( A[ id1 - sb2 ] * x0 );
		s2 = ( ( nounit ) ? A[ id2 ] * x2 : x2 ) + ( A[ id2 - ( 2 * sb2 ) ] * x0 ) + ( A[ id2 - sb2 ] * x1 );
		s3 = ( ( nounit ) ? A[ id3 ] * x3 : x3 ) + ( A[ id3 - ( 3 * sb2 ) ] * x0 ) + ( A[ id3 - ( 2 * sb2 ) ] * x1 ) + ( A[ id3 - sb2 ] * x2 );
		x[ jx ] = s0;
		x[ jx + sx ] = s1;
		x[ jx + ( 2 * sx ) ] = s2;
		x[ jx + ( 3 * sx ) ] = s3;
		jx -= 4 * sx;
	}
	jx = offsetX + ( ( ( N % 4 ) - 1 ) * sx );
	for ( j = ( N % 4 ) - 1; j >= 0; j-- ) {
		if ( x[ jx ] !== 0.0 ) {
			temp = x[ jx ];
			ia = offsetA + ( ( j + 1 ) * sb1 ) + ( j * sb2 );
			ix = jx + sx;
			for ( i = j + 1; i < N; i++ ) {
				x[ ix ] += temp * A[ ia ];
				ia += sb1;
				ix += sx;
			}
			if ( nounit ) {
				x[ jx ] *= A[ offsetA + ( j * sd ) ];
			}
		}
		jx -= sx;
	}
	return x;
}


// EXPORTS //

export default dtrmv;
