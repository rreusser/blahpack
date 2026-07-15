/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-lines, max-lines-per-function, max-params, max-statements, max-depth */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// FUNCTIONS //

/**
* Computes the conjugate-transpose update `C := alpha*A^H*B + conj(alpha)*B^H*A
* + beta*C` over one triangle, using a 2x2 fused two-term complex register tile.
* Kept in its own function so the reference no-transpose path (in the main
* dispatcher) retains its original codegen. `op(A)(i,l) = A(l,i) = Av[ oA +
* i*ar + l*ak ]`; the conjugation of the row operands is applied inline (`-`) on
* the imaginary lane, and the column operands are not conjugated (trans=C).
*
* @private
*/
function ctrans( upper, N, K, alphaR, alphaI, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var c00R; var c00I; var c10R; var c10I; var c01R; var c01I; var c11R; var c11I;
	var a0R; var a0I; var a1R; var a1I; var d0R; var d0I; var d1R; var d1I;
	var t1_0R; var t1_0I; var t2_0R; var t2_0I; var t1_1R; var t1_1I; var t2_1R; var t2_1I;
	var bc0R; var bc0I; var ac0R; var ac0I; var bc1R; var bc1I; var ac1R; var ac1I;
	var pAi0; var pAi1; var pBi0; var pBi1; var pAj0; var pAj1; var pBj0; var pBj1;
	var Av; var Bv; var Cv; var ar; var ak; var br; var bk; var oA; var oB; var oC; var sc1; var sc2;
	var pak; var pbk; var pc; var nb; var i; var j; var l; var ii;

	// Float64Array views; offsets/strides in Float64 units. For trans=C the
	// effective (row, k) strides swap so op(A)(i,l) = A(l,i).
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Cv = reinterpret( C, 0 );
	oA = offsetA * 2;
	oB = offsetB * 2;
	oC = offsetC * 2;
	ar = strideA2 * 2;
	ak = strideA1 * 2;
	br = strideB2 * 2;
	bk = strideB1 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	nb = N - ( N % 2 );
	if ( upper ) {
		for ( j = 0; j < nb; j += 2 ) {
			pAj0 = oA + ( j * ar );
			pAj1 = pAj0 + ar;
			pBj0 = oB + ( j * br );
			pBj1 = pBj0 + br;

			for ( i = 0; i + 2 <= j; i += 2 ) {
				c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
				c01R = 0.0; c01I = 0.0; c11R = 0.0; c11I = 0.0;
				pAi0 = oA + ( i * ar );
				pAi1 = pAi0 + ar;
				pBi0 = oB + ( i * br );
				pBi1 = pBi0 + br;
				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					pbk = l * bk;
					a0R = Av[ pAi0 + pak ]; a0I = -Av[ pAi0 + pak + 1 ];
					a1R = Av[ pAi1 + pak ]; a1I = -Av[ pAi1 + pak + 1 ];
					d0R = Bv[ pBi0 + pbk ]; d0I = -Bv[ pBi0 + pbk + 1 ];
					d1R = Bv[ pBi1 + pbk ]; d1I = -Bv[ pBi1 + pbk + 1 ];
					bc0R = Bv[ pBj0 + pbk ]; bc0I = Bv[ pBj0 + pbk + 1 ];
					ac0R = Av[ pAj0 + pak ]; ac0I = Av[ pAj0 + pak + 1 ];
					t1_0R = ( alphaR * bc0R ) - ( alphaI * bc0I ); t1_0I = ( alphaR * bc0I ) + ( alphaI * bc0R );
					t2_0R = ( alphaR * ac0R ) + ( alphaI * ac0I ); t2_0I = ( alphaR * ac0I ) - ( alphaI * ac0R );
					bc1R = Bv[ pBj1 + pbk ]; bc1I = Bv[ pBj1 + pbk + 1 ];
					ac1R = Av[ pAj1 + pak ]; ac1I = Av[ pAj1 + pak + 1 ];
					t1_1R = ( alphaR * bc1R ) - ( alphaI * bc1I ); t1_1I = ( alphaR * bc1I ) + ( alphaI * bc1R );
					t2_1R = ( alphaR * ac1R ) + ( alphaI * ac1I ); t2_1I = ( alphaR * ac1I ) - ( alphaI * ac1R );
					c00R += ( a0R * t1_0R ) - ( a0I * t1_0I ) + ( d0R * t2_0R ) - ( d0I * t2_0I );
					c00I += ( a0R * t1_0I ) + ( a0I * t1_0R ) + ( d0R * t2_0I ) + ( d0I * t2_0R );
					c10R += ( a1R * t1_0R ) - ( a1I * t1_0I ) + ( d1R * t2_0R ) - ( d1I * t2_0I );
					c10I += ( a1R * t1_0I ) + ( a1I * t1_0R ) + ( d1R * t2_0I ) + ( d1I * t2_0R );
					c01R += ( a0R * t1_1R ) - ( a0I * t1_1I ) + ( d0R * t2_1R ) - ( d0I * t2_1I );
					c01I += ( a0R * t1_1I ) + ( a0I * t1_1R ) + ( d0R * t2_1I ) + ( d0I * t2_1R );
					c11R += ( a1R * t1_1R ) - ( a1I * t1_1I ) + ( d1R * t2_1R ) - ( d1I * t2_1I );
					c11I += ( a1R * t1_1I ) + ( a1I * t1_1R ) + ( d1R * t2_1I ) + ( d1I * t2_1R );
				}
				pc = oC + ( i * sc1 ) + ( j * sc2 );
				if ( beta === 0.0 ) {
					Cv[ pc ] = c00R; Cv[ pc + 1 ] = c00I;
					Cv[ pc + sc1 ] = c10R; Cv[ pc + sc1 + 1 ] = c10I;
					Cv[ pc + sc2 ] = c01R; Cv[ pc + sc2 + 1 ] = c01I;
					Cv[ pc + sc1 + sc2 ] = c11R; Cv[ pc + sc1 + sc2 + 1 ] = c11I;
				} else {
					Cv[ pc ] = c00R + ( beta * Cv[ pc ] ); Cv[ pc + 1 ] = c00I + ( beta * Cv[ pc + 1 ] );
					Cv[ pc + sc1 ] = c10R + ( beta * Cv[ pc + sc1 ] ); Cv[ pc + sc1 + 1 ] = c10I + ( beta * Cv[ pc + sc1 + 1 ] );
					Cv[ pc + sc2 ] = c01R + ( beta * Cv[ pc + sc2 ] ); Cv[ pc + sc2 + 1 ] = c01I + ( beta * Cv[ pc + sc2 + 1 ] );
					Cv[ pc + sc1 + sc2 ] = c11R + ( beta * Cv[ pc + sc1 + sc2 ] ); Cv[ pc + sc1 + sc2 + 1 ] = c11I + ( beta * Cv[ pc + sc1 + sc2 + 1 ] );
				}
			}

			for ( ii = i; ii < j; ii++ ) {
				offdiag( ii, j );
			}
			diag( j );
			for ( ii = i; ii < j + 1; ii++ ) {
				offdiag( ii, j + 1 );
			}
			diag( j + 1 );
		}

		for ( j = nb; j < N; j++ ) {
			for ( ii = 0; ii < j; ii++ ) {
				offdiag( ii, j );
			}
			diag( j );
		}
	} else {
		for ( j = 0; j < nb; j += 2 ) {
			pAj0 = oA + ( j * ar );
			pAj1 = pAj0 + ar;
			pBj0 = oB + ( j * br );
			pBj1 = pBj0 + br;

			diag( j );
			offdiag( j + 1, j );
			diag( j + 1 );

			for ( i = j + 2; i + 2 <= N; i += 2 ) {
				c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
				c01R = 0.0; c01I = 0.0; c11R = 0.0; c11I = 0.0;
				pAi0 = oA + ( i * ar );
				pAi1 = pAi0 + ar;
				pBi0 = oB + ( i * br );
				pBi1 = pBi0 + br;
				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					pbk = l * bk;
					a0R = Av[ pAi0 + pak ]; a0I = -Av[ pAi0 + pak + 1 ];
					a1R = Av[ pAi1 + pak ]; a1I = -Av[ pAi1 + pak + 1 ];
					d0R = Bv[ pBi0 + pbk ]; d0I = -Bv[ pBi0 + pbk + 1 ];
					d1R = Bv[ pBi1 + pbk ]; d1I = -Bv[ pBi1 + pbk + 1 ];
					bc0R = Bv[ pBj0 + pbk ]; bc0I = Bv[ pBj0 + pbk + 1 ];
					ac0R = Av[ pAj0 + pak ]; ac0I = Av[ pAj0 + pak + 1 ];
					t1_0R = ( alphaR * bc0R ) - ( alphaI * bc0I ); t1_0I = ( alphaR * bc0I ) + ( alphaI * bc0R );
					t2_0R = ( alphaR * ac0R ) + ( alphaI * ac0I ); t2_0I = ( alphaR * ac0I ) - ( alphaI * ac0R );
					bc1R = Bv[ pBj1 + pbk ]; bc1I = Bv[ pBj1 + pbk + 1 ];
					ac1R = Av[ pAj1 + pak ]; ac1I = Av[ pAj1 + pak + 1 ];
					t1_1R = ( alphaR * bc1R ) - ( alphaI * bc1I ); t1_1I = ( alphaR * bc1I ) + ( alphaI * bc1R );
					t2_1R = ( alphaR * ac1R ) + ( alphaI * ac1I ); t2_1I = ( alphaR * ac1I ) - ( alphaI * ac1R );
					c00R += ( a0R * t1_0R ) - ( a0I * t1_0I ) + ( d0R * t2_0R ) - ( d0I * t2_0I );
					c00I += ( a0R * t1_0I ) + ( a0I * t1_0R ) + ( d0R * t2_0I ) + ( d0I * t2_0R );
					c10R += ( a1R * t1_0R ) - ( a1I * t1_0I ) + ( d1R * t2_0R ) - ( d1I * t2_0I );
					c10I += ( a1R * t1_0I ) + ( a1I * t1_0R ) + ( d1R * t2_0I ) + ( d1I * t2_0R );
					c01R += ( a0R * t1_1R ) - ( a0I * t1_1I ) + ( d0R * t2_1R ) - ( d0I * t2_1I );
					c01I += ( a0R * t1_1I ) + ( a0I * t1_1R ) + ( d0R * t2_1I ) + ( d0I * t2_1R );
					c11R += ( a1R * t1_1R ) - ( a1I * t1_1I ) + ( d1R * t2_1R ) - ( d1I * t2_1I );
					c11I += ( a1R * t1_1I ) + ( a1I * t1_1R ) + ( d1R * t2_1I ) + ( d1I * t2_1R );
				}
				pc = oC + ( i * sc1 ) + ( j * sc2 );
				if ( beta === 0.0 ) {
					Cv[ pc ] = c00R; Cv[ pc + 1 ] = c00I;
					Cv[ pc + sc1 ] = c10R; Cv[ pc + sc1 + 1 ] = c10I;
					Cv[ pc + sc2 ] = c01R; Cv[ pc + sc2 + 1 ] = c01I;
					Cv[ pc + sc1 + sc2 ] = c11R; Cv[ pc + sc1 + sc2 + 1 ] = c11I;
				} else {
					Cv[ pc ] = c00R + ( beta * Cv[ pc ] ); Cv[ pc + 1 ] = c00I + ( beta * Cv[ pc + 1 ] );
					Cv[ pc + sc1 ] = c10R + ( beta * Cv[ pc + sc1 ] ); Cv[ pc + sc1 + 1 ] = c10I + ( beta * Cv[ pc + sc1 + 1 ] );
					Cv[ pc + sc2 ] = c01R + ( beta * Cv[ pc + sc2 ] ); Cv[ pc + sc2 + 1 ] = c01I + ( beta * Cv[ pc + sc2 + 1 ] );
					Cv[ pc + sc1 + sc2 ] = c11R + ( beta * Cv[ pc + sc1 + sc2 ] ); Cv[ pc + sc1 + sc2 + 1 ] = c11I + ( beta * Cv[ pc + sc1 + sc2 + 1 ] );
				}
			}

			for ( ii = i; ii < N; ii++ ) {
				offdiag( ii, j );
			}
			for ( ii = i; ii < N; ii++ ) {
				offdiag( ii, j + 1 );
			}
		}

		for ( j = nb; j < N; j++ ) {
			diag( j );
			for ( ii = j + 1; ii < N; ii++ ) {
				offdiag( ii, j );
			}
		}
	}
	return;

	// Off-diagonal cell (ii,jj).
	function offdiag( ii, jj ) {
		var pAi;
		var pBi;
		var pAj;
		var pBj;
		var cR;
		var cI;
		var aR;
		var aI;
		var bR;
		var bI;
		var acR;
		var acI;
		var bcR;
		var bcI;
		var t1R;
		var t1I;
		var t2R;
		var t2I;
		var pa;
		var pb;
		var d;
		var ll;
		pAi = oA + ( ii * ar );
		pBi = oB + ( ii * br );
		pAj = oA + ( jj * ar );
		pBj = oB + ( jj * br );
		cR = 0.0;
		cI = 0.0;
		for ( ll = 0; ll < K; ll++ ) {
			pa = ll * ak;
			pb = ll * bk;
			aR = Av[ pAi + pa ]; aI = -Av[ pAi + pa + 1 ];
			bR = Bv[ pBi + pb ]; bI = -Bv[ pBi + pb + 1 ];
			bcR = Bv[ pBj + pb ]; bcI = Bv[ pBj + pb + 1 ];
			acR = Av[ pAj + pa ]; acI = Av[ pAj + pa + 1 ];
			t1R = ( alphaR * bcR ) - ( alphaI * bcI ); t1I = ( alphaR * bcI ) + ( alphaI * bcR );
			t2R = ( alphaR * acR ) + ( alphaI * acI ); t2I = ( alphaR * acI ) - ( alphaI * acR );
			cR += ( aR * t1R ) - ( aI * t1I ) + ( bR * t2R ) - ( bI * t2I );
			cI += ( aR * t1I ) + ( aI * t1R ) + ( bR * t2I ) + ( bI * t2R );
		}
		d = oC + ( ii * sc1 ) + ( jj * sc2 );
		if ( beta === 0.0 ) {
			Cv[ d ] = cR;
			Cv[ d + 1 ] = cI;
		} else {
			Cv[ d ] = cR + ( beta * Cv[ d ] );
			Cv[ d + 1 ] = cI + ( beta * Cv[ d + 1 ] );
		}
	}

	// Diagonal cell (jj,jj): real two-term sum; imag forced to zero.
	function diag( jj ) {
		var pAj;
		var pBj;
		var cR;
		var aR;
		var aI;
		var bR;
		var bI;
		var acR;
		var acI;
		var bcR;
		var bcI;
		var t1R;
		var t1I;
		var t2R;
		var t2I;
		var pa;
		var pb;
		var d;
		var ll;
		pAj = oA + ( jj * ar );
		pBj = oB + ( jj * br );
		cR = 0.0;
		for ( ll = 0; ll < K; ll++ ) {
			pa = ll * ak;
			pb = ll * bk;
			aR = Av[ pAj + pa ]; aI = -Av[ pAj + pa + 1 ];
			bR = Bv[ pBj + pb ]; bI = -Bv[ pBj + pb + 1 ];
			bcR = Bv[ pBj + pb ]; bcI = Bv[ pBj + pb + 1 ];
			acR = Av[ pAj + pa ]; acI = Av[ pAj + pa + 1 ];
			t1R = ( alphaR * bcR ) - ( alphaI * bcI ); t1I = ( alphaR * bcI ) + ( alphaI * bcR );
			t2R = ( alphaR * acR ) + ( alphaI * acI ); t2I = ( alphaR * acI ) - ( alphaI * acR );
			cR += ( aR * t1R ) - ( aI * t1I ) + ( bR * t2R ) - ( bI * t2I );
		}
		d = oC + ( jj * sc1 ) + ( jj * sc2 );
		if ( beta === 0.0 ) {
			Cv[ d ] = cR;
		} else {
			Cv[ d ] = cR + ( beta * Cv[ d ] );
		}
		Cv[ d + 1 ] = 0.0;
	}
}


