/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-depth, max-len, max-lines, max-lines-per-function, max-params, max-statements, no-continue */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';


// VARIABLES //

// Scratch for complex divide/reciprocal results (Smith's formula):
const res = new Float64Array( 2 );


// FUNCTIONS //

/**
* Complex divide `(xr + i*xi) / (dr + i*di)` using Smith's formula, writing the
* real/imaginary parts of the quotient into module scratch `res`.
*
* Identical algorithm to `cmplx.divAt` (the form used by the reference kernel
* at every corner-solve division), so the corner rounding is preserved.
*
* @private
* @param {number} xr - numerator real part
* @param {number} xi - numerator imaginary part
* @param {number} dr - denominator real part
* @param {number} di - denominator imaginary part
*/
function cdiv2( xr, xi, dr, di ) {
	let r, d;
	if ( Math.abs( di ) <= Math.abs( dr ) ) {
		r = di / dr;
		d = dr + ( di * r );
		res[ 0 ] = ( xr + ( xi * r ) ) / d;
		res[ 1 ] = ( xi - ( xr * r ) ) / d;
	} else {
		r = dr / di;
		d = di + ( dr * r );
		res[ 0 ] = ( ( xr * r ) + xi ) / d;
		res[ 1 ] = ( ( xi * r ) - xr ) / d;
	}
}


// MAIN //

