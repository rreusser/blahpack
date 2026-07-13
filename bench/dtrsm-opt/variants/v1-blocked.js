/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-depth, max-len, max-lines-per-function, max-params, max-statements */

// MAIN //

/**
* Solves one of the matrix equations:.
* op(A)_X = alpha_B,  or  X_op(A) = alpha_B
* where alpha is a scalar, X and B are M-by-N matrices, A is a unit or
* non-unit, upper or lower triangular matrix, and op(A) is A or A**T.
* The matrix X is overwritten on B.
*
* ## Notes
*
* -   Blocked substitution with a 4×4 register-tiled update kernel. All eight
*     (side, uplo, transa) structural combinations are folded into a single
*     upper-triangular backward-substitution kernel via effective strides:
*     `side='right'` transposes the whole problem (X*op(A) = alpha*B is
*     op(A)^T*X^T = alpha*B^T), `transa` swaps A's strides, and an effectively
*     lower-triangular system is index-reversed into an upper one by negating
*     strides and shifting offsets. Rows are solved in 4-row blocks from the
*     bottom up; for each block and each group of 4 columns of B the update
*     sum over already-solved rows is accumulated dgemm-style in 16 scalar
*     registers, then the 4×4 triangular corner is solved in reference order
*     (dividing by the diagonal, honoring `diag`).
* -   This is a pure reordering of the reference recurrence (backward-error
*     verification tier; see docs/optimization-policy.md). The unit diagonal
*     is never read when `diag='unit'`; only the stored triangle is read.
* -   Speedup vs the reference kernel: ~3.3-4.2× for col-major cases and
*     ~7-10.6× row-major at n>=256 (~5.2-5.4 GF/s vs the shipped dgemm's
*     8.2-8.8 GF/s roofline). See bench/dtrsm-opt/ for the full study.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'` (upper or lower triangular)
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier for B
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - input/output matrix (overwritten with X)
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {Float64Array} `B`
*/
function dtrsm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	// 16 register accumulators declared first — V8 register allocation is
	// Sensitive to declaration order (see bench/dgemm-opt/reports/).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;
	var nounit; var eupper;
	var ea1; var ea2; var eb1; var eb2; var oa; var ob; var MM; var NN;
	var u01; var u02; var u03; var u12; var u13; var u23;
	var d0; var d1; var d2; var d3;
	var x0; var x1; var x2; var x3;
	var a0; var a1; var a2; var a3;
	var b0; var b1; var b2; var b3;
	var pa0; var pa1; var pa2; var pa3;
	var pb0; var pb1; var pb2; var pb3;
	var t0; var t1; var t2; var t3;
	var pa; var pb; var pk; var pl;
	var rem; var nb; var kl;
	var i0; var i; var j; var l;

	if ( M === 0 || N === 0 ) {
		return B;
	}

	// When alpha is zero, set B to zero
	if ( alpha === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			pb = offsetB + ( j * strideB2 );
			for ( i = 0; i < M; i++ ) {
				B[ pb ] = 0.0;
				pb += strideB1;
			}
		}
		return B;
	}

	nounit = ( diag === 'non-unit' );

	// Fold the eight (side, uplo, transa) combinations into one triangular
	// solve T*X = alpha*B' with T = A[oa + i*ea1 + k*ea2] (MM×MM) and
	// B' = B[ob + i*eb1 + j*eb2] (MM×NN):
	if ( side === 'left' ) {
		MM = M;
		NN = N;
		eb1 = strideB1;
		eb2 = strideB2;
		if ( transa === 'no-transpose' ) {
			ea1 = strideA1;
			ea2 = strideA2;
			eupper = ( uplo === 'upper' );
		} else {
			ea1 = strideA2;
			ea2 = strideA1;
			eupper = ( uplo !== 'upper' );
		}
	} else {
		// X*op(A) = alpha*B  <=>  op(A)^T * X^T = alpha * B^T
		MM = N;
		NN = M;
		eb1 = strideB2;
		eb2 = strideB1;
		if ( transa === 'no-transpose' ) {
			ea1 = strideA2;
			ea2 = strideA1;
			eupper = ( uplo !== 'upper' );
		} else {
			ea1 = strideA1;
			ea2 = strideA2;
			eupper = ( uplo === 'upper' );
		}
	}
	oa = offsetA;
	ob = offsetB;
	if ( !eupper ) {
		// Reverse row and column order to turn the lower-triangular system
		// into an upper-triangular one (pure index relabeling):
		oa += ( MM - 1 ) * ( ea1 + ea2 );
		ea1 = -ea1;
		ea2 = -ea2;
		ob += ( MM - 1 ) * eb1;
		eb1 = -eb1;
	}

	// Backward substitution on the upper-triangular system: solve rows in
	// 4-row blocks from the bottom up; rows [0, rem) are the scalar remainder.
	rem = MM % 4;
	nb = NN - ( NN % 4 );

	for ( j = 0; j < nb; j += 4 ) {
		for ( i0 = MM - 4; i0 >= rem; i0 -= 4 ) {
			// Accumulate the update sum over already-solved rows below the
			// block with a dgemm-style 4×4 register tile:
			c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
			c01 = 0.0; c11 = 0.0; c21 = 0.0; c31 = 0.0;
			c02 = 0.0; c12 = 0.0; c22 = 0.0; c32 = 0.0;
			c03 = 0.0; c13 = 0.0; c23 = 0.0; c33 = 0.0;

			kl = MM - i0 - 4;
			pa0 = oa + ( i0 * ea1 ) + ( ( i0 + 4 ) * ea2 );
			pa1 = pa0 + ea1;
			pa2 = pa1 + ea1;
			pa3 = pa2 + ea1;
			pb0 = ob + ( ( i0 + 4 ) * eb1 ) + ( j * eb2 );
			pb1 = pb0 + eb2;
			pb2 = pb1 + eb2;
			pb3 = pb2 + eb2;

			for ( l = 0; l < kl; l++ ) {
				pk = l * ea2;
				a0 = A[ pa0 + pk ]; a1 = A[ pa1 + pk ]; a2 = A[ pa2 + pk ]; a3 = A[ pa3 + pk ];
				pl = l * eb1;
				b0 = B[ pb0 + pl ]; b1 = B[ pb1 + pl ]; b2 = B[ pb2 + pl ]; b3 = B[ pb3 + pl ];
				c00 += a0 * b0; c10 += a1 * b0; c20 += a2 * b0; c30 += a3 * b0;
				c01 += a0 * b1; c11 += a1 * b1; c21 += a2 * b1; c31 += a3 * b1;
				c02 += a0 * b2; c12 += a1 * b2; c22 += a2 * b2; c32 += a3 * b2;
				c03 += a0 * b3; c13 += a1 * b3; c23 += a2 * b3; c33 += a3 * b3;
			}

			// Solve the 4×4 upper-triangular diagonal corner in reference
			// order (bottom row first, dividing by the diagonal):
			pa = oa + ( i0 * ea1 ) + ( i0 * ea2 );
			u01 = A[ pa + ea2 ];
			u02 = A[ pa + ( 2 * ea2 ) ];
			u03 = A[ pa + ( 3 * ea2 ) ];
			u12 = A[ pa + ea1 + ( 2 * ea2 ) ];
			u13 = A[ pa + ea1 + ( 3 * ea2 ) ];
			u23 = A[ pa + ( 2 * ea1 ) + ( 3 * ea2 ) ];
			if ( nounit ) {
				d0 = A[ pa ];
				d1 = A[ pa + ea1 + ea2 ];
				d2 = A[ pa + ( 2 * ( ea1 + ea2 ) ) ];
				d3 = A[ pa + ( 3 * ( ea1 + ea2 ) ) ];
			}
			pb = ob + ( i0 * eb1 ) + ( j * eb2 );

			x3 = ( alpha * B[ pb + ( 3 * eb1 ) ] ) - c30;
			if ( nounit ) { x3 /= d3; }
			x2 = ( alpha * B[ pb + ( 2 * eb1 ) ] ) - c20 - ( u23 * x3 );
			if ( nounit ) { x2 /= d2; }
			x1 = ( alpha * B[ pb + eb1 ] ) - c10 - ( u12 * x2 ) - ( u13 * x3 );
			if ( nounit ) { x1 /= d1; }
			x0 = ( alpha * B[ pb ] ) - c00 - ( u01 * x1 ) - ( u02 * x2 ) - ( u03 * x3 );
			if ( nounit ) { x0 /= d0; }
			B[ pb ] = x0; B[ pb + eb1 ] = x1; B[ pb + ( 2 * eb1 ) ] = x2; B[ pb + ( 3 * eb1 ) ] = x3;

			pb += eb2;
			x3 = ( alpha * B[ pb + ( 3 * eb1 ) ] ) - c31;
			if ( nounit ) { x3 /= d3; }
			x2 = ( alpha * B[ pb + ( 2 * eb1 ) ] ) - c21 - ( u23 * x3 );
			if ( nounit ) { x2 /= d2; }
			x1 = ( alpha * B[ pb + eb1 ] ) - c11 - ( u12 * x2 ) - ( u13 * x3 );
			if ( nounit ) { x1 /= d1; }
			x0 = ( alpha * B[ pb ] ) - c01 - ( u01 * x1 ) - ( u02 * x2 ) - ( u03 * x3 );
			if ( nounit ) { x0 /= d0; }
			B[ pb ] = x0; B[ pb + eb1 ] = x1; B[ pb + ( 2 * eb1 ) ] = x2; B[ pb + ( 3 * eb1 ) ] = x3;

			pb += eb2;
			x3 = ( alpha * B[ pb + ( 3 * eb1 ) ] ) - c32;
			if ( nounit ) { x3 /= d3; }
			x2 = ( alpha * B[ pb + ( 2 * eb1 ) ] ) - c22 - ( u23 * x3 );
			if ( nounit ) { x2 /= d2; }
			x1 = ( alpha * B[ pb + eb1 ] ) - c12 - ( u12 * x2 ) - ( u13 * x3 );
			if ( nounit ) { x1 /= d1; }
			x0 = ( alpha * B[ pb ] ) - c02 - ( u01 * x1 ) - ( u02 * x2 ) - ( u03 * x3 );
			if ( nounit ) { x0 /= d0; }
			B[ pb ] = x0; B[ pb + eb1 ] = x1; B[ pb + ( 2 * eb1 ) ] = x2; B[ pb + ( 3 * eb1 ) ] = x3;

			pb += eb2;
			x3 = ( alpha * B[ pb + ( 3 * eb1 ) ] ) - c33;
			if ( nounit ) { x3 /= d3; }
			x2 = ( alpha * B[ pb + ( 2 * eb1 ) ] ) - c23 - ( u23 * x3 );
			if ( nounit ) { x2 /= d2; }
			x1 = ( alpha * B[ pb + eb1 ] ) - c13 - ( u12 * x2 ) - ( u13 * x3 );
			if ( nounit ) { x1 /= d1; }
			x0 = ( alpha * B[ pb ] ) - c03 - ( u01 * x1 ) - ( u02 * x2 ) - ( u03 * x3 );
			if ( nounit ) { x0 /= d0; }
			B[ pb ] = x0; B[ pb + eb1 ] = x1; B[ pb + ( 2 * eb1 ) ] = x2; B[ pb + ( 3 * eb1 ) ] = x3;
		}

		// Scalar remainder rows [0, rem) at the top (1×4 kernel):
		for ( i = rem - 1; i >= 0; i-- ) {
			pb = ob + ( i * eb1 ) + ( j * eb2 );
			t0 = alpha * B[ pb ];
			t1 = alpha * B[ pb + eb2 ];
			t2 = alpha * B[ pb + ( 2 * eb2 ) ];
			t3 = alpha * B[ pb + ( 3 * eb2 ) ];
			pa = oa + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
			pb = ob + ( ( i + 1 ) * eb1 ) + ( j * eb2 );
			for ( l = i + 1; l < MM; l++ ) {
				a0 = A[ pa ];
				pa += ea2;
				t0 -= a0 * B[ pb ];
				t1 -= a0 * B[ pb + eb2 ];
				t2 -= a0 * B[ pb + ( 2 * eb2 ) ];
				t3 -= a0 * B[ pb + ( 3 * eb2 ) ];
				pb += eb1;
			}
			if ( nounit ) {
				d0 = A[ oa + ( i * ( ea1 + ea2 ) ) ];
				t0 /= d0;
				t1 /= d0;
				t2 /= d0;
				t3 /= d0;
			}
			pb = ob + ( i * eb1 ) + ( j * eb2 );
			B[ pb ] = t0;
			B[ pb + eb2 ] = t1;
			B[ pb + ( 2 * eb2 ) ] = t2;
			B[ pb + ( 3 * eb2 ) ] = t3;
		}
	}

	// Remainder columns [nb, NN): scalar backward substitution per column
	for ( j = nb; j < NN; j++ ) {
		for ( i = MM - 1; i >= 0; i-- ) {
			t0 = alpha * B[ ob + ( i * eb1 ) + ( j * eb2 ) ];
			pa = oa + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
			pb = ob + ( ( i + 1 ) * eb1 ) + ( j * eb2 );
			for ( l = i + 1; l < MM; l++ ) {
				t0 -= A[ pa ] * B[ pb ];
				pa += ea2;
				pb += eb1;
			}
			if ( nounit ) {
				t0 /= A[ oa + ( i * ( ea1 + ea2 ) ) ];
			}
			B[ ob + ( i * eb1 ) + ( j * eb2 ) ] = t0;
		}
	}
	return B;
}


// EXPORTS //

export default dtrsm;
