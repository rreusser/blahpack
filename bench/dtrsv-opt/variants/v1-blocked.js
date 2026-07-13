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
* Solves one of the systems of equations:.
* A_x = b,  or  A__T_x = b
* where b is overwritten with the solution x, x is an N element vector,
* and A is an N by N unit or non-unit, upper or lower triangular matrix.
*
* ## Method
*
* The transpose is folded into the logical strides: `B = op(A)` has strides
* `(sb1, sb2)` equal to `(strideA1, strideA2)` (no-transpose) or swapped
* (transpose), and transposition flips which triangle `B` occupies. This
* collapses the four `(uplo, trans)` cases into two substitutions (backward
* for `B` upper, forward for `B` lower). Each is blocked four wide: the 4x4
* triangular diagonal corner is solved by scalar code in reference order,
* and the dense rectangle coupling it to the rest of the right-hand side is
* handled by whichever four-wide form walks `B`'s smaller-stride dimension
* in the inner loop:
*
* -   **dot form** (four rows of `B` per pass, four accumulators folding
*     already-solved values into the block's right-hand side) when `B`'s
*     second dimension has the smaller stride;
* -   **axpy form** (four columns of `B` per pass, one fused update folding
*     the four just-solved values into the remaining right-hand side)
*     otherwise.
*
* This is block substitution — the same substitution as the reference with
* reordered accumulation — so the kernel is verified at a backward-error
* tolerance against the reference variant (see `bench/dtrsv-opt/`).
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
* @param {Float64Array} x - input/output vector (b on entry, x on exit)
* @param {integer} strideX - stride for x
* @param {NonNegativeInteger} offsetX - starting index for x
* @returns {Float64Array} `x`
*/
function dtrsv( uplo, trans, diag, N, A, strideA1, strideA2, offsetA, x, strideX, offsetX ) {
	var nounit;
	var upper;
	var temp;
	var sb1;
	var sb2;
	var id0;
	var id1;
	var id2;
	var id3;
	var sd;
	var sx;
	var x0;
	var x1;
	var x2;
	var x3;
	var s0;
	var s1;
	var s2;
	var s3;
	var a0;
	var a1;
	var a2;
	var a3;
	var ia;
	var ix;
	var jx;
	var xv;
	var i;
	var j;

	if ( N <= 0 ) {
		return x;
	}

	nounit = ( diag === 'non-unit' );

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
	sd = sb1 + sb2;
	sx = strideX;

	if ( upper ) {
		// Solve B*x = b, B upper triangular: back substitution from the bottom...
		if ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) {
			// Dot form: rows in blocks of four; fold already-solved x[j], j >= i+4, into the block right-hand side, then solve the 4x4 corner...
			jx = offsetX + ( ( N - 4 ) * sx );
			for ( i = N - 4; i >= 0; i -= 4 ) {
				s0 = 0.0;
				s1 = 0.0;
				s2 = 0.0;
				s3 = 0.0;
				id0 = offsetA + ( i * sd );
				id1 = id0 + sd;
				id2 = id1 + sd;
				id3 = id2 + sd;
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
				x3 = x[ jx + ( 3 * sx ) ] - s3;
				if ( nounit ) {
					x3 /= A[ id3 ];
				}
				x2 = x[ jx + ( 2 * sx ) ] - s2 - ( A[ id2 + sb2 ] * x3 );
				if ( nounit ) {
					x2 /= A[ id2 ];
				}
				x1 = x[ jx + sx ] - s1 - ( A[ id1 + sb2 ] * x2 ) - ( A[ id1 + ( 2 * sb2 ) ] * x3 );
				if ( nounit ) {
					x1 /= A[ id1 ];
				}
				x0 = x[ jx ] - s0 - ( A[ id0 + sb2 ] * x1 ) - ( A[ id0 + ( 2 * sb2 ) ] * x2 ) - ( A[ id0 + ( 3 * sb2 ) ] * x3 );
				if ( nounit ) {
					x0 /= A[ id0 ];
				}
				x[ jx ] = x0;
				x[ jx + sx ] = x1;
				x[ jx + ( 2 * sx ) ] = x2;
				x[ jx + ( 3 * sx ) ] = x3;
				jx -= 4 * sx;
			}
			jx = offsetX + ( ( ( N % 4 ) - 1 ) * sx );
			for ( i = ( N % 4 ) - 1; i >= 0; i-- ) {
				temp = x[ jx ];
				ia = offsetA + ( i * sd ) + sb2;
				ix = jx + sx;
				for ( j = i + 1; j < N; j++ ) {
					temp -= A[ ia ] * x[ ix ];
					ia += sb2;
					ix += sx;
				}
				if ( nounit ) {
					temp /= A[ offsetA + ( i * sd ) ];
				}
				x[ jx ] = temp;
				jx -= sx;
			}
			return x;
		}
		// Axpy form: columns in blocks of four; solve the 4x4 corner, then fold the four solved values into the right-hand side above it...
		jx = offsetX + ( ( N - 4 ) * sx );
		for ( j = N - 4; j >= 0; j -= 4 ) {
			id0 = offsetA + ( j * sd );
			id1 = id0 + sd;
			id2 = id1 + sd;
			id3 = id2 + sd;
			x3 = x[ jx + ( 3 * sx ) ];
			if ( nounit ) {
				x3 /= A[ id3 ];
			}
			x2 = x[ jx + ( 2 * sx ) ] - ( A[ id2 + sb2 ] * x3 );
			if ( nounit ) {
				x2 /= A[ id2 ];
			}
			x1 = x[ jx + sx ] - ( A[ id1 + sb2 ] * x2 ) - ( A[ id1 + ( 2 * sb2 ) ] * x3 );
			if ( nounit ) {
				x1 /= A[ id1 ];
			}
			x0 = x[ jx ] - ( A[ id0 + sb2 ] * x1 ) - ( A[ id0 + ( 2 * sb2 ) ] * x2 ) - ( A[ id0 + ( 3 * sb2 ) ] * x3 );
			if ( nounit ) {
				x0 /= A[ id0 ];
			}
			x[ jx ] = x0;
			x[ jx + sx ] = x1;
			x[ jx + ( 2 * sx ) ] = x2;
			x[ jx + ( 3 * sx ) ] = x3;
			a0 = offsetA + ( j * sb2 );
			a1 = a0 + sb2;
			a2 = a1 + sb2;
			a3 = a2 + sb2;
			ix = offsetX;
			for ( i = 0; i < j; i++ ) {
				x[ ix ] -= ( x0 * A[ a0 ] ) + ( x1 * A[ a1 ] ) + ( x2 * A[ a2 ] ) + ( x3 * A[ a3 ] );
				a0 += sb1;
				a1 += sb1;
				a2 += sb1;
				a3 += sb1;
				ix += sx;
			}
			jx -= 4 * sx;
		}
		jx = offsetX + ( ( ( N % 4 ) - 1 ) * sx );
		for ( j = ( N % 4 ) - 1; j >= 0; j-- ) {
			if ( x[ jx ] !== 0.0 ) {
				if ( nounit ) {
					x[ jx ] /= A[ offsetA + ( j * sd ) ];
				}
				temp = x[ jx ];
				ia = offsetA + ( j * sb2 );
				ix = offsetX;
				for ( i = 0; i < j; i++ ) {
					x[ ix ] -= temp * A[ ia ];
					ia += sb1;
					ix += sx;
				}
			}
			jx -= sx;
		}
		return x;
	}
	// Solve B*x = b, B lower triangular: forward substitution from the top...
	if ( Math.abs( sb2 ) <= Math.abs( sb1 ) ) {
		// Dot form: rows in blocks of four; fold already-solved x[j], j < i, into the block right-hand side, then solve the 4x4 corner...
		jx = offsetX;
		for ( i = 0; i + 3 < N; i += 4 ) {
			s0 = 0.0;
			s1 = 0.0;
			s2 = 0.0;
			s3 = 0.0;
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
			id0 = offsetA + ( i * sd );
			id1 = id0 + sd;
			id2 = id1 + sd;
			id3 = id2 + sd;
			x0 = x[ jx ] - s0;
			if ( nounit ) {
				x0 /= A[ id0 ];
			}
			x1 = x[ jx + sx ] - s1 - ( A[ id1 - sb2 ] * x0 );
			if ( nounit ) {
				x1 /= A[ id1 ];
			}
			x2 = x[ jx + ( 2 * sx ) ] - s2 - ( A[ id2 - ( 2 * sb2 ) ] * x0 ) - ( A[ id2 - sb2 ] * x1 );
			if ( nounit ) {
				x2 /= A[ id2 ];
			}
			x3 = x[ jx + ( 3 * sx ) ] - s3 - ( A[ id3 - ( 3 * sb2 ) ] * x0 ) - ( A[ id3 - ( 2 * sb2 ) ] * x1 ) - ( A[ id3 - sb2 ] * x2 );
			if ( nounit ) {
				x3 /= A[ id3 ];
			}
			x[ jx ] = x0;
			x[ jx + sx ] = x1;
			x[ jx + ( 2 * sx ) ] = x2;
			x[ jx + ( 3 * sx ) ] = x3;
			jx += 4 * sx;
		}
		for ( ; i < N; i++ ) {
			temp = x[ jx ];
			ia = offsetA + ( i * sb1 );
			ix = offsetX;
			for ( j = 0; j < i; j++ ) {
				temp -= A[ ia ] * x[ ix ];
				ia += sb2;
				ix += sx;
			}
			if ( nounit ) {
				temp /= A[ offsetA + ( i * sd ) ];
			}
			x[ jx ] = temp;
			jx += sx;
		}
		return x;
	}
	// Axpy form: columns in blocks of four; solve the 4x4 corner, then fold the four solved values into the right-hand side below it...
	jx = offsetX;
	for ( j = 0; j + 3 < N; j += 4 ) {
		id0 = offsetA + ( j * sd );
		id1 = id0 + sd;
		id2 = id1 + sd;
		id3 = id2 + sd;
		x0 = x[ jx ];
		if ( nounit ) {
			x0 /= A[ id0 ];
		}
		x1 = x[ jx + sx ] - ( A[ id1 - sb2 ] * x0 );
		if ( nounit ) {
			x1 /= A[ id1 ];
		}
		x2 = x[ jx + ( 2 * sx ) ] - ( A[ id2 - ( 2 * sb2 ) ] * x0 ) - ( A[ id2 - sb2 ] * x1 );
		if ( nounit ) {
			x2 /= A[ id2 ];
		}
		x3 = x[ jx + ( 3 * sx ) ] - ( A[ id3 - ( 3 * sb2 ) ] * x0 ) - ( A[ id3 - ( 2 * sb2 ) ] * x1 ) - ( A[ id3 - sb2 ] * x2 );
		if ( nounit ) {
			x3 /= A[ id3 ];
		}
		x[ jx ] = x0;
		x[ jx + sx ] = x1;
		x[ jx + ( 2 * sx ) ] = x2;
		x[ jx + ( 3 * sx ) ] = x3;
		a0 = offsetA + ( ( j + 4 ) * sb1 ) + ( j * sb2 );
		a1 = a0 + sb2;
		a2 = a1 + sb2;
		a3 = a2 + sb2;
		ix = jx + ( 4 * sx );
		for ( i = j + 4; i < N; i++ ) {
			x[ ix ] -= ( x0 * A[ a0 ] ) + ( x1 * A[ a1 ] ) + ( x2 * A[ a2 ] ) + ( x3 * A[ a3 ] );
			a0 += sb1;
			a1 += sb1;
			a2 += sb1;
			a3 += sb1;
			ix += sx;
		}
		jx += 4 * sx;
	}
	for ( ; j < N; j++ ) {
		if ( x[ jx ] !== 0.0 ) {
			if ( nounit ) {
				x[ jx ] /= A[ offsetA + ( j * sd ) ];
			}
			temp = x[ jx ];
			ia = offsetA + ( ( j + 1 ) * sb1 ) + ( j * sb2 );
			ix = jx + sx;
			for ( i = j + 1; i < N; i++ ) {
				x[ ix ] -= temp * A[ ia ];
				ia += sb1;
				ix += sx;
			}
		}
		jx += sx;
	}
	return x;
}


// EXPORTS //

export default dtrsv;
