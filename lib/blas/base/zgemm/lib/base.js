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
* Perform one of the complex matrix-matrix operations:.
* C := alpha_op(A)_op(B) + beta*C
* where op(X) is one of X, X**T, or X**H.
*
* ## Notes
*
* -   2x2 complex register-tiled kernel. Each 2x2 block of C is accumulated in
*     registers (four complex accumulators = eight doubles) across the whole K
*     loop, so C is touched once and every A/B load is reused across the tile.
*     A single general-stride code path covers all nine op combinations: the
*     transpose is folded into effective row/column strides and conjugation is
*     folded into a hoisted +/-1 sign multiplier on the imaginary lane (`csa`,
*     `csb`), never a per-element branch. The complex product uses the faithful
*     four-multiply / two-add form (no Gauss/Karatsuba, which would change
*     per-element rounding). Row/column remainders fall to scalar complex-dot
*     cleanup loops. See `bench/zgemm-opt/GEOMETRY.md` for the geometry sweep
*     that settled the 2x2 tile, and `DIFFERENCES.md` for the verification tier.
*
* @private
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} transb - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - rows of op(A) and C
* @param {NonNegativeInteger} N - columns of op(B) and C
* @param {NonNegativeInteger} K - columns of op(A) / rows of op(B)
* @param {Complex128} alpha - complex scalar
* @param {Complex128Array} A - complex input matrix
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Complex128Array} B - complex input matrix
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
* @param {Complex128} beta - complex scalar
* @param {Complex128Array} C - complex input/output matrix
* @param {integer} strideC1 - first dimension stride of C
* @param {integer} strideC2 - second dimension stride of C
* @param {NonNegativeInteger} offsetC - starting index for C (in complex elements)
* @returns {Complex128Array} C
*/
function zgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	let c00R, c00I, c01R, c01I, c10R, c10I, c11R, c11I, a0R, a0I, a1R, a1I, b0R;
	let b0I, b1R, b1I, pa0, pa1, pb0, pb1, pak, pbk, pc, pcc, sR, sI, cR, cI;
	let tR, tI, aR, aI, bR, bI, pa, pb, i, j, l;

	if ( M === 0 || N === 0 ) {
		return C;
	}
	const alphaR = real( alpha );
	const alphaI = imag( alpha );
	const betaR = real( beta );
	const betaI = imag( beta );

	// Quick return if alpha=0 and beta=1:
	if ( alphaR === 0.0 && alphaI === 0.0 && betaR === 1.0 && betaI === 0.0 ) {
		return C;
	}
	const nota = ( transa === 'no-transpose' );
	const notb = ( transb === 'no-transpose' );

	// Conjugation folds into a hoisted sign on the imaginary lane:
	const csa = ( transa === 'conjugate-transpose' ) ? -1.0 : 1.0;
	const csb = ( transb === 'conjugate-transpose' ) ? -1.0 : 1.0;

	// Get Float64Array views and double offsets/strides for interleaved storage:
	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );
	const Cv = reinterpret( C, 0 );
	const oA = offsetA * 2;
	const oB = offsetB * 2;
	const oC = offsetC * 2;
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;
	const sb1 = strideB1 * 2;
	const sb2 = strideB2 * 2;

	// Effective row/column strides fold the transpose into the access pattern:
	const ar = nota ? sa1 : sa2;
	const ak = nota ? sa2 : sa1;
	const bk = notb ? sb1 : sb2;
	const bn = notb ? sb2 : sb1;
	const sc1 = strideC1 * 2;
	const sc2 = strideC2 * 2;

	// When alpha=0, scale C by beta and return:
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			pc = oC + ( j * sc2 );
			if ( betaR === 0.0 && betaI === 0.0 ) {
				for ( i = 0; i < M; i++ ) {
					Cv[ pc ] = 0.0;
					Cv[ pc + 1 ] = 0.0;
					pc += sc1;
				}
			} else {
				for ( i = 0; i < M; i++ ) {
					cR = Cv[ pc ];
					cI = Cv[ pc + 1 ];
					Cv[ pc ] = ( betaR * cR ) - ( betaI * cI );
					Cv[ pc + 1 ] = ( betaR * cI ) + ( betaI * cR );
					pc += sc1;
				}
			}
		}
		return C;
	}

	const mb = M - ( M % 2 );
	const nb = N - ( N % 2 );

	// Main 2x2 register-tiled loop:
	for ( j = 0; j < nb; j += 2 ) {
		pb0 = oB + ( j * bn );
		pb1 = pb0 + bn;
		for ( i = 0; i < mb; i += 2 ) {
			c00R = 0.0;
			c00I = 0.0;
			c01R = 0.0;
			c01I = 0.0;
			c10R = 0.0;
			c10I = 0.0;
			c11R = 0.0;
			c11I = 0.0;
			pa0 = oA + ( i * ar );
			pa1 = pa0 + ar;
			for ( l = 0; l < K; l++ ) {
				pak = l * ak;
				pbk = l * bk;
				a0R = Av[ pa0 + pak ];
				a0I = csa * Av[ pa0 + pak + 1 ];
				a1R = Av[ pa1 + pak ];
				a1I = csa * Av[ pa1 + pak + 1 ];
				b0R = Bv[ pb0 + pbk ];
				b0I = csb * Bv[ pb0 + pbk + 1 ];
				b1R = Bv[ pb1 + pbk ];
				b1I = csb * Bv[ pb1 + pbk + 1 ];
				c00R += ( a0R * b0R ) - ( a0I * b0I );
				c00I += ( a0R * b0I ) + ( a0I * b0R );
				c10R += ( a1R * b0R ) - ( a1I * b0I );
				c10I += ( a1R * b0I ) + ( a1I * b0R );
				c01R += ( a0R * b1R ) - ( a0I * b1I );
				c01I += ( a0R * b1I ) + ( a0I * b1R );
				c11R += ( a1R * b1R ) - ( a1I * b1I );
				c11I += ( a1R * b1I ) + ( a1I * b1R );
			}
			pc = oC + ( i * sc1 ) + ( j * sc2 );
			if ( betaR === 0.0 && betaI === 0.0 ) {
				pcc = pc;
				Cv[ pcc ] = ( alphaR * c00R ) - ( alphaI * c00I );
				Cv[ pcc + 1 ] = ( alphaR * c00I ) + ( alphaI * c00R );
				Cv[ pcc + sc1 ] = ( alphaR * c10R ) - ( alphaI * c10I );
				Cv[ pcc + sc1 + 1 ] = ( alphaR * c10I ) + ( alphaI * c10R );
				pcc = pc + sc2;
				Cv[ pcc ] = ( alphaR * c01R ) - ( alphaI * c01I );
				Cv[ pcc + 1 ] = ( alphaR * c01I ) + ( alphaI * c01R );
				Cv[ pcc + sc1 ] = ( alphaR * c11R ) - ( alphaI * c11I );
				Cv[ pcc + sc1 + 1 ] = ( alphaR * c11I ) + ( alphaI * c11R );
			} else {
				pcc = pc;
				sR = c00R; sI = c00I; cR = Cv[ pcc ]; cI = Cv[ pcc + 1 ];
				Cv[ pcc ] = ( alphaR * sR ) - ( alphaI * sI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pcc + 1 ] = ( alphaR * sI ) + ( alphaI * sR ) + ( betaR * cI ) + ( betaI * cR );
				sR = c10R; sI = c10I; cR = Cv[ pcc + sc1 ]; cI = Cv[ pcc + sc1 + 1 ];
				Cv[ pcc + sc1 ] = ( alphaR * sR ) - ( alphaI * sI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pcc + sc1 + 1 ] = ( alphaR * sI ) + ( alphaI * sR ) + ( betaR * cI ) + ( betaI * cR );
				pcc = pc + sc2;
				sR = c01R; sI = c01I; cR = Cv[ pcc ]; cI = Cv[ pcc + 1 ];
				Cv[ pcc ] = ( alphaR * sR ) - ( alphaI * sI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pcc + 1 ] = ( alphaR * sI ) + ( alphaI * sR ) + ( betaR * cI ) + ( betaI * cR );
				sR = c11R; sI = c11I; cR = Cv[ pcc + sc1 ]; cI = Cv[ pcc + sc1 + 1 ];
				Cv[ pcc + sc1 ] = ( alphaR * sR ) - ( alphaI * sI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pcc + sc1 + 1 ] = ( alphaR * sI ) + ( alphaI * sR ) + ( betaR * cI ) + ( betaI * cR );
			}
		}
	}

	// Edge columns [nb,N) over all rows (scalar complex dot):
	for ( j = nb; j < N; j++ ) {
		pb = oB + ( j * bn );
		for ( i = 0; i < M; i++ ) {
			tR = 0.0;
			tI = 0.0;
			pa = oA + ( i * ar );
			for ( l = 0; l < K; l++ ) {
				aR = Av[ pa + ( l * ak ) ];
				aI = csa * Av[ pa + ( l * ak ) + 1 ];
				bR = Bv[ pb + ( l * bk ) ];
				bI = csb * Bv[ pb + ( l * bk ) + 1 ];
				tR += ( aR * bR ) - ( aI * bI );
				tI += ( aR * bI ) + ( aI * bR );
			}
			pc = oC + ( i * sc1 ) + ( j * sc2 );
			if ( betaR === 0.0 && betaI === 0.0 ) {
				Cv[ pc ] = ( alphaR * tR ) - ( alphaI * tI );
				Cv[ pc + 1 ] = ( alphaR * tI ) + ( alphaI * tR );
			} else {
				cR = Cv[ pc ];
				cI = Cv[ pc + 1 ];
				Cv[ pc ] = ( alphaR * tR ) - ( alphaI * tI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pc + 1 ] = ( alphaR * tI ) + ( alphaI * tR ) + ( betaR * cI ) + ( betaI * cR );
			}
		}
	}

	// Edge rows [mb,M) over columns [0,nb) (scalar complex dot):
	for ( j = 0; j < nb; j++ ) {
		pb = oB + ( j * bn );
		for ( i = mb; i < M; i++ ) {
			tR = 0.0;
			tI = 0.0;
			pa = oA + ( i * ar );
			for ( l = 0; l < K; l++ ) {
				aR = Av[ pa + ( l * ak ) ];
				aI = csa * Av[ pa + ( l * ak ) + 1 ];
				bR = Bv[ pb + ( l * bk ) ];
				bI = csb * Bv[ pb + ( l * bk ) + 1 ];
				tR += ( aR * bR ) - ( aI * bI );
				tI += ( aR * bI ) + ( aI * bR );
			}
			pc = oC + ( i * sc1 ) + ( j * sc2 );
			if ( betaR === 0.0 && betaI === 0.0 ) {
				Cv[ pc ] = ( alphaR * tR ) - ( alphaI * tI );
				Cv[ pc + 1 ] = ( alphaR * tI ) + ( alphaI * tR );
			} else {
				cR = Cv[ pc ];
				cI = Cv[ pc + 1 ];
				Cv[ pc ] = ( alphaR * tR ) - ( alphaI * tI ) + ( betaR * cR ) - ( betaI * cI );
				Cv[ pc + 1 ] = ( alphaR * tI ) + ( alphaI * tR ) + ( betaR * cI ) + ( betaI * cR );
			}
		}
	}
	return C;
}


// EXPORTS //

export default zgemm;