// MAIN //

/**
* Performs one of the Hermitian rank-2k operations:.
* C := alpha*A*B^H + conj(alpha)*B*A^H + beta*C,  or
* C := alpha*A^H*B + conj(alpha)*B^H*A + beta*C
* where alpha is a complex scalar, beta is a REAL scalar, C is an N-by-N
* Hermitian matrix (stored as Complex128Array), and A and B are N-by-K matrices
* in the first case and K-by-N matrices in the second case. Only the upper or
* lower triangular part of C is updated; the diagonal of C is always real.
*
* ## Notes
*
* -   Mode-dispatched. **trans='conjugate-transpose'** (C := alpha*A^H*B + ...)
*     runs `ctrans`, a 2x2 complex register-tiled kernel over the STORED
*     triangle (the settled complex level-3 tile geometry; see
*     bench/zgemm-opt/GEOMETRY.md): the two rank-2k product terms are FUSED into
*     one complex accumulator per cell by folding alpha into hoisted column
*     factors t1 = alpha*B(l,j) and t2 = conj(alpha)*A(l,j), so each C(i,j) is
*     accumulated in registers across the whole K loop (C touched once, row
*     loads reused across the tile). The reference recomputes an O(K) strided
*     dot product per cell, so the tile wins ~1.25-1.75x here.
* -   **trans='no-transpose'** (C := alpha*A*B^H + ...) keeps the reference
*     rank-1-update structure verbatim (below). For that mode the fused
*     two-term tile recomputes the column temps once per row-tile — ~50% more
*     FLOPs — and the reference already streams C with unit stride on the common
*     column-major layout, so tiling would regress it. `ctrans` is a separate
*     function so this path retains its original codegen.
* -   The complex product is the faithful 4-mul/2-add form (no Gauss/Karatsuba).
*     The DIAGONAL of C is real by construction: diagonal cells accumulate only
*     the real part and store imag = 0, ignoring any stored imaginary part
*     (reference DBLE semantics). The opposite triangle is never touched.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A,B (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
* @param {Complex128} alpha - complex scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - complex input matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {number} beta - REAL scalar multiplier for C
* @param {Complex128Array} C - input/output Hermitian matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zher2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var temp1R;
	var temp1I;
	var temp2R;
	var temp2I;
	var upper;
	var nota;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var ajR;
	var ajI;
	var bjR;
	var bjI;
	var aiR;
	var aiI;
	var biR;
	var biI;
	var Av;
	var Bv;
	var Cv;
	var oA;
	var oB;
	var oC;
	var ic;
	var ia;
	var ib;
	var i;
	var j;
	var l;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	alphaR = real( alpha );
	alphaI = imag( alpha );

	if ( N === 0 || ( ( ( alphaR === 0.0 && alphaI === 0.0 ) || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// No multiply (alpha==0 or K==0, and beta!=1): scale the stored triangle by
	// beta, forcing the diagonal real (imag=0). Reference DBLE semantics.
	if ( ( alphaR === 0.0 && alphaI === 0.0 ) || K === 0 ) {
		if ( upper ) {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc2 );
				if ( beta === 0.0 ) {
					for ( i = 0; i <= j; i++ ) {
						Cv[ ic ] = 0.0;
						Cv[ ic + 1 ] = 0.0;
						ic += sc1;
					}
				} else {
					for ( i = 0; i < j; i++ ) {
						Cv[ ic ] *= beta;
						Cv[ ic + 1 ] *= beta;
						ic += sc1;
					}
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] = 0.0;
				}
			}
		} else if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				Cv[ ic ] *= beta;
				Cv[ ic + 1 ] = 0.0;
				ic += sc1;
				for ( i = j + 1; i < N; i++ ) {
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] *= beta;
					ic += sc1;
				}
			}
		}
		return C;
	}

	if ( !nota ) {
		ctrans( upper, N, K, alphaR, alphaI, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC );
		return C;
	}

	// C := alpha*A*B^H + conj(alpha)*B*A^H + beta*C (reference rank-1 form).
	if ( upper ) {
		for ( j = 0; j < N; j++ ) {
			if ( beta === 0.0 ) {
				ic = oC + ( j * sc2 );
				for ( i = 0; i <= j; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			} else if ( beta === 1.0 ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				Cv[ ic + 1 ] = 0.0;
			} else {
				ic = oC + ( j * sc2 );
				for ( i = 0; i < j; i++ ) {
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] *= beta;
					ic += sc1;
				}
				Cv[ ic ] *= beta;
				Cv[ ic + 1 ] = 0.0;
			}
			for ( l = 0; l < K; l++ ) {
				ia = oA + ( j * sa1 ) + ( l * sa2 );
				ib = oB + ( j * sb1 ) + ( l * sb2 );
				ajR = Av[ ia ];
				ajI = Av[ ia + 1 ];
				bjR = Bv[ ib ];
				bjI = Bv[ ib + 1 ];
				if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
					temp1R = ( alphaR * bjR ) + ( alphaI * bjI );
					temp1I = ( alphaI * bjR ) - ( alphaR * bjI );
					temp2R = ( alphaR * ajR ) - ( alphaI * ajI );
					temp2I = -( ( alphaR * ajI ) + ( alphaI * ajR ) );
					ic = oC + ( j * sc2 );
					ia = oA + ( l * sa2 );
					ib = oB + ( l * sb2 );
					for ( i = 0; i < j; i++ ) {
						aiR = Av[ ia ];
						aiI = Av[ ia + 1 ];
						biR = Bv[ ib ];
						biI = Bv[ ib + 1 ];
						Cv[ ic ] += ( aiR * temp1R ) - ( aiI * temp1I ) + ( biR * temp2R ) - ( biI * temp2I );
						Cv[ ic + 1 ] += ( aiR * temp1I ) + ( aiI * temp1R ) + ( biR * temp2I ) + ( biI * temp2R );
						ic += sc1;
						ia += sa1;
						ib += sb1;
					}
					aiR = Av[ ia ];
					aiI = Av[ ia + 1 ];
					biR = Bv[ ib ];
					biI = Bv[ ib + 1 ];
					Cv[ ic ] += ( aiR * temp1R ) - ( aiI * temp1I ) + ( biR * temp2R ) - ( biI * temp2I );
				}
			}
		}
	} else {
		for ( j = 0; j < N; j++ ) {
			if ( beta === 0.0 ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			} else if ( beta === 1.0 ) {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				Cv[ ic + 1 ] = 0.0;
			} else {
				ic = oC + ( j * sc1 ) + ( j * sc2 );
				Cv[ ic ] *= beta;
				Cv[ ic + 1 ] = 0.0;
				ic += sc1;
				for ( i = j + 1; i < N; i++ ) {
					Cv[ ic ] *= beta;
					Cv[ ic + 1 ] *= beta;
					ic += sc1;
				}
			}
			for ( l = 0; l < K; l++ ) {
				ia = oA + ( j * sa1 ) + ( l * sa2 );
				ib = oB + ( j * sb1 ) + ( l * sb2 );
				ajR = Av[ ia ];
				ajI = Av[ ia + 1 ];
				bjR = Bv[ ib ];
				bjI = Bv[ ib + 1 ];
				if ( ajR !== 0.0 || ajI !== 0.0 || bjR !== 0.0 || bjI !== 0.0 ) {
					temp1R = ( alphaR * bjR ) + ( alphaI * bjI );
					temp1I = ( alphaI * bjR ) - ( alphaR * bjI );
					temp2R = ( alphaR * ajR ) - ( alphaI * ajI );
					temp2I = -( ( alphaR * ajI ) + ( alphaI * ajR ) );
					ic = oC + ( j * sc1 ) + ( j * sc2 );
					Cv[ ic ] += ( ajR * temp1R ) - ( ajI * temp1I ) + ( bjR * temp2R ) - ( bjI * temp2I );
					ic += sc1;
					ia = oA + ( ( j + 1 ) * sa1 ) + ( l * sa2 );
					ib = oB + ( ( j + 1 ) * sb1 ) + ( l * sb2 );
					for ( i = j + 1; i < N; i++ ) {
						aiR = Av[ ia ];
						aiI = Av[ ia + 1 ];
						biR = Bv[ ib ];
						biI = Bv[ ib + 1 ];
						Cv[ ic ] += ( aiR * temp1R ) - ( aiI * temp1I ) + ( biR * temp2R ) - ( biI * temp2I );
						Cv[ ic + 1 ] += ( aiR * temp1I ) + ( aiI * temp1R ) + ( biR * temp2I ) + ( biI * temp2R );
						ic += sc1;
						ia += sa1;
						ib += sb1;
					}
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default zher2k;