/**
* Solves one of the matrix equations:.
* op(A)_X = alpha_B,  or  X_op(A) = alpha_B
*
* where alpha is a complex scalar, X and B are M-by-N complex matrices,
* A is a unit or non-unit, upper or lower triangular complex matrix, and
* op(A) is one of A, A**T, or A**H. The matrix X is overwritten on B.
*
* ## Notes
*
* -   Blocked substitution with a 2x2 complex register-tiled update kernel.
*     All twelve (side, uplo, transa) structural combinations are folded into a
*     single upper-triangular backward-substitution kernel via effective
*     strides plus a conjugation sign `cs`: `side='right'` transposes the whole
*     problem (`X*op(A) = alpha*B` is `op(A)^T*X^T = alpha*B^T`), `transa` swaps
*     A's strides (and, for `A**H`, sets `cs=-1` so A is read conjugated), and
*     an effectively lower-triangular system is index-reversed into an upper one
*     by negating strides and shifting offsets. Rows are solved in 2-row blocks
*     from the bottom up; for each block and each pair of columns of B the
*     update sum over already-solved rows is accumulated gemm-style in complex
*     registers, then the 2x2 triangular corner is solved in reference order.
* -   This is a pure reordering of the reference recurrence (backward-error
*     verification tier; see docs/optimization-policy.md). Corner divisions use
*     the reference's Smith-formula complex division; `side='left'` divides by
*     the diagonal directly and `side='right'` multiplies by the reciprocal
*     `1/A(j,j)`, each matching the reference form for that orientation. The
*     unit diagonal is never read when `diag='unit'`; only the stored triangle
*     is read; A is never written.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'` (upper or lower triangular)
* @param {string} transa - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {Complex128} alpha - complex scalar multiplier for B
* @param {Complex128Array} A - complex triangular matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - input/output complex matrix (overwritten with X)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {Complex128Array} `B`
*/
function ztrsm( side, uplo, transa, diag, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	// Complex accumulators for the 2x2 update tile (8 doubles):
	let c00r, c00i, c01r, c01i, c10r, c10i, c11r, c11i, a0r, a0i, a1r, a1i, b0r;
	let b0i, b1r, b1i, eupper, cs, ea1, ea2, eb1, eb2, oa, ob, MM, NN, d0r, d0i;
	let d1r, d1i, r0r, r0i, r1r, r1i, u01r, u01i, x0r, x0i, x1r, x1i, t0r, t0i;
	let t1r, t1i, xr, xi, ar, ai, br, bi, pa0, pa1, pb0, pb1, pdT, pdB, pu, pbT;
	let pbB, pa, pb, pk, pl, kl, i0, i, j, l;

	if ( M === 0 || N === 0 ) {
		return B;
	}

	const alphaR = real( alpha );
	const alphaI = imag( alpha );

	const Av = reinterpret( A, 0 );
	const Bv = reinterpret( B, 0 );

	const sA1 = strideA1 * 2;
	const sA2 = strideA2 * 2;
	const sB1 = strideB1 * 2;
	const sB2 = strideB2 * 2;
	oa = offsetA * 2;
	ob = offsetB * 2;

	// When alpha == 0, set B to zero (reference special path, exact):
	if ( alphaR === 0.0 && alphaI === 0.0 ) {
		for ( j = 0; j < N; j++ ) {
			for ( i = 0; i < M; i++ ) {
				pb = ob + ( i * sB1 ) + ( j * sB2 );
				Bv[ pb ] = 0.0;
				Bv[ pb + 1 ] = 0.0;
			}
		}
		return B;
	}

	const nounit = ( diag === 'non-unit' );
	const useRecip = ( side === 'right' );

	// Fold the twelve (side, uplo, transa) combinations into one upper-
	// triangular solve T*Y = alpha*B' where T[i,k] reads A at
	// oa + i*ea1 + k*ea2 with imaginary part scaled by cs (cs=-1 conjugates):
	if ( side === 'left' ) {
		MM = M;
		NN = N;
		eb1 = sB1;
		eb2 = sB2;
		if ( transa === 'no-transpose' ) {
			ea1 = sA1;
			ea2 = sA2;
			eupper = ( uplo === 'upper' );
			cs = 1.0;
		} else if ( transa === 'transpose' ) {
			ea1 = sA2;
			ea2 = sA1;
			eupper = ( uplo !== 'upper' );
			cs = 1.0;
		} else { // conjugate-transpose
			ea1 = sA2;
			ea2 = sA1;
			eupper = ( uplo !== 'upper' );
			cs = -1.0;
		}
	} else {
		// X*op(A) = alpha*B  <=>  op(A)^T * X^T = alpha * B^T
		MM = N;
		NN = M;
		eb1 = sB2;
		eb2 = sB1;
		if ( transa === 'no-transpose' ) {
			ea1 = sA2;
			ea2 = sA1;
			eupper = ( uplo !== 'upper' );
			cs = 1.0;
		} else if ( transa === 'transpose' ) {
			ea1 = sA1;
			ea2 = sA2;
			eupper = ( uplo === 'upper' );
			cs = 1.0;
		} else { // conjugate-transpose -> effective operator conj(A)
			ea1 = sA1;
			ea2 = sA2;
			eupper = ( uplo === 'upper' );
			cs = -1.0;
		}
	}

	if ( !eupper ) {
		// Reverse row/column order to relabel the lower-triangular system as
		// an upper-triangular one (pure index relabeling):
		oa += ( MM - 1 ) * ( ea1 + ea2 );
		ea1 = -ea1;
		ea2 = -ea2;
		ob += ( MM - 1 ) * eb1;
		eb1 = -eb1;
	}

	const rem = MM % 2;
	const nb = NN - ( NN % 2 );

	for ( j = 0; j < nb; j += 2 ) {
		for ( i0 = MM - 2; i0 >= rem; i0 -= 2 ) {
			// Accumulate the update over already-solved rows [i0+2, MM) with a
			// 2x2 complex register tile:
			c00r = 0.0; c00i = 0.0; c01r = 0.0; c01i = 0.0;
			c10r = 0.0; c10i = 0.0; c11r = 0.0; c11i = 0.0;

			kl = MM - i0 - 2;
			pa0 = oa + ( i0 * ea1 ) + ( ( i0 + 2 ) * ea2 );
			pa1 = pa0 + ea1;
			pb0 = ob + ( ( i0 + 2 ) * eb1 ) + ( j * eb2 );
			pb1 = pb0 + eb2;

			for ( l = 0; l < kl; l++ ) {
				pk = l * ea2;
				a0r = Av[ pa0 + pk ]; a0i = cs * Av[ pa0 + pk + 1 ];
				a1r = Av[ pa1 + pk ]; a1i = cs * Av[ pa1 + pk + 1 ];
				pl = l * eb1;
				b0r = Bv[ pb0 + pl ]; b0i = Bv[ pb0 + pl + 1 ];
				b1r = Bv[ pb1 + pl ]; b1i = Bv[ pb1 + pl + 1 ];
				c00r += ( a0r * b0r ) - ( a0i * b0i ); c00i += ( a0r * b0i ) + ( a0i * b0r );
				c01r += ( a0r * b1r ) - ( a0i * b1i ); c01i += ( a0r * b1i ) + ( a0i * b1r );
				c10r += ( a1r * b0r ) - ( a1i * b0i ); c10i += ( a1r * b0i ) + ( a1i * b0r );
				c11r += ( a1r * b1r ) - ( a1i * b1i ); c11i += ( a1r * b1i ) + ( a1i * b1r );
			}

			// Read the 2x2 upper-triangular corner (conjugated via cs):
			pdT = oa + ( i0 * ( ea1 + ea2 ) );
			pdB = pdT + ea1 + ea2;
			pu = oa + ( i0 * ea1 ) + ( ( i0 + 1 ) * ea2 );
			u01r = Av[ pu ]; u01i = cs * Av[ pu + 1 ];
			if ( nounit ) {
				d1r = Av[ pdB ]; d1i = cs * Av[ pdB + 1 ];
				d0r = Av[ pdT ]; d0i = cs * Av[ pdT + 1 ];
				if ( useRecip ) {
					cdiv2( 1.0, 0.0, d1r, d1i ); r1r = res[ 0 ]; r1i = res[ 1 ];
					cdiv2( 1.0, 0.0, d0r, d0i ); r0r = res[ 0 ]; r0i = res[ 1 ];
				}
			}

			pbT = ob + ( i0 * eb1 ) + ( j * eb2 );
			pbB = pbT + eb1;

			// --- column j (col 0) ---
			b1r = Bv[ pbB ]; b1i = Bv[ pbB + 1 ];
			xr = ( alphaR * b1r ) - ( alphaI * b1i ) - c10r;
			xi = ( alphaR * b1i ) + ( alphaI * b1r ) - c10i;
			if ( nounit ) {
				if ( useRecip ) {
					x1r = ( xr * r1r ) - ( xi * r1i );
					x1i = ( xr * r1i ) + ( xi * r1r );
				} else {
					cdiv2( xr, xi, d1r, d1i ); x1r = res[ 0 ]; x1i = res[ 1 ];
				}
			} else {
				x1r = xr; x1i = xi;
			}
			b0r = Bv[ pbT ]; b0i = Bv[ pbT + 1 ];
			xr = ( alphaR * b0r ) - ( alphaI * b0i ) - c00r - ( ( u01r * x1r ) - ( u01i * x1i ) );
			xi = ( alphaR * b0i ) + ( alphaI * b0r ) - c00i - ( ( u01r * x1i ) + ( u01i * x1r ) );
			if ( nounit ) {
				if ( useRecip ) {
					x0r = ( xr * r0r ) - ( xi * r0i );
					x0i = ( xr * r0i ) + ( xi * r0r );
				} else {
					cdiv2( xr, xi, d0r, d0i ); x0r = res[ 0 ]; x0i = res[ 1 ];
				}
			} else {
				x0r = xr; x0i = xi;
			}
			Bv[ pbT ] = x0r; Bv[ pbT + 1 ] = x0i;
			Bv[ pbB ] = x1r; Bv[ pbB + 1 ] = x1i;

			// --- column j+1 (col 1) ---
			pbT += eb2; pbB += eb2;
			b1r = Bv[ pbB ]; b1i = Bv[ pbB + 1 ];
			xr = ( alphaR * b1r ) - ( alphaI * b1i ) - c11r;
			xi = ( alphaR * b1i ) + ( alphaI * b1r ) - c11i;
			if ( nounit ) {
				if ( useRecip ) {
					x1r = ( xr * r1r ) - ( xi * r1i );
					x1i = ( xr * r1i ) + ( xi * r1r );
				} else {
					cdiv2( xr, xi, d1r, d1i ); x1r = res[ 0 ]; x1i = res[ 1 ];
				}
			} else {
				x1r = xr; x1i = xi;
			}
			b0r = Bv[ pbT ]; b0i = Bv[ pbT + 1 ];
			xr = ( alphaR * b0r ) - ( alphaI * b0i ) - c01r - ( ( u01r * x1r ) - ( u01i * x1i ) );
			xi = ( alphaR * b0i ) + ( alphaI * b0r ) - c01i - ( ( u01r * x1i ) + ( u01i * x1r ) );
			if ( nounit ) {
				if ( useRecip ) {
					x0r = ( xr * r0r ) - ( xi * r0i );
					x0i = ( xr * r0i ) + ( xi * r0r );
				} else {
					cdiv2( xr, xi, d0r, d0i ); x0r = res[ 0 ]; x0i = res[ 1 ];
				}
			} else {
				x0r = xr; x0i = xi;
			}
			Bv[ pbT ] = x0r; Bv[ pbT + 1 ] = x0i;
			Bv[ pbB ] = x1r; Bv[ pbB + 1 ] = x1i;
		}

		// Scalar remainder row [0, rem) (rem is 0 or 1); 1x2 kernel:
		for ( i = rem - 1; i >= 0; i-- ) {
			pbT = ob + ( i * eb1 ) + ( j * eb2 );
			b0r = Bv[ pbT ]; b0i = Bv[ pbT + 1 ];
			t0r = ( alphaR * b0r ) - ( alphaI * b0i );
			t0i = ( alphaR * b0i ) + ( alphaI * b0r );
			b0r = Bv[ pbT + eb2 ]; b0i = Bv[ pbT + eb2 + 1 ];
			t1r = ( alphaR * b0r ) - ( alphaI * b0i );
			t1i = ( alphaR * b0i ) + ( alphaI * b0r );
			pa = oa + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
			pb = ob + ( ( i + 1 ) * eb1 ) + ( j * eb2 );
			for ( l = i + 1; l < MM; l++ ) {
				ar = Av[ pa ]; ai = cs * Av[ pa + 1 ];
				pa += ea2;
				br = Bv[ pb ]; bi = Bv[ pb + 1 ];
				t0r -= ( ar * br ) - ( ai * bi ); t0i -= ( ar * bi ) + ( ai * br );
				br = Bv[ pb + eb2 ]; bi = Bv[ pb + eb2 + 1 ];
				t1r -= ( ar * br ) - ( ai * bi ); t1i -= ( ar * bi ) + ( ai * br );
				pb += eb1;
			}
			if ( nounit ) {
				pdT = oa + ( i * ( ea1 + ea2 ) );
				d0r = Av[ pdT ]; d0i = cs * Av[ pdT + 1 ];
				if ( useRecip ) {
					cdiv2( 1.0, 0.0, d0r, d0i ); r0r = res[ 0 ]; r0i = res[ 1 ];
					xr = t0r; xi = t0i;
					t0r = ( xr * r0r ) - ( xi * r0i ); t0i = ( xr * r0i ) + ( xi * r0r );
					xr = t1r; xi = t1i;
					t1r = ( xr * r0r ) - ( xi * r0i ); t1i = ( xr * r0i ) + ( xi * r0r );
				} else {
					cdiv2( t0r, t0i, d0r, d0i ); t0r = res[ 0 ]; t0i = res[ 1 ];
					cdiv2( t1r, t1i, d0r, d0i ); t1r = res[ 0 ]; t1i = res[ 1 ];
				}
			}
			Bv[ pbT ] = t0r; Bv[ pbT + 1 ] = t0i;
			Bv[ pbT + eb2 ] = t1r; Bv[ pbT + eb2 + 1 ] = t1i;
		}
	}

	// Remainder columns [nb, NN): scalar backward substitution per column.
	for ( j = nb; j < NN; j++ ) {
		for ( i = MM - 1; i >= 0; i-- ) {
			pbT = ob + ( i * eb1 ) + ( j * eb2 );
			b0r = Bv[ pbT ]; b0i = Bv[ pbT + 1 ];
			t0r = ( alphaR * b0r ) - ( alphaI * b0i );
			t0i = ( alphaR * b0i ) + ( alphaI * b0r );
			pa = oa + ( i * ea1 ) + ( ( i + 1 ) * ea2 );
			pb = ob + ( ( i + 1 ) * eb1 ) + ( j * eb2 );
			for ( l = i + 1; l < MM; l++ ) {
				ar = Av[ pa ]; ai = cs * Av[ pa + 1 ];
				pa += ea2;
				br = Bv[ pb ]; bi = Bv[ pb + 1 ];
				t0r -= ( ar * br ) - ( ai * bi );
				t0i -= ( ar * bi ) + ( ai * br );
				pb += eb1;
			}
			if ( nounit ) {
				pdT = oa + ( i * ( ea1 + ea2 ) );
				d0r = Av[ pdT ]; d0i = cs * Av[ pdT + 1 ];
				cdiv2( t0r, t0i, d0r, d0i ); t0r = res[ 0 ]; t0i = res[ 1 ];
			}
			Bv[ pbT ] = t0r; Bv[ pbT + 1 ] = t0i;
		}
	}
	return B;
}


// EXPORTS //

export default ztrsm;
