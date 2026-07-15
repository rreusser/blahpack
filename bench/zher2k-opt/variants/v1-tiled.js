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
* -   2x2 complex register-tiled kernel over the STORED triangle (the settled
*     complex level-3 tile geometry; see bench/zgemm-opt/GEOMETRY.md). The two
*     rank-2k product terms (alpha*A*B^H and conj(alpha)*B*A^H) are FUSED into a
*     single complex accumulator per cell by folding alpha into hoisted column
*     factors t1 = alpha*conj(B(j,l)) and t2 = conj(alpha)*conj(A(j,l)) (the
*     reference temp1/temp2). Each C(i,j) is accumulated in registers across the
*     whole K loop, so C is touched once and every row load is reused across the
*     tile.
* -   Both trans modes and both layouts collapse into one general-stride path:
*     effective strides (ar, ak) for A and (br, bk) for B derived from the
*     transpose flag, with the conjugation folded into hoisted +/-1 sign flags
*     (csr on the row operands, csc on the column operands) — never a per-element
*     branch. trans=N: t1/t2 conjugate the column operand (csc=-1);
*     trans=C: they conjugate the row operand (csr=-1).
* -   Faithful 4-mul/2-add complex product (no Gauss/Karatsuba). beta is real,
*     so scaling is a single acc + beta*Cold (alpha is already inside acc).
* -   Full 2x2 tiles lie strictly off the diagonal; the diagonal-straddling
*     fringe and remainders use scalar cells. The DIAGONAL is real by
*     construction: diagonal cells accumulate only the real part and store
*     imag = 0, ignoring any stored imaginary part (reference DBLE semantics).
* -   The opposite triangle of C is never read or written.
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
	// 8 complex-tile accumulator doubles declared first (V8 register allocation
	// is sensitive to declaration order; see bench/dgemm-opt/reports/).
	var c00R; var c00I; var c10R; var c10I; var c01R; var c01I; var c11R; var c11I;
	var a0R; var a0I; var a1R; var a1I; var d0R; var d0I; var d1R; var d1I;
	var t1_0R; var t1_0I; var t2_0R; var t2_0I; var t1_1R; var t1_1I; var t2_1R; var t2_1I;
	var bc0R; var bc0I; var ac0R; var ac0I; var bc1R; var bc1I; var ac1R; var ac1I;
	var pAi0; var pAi1; var pBi0; var pBi1; var pAj0; var pAj1; var pBj0; var pBj1;
	var pak; var pbk; var pc;
	var upper; var nota; var ar; var ak; var br; var bk; var csr; var csc;
	var alphaR; var alphaI; var sc1; var sc2; var oA; var oB; var oC; var Av; var Bv; var Cv;
	var nb; var i; var j; var l; var ii; var ic;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	alphaR = real( alpha );
	alphaI = imag( alpha );

	if ( N === 0 || ( ( ( alphaR === 0.0 && alphaI === 0.0 ) || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	// Float64Array views; offsets/strides in Float64 units.
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Bv = reinterpret( B, 0 );
	oB = offsetB * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	// Effective strides: op(A)(i,l) = A[ oA + (i*ar) + (l*ak) ], likewise B. For
	// trans=N op=A; for trans=C op(A)(i,l)=A(l,i). csr conjugates the row
	// operands (index i), csc conjugates the column operands (index j).
	ar = ( nota ) ? strideA1 * 2 : strideA2 * 2;
	ak = ( nota ) ? strideA2 * 2 : strideA1 * 2;
	br = ( nota ) ? strideB1 * 2 : strideB2 * 2;
	bk = ( nota ) ? strideB2 * 2 : strideB1 * 2;
	csr = ( nota ) ? 1.0 : -1.0;
	csc = ( nota ) ? -1.0 : 1.0;
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

	nb = N - ( N % 2 );
	if ( upper ) {
		for ( j = 0; j < nb; j += 2 ) {
			pAj0 = oA + ( j * ar );
			pAj1 = pAj0 + ar;
			pBj0 = oB + ( j * br );
			pBj1 = pBj0 + br;

			// Full 2x2 tiles strictly above the diagonal (rows i,i+1 with i+1 < j).
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
					a0R = Av[ pAi0 + pak ]; a0I = csr * Av[ pAi0 + pak + 1 ];
					a1R = Av[ pAi1 + pak ]; a1I = csr * Av[ pAi1 + pak + 1 ];
					d0R = Bv[ pBi0 + pbk ]; d0I = csr * Bv[ pBi0 + pbk + 1 ];
					d1R = Bv[ pBi1 + pbk ]; d1I = csr * Bv[ pBi1 + pbk + 1 ];
					bc0R = Bv[ pBj0 + pbk ]; bc0I = Bv[ pBj0 + pbk + 1 ];
					ac0R = Av[ pAj0 + pak ]; ac0I = Av[ pAj0 + pak + 1 ];
					t1_0R = ( alphaR * bc0R ) - ( csc * alphaI * bc0I ); t1_0I = ( csc * alphaR * bc0I ) + ( alphaI * bc0R );
					t2_0R = ( alphaR * ac0R ) + ( csc * alphaI * ac0I ); t2_0I = ( csc * alphaR * ac0I ) - ( alphaI * ac0R );
					bc1R = Bv[ pBj1 + pbk ]; bc1I = Bv[ pBj1 + pbk + 1 ];
					ac1R = Av[ pAj1 + pak ]; ac1I = Av[ pAj1 + pak + 1 ];
					t1_1R = ( alphaR * bc1R ) - ( csc * alphaI * bc1I ); t1_1I = ( csc * alphaR * bc1I ) + ( alphaI * bc1R );
					t2_1R = ( alphaR * ac1R ) + ( csc * alphaI * ac1I ); t2_1I = ( csc * alphaR * ac1I ) - ( alphaI * ac1R );
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

			// Diagonal-straddling fringe for columns j, j+1 (scalar, exact bounds).
			for ( ii = i; ii < j; ii++ ) {
				offdiag( ii, j );
			}
			diag( j );
			for ( ii = i; ii < j + 1; ii++ ) {
				offdiag( ii, j + 1 );
			}
			diag( j + 1 );
		}

		// Remainder column (N odd): full column, exact triangle bounds.
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

			// Diagonal block (rows j..j+1 within columns j, j+1).
			diag( j );
			offdiag( j + 1, j );
			diag( j + 1 );

			// Full 2x2 tiles strictly below the diagonal block (rows i>=j+2).
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
					a0R = Av[ pAi0 + pak ]; a0I = csr * Av[ pAi0 + pak + 1 ];
					a1R = Av[ pAi1 + pak ]; a1I = csr * Av[ pAi1 + pak + 1 ];
					d0R = Bv[ pBi0 + pbk ]; d0I = csr * Bv[ pBi0 + pbk + 1 ];
					d1R = Bv[ pBi1 + pbk ]; d1I = csr * Bv[ pBi1 + pbk + 1 ];
					bc0R = Bv[ pBj0 + pbk ]; bc0I = Bv[ pBj0 + pbk + 1 ];
					ac0R = Av[ pAj0 + pak ]; ac0I = Av[ pAj0 + pak + 1 ];
					t1_0R = ( alphaR * bc0R ) - ( csc * alphaI * bc0I ); t1_0I = ( csc * alphaR * bc0I ) + ( alphaI * bc0R );
					t2_0R = ( alphaR * ac0R ) + ( csc * alphaI * ac0I ); t2_0I = ( csc * alphaR * ac0I ) - ( alphaI * ac0R );
					bc1R = Bv[ pBj1 + pbk ]; bc1I = Bv[ pBj1 + pbk + 1 ];
					ac1R = Av[ pAj1 + pak ]; ac1I = Av[ pAj1 + pak + 1 ];
					t1_1R = ( alphaR * bc1R ) - ( csc * alphaI * bc1I ); t1_1I = ( csc * alphaR * bc1I ) + ( alphaI * bc1R );
					t2_1R = ( alphaR * ac1R ) + ( csc * alphaI * ac1I ); t2_1I = ( csc * alphaR * ac1I ) - ( alphaI * ac1R );
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

			// Remainder rows i..N-1 for columns j, j+1 (scalar).
			for ( ii = i; ii < N; ii++ ) {
				offdiag( ii, j );
			}
			for ( ii = i; ii < N; ii++ ) {
				offdiag( ii, j + 1 );
			}
		}

		// Remainder column (N odd): rows j..N-1, exact triangle bounds.
		for ( j = nb; j < N; j++ ) {
			diag( j );
			for ( ii = j + 1; ii < N; ii++ ) {
				offdiag( ii, j );
			}
		}
	}
	return C;

	// Off-diagonal cell (ii,jj): C(ii,jj) = alpha*A*B^H + conj(alpha)*B*A^H + beta*C.
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
			aR = Av[ pAi + pa ]; aI = csr * Av[ pAi + pa + 1 ];
			bR = Bv[ pBi + pb ]; bI = csr * Bv[ pBi + pb + 1 ];
			bcR = Bv[ pBj + pb ]; bcI = Bv[ pBj + pb + 1 ];
			acR = Av[ pAj + pa ]; acI = Av[ pAj + pa + 1 ];
			t1R = ( alphaR * bcR ) - ( csc * alphaI * bcI ); t1I = ( csc * alphaR * bcI ) + ( alphaI * bcR );
			t2R = ( alphaR * acR ) + ( csc * alphaI * acI ); t2I = ( csc * alphaR * acI ) - ( alphaI * acR );
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
			aR = Av[ pAj + pa ]; aI = csr * Av[ pAj + pa + 1 ];
			bR = Bv[ pBj + pb ]; bI = csr * Bv[ pBj + pb + 1 ];
			bcR = Bv[ pBj + pb ]; bcI = Bv[ pBj + pb + 1 ];
			acR = Av[ pAj + pa ]; acI = Av[ pAj + pa + 1 ];
			t1R = ( alphaR * bcR ) - ( csc * alphaI * bcI ); t1I = ( csc * alphaR * bcI ) + ( alphaI * bcR );
			t2R = ( alphaR * acR ) + ( csc * alphaI * acI ); t2I = ( csc * alphaR * acI ) - ( alphaI * acR );
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


// EXPORTS //

export default zher2k;
