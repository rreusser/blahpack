/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-depth, max-len, max-params, max-statements, max-lines-per-function */

// MAIN //

/**
* Performs one of the matrix-matrix operations.
* B := alpha_op(A)_B,  or  B := alpha_B_op(A)
*
* where alpha is a scalar, B is an M-by-N matrix, A is a unit or
* non-unit, upper or lower triangular matrix, and op(A) is A or A**T.
*
* ## Notes
*
* -   4×4 register-tiled kernel. Both `side` values and both `transa` values
*     fold into a single pair of directional kernels via effective strides:
*     `B := alpha*B*op(A)` is `B^T := alpha*op(A)^T*B^T`, i.e. a left-side
*     problem with B's strides swapped, A's strides swapped, and `uplo`
*     flipped; `transa` = 'transpose' swaps A's strides and flips `uplo`
*     again. The effective-upper kernel walks 4-row tiles top-down, the
*     effective-lower kernel bottom-up, so every row a tile reads is either
*     not yet overwritten or cached from the tile's own 4×4 diagonal corner
*     of B (held in registers before the tile is written).
* -   Each tile's K-loop splits into a uniform part (a standard 4×4 register
*     micro-kernel over strictly-off-corner rows) and the 4×4 triangular
*     corner (scalar, using the cached B values and honoring `diag`).
* -   The reference's `!== 0.0` skip-guards inside the loops are dropped
*     (dgemm precedent); the `alpha == 0` quick path is preserved.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier
* @param {Float64Array} A - triangular matrix
* @param {integer} strideA1 - stride of first dim of A
* @param {integer} strideA2 - stride of second dim of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - matrix, modified in-place
* @param {integer} strideB1 - stride of first dim of B
* @param {integer} strideB2 - stride of second dim of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @returns {Float64Array} B
*/
function dtrmm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	// 16 register accumulators declared first — V8 register allocation is
	// sensitive to declaration order (see lib/blas/base/dgemm/lib/base.js).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;

	// Cached 4x4 diagonal corner of B (read before the tile is overwritten):
	var b00; var b01; var b02; var b03; var b10; var b11; var b12; var b13; var b20; var b21; var b22; var b23; var b30; var b31; var b32; var b33;

	// Triangular 4x4 corner of A: t01 holds the (0,1) corner entry for the
	// upper kernel and the mirrored (1,0) entry for the lower kernel, etc.
	var t01; var t02; var t03; var t12; var t13; var t23;
	var d0; var d1; var d2; var d3;
	var a0; var a1; var a2; var a3;
	var e0; var e1; var e2; var e3;
	var pa0; var pa1; var pa2; var pa3;
	var pb0; var pb1; var pb2; var pb3;
	var nounit;
	var temp;
	var eup;
	var ea1;
	var ea2;
	var eb1;
	var eb2;
	var nb4;
	var tmp;
	var pd;
	var pb;
	var pw;
	var pa;
	var nr;
	var nc;
	var mb;
	var i0;
	var i;
	var j;
	var l;

	if ( M === 0 || N === 0 ) {
		return B;
	}
	// When alpha is zero, set B to zero:
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
	eup = ( uplo === 'upper' );

	// Fold `side` and `transa` into effective strides so a single pair of
	// directional kernels covers all eight (side, uplo, transa) cases.
	// Right side: B := alpha*B*op(A) is B^T := alpha*op(A)^T*B^T — a
	// left-side problem on the transposed (stride-swapped) operands with
	// `uplo` flipped.
	if ( side === 'left' ) {
		nr = M;
		nc = N;
		ea1 = strideA1;
		ea2 = strideA2;
		eb1 = strideB1;
		eb2 = strideB2;
	} else {
		nr = N;
		nc = M;
		ea1 = strideA2;
		ea2 = strideA1;
		eb1 = strideB2;
		eb2 = strideB1;
		eup = !eup;
	}
	// Transposing A swaps its strides and flips the stored triangle:
	if ( transa === 'transpose' ) {
		tmp = ea1;
		ea1 = ea2;
		ea2 = tmp;
		eup = !eup;
	}

	// Effective problem: X := alpha*T*X, where X is `nr`-by-`nc` with strides
	// (eb1, eb2) and T is `nr`-by-`nr` triangular with strides (ea1, ea2) and
	// stored triangle `eup`. X_new[i][j] depends on X_old[l][j] with l >= i
	// (upper) or l <= i (lower), so 4-row tiles are processed top-down
	// (upper) or bottom-up (lower) and only the tile's own corner needs
	// caching.
	mb = nr - ( nr % 4 );
	nb4 = nc - ( nc % 4 );
	if ( eup ) {
		// Upper: top-down.
		for ( i0 = 0; i0 < mb; i0 += 4 ) {
			// Load the 4x4 triangular corner of A at (i0, i0):
			pd = offsetA + ( i0 * ea1 ) + ( i0 * ea2 );
			t01 = A[ pd + ea2 ];
			t02 = A[ pd + ( 2 * ea2 ) ];
			t03 = A[ pd + ( 3 * ea2 ) ];
			t12 = A[ pd + ea1 + ( 2 * ea2 ) ];
			t13 = A[ pd + ea1 + ( 3 * ea2 ) ];
			t23 = A[ pd + ( 2 * ea1 ) + ( 3 * ea2 ) ];
			if ( nounit ) {
				d0 = A[ pd ];
				d1 = A[ pd + ea1 + ea2 ];
				d2 = A[ pd + ( 2 * ( ea1 + ea2 ) ) ];
				d3 = A[ pd + ( 3 * ( ea1 + ea2 ) ) ];
			} else {
				d0 = 1.0;
				d1 = 1.0;
				d2 = 1.0;
				d3 = 1.0;
			}
			for ( j = 0; j < nb4; j += 4 ) {
				// Cache the 4x4 diagonal corner of B before overwriting:
				pb = offsetB + ( i0 * eb1 ) + ( j * eb2 );
				pw = pb;
				b00 = B[ pw ]; b10 = B[ pw + eb1 ]; b20 = B[ pw + ( 2 * eb1 ) ]; b30 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b01 = B[ pw ]; b11 = B[ pw + eb1 ]; b21 = B[ pw + ( 2 * eb1 ) ]; b31 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b02 = B[ pw ]; b12 = B[ pw + eb1 ]; b22 = B[ pw + ( 2 * eb1 ) ]; b32 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b03 = B[ pw ]; b13 = B[ pw + eb1 ]; b23 = B[ pw + ( 2 * eb1 ) ]; b33 = B[ pw + ( 3 * eb1 ) ];

				c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
				c01 = 0.0; c11 = 0.0; c21 = 0.0; c31 = 0.0;
				c02 = 0.0; c12 = 0.0; c22 = 0.0; c32 = 0.0;
				c03 = 0.0; c13 = 0.0; c23 = 0.0; c33 = 0.0;

				// Uniform part: rows l >= i0+4 of X are not yet overwritten.
				pa0 = pd + ( 4 * ea2 );
				pa1 = pa0 + ea1;
				pa2 = pa1 + ea1;
				pa3 = pa2 + ea1;
				pb0 = offsetB + ( ( i0 + 4 ) * eb1 ) + ( j * eb2 );
				pb1 = pb0 + eb2;
				pb2 = pb1 + eb2;
				pb3 = pb2 + eb2;
				for ( l = i0 + 4; l < nr; l++ ) {
					a0 = A[ pa0 ]; a1 = A[ pa1 ]; a2 = A[ pa2 ]; a3 = A[ pa3 ];
					e0 = B[ pb0 ]; e1 = B[ pb1 ]; e2 = B[ pb2 ]; e3 = B[ pb3 ];
					c00 += a0 * e0; c10 += a1 * e0; c20 += a2 * e0; c30 += a3 * e0;
					c01 += a0 * e1; c11 += a1 * e1; c21 += a2 * e1; c31 += a3 * e1;
					c02 += a0 * e2; c12 += a1 * e2; c22 += a2 * e2; c32 += a3 * e2;
					c03 += a0 * e3; c13 += a1 * e3; c23 += a2 * e3; c33 += a3 * e3;
					pa0 += ea2; pa1 += ea2; pa2 += ea2; pa3 += ea2;
					pb0 += eb1; pb1 += eb1; pb2 += eb1; pb3 += eb1;
				}

				// Triangular corner (cached B values; `diag` honored via d*):
				c00 += ( d0 * b00 ) + ( t01 * b10 ) + ( t02 * b20 ) + ( t03 * b30 );
				c01 += ( d0 * b01 ) + ( t01 * b11 ) + ( t02 * b21 ) + ( t03 * b31 );
				c02 += ( d0 * b02 ) + ( t01 * b12 ) + ( t02 * b22 ) + ( t03 * b32 );
				c03 += ( d0 * b03 ) + ( t01 * b13 ) + ( t02 * b23 ) + ( t03 * b33 );
				c10 += ( d1 * b10 ) + ( t12 * b20 ) + ( t13 * b30 );
				c11 += ( d1 * b11 ) + ( t12 * b21 ) + ( t13 * b31 );
				c12 += ( d1 * b12 ) + ( t12 * b22 ) + ( t13 * b32 );
				c13 += ( d1 * b13 ) + ( t12 * b23 ) + ( t13 * b33 );
				c20 += ( d2 * b20 ) + ( t23 * b30 );
				c21 += ( d2 * b21 ) + ( t23 * b31 );
				c22 += ( d2 * b22 ) + ( t23 * b32 );
				c23 += ( d2 * b23 ) + ( t23 * b33 );
				c30 += d3 * b30;
				c31 += d3 * b31;
				c32 += d3 * b32;
				c33 += d3 * b33;

				pw = pb;
				B[ pw ] = alpha * c00; B[ pw + eb1 ] = alpha * c10; B[ pw + ( 2 * eb1 ) ] = alpha * c20; B[ pw + ( 3 * eb1 ) ] = alpha * c30;
				pw += eb2;
				B[ pw ] = alpha * c01; B[ pw + eb1 ] = alpha * c11; B[ pw + ( 2 * eb1 ) ] = alpha * c21; B[ pw + ( 3 * eb1 ) ] = alpha * c31;
				pw += eb2;
				B[ pw ] = alpha * c02; B[ pw + eb1 ] = alpha * c12; B[ pw + ( 2 * eb1 ) ] = alpha * c22; B[ pw + ( 3 * eb1 ) ] = alpha * c32;
				pw += eb2;
				B[ pw ] = alpha * c03; B[ pw + eb1 ] = alpha * c13; B[ pw + ( 2 * eb1 ) ] = alpha * c23; B[ pw + ( 3 * eb1 ) ] = alpha * c33;
			}
			// Edge columns [nb4, nc): 4x1 kernel.
			for ( j = nb4; j < nc; j++ ) {
				pb = offsetB + ( i0 * eb1 ) + ( j * eb2 );
				b00 = B[ pb ]; b10 = B[ pb + eb1 ]; b20 = B[ pb + ( 2 * eb1 ) ]; b30 = B[ pb + ( 3 * eb1 ) ];
				c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
				pa0 = pd + ( 4 * ea2 );
				pa1 = pa0 + ea1;
				pa2 = pa1 + ea1;
				pa3 = pa2 + ea1;
				pb0 = offsetB + ( ( i0 + 4 ) * eb1 ) + ( j * eb2 );
				for ( l = i0 + 4; l < nr; l++ ) {
					e0 = B[ pb0 ];
					c00 += A[ pa0 ] * e0; c10 += A[ pa1 ] * e0; c20 += A[ pa2 ] * e0; c30 += A[ pa3 ] * e0;
					pa0 += ea2; pa1 += ea2; pa2 += ea2; pa3 += ea2;
					pb0 += eb1;
				}
				c00 += ( d0 * b00 ) + ( t01 * b10 ) + ( t02 * b20 ) + ( t03 * b30 );
				c10 += ( d1 * b10 ) + ( t12 * b20 ) + ( t13 * b30 );
				c20 += ( d2 * b20 ) + ( t23 * b30 );
				c30 += d3 * b30;
				B[ pb ] = alpha * c00; B[ pb + eb1 ] = alpha * c10; B[ pb + ( 2 * eb1 ) ] = alpha * c20; B[ pb + ( 3 * eb1 ) ] = alpha * c30;
			}
		}
		// Remainder rows [mb, nr), processed last (tiles above already
		// consumed their old values); each row only reads rows below itself.
		for ( i = mb; i < nr; i++ ) {
			for ( j = 0; j < nc; j++ ) {
				pb = offsetB + ( i * eb1 ) + ( j * eb2 );
				temp = ( nounit ) ? A[ offsetA + ( i * ( ea1 + ea2 ) ) ] * B[ pb ] : B[ pb ];
				pa = offsetA + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
				pb0 = pb + eb1;
				for ( l = i + 1; l < nr; l++ ) {
					temp += A[ pa ] * B[ pb0 ];
					pa += ea2;
					pb0 += eb1;
				}
				B[ pb ] = alpha * temp;
			}
		}
	} else {
		// Lower: bottom-up. Remainder rows [mb, nr) go first (descending);
		// each reads only rows above itself, which are still old.
		for ( i = nr - 1; i >= mb; i-- ) {
			for ( j = 0; j < nc; j++ ) {
				pb = offsetB + ( i * eb1 ) + ( j * eb2 );
				temp = ( nounit ) ? A[ offsetA + ( i * ( ea1 + ea2 ) ) ] * B[ pb ] : B[ pb ];
				pa = offsetA + ( i * ea1 );
				pb0 = offsetB + ( j * eb2 );
				for ( l = 0; l < i; l++ ) {
					temp += A[ pa ] * B[ pb0 ];
					pa += ea2;
					pb0 += eb1;
				}
				B[ pb ] = alpha * temp;
			}
		}
		for ( i0 = mb - 4; i0 >= 0; i0 -= 4 ) {
			// Load the mirrored 4x4 triangular corner of A at (i0, i0):
			// here t01 = A(i0+1, i0), t02 = A(i0+2, i0), t12 = A(i0+2, i0+1), ...
			pd = offsetA + ( i0 * ea1 ) + ( i0 * ea2 );
			t01 = A[ pd + ea1 ];
			t02 = A[ pd + ( 2 * ea1 ) ];
			t03 = A[ pd + ( 3 * ea1 ) ];
			t12 = A[ pd + ( 2 * ea1 ) + ea2 ];
			t13 = A[ pd + ( 3 * ea1 ) + ea2 ];
			t23 = A[ pd + ( 3 * ea1 ) + ( 2 * ea2 ) ];
			if ( nounit ) {
				d0 = A[ pd ];
				d1 = A[ pd + ea1 + ea2 ];
				d2 = A[ pd + ( 2 * ( ea1 + ea2 ) ) ];
				d3 = A[ pd + ( 3 * ( ea1 + ea2 ) ) ];
			} else {
				d0 = 1.0;
				d1 = 1.0;
				d2 = 1.0;
				d3 = 1.0;
			}
			for ( j = 0; j < nb4; j += 4 ) {
				pb = offsetB + ( i0 * eb1 ) + ( j * eb2 );
				pw = pb;
				b00 = B[ pw ]; b10 = B[ pw + eb1 ]; b20 = B[ pw + ( 2 * eb1 ) ]; b30 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b01 = B[ pw ]; b11 = B[ pw + eb1 ]; b21 = B[ pw + ( 2 * eb1 ) ]; b31 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b02 = B[ pw ]; b12 = B[ pw + eb1 ]; b22 = B[ pw + ( 2 * eb1 ) ]; b32 = B[ pw + ( 3 * eb1 ) ];
				pw += eb2;
				b03 = B[ pw ]; b13 = B[ pw + eb1 ]; b23 = B[ pw + ( 2 * eb1 ) ]; b33 = B[ pw + ( 3 * eb1 ) ];

				c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
				c01 = 0.0; c11 = 0.0; c21 = 0.0; c31 = 0.0;
				c02 = 0.0; c12 = 0.0; c22 = 0.0; c32 = 0.0;
				c03 = 0.0; c13 = 0.0; c23 = 0.0; c33 = 0.0;

				// Uniform part: rows l < i0 of X are not yet overwritten.
				pa0 = offsetA + ( i0 * ea1 );
				pa1 = pa0 + ea1;
				pa2 = pa1 + ea1;
				pa3 = pa2 + ea1;
				pb0 = offsetB + ( j * eb2 );
				pb1 = pb0 + eb2;
				pb2 = pb1 + eb2;
				pb3 = pb2 + eb2;
				for ( l = 0; l < i0; l++ ) {
					a0 = A[ pa0 ]; a1 = A[ pa1 ]; a2 = A[ pa2 ]; a3 = A[ pa3 ];
					e0 = B[ pb0 ]; e1 = B[ pb1 ]; e2 = B[ pb2 ]; e3 = B[ pb3 ];
					c00 += a0 * e0; c10 += a1 * e0; c20 += a2 * e0; c30 += a3 * e0;
					c01 += a0 * e1; c11 += a1 * e1; c21 += a2 * e1; c31 += a3 * e1;
					c02 += a0 * e2; c12 += a1 * e2; c22 += a2 * e2; c32 += a3 * e2;
					c03 += a0 * e3; c13 += a1 * e3; c23 += a2 * e3; c33 += a3 * e3;
					pa0 += ea2; pa1 += ea2; pa2 += ea2; pa3 += ea2;
					pb0 += eb1; pb1 += eb1; pb2 += eb1; pb3 += eb1;
				}

				// Triangular corner (mirrored):
				c00 += d0 * b00;
				c01 += d0 * b01;
				c02 += d0 * b02;
				c03 += d0 * b03;
				c10 += ( t01 * b00 ) + ( d1 * b10 );
				c11 += ( t01 * b01 ) + ( d1 * b11 );
				c12 += ( t01 * b02 ) + ( d1 * b12 );
				c13 += ( t01 * b03 ) + ( d1 * b13 );
				c20 += ( t02 * b00 ) + ( t12 * b10 ) + ( d2 * b20 );
				c21 += ( t02 * b01 ) + ( t12 * b11 ) + ( d2 * b21 );
				c22 += ( t02 * b02 ) + ( t12 * b12 ) + ( d2 * b22 );
				c23 += ( t02 * b03 ) + ( t12 * b13 ) + ( d2 * b23 );
				c30 += ( t03 * b00 ) + ( t13 * b10 ) + ( t23 * b20 ) + ( d3 * b30 );
				c31 += ( t03 * b01 ) + ( t13 * b11 ) + ( t23 * b21 ) + ( d3 * b31 );
				c32 += ( t03 * b02 ) + ( t13 * b12 ) + ( t23 * b22 ) + ( d3 * b32 );
				c33 += ( t03 * b03 ) + ( t13 * b13 ) + ( t23 * b23 ) + ( d3 * b33 );

				pw = pb;
				B[ pw ] = alpha * c00; B[ pw + eb1 ] = alpha * c10; B[ pw + ( 2 * eb1 ) ] = alpha * c20; B[ pw + ( 3 * eb1 ) ] = alpha * c30;
				pw += eb2;
				B[ pw ] = alpha * c01; B[ pw + eb1 ] = alpha * c11; B[ pw + ( 2 * eb1 ) ] = alpha * c21; B[ pw + ( 3 * eb1 ) ] = alpha * c31;
				pw += eb2;
				B[ pw ] = alpha * c02; B[ pw + eb1 ] = alpha * c12; B[ pw + ( 2 * eb1 ) ] = alpha * c22; B[ pw + ( 3 * eb1 ) ] = alpha * c32;
				pw += eb2;
				B[ pw ] = alpha * c03; B[ pw + eb1 ] = alpha * c13; B[ pw + ( 2 * eb1 ) ] = alpha * c23; B[ pw + ( 3 * eb1 ) ] = alpha * c33;
			}
			// Edge columns [nb4, nc): 4x1 kernel.
			for ( j = nb4; j < nc; j++ ) {
				pb = offsetB + ( i0 * eb1 ) + ( j * eb2 );
				b00 = B[ pb ]; b10 = B[ pb + eb1 ]; b20 = B[ pb + ( 2 * eb1 ) ]; b30 = B[ pb + ( 3 * eb1 ) ];
				c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
				pa0 = offsetA + ( i0 * ea1 );
				pa1 = pa0 + ea1;
				pa2 = pa1 + ea1;
				pa3 = pa2 + ea1;
				pb0 = offsetB + ( j * eb2 );
				for ( l = 0; l < i0; l++ ) {
					e0 = B[ pb0 ];
					c00 += A[ pa0 ] * e0; c10 += A[ pa1 ] * e0; c20 += A[ pa2 ] * e0; c30 += A[ pa3 ] * e0;
					pa0 += ea2; pa1 += ea2; pa2 += ea2; pa3 += ea2;
					pb0 += eb1;
				}
				c00 += d0 * b00;
				c10 += ( t01 * b00 ) + ( d1 * b10 );
				c20 += ( t02 * b00 ) + ( t12 * b10 ) + ( d2 * b20 );
				c30 += ( t03 * b00 ) + ( t13 * b10 ) + ( t23 * b20 ) + ( d3 * b30 );
				B[ pb ] = alpha * c00; B[ pb + eb1 ] = alpha * c10; B[ pb + ( 2 * eb1 ) ] = alpha * c20; B[ pb + ( 3 * eb1 ) ] = alpha * c30;
			}
		}
	}
	return B;
}


// EXPORTS //

export default dtrmm;
