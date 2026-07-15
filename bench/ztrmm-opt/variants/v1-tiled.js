/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-depth, max-len, max-lines, max-lines-per-function, max-params, max-statements */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// MAIN //

/**
* Perform one of the matrix-matrix operations.
* B := alpha*op(A)*B,  or  B := alpha*B*op(A)
*
* where alpha is a complex scalar, B is an M-by-N matrix, A is a unit or
* non-unit, upper or lower triangular matrix, and op(A) is one of op(A) = A,
* op(A) = A^T, or op(A) = A^H.
*
* ## Notes
*
* -   2x2 *complex* register-tiled kernel (8 accumulator doubles, within V8's
*     ~16-f64 spill budget; a 4x4 complex tile is 32 doubles, over budget).
*     All `side`/`transa` cases fold into a single pair of directional kernels
*     via effective strides (dtrmm precedent): `B := alpha*B*op(A)` is
*     `B^T := alpha*op(A)^T*B^T` — a left-side problem with B's and A's strides
*     swapped and `uplo` flipped; `transa` in {transpose, conjugate-transpose}
*     swaps A's strides and flips `uplo` again. Conjugation (op=A^H) is folded
*     into a hoisted sign (`conjSign`) applied to every imaginary A value at
*     load, never a per-element branch.
* -   The effective-upper kernel walks 2-row tiles top-down, the
*     effective-lower kernel bottom-up, so every row a tile reads is either not
*     yet overwritten or cached from the tile's own 2x2 diagonal corner of B
*     (held in registers before the tile is written) — preserving the
*     reference's in-place traversal semantics.
* -   The reference's `!== 0.0` skip-guards inside the loops are dropped (dgemm
*     precedent); the alpha == 0 quick path is preserved.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex triangular matrix
* @param {integer} strideA1 - stride of first dim of A (complex elements)
* @param {integer} strideA2 - stride of second dim of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - complex matrix, modified in-place
* @param {integer} strideB1 - stride of first dim of B (complex elements)
* @param {integer} strideB2 - stride of second dim of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @returns {Complex128Array} `B`
*/
function ztrmm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	// 2x2 complex accumulators (8 doubles):
	var c00r; var c00i; var c01r; var c01i; var c10r; var c10i; var c11r; var c11i;

	// Cached 2x2 diagonal corner of B (read before the tile is overwritten):
	var b00r; var b00i; var b01r; var b01i; var b10r; var b10i; var b11r; var b11i;

	// Triangular 2x2 corner of A and diagonal:
	var t01r; var t01i;
	var d0r; var d0i; var d1r; var d1i;
	var a0r; var a0i; var a1r; var a1i;
	var e0r; var e0i; var e1r; var e1i;
	var alphaR;
	var alphaI;
	var conjSign;
	var nounit;
	var eup;
	var ea1;
	var ea2;
	var eb1;
	var eb2;
	var nr;
	var nc;
	var mb;
	var nb2;
	var Av;
	var Bv;
	var oA;
	var oB;
	var pd;
	var pdd;
	var pa;
	var pa0;
	var pa1;
	var pb;
	var pb0;
	var pb1;
	var pw;
	var ar;
	var ai;
	var br;
	var bi;
	var er;
	var ei;
	var tr;
	var ti;
	var i0;
	var i;
	var j;
	var l;

	if ( M === 0 || N === 0 ) {
		return B;
	}

	alphaR = real( alpha );
	alphaI = imag( alpha );

	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;

	// When alpha is zero, set B to zero:
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			pb = oB + ( j * strideB2 * 2 );
			for ( i = 0; i < M; i++ ) {
				Bv[ pb ] = 0.0;
				Bv[ pb + 1 ] = 0.0;
				pb += strideB1 * 2;
			}
		}
		return B;
	}

	nounit = ( diag === 'non-unit' );
	eup = ( uplo === 'upper' );
	conjSign = ( transa === 'conjugate-transpose' ) ? -1.0 : 1.0;

	// Fold `side` and `transa` into effective (doubled) strides so a single
	// pair of directional kernels covers all cases. Right side: B :=
	// alpha*B*op(A) is B^T := alpha*op(A)^T*B^T — a left-side problem on the
	// transposed (stride-swapped) operands with `uplo` flipped.
	if ( side === 'left' ) {
		nr = M;
		nc = N;
		ea1 = strideA1 * 2;
		ea2 = strideA2 * 2;
		eb1 = strideB1 * 2;
		eb2 = strideB2 * 2;
	} else {
		nr = N;
		nc = M;
		ea1 = strideA2 * 2;
		ea2 = strideA1 * 2;
		eb1 = strideB2 * 2;
		eb2 = strideB1 * 2;
		eup = !eup;
	}
	// Transposing A (transpose or conjugate-transpose) swaps its strides and
	// flips the stored triangle:
	if ( transa !== 'no-transpose' ) {
		tr = ea1;
		ea1 = ea2;
		ea2 = tr;
		eup = !eup;
	}

	mb = nr - ( nr % 2 );
	nb2 = nc - ( nc % 2 );

	if ( eup ) {
		// Upper: top-down 2-row tiles.
		for ( i0 = 0; i0 < mb; i0 += 2 ) {
			pd = oA + ( i0 * ea1 ) + ( i0 * ea2 );
			t01r = Av[ pd + ea2 ];
			t01i = conjSign * Av[ pd + ea2 + 1 ];
			if ( nounit ) {
				d0r = Av[ pd ];
				d0i = conjSign * Av[ pd + 1 ];
				d1r = Av[ pd + ea1 + ea2 ];
				d1i = conjSign * Av[ pd + ea1 + ea2 + 1 ];
			} else {
				d0r = 1.0;
				d0i = 0.0;
				d1r = 1.0;
				d1i = 0.0;
			}
			for ( j = 0; j < nb2; j += 2 ) {
				pb = oB + ( i0 * eb1 ) + ( j * eb2 );
				pw = pb;
				b00r = Bv[ pw ]; b00i = Bv[ pw + 1 ];
				b10r = Bv[ pw + eb1 ]; b10i = Bv[ pw + eb1 + 1 ];
				pw += eb2;
				b01r = Bv[ pw ]; b01i = Bv[ pw + 1 ];
				b11r = Bv[ pw + eb1 ]; b11i = Bv[ pw + eb1 + 1 ];

				c00r = 0.0; c00i = 0.0; c01r = 0.0; c01i = 0.0;
				c10r = 0.0; c10i = 0.0; c11r = 0.0; c11i = 0.0;

				// Uniform part: rows l >= i0+2 are not yet overwritten.
				pa0 = pd + ( 2 * ea2 );
				pa1 = pa0 + ea1;
				pb0 = oB + ( ( i0 + 2 ) * eb1 ) + ( j * eb2 );
				pb1 = pb0 + eb2;
				for ( l = i0 + 2; l < nr; l++ ) {
					a0r = Av[ pa0 ]; a0i = conjSign * Av[ pa0 + 1 ];
					a1r = Av[ pa1 ]; a1i = conjSign * Av[ pa1 + 1 ];
					e0r = Bv[ pb0 ]; e0i = Bv[ pb0 + 1 ];
					e1r = Bv[ pb1 ]; e1i = Bv[ pb1 + 1 ];
					c00r += ( a0r * e0r ) - ( a0i * e0i ); c00i += ( a0r * e0i ) + ( a0i * e0r );
					c01r += ( a0r * e1r ) - ( a0i * e1i ); c01i += ( a0r * e1i ) + ( a0i * e1r );
					c10r += ( a1r * e0r ) - ( a1i * e0i ); c10i += ( a1r * e0i ) + ( a1i * e0r );
					c11r += ( a1r * e1r ) - ( a1i * e1i ); c11i += ( a1r * e1i ) + ( a1i * e1r );
					pa0 += ea2; pa1 += ea2;
					pb0 += eb1; pb1 += eb1;
				}

				// Triangular corner (cached B; `diag` honored via d*):
				c00r += ( d0r * b00r ) - ( d0i * b00i ) + ( t01r * b10r ) - ( t01i * b10i );
				c00i += ( d0r * b00i ) + ( d0i * b00r ) + ( t01r * b10i ) + ( t01i * b10r );
				c01r += ( d0r * b01r ) - ( d0i * b01i ) + ( t01r * b11r ) - ( t01i * b11i );
				c01i += ( d0r * b01i ) + ( d0i * b01r ) + ( t01r * b11i ) + ( t01i * b11r );
				c10r += ( d1r * b10r ) - ( d1i * b10i );
				c10i += ( d1r * b10i ) + ( d1i * b10r );
				c11r += ( d1r * b11r ) - ( d1i * b11i );
				c11i += ( d1r * b11i ) + ( d1i * b11r );

				pw = pb;
				Bv[ pw ] = ( alphaR * c00r ) - ( alphaI * c00i ); Bv[ pw + 1 ] = ( alphaR * c00i ) + ( alphaI * c00r );
				Bv[ pw + eb1 ] = ( alphaR * c10r ) - ( alphaI * c10i ); Bv[ pw + eb1 + 1 ] = ( alphaR * c10i ) + ( alphaI * c10r );
				pw += eb2;
				Bv[ pw ] = ( alphaR * c01r ) - ( alphaI * c01i ); Bv[ pw + 1 ] = ( alphaR * c01i ) + ( alphaI * c01r );
				Bv[ pw + eb1 ] = ( alphaR * c11r ) - ( alphaI * c11i ); Bv[ pw + eb1 + 1 ] = ( alphaR * c11i ) + ( alphaI * c11r );
			}
			// Edge columns [nb2, nc): 2x1 kernel.
			for ( j = nb2; j < nc; j++ ) {
				pb = oB + ( i0 * eb1 ) + ( j * eb2 );
				b00r = Bv[ pb ]; b00i = Bv[ pb + 1 ];
				b10r = Bv[ pb + eb1 ]; b10i = Bv[ pb + eb1 + 1 ];
				c00r = 0.0; c00i = 0.0; c10r = 0.0; c10i = 0.0;
				pa0 = pd + ( 2 * ea2 );
				pa1 = pa0 + ea1;
				pb0 = oB + ( ( i0 + 2 ) * eb1 ) + ( j * eb2 );
				for ( l = i0 + 2; l < nr; l++ ) {
					a0r = Av[ pa0 ]; a0i = conjSign * Av[ pa0 + 1 ];
					a1r = Av[ pa1 ]; a1i = conjSign * Av[ pa1 + 1 ];
					e0r = Bv[ pb0 ]; e0i = Bv[ pb0 + 1 ];
					c00r += ( a0r * e0r ) - ( a0i * e0i ); c00i += ( a0r * e0i ) + ( a0i * e0r );
					c10r += ( a1r * e0r ) - ( a1i * e0i ); c10i += ( a1r * e0i ) + ( a1i * e0r );
					pa0 += ea2; pa1 += ea2;
					pb0 += eb1;
				}
				c00r += ( d0r * b00r ) - ( d0i * b00i ) + ( t01r * b10r ) - ( t01i * b10i );
				c00i += ( d0r * b00i ) + ( d0i * b00r ) + ( t01r * b10i ) + ( t01i * b10r );
				c10r += ( d1r * b10r ) - ( d1i * b10i );
				c10i += ( d1r * b10i ) + ( d1i * b10r );
				Bv[ pb ] = ( alphaR * c00r ) - ( alphaI * c00i ); Bv[ pb + 1 ] = ( alphaR * c00i ) + ( alphaI * c00r );
				Bv[ pb + eb1 ] = ( alphaR * c10r ) - ( alphaI * c10i ); Bv[ pb + eb1 + 1 ] = ( alphaR * c10i ) + ( alphaI * c10r );
			}
		}
		// Remainder row [mb, nr) (at most one), processed after the tiles.
		for ( i = mb; i < nr; i++ ) {
			for ( j = 0; j < nc; j++ ) {
				pb = oB + ( i * eb1 ) + ( j * eb2 );
				br = Bv[ pb ]; bi = Bv[ pb + 1 ];
				if ( nounit ) {
					pdd = oA + ( i * ( ea1 + ea2 ) );
					ar = Av[ pdd ]; ai = conjSign * Av[ pdd + 1 ];
					tr = ( ar * br ) - ( ai * bi );
					ti = ( ar * bi ) + ( ai * br );
				} else {
					tr = br;
					ti = bi;
				}
				pa = oA + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
				pb0 = pb + eb1;
				for ( l = i + 1; l < nr; l++ ) {
					ar = Av[ pa ]; ai = conjSign * Av[ pa + 1 ];
					er = Bv[ pb0 ]; ei = Bv[ pb0 + 1 ];
					tr += ( ar * er ) - ( ai * ei );
					ti += ( ar * ei ) + ( ai * er );
					pa += ea2;
					pb0 += eb1;
				}
				Bv[ pb ] = ( alphaR * tr ) - ( alphaI * ti );
				Bv[ pb + 1 ] = ( alphaR * ti ) + ( alphaI * tr );
			}
		}
	} else {
		// Lower: bottom-up. Remainder row [mb, nr) goes first (descending);
		// it reads only rows above itself, which are still old.
		for ( i = nr - 1; i >= mb; i-- ) {
			for ( j = 0; j < nc; j++ ) {
				pb = oB + ( i * eb1 ) + ( j * eb2 );
				br = Bv[ pb ]; bi = Bv[ pb + 1 ];
				if ( nounit ) {
					pdd = oA + ( i * ( ea1 + ea2 ) );
					ar = Av[ pdd ]; ai = conjSign * Av[ pdd + 1 ];
					tr = ( ar * br ) - ( ai * bi );
					ti = ( ar * bi ) + ( ai * br );
				} else {
					tr = br;
					ti = bi;
				}
				pa = oA + ( i * ea1 );
				pb0 = oB + ( j * eb2 );
				for ( l = 0; l < i; l++ ) {
					ar = Av[ pa ]; ai = conjSign * Av[ pa + 1 ];
					er = Bv[ pb0 ]; ei = Bv[ pb0 + 1 ];
					tr += ( ar * er ) - ( ai * ei );
					ti += ( ar * ei ) + ( ai * er );
					pa += ea2;
					pb0 += eb1;
				}
				Bv[ pb ] = ( alphaR * tr ) - ( alphaI * ti );
				Bv[ pb + 1 ] = ( alphaR * ti ) + ( alphaI * tr );
			}
		}
		for ( i0 = mb - 2; i0 >= 0; i0 -= 2 ) {
			pd = oA + ( i0 * ea1 ) + ( i0 * ea2 );
			// Mirrored corner: t01 = T(i0+1, i0).
			t01r = Av[ pd + ea1 ];
			t01i = conjSign * Av[ pd + ea1 + 1 ];
			if ( nounit ) {
				d0r = Av[ pd ];
				d0i = conjSign * Av[ pd + 1 ];
				d1r = Av[ pd + ea1 + ea2 ];
				d1i = conjSign * Av[ pd + ea1 + ea2 + 1 ];
			} else {
				d0r = 1.0;
				d0i = 0.0;
				d1r = 1.0;
				d1i = 0.0;
			}
			for ( j = 0; j < nb2; j += 2 ) {
				pb = oB + ( i0 * eb1 ) + ( j * eb2 );
				pw = pb;
				b00r = Bv[ pw ]; b00i = Bv[ pw + 1 ];
				b10r = Bv[ pw + eb1 ]; b10i = Bv[ pw + eb1 + 1 ];
				pw += eb2;
				b01r = Bv[ pw ]; b01i = Bv[ pw + 1 ];
				b11r = Bv[ pw + eb1 ]; b11i = Bv[ pw + eb1 + 1 ];

				c00r = 0.0; c00i = 0.0; c01r = 0.0; c01i = 0.0;
				c10r = 0.0; c10i = 0.0; c11r = 0.0; c11i = 0.0;

				// Uniform part: rows l < i0 are not yet overwritten.
				pa0 = oA + ( i0 * ea1 );
				pa1 = pa0 + ea1;
				pb0 = oB + ( j * eb2 );
				pb1 = pb0 + eb2;
				for ( l = 0; l < i0; l++ ) {
					a0r = Av[ pa0 ]; a0i = conjSign * Av[ pa0 + 1 ];
					a1r = Av[ pa1 ]; a1i = conjSign * Av[ pa1 + 1 ];
					e0r = Bv[ pb0 ]; e0i = Bv[ pb0 + 1 ];
					e1r = Bv[ pb1 ]; e1i = Bv[ pb1 + 1 ];
					c00r += ( a0r * e0r ) - ( a0i * e0i ); c00i += ( a0r * e0i ) + ( a0i * e0r );
					c01r += ( a0r * e1r ) - ( a0i * e1i ); c01i += ( a0r * e1i ) + ( a0i * e1r );
					c10r += ( a1r * e0r ) - ( a1i * e0i ); c10i += ( a1r * e0i ) + ( a1i * e0r );
					c11r += ( a1r * e1r ) - ( a1i * e1i ); c11i += ( a1r * e1i ) + ( a1i * e1r );
					pa0 += ea2; pa1 += ea2;
					pb0 += eb1; pb1 += eb1;
				}

				// Triangular corner (mirrored):
				c00r += ( d0r * b00r ) - ( d0i * b00i );
				c00i += ( d0r * b00i ) + ( d0i * b00r );
				c01r += ( d0r * b01r ) - ( d0i * b01i );
				c01i += ( d0r * b01i ) + ( d0i * b01r );
				c10r += ( t01r * b00r ) - ( t01i * b00i ) + ( d1r * b10r ) - ( d1i * b10i );
				c10i += ( t01r * b00i ) + ( t01i * b00r ) + ( d1r * b10i ) + ( d1i * b10r );
				c11r += ( t01r * b01r ) - ( t01i * b01i ) + ( d1r * b11r ) - ( d1i * b11i );
				c11i += ( t01r * b01i ) + ( t01i * b01r ) + ( d1r * b11i ) + ( d1i * b11r );

				pw = pb;
				Bv[ pw ] = ( alphaR * c00r ) - ( alphaI * c00i ); Bv[ pw + 1 ] = ( alphaR * c00i ) + ( alphaI * c00r );
				Bv[ pw + eb1 ] = ( alphaR * c10r ) - ( alphaI * c10i ); Bv[ pw + eb1 + 1 ] = ( alphaR * c10i ) + ( alphaI * c10r );
				pw += eb2;
				Bv[ pw ] = ( alphaR * c01r ) - ( alphaI * c01i ); Bv[ pw + 1 ] = ( alphaR * c01i ) + ( alphaI * c01r );
				Bv[ pw + eb1 ] = ( alphaR * c11r ) - ( alphaI * c11i ); Bv[ pw + eb1 + 1 ] = ( alphaR * c11i ) + ( alphaI * c11r );
			}
			// Edge columns [nb2, nc): 2x1 kernel.
			for ( j = nb2; j < nc; j++ ) {
				pb = oB + ( i0 * eb1 ) + ( j * eb2 );
				b00r = Bv[ pb ]; b00i = Bv[ pb + 1 ];
				b10r = Bv[ pb + eb1 ]; b10i = Bv[ pb + eb1 + 1 ];
				c00r = 0.0; c00i = 0.0; c10r = 0.0; c10i = 0.0;
				pa0 = oA + ( i0 * ea1 );
				pa1 = pa0 + ea1;
				pb0 = oB + ( j * eb2 );
				for ( l = 0; l < i0; l++ ) {
					a0r = Av[ pa0 ]; a0i = conjSign * Av[ pa0 + 1 ];
					a1r = Av[ pa1 ]; a1i = conjSign * Av[ pa1 + 1 ];
					e0r = Bv[ pb0 ]; e0i = Bv[ pb0 + 1 ];
					c00r += ( a0r * e0r ) - ( a0i * e0i ); c00i += ( a0r * e0i ) + ( a0i * e0r );
					c10r += ( a1r * e0r ) - ( a1i * e0i ); c10i += ( a1r * e0i ) + ( a1i * e0r );
					pa0 += ea2; pa1 += ea2;
					pb0 += eb1;
				}
				c00r += ( d0r * b00r ) - ( d0i * b00i );
				c00i += ( d0r * b00i ) + ( d0i * b00r );
				c10r += ( t01r * b00r ) - ( t01i * b00i ) + ( d1r * b10r ) - ( d1i * b10i );
				c10i += ( t01r * b00i ) + ( t01i * b00r ) + ( d1r * b10i ) + ( d1i * b10r );
				Bv[ pb ] = ( alphaR * c00r ) - ( alphaI * c00i ); Bv[ pb + 1 ] = ( alphaR * c00i ) + ( alphaI * c00r );
				Bv[ pb + eb1 ] = ( alphaR * c10r ) - ( alphaI * c10i ); Bv[ pb + eb1 + 1 ] = ( alphaR * c10i ) + ( alphaI * c10r );
			}
		}
	}
	return B;
}


// EXPORTS //

export default ztrmm;
