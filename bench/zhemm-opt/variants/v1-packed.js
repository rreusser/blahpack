/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-lines-per-function, max-params, max-statements, max-depth */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// VARIABLES //

// Packing scratch: two rows of the (virtual) Hermitian operand, each K complex
// elements = 4*K doubles. Module-level, reused across calls (grown on demand);
// safe because the kernel never calls out while the buffer is live. Grown by
// the main function; never shrunk.
var PACK = new Float64Array( 2 * 2 * 64 );


// MAIN //

/**
* Performs one of the Hermitian matrix-matrix operations:.
* C := alpha_A_B + beta_C, or C := alpha_B_A + beta_C,
* where alpha and beta are complex scalars, A is a Hermitian matrix, and B and C
* are M-by-N matrices.
*
* ## Notes
*
* -   2x2 complex register-tiled kernel (`bench/zgemm-opt/GEOMETRY.md`). The
*     Hermitian operand is *materialized* two rows at a time from the stored
*     triangle into a small contiguous scratch buffer (conjugating mirror
*     entries, zeroing the diagonal imaginary part), after which the inner
*     K-loop is a plain complex-gemm microkernel. Packing is O(2K) amortized
*     over the whole column sweep of C.
* -   `side='right'` folds into the same kernel: C := alpha*B*A + beta*C is
*     C^T := alpha*conj(A)*B^T + beta*C^T because A^T = conj(A) for Hermitian A.
*     So the kernel runs with the B/C stride pairs swapped and the packed A
*     conjugated via a hoisted `csa = -1` sign on its imaginary lane.
*
* @private
* @param {string} side - 'left' if A is on the left, 'right' if A is on the right
* @param {string} uplo - 'upper' or 'lower', specifies which triangle of A is stored
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128} alpha - complex scalar multiplier for A*B or B*A
* @param {Complex128Array} A - Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @param {Complex128} beta - complex scalar multiplier for C
* @param {Complex128Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zhemm( side, uplo, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var alphaR;
	var alphaI;
	var betaR;
	var betaI;
	var bZero;
	var upper;
	var lside;
	var csa;
	var Av;
	var Bv;
	var Cv;
	var oA;
	var oB;
	var oC;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sc1;
	var sc2;
	var scr1;
	var scr2;
	var K;
	var NN;
	var mb;
	var nb;
	var need;
	var p1;
	var pb0;
	var pb1;
	var pbj;
	var pc;
	var pc2;
	var lb;
	var ll;
	var c00R;
	var c00I;
	var c10R;
	var c10I;
	var c01R;
	var c01I;
	var c11R;
	var c11I;
	var a0R;
	var a0I;
	var a1R;
	var a1I;
	var b0R;
	var b0I;
	var b1R;
	var b1I;
	var cR;
	var cI;
	var i;
	var j;
	var k;
	var l;
	var ic;

	lside = ( side === 'left' );
	upper = ( uplo === 'upper' );

	alphaR = real( alpha );
	alphaI = imag( alpha );
	betaR = real( beta );
	betaI = imag( beta );

	if ( M === 0 || N === 0 || ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) ) {
		return C;
	}

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );
	Cv = reinterpret( C, 0 );
	oA = offsetA * 2;
	oB = offsetB * 2;
	oC = offsetC * 2;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;

	// When alpha is zero, just scale C by beta (over the original M-by-N C):
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		sc1 = strideC1 * 2;
		sc2 = strideC2 * 2;
		if ( betaR === 0.0 && betaI === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					Cv[ ic ] = 0.0;
					Cv[ ic + 1 ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = oC + ( j * sc2 );
				for ( i = 0; i < M; i++ ) {
					cR = Cv[ ic ];
					cI = Cv[ ic + 1 ];
					Cv[ ic ] = ( betaR * cR ) - ( betaI * cI );
					Cv[ ic + 1 ] = ( betaR * cI ) + ( betaI * cR );
					ic += sc1;
				}
			}
		}
		return C;
	}

	// Reduce both sides to C' := alpha*S*B' + beta*C' with S = A (Hermitian,
	// K x K) and C' being K x NN. For side='right', C' = C^T, B' = B^T, and S is
	// conjugated (A^T = conj(A)); the conjugation is folded into `csa`.
	if ( lside ) {
		K = M;
		NN = N;
		sb1 = strideB1 * 2;
		sb2 = strideB2 * 2;
		scr1 = strideC1 * 2;
		scr2 = strideC2 * 2;
		csa = 1.0;
	} else {
		K = N;
		NN = M;
		sb1 = strideB2 * 2;
		sb2 = strideB1 * 2;
		scr1 = strideC2 * 2;
		scr2 = strideC1 * 2;
		csa = -1.0;
	}

	bZero = ( betaR === 0.0 && betaI === 0.0 );

	// Grow the packing scratch if this K needs more than the current buffer:
	need = 4 * K;
	if ( PACK.length < need ) {
		PACK = new Float64Array( need );
	}

	mb = K - ( K % 2 );
	nb = NN - ( NN % 2 );
	p1 = 2 * K;

	// 2-row groups of the Hermitian dimension:
	for ( i = 0; i < mb; i += 2 ) {
		packRow( i, 0 );
		packRow( i + 1, p1 );

		// 2x2 tiles over full column pairs:
		for ( j = 0; j < nb; j += 2 ) {
			pb0 = oB + ( j * sb2 );
			pb1 = pb0 + sb2;
			c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
			c01R = 0.0; c01I = 0.0; c11R = 0.0; c11I = 0.0;
			for ( l = 0; l < K; l++ ) {
				ll = 2 * l;
				a0R = PACK[ ll ]; a0I = csa * PACK[ ll + 1 ];
				a1R = PACK[ p1 + ll ]; a1I = csa * PACK[ p1 + ll + 1 ];
				lb = l * sb1;
				b0R = Bv[ pb0 + lb ]; b0I = Bv[ pb0 + lb + 1 ];
				b1R = Bv[ pb1 + lb ]; b1I = Bv[ pb1 + lb + 1 ];
				c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
				c10R += ( a1R * b0R ) - ( a1I * b0I ); c10I += ( a1R * b0I ) + ( a1I * b0R );
				c01R += ( a0R * b1R ) - ( a0I * b1I ); c01I += ( a0R * b1I ) + ( a0I * b1R );
				c11R += ( a1R * b1R ) - ( a1I * b1I ); c11I += ( a1R * b1I ) + ( a1I * b1R );
			}
			pc = oC + ( i * scr1 ) + ( j * scr2 );
			pc2 = pc + scr2;
			if ( bZero ) {
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R );
				Cv[ pc + scr1 ] = ( alphaR * c10R ) - ( alphaI * c10I ); Cv[ pc + scr1 + 1 ] = ( alphaR * c10I ) + ( alphaI * c10R );
				Cv[ pc2 ] = ( alphaR * c01R ) - ( alphaI * c01I ); Cv[ pc2 + 1 ] = ( alphaR * c01I ) + ( alphaI * c01R );
				Cv[ pc2 + scr1 ] = ( alphaR * c11R ) - ( alphaI * c11I ); Cv[ pc2 + scr1 + 1 ] = ( alphaR * c11I ) + ( alphaI * c11R );
			} else {
				cR = Cv[ pc ]; cI = Cv[ pc + 1 ];
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R ) + ( betaR * cI ) + ( betaI * cR );
				cR = Cv[ pc + scr1 ]; cI = Cv[ pc + scr1 + 1 ];
				Cv[ pc + scr1 ] = ( alphaR * c10R ) - ( alphaI * c10I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc + scr1 + 1 ] = ( alphaR * c10I ) + ( alphaI * c10R ) + ( betaR * cI ) + ( betaI * cR );
				cR = Cv[ pc2 ]; cI = Cv[ pc2 + 1 ];
				Cv[ pc2 ] = ( alphaR * c01R ) - ( alphaI * c01I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc2 + 1 ] = ( alphaR * c01I ) + ( alphaI * c01R ) + ( betaR * cI ) + ( betaI * cR );
				cR = Cv[ pc2 + scr1 ]; cI = Cv[ pc2 + scr1 + 1 ];
				Cv[ pc2 + scr1 ] = ( alphaR * c11R ) - ( alphaI * c11I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc2 + scr1 + 1 ] = ( alphaR * c11I ) + ( alphaI * c11R ) + ( betaR * cI ) + ( betaI * cR );
			}
		}

		// Edge column (2x1 tile) when NN is odd:
		for ( k = nb; k < NN; k++ ) {
			pbj = oB + ( k * sb2 );
			c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
			for ( l = 0; l < K; l++ ) {
				ll = 2 * l;
				a0R = PACK[ ll ]; a0I = csa * PACK[ ll + 1 ];
				a1R = PACK[ p1 + ll ]; a1I = csa * PACK[ p1 + ll + 1 ];
				lb = l * sb1;
				b0R = Bv[ pbj + lb ]; b0I = Bv[ pbj + lb + 1 ];
				c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
				c10R += ( a1R * b0R ) - ( a1I * b0I ); c10I += ( a1R * b0I ) + ( a1I * b0R );
			}
			pc = oC + ( i * scr1 ) + ( k * scr2 );
			if ( bZero ) {
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R );
				Cv[ pc + scr1 ] = ( alphaR * c10R ) - ( alphaI * c10I ); Cv[ pc + scr1 + 1 ] = ( alphaR * c10I ) + ( alphaI * c10R );
			} else {
				cR = Cv[ pc ]; cI = Cv[ pc + 1 ];
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R ) + ( betaR * cI ) + ( betaI * cR );
				cR = Cv[ pc + scr1 ]; cI = Cv[ pc + scr1 + 1 ];
				Cv[ pc + scr1 ] = ( alphaR * c10R ) - ( alphaI * c10I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc + scr1 + 1 ] = ( alphaR * c10I ) + ( alphaI * c10R ) + ( betaR * cI ) + ( betaI * cR );
			}
		}
	}

	// Edge row (single) when K is odd:
	for ( i = mb; i < K; i++ ) {
		packRow( i, 0 );
		for ( k = 0; k < NN; k++ ) {
			pbj = oB + ( k * sb2 );
			c00R = 0.0; c00I = 0.0;
			for ( l = 0; l < K; l++ ) {
				ll = 2 * l;
				a0R = PACK[ ll ]; a0I = csa * PACK[ ll + 1 ];
				lb = l * sb1;
				b0R = Bv[ pbj + lb ]; b0I = Bv[ pbj + lb + 1 ];
				c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
			}
			pc = oC + ( i * scr1 ) + ( k * scr2 );
			if ( bZero ) {
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R );
			} else {
				cR = Cv[ pc ]; cI = Cv[ pc + 1 ];
				Cv[ pc ] = ( alphaR * c00R ) - ( alphaI * c00I ) + ( betaR * cR ) - ( betaI * cI ); Cv[ pc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R ) + ( betaR * cI ) + ( betaI * cR );
			}
		}
	}
	return C;

	/**
	* Packs row `r` of the (virtual) Hermitian matrix over `p = 0..K-1` into
	* `PACK` starting at double index `dst`, materializing entries from the
	* stored triangle in the "left" convention `S[r,p] = A[r,p]`.
	*
	* Off-diagonal entries not in the stored triangle are read from the mirror
	* and conjugated (`A[r,p] = conj(A[p,r])`). The diagonal is real: only
	* `DBLE(A[r,r])` is read and the packed imaginary part is forced to zero, so
	* any garbage stored in the diagonal's imaginary slot is ignored (matching
	* the reference).
	*
	* @private
	* @param {NonNegativeInteger} r - row to pack
	* @param {NonNegativeInteger} dst - packed destination (double index)
	*/
	function packRow( r, dst ) {
		var base;
		var q;
		var p;

		q = dst;
		if ( upper ) {
			for ( p = 0; p < K; p++ ) {
				if ( p === r ) {
					// Diagonal is real: DBLE(A(r,r)); imaginary forced to zero.
					PACK[ q ] = Av[ oA + ( r * sa1 ) + ( r * sa2 ) ];
					PACK[ q + 1 ] = 0.0;
				} else if ( p > r ) {
					// Stored as-is at (r,p):
					base = oA + ( r * sa1 ) + ( p * sa2 );
					PACK[ q ] = Av[ base ];
					PACK[ q + 1 ] = Av[ base + 1 ];
				} else {
					// A[r,p] = conj(A[p,r]); (p,r) is in the upper triangle:
					base = oA + ( p * sa1 ) + ( r * sa2 );
					PACK[ q ] = Av[ base ];
					PACK[ q + 1 ] = -Av[ base + 1 ];
				}
				q += 2;
			}
		} else {
			for ( p = 0; p < K; p++ ) {
				if ( p === r ) {
					PACK[ q ] = Av[ oA + ( r * sa1 ) + ( r * sa2 ) ];
					PACK[ q + 1 ] = 0.0;
				} else if ( p < r ) {
					// Stored as-is at (r,p):
					base = oA + ( r * sa1 ) + ( p * sa2 );
					PACK[ q ] = Av[ base ];
					PACK[ q + 1 ] = Av[ base + 1 ];
				} else {
					// A[r,p] = conj(A[p,r]); (p,r) is in the lower triangle:
					base = oA + ( p * sa1 ) + ( r * sa2 );
					PACK[ q ] = Av[ base ];
					PACK[ q + 1 ] = -Av[ base + 1 ];
				}
				q += 2;
			}
		}
	}
}


// EXPORTS //

export default zhemm;
