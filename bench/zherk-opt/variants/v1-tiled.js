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


// MAIN //

/**
* Performs one of the Hermitian rank-k operations:.
* C := alpha*A*A^H + beta*C,  or  C := alpha*A^H*A + beta*C
* where alpha and beta are REAL scalars, C is an N-by-N Hermitian matrix
* (stored as Complex128Array), and A is an N-by-K matrix in the first case
* and a K-by-N matrix in the second case. Only the upper or lower triangular
* part of C is updated; the diagonal of C is always real after the update.
*
* ## Notes
*
* -   2x2 complex register-tiled kernel over the STORED triangle (the settled
*     complex level-3 tile geometry; see bench/zgemm-opt/GEOMETRY.md). Each
*     C(i,j) is accumulated in registers across the whole K loop, so C is
*     touched once and every A load is reused across the tile.
* -   Both trans modes and both layouts collapse into one general-stride path:
*     effective strides (ar, ak) derived from the transpose flag, and the
*     conjugation folds into a hoisted +/-1 sign flag on the imaginary lane
*     (csa on the row operand, csb on the column operand) — never a per-element
*     branch. trans=N: C(i,j)=alpha*sum A(i,l)*conj(A(j,l)); trans=C:
*     C(i,j)=alpha*sum conj(A(l,i))*A(l,j).
* -   Faithful 4-mul/2-add complex product (no Gauss/Karatsuba). alpha/beta are
*     real, so scaling is cheap and applied in one shot (alpha*acc + beta*Cold).
* -   Full 2x2 tiles lie strictly off the diagonal; the diagonal-straddling
*     fringe and remainders use scalar cells. The DIAGONAL is real by
*     construction: diagonal cells accumulate a real sum of squares and store
*     imag = 0, ignoring any stored imaginary part (reference DBLE semantics).
* -   The opposite triangle of C is never read or written.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` for A*A^H, `'conjugate-transpose'` for A^H*A
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'conjugate-transpose')
* @param {number} alpha - real scalar multiplier
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {number} beta - real scalar multiplier
* @param {Complex128Array} C - input/output Hermitian matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C (in complex elements)
* @param {integer} strideC2 - stride of the second dimension of C (in complex elements)
* @param {NonNegativeInteger} offsetC - index offset for C (in complex elements)
* @returns {Complex128Array} `C`
*/
function zherk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
	// 8 complex-tile accumulator doubles declared first (V8 register allocation
	// is sensitive to declaration order; see bench/dgemm-opt/reports/).
	var c00R; var c00I; var c10R; var c10I; var c01R; var c01I; var c11R; var c11I;
	var a0R; var a0I; var a1R; var a1I; var b0R; var b0I; var b1R; var b1I;
	var pa0; var pa1; var pb0; var pb1; var pak; var pc;
	var upper; var nota; var ar; var ak; var csa; var csb;
	var sc1; var sc2; var oA; var oC; var Av; var Cv;
	var nb; var i; var j; var l; var ii; var ic;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	// Float64Array views; offsets/strides in Float64 units.
	Av = reinterpret( A, 0 );
	oA = offsetA * 2;
	Cv = reinterpret( C, 0 );
	oC = offsetC * 2;

	// Effective strides: op(A)(i,l) = A[ oA + (i*ar) + (l*ak) ]. For trans=N,
	// op(A)=A; for trans=C, op(A)(i,l)=A(l,i). csa/csb carry the conjugation.
	ar = ( nota ) ? strideA1 * 2 : strideA2 * 2;
	ak = ( nota ) ? strideA2 * 2 : strideA1 * 2;
	csa = ( nota ) ? 1.0 : -1.0; // conj on row operand
	csb = ( nota ) ? -1.0 : 1.0; // conj on column operand
	sc1 = strideC1 * 2;
	sc2 = strideC2 * 2;

	// No multiply (alpha==0 or K==0, and beta!=1): scale the stored triangle
	// by beta, forcing the diagonal real (imag=0). Reference DBLE semantics.
	if ( alpha === 0.0 || K === 0 ) {
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
					// Diagonal: scale real part only, imag = 0.
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
				// Diagonal: scale real part only, imag = 0.
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
			pb0 = oA + ( j * ar );
			pb1 = pb0 + ar;

			// Full 2x2 tiles strictly above the diagonal (rows i,i+1 with i+1 < j).
			for ( i = 0; i + 2 <= j; i += 2 ) {
				c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
				c01R = 0.0; c01I = 0.0; c11R = 0.0; c11I = 0.0;
				pa0 = oA + ( i * ar );
				pa1 = pa0 + ar;
				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					a0R = Av[ pa0 + pak ]; a0I = csa * Av[ pa0 + pak + 1 ];
					a1R = Av[ pa1 + pak ]; a1I = csa * Av[ pa1 + pak + 1 ];
					b0R = Av[ pb0 + pak ]; b0I = csb * Av[ pb0 + pak + 1 ];
					b1R = Av[ pb1 + pak ]; b1I = csb * Av[ pb1 + pak + 1 ];
					c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
					c10R += ( a1R * b0R ) - ( a1I * b0I ); c10I += ( a1R * b0I ) + ( a1I * b0R );
					c01R += ( a0R * b1R ) - ( a0I * b1I ); c01I += ( a0R * b1I ) + ( a0I * b1R );
					c11R += ( a1R * b1R ) - ( a1I * b1I ); c11I += ( a1R * b1I ) + ( a1I * b1R );
				}
				pc = oC + ( i * sc1 ) + ( j * sc2 );
				if ( beta === 0.0 ) {
					Cv[ pc ] = alpha * c00R; Cv[ pc + 1 ] = alpha * c00I;
					Cv[ pc + sc1 ] = alpha * c10R; Cv[ pc + sc1 + 1 ] = alpha * c10I;
					Cv[ pc + sc2 ] = alpha * c01R; Cv[ pc + sc2 + 1 ] = alpha * c01I;
					Cv[ pc + sc1 + sc2 ] = alpha * c11R; Cv[ pc + sc1 + sc2 + 1 ] = alpha * c11I;
				} else {
					Cv[ pc ] = ( alpha * c00R ) + ( beta * Cv[ pc ] ); Cv[ pc + 1 ] = ( alpha * c00I ) + ( beta * Cv[ pc + 1 ] );
					Cv[ pc + sc1 ] = ( alpha * c10R ) + ( beta * Cv[ pc + sc1 ] ); Cv[ pc + sc1 + 1 ] = ( alpha * c10I ) + ( beta * Cv[ pc + sc1 + 1 ] );
					Cv[ pc + sc2 ] = ( alpha * c01R ) + ( beta * Cv[ pc + sc2 ] ); Cv[ pc + sc2 + 1 ] = ( alpha * c01I ) + ( beta * Cv[ pc + sc2 + 1 ] );
					Cv[ pc + sc1 + sc2 ] = ( alpha * c11R ) + ( beta * Cv[ pc + sc1 + sc2 ] ); Cv[ pc + sc1 + sc2 + 1 ] = ( alpha * c11I ) + ( beta * Cv[ pc + sc1 + sc2 + 1 ] );
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
			pb0 = oA + ( j * ar );
			pb1 = pb0 + ar;

			// Diagonal block (rows j..j+1 within columns j, j+1).
			diag( j );
			offdiag( j + 1, j );
			diag( j + 1 );

			// Full 2x2 tiles strictly below the diagonal block (rows i>=j+2).
			for ( i = j + 2; i + 2 <= N; i += 2 ) {
				c00R = 0.0; c00I = 0.0; c10R = 0.0; c10I = 0.0;
				c01R = 0.0; c01I = 0.0; c11R = 0.0; c11I = 0.0;
				pa0 = oA + ( i * ar );
				pa1 = pa0 + ar;
				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					a0R = Av[ pa0 + pak ]; a0I = csa * Av[ pa0 + pak + 1 ];
					a1R = Av[ pa1 + pak ]; a1I = csa * Av[ pa1 + pak + 1 ];
					b0R = Av[ pb0 + pak ]; b0I = csb * Av[ pb0 + pak + 1 ];
					b1R = Av[ pb1 + pak ]; b1I = csb * Av[ pb1 + pak + 1 ];
					c00R += ( a0R * b0R ) - ( a0I * b0I ); c00I += ( a0R * b0I ) + ( a0I * b0R );
					c10R += ( a1R * b0R ) - ( a1I * b0I ); c10I += ( a1R * b0I ) + ( a1I * b0R );
					c01R += ( a0R * b1R ) - ( a0I * b1I ); c01I += ( a0R * b1I ) + ( a0I * b1R );
					c11R += ( a1R * b1R ) - ( a1I * b1I ); c11I += ( a1R * b1I ) + ( a1I * b1R );
				}
				pc = oC + ( i * sc1 ) + ( j * sc2 );
				if ( beta === 0.0 ) {
					Cv[ pc ] = alpha * c00R; Cv[ pc + 1 ] = alpha * c00I;
					Cv[ pc + sc1 ] = alpha * c10R; Cv[ pc + sc1 + 1 ] = alpha * c10I;
					Cv[ pc + sc2 ] = alpha * c01R; Cv[ pc + sc2 + 1 ] = alpha * c01I;
					Cv[ pc + sc1 + sc2 ] = alpha * c11R; Cv[ pc + sc1 + sc2 + 1 ] = alpha * c11I;
				} else {
					Cv[ pc ] = ( alpha * c00R ) + ( beta * Cv[ pc ] ); Cv[ pc + 1 ] = ( alpha * c00I ) + ( beta * Cv[ pc + 1 ] );
					Cv[ pc + sc1 ] = ( alpha * c10R ) + ( beta * Cv[ pc + sc1 ] ); Cv[ pc + sc1 + 1 ] = ( alpha * c10I ) + ( beta * Cv[ pc + sc1 + 1 ] );
					Cv[ pc + sc2 ] = ( alpha * c01R ) + ( beta * Cv[ pc + sc2 ] ); Cv[ pc + sc2 + 1 ] = ( alpha * c01I ) + ( beta * Cv[ pc + sc2 + 1 ] );
					Cv[ pc + sc1 + sc2 ] = ( alpha * c11R ) + ( beta * Cv[ pc + sc1 + sc2 ] ); Cv[ pc + sc1 + sc2 + 1 ] = ( alpha * c11I ) + ( beta * Cv[ pc + sc1 + sc2 + 1 ] );
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

	// Off-diagonal cell (ii,jj): C(ii,jj) = alpha*sum + beta*C(ii,jj).
	function offdiag( ii, jj ) {
		var pi;
		var pj;
		var cR;
		var cI;
		var aR;
		var aI;
		var bR;
		var bI;
		var p;
		var d;
		var ll;
		pi = oA + ( ii * ar );
		pj = oA + ( jj * ar );
		cR = 0.0;
		cI = 0.0;
		for ( ll = 0; ll < K; ll++ ) {
			p = ll * ak;
			aR = Av[ pi + p ]; aI = csa * Av[ pi + p + 1 ];
			bR = Av[ pj + p ]; bI = csb * Av[ pj + p + 1 ];
			cR += ( aR * bR ) - ( aI * bI );
			cI += ( aR * bI ) + ( aI * bR );
		}
		d = oC + ( ii * sc1 ) + ( jj * sc2 );
		if ( beta === 0.0 ) {
			Cv[ d ] = alpha * cR;
			Cv[ d + 1 ] = alpha * cI;
		} else {
			Cv[ d ] = ( alpha * cR ) + ( beta * Cv[ d ] );
			Cv[ d + 1 ] = ( alpha * cI ) + ( beta * Cv[ d + 1 ] );
		}
	}

	// Diagonal cell (jj,jj): real sum of squares; imag forced to zero.
	function diag( jj ) {
		var pj;
		var rt;
		var re;
		var im;
		var p;
		var d;
		var ll;
		pj = oA + ( jj * ar );
		rt = 0.0;
		for ( ll = 0; ll < K; ll++ ) {
			p = ll * ak;
			re = Av[ pj + p ];
			im = Av[ pj + p + 1 ];
			rt += ( re * re ) + ( im * im );
		}
		d = oC + ( jj * sc1 ) + ( jj * sc2 );
		if ( beta === 0.0 ) {
			Cv[ d ] = alpha * rt;
		} else {
			Cv[ d ] = ( alpha * rt ) + ( beta * Cv[ d ] );
		}
		Cv[ d + 1 ] = 0.0;
	}
}


// EXPORTS //

export default zherk;
