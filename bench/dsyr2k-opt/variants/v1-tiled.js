/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth */

// FUNCTIONS //

/**
* Accumulates `C(triangle) += alpha * X * Y^T` using 4x4 register tiles, where `X` and `Y` are N-by-K matrices addressed through effective strides.
*
* ## Notes
*
* -   `X(i,l) = X[ offsetX + (i*strideX1) + (l*strideX2) ]` and likewise for `Y`,
*     so a single kernel covers both transpose modes and both storage layouts.
* -   Full 4x4 tiles lying entirely within the stored triangle use the
*     16-accumulator K-loop (dgemm pattern; see lib/blas/base/dgemm/lib/base.js);
*     the diagonal-straddling fringe and the row/column remainders use
*     reference-style scalar loops with exact triangle bounds.
* -   The opposite triangle of `C` is never read or written.
*
* @private
* @param {boolean} upper - boolean indicating whether the upper triangle of `C` is stored
* @param {NonNegativeInteger} N - order of matrix `C`
* @param {NonNegativeInteger} K - reduction dimension
* @param {number} alpha - scalar multiplier
* @param {Float64Array} X - first input matrix (N-by-K in effective strides)
* @param {integer} strideX1 - effective stride of the row dimension of `X`
* @param {integer} strideX2 - effective stride of the reduction dimension of `X`
* @param {NonNegativeInteger} offsetX - index offset for `X`
* @param {Float64Array} Y - second input matrix (N-by-K in effective strides)
* @param {integer} strideY1 - effective stride of the row dimension of `Y`
* @param {integer} strideY2 - effective stride of the reduction dimension of `Y`
* @param {NonNegativeInteger} offsetY - index offset for `Y`
* @param {Float64Array} C - input/output symmetric matrix (only the stored triangle is accessed)
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - index offset for `C`
* @returns {Float64Array} `C`
*/
function tiled( upper, N, K, alpha, X, strideX1, strideX2, offsetX, Y, strideY1, strideY2, offsetY, C, strideC1, strideC2, offsetC ) {
	// 16 register accumulators declared first -- V8 register allocation is
	// Sensitive to declaration order; accumulators before loop variables gives
	// A reproducible ~15% improvement (see bench/dgemm-opt/reports/).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;
	var px0; var px1; var px2; var px3; var py0; var py1; var py2; var py3; var pcc; var pxk; var pyk;
	var xr; var xk; var yr; var yk; var sc1; var sc2;
	var a0; var a1; var a2; var a3; var b0; var b1; var b2; var b3;
	var pc; var nb; var jj; var ii; var px; var py; var tt;
	var i; var j; var l;

	xr = strideX1;
	xk = strideX2;
	yr = strideY1;
	yk = strideY2;
	sc1 = strideC1;
	sc2 = strideC2;

	nb = N - ( N % 4 ); // last full 4-column block boundary
	if ( upper ) {
		for ( j = 0; j < nb; j += 4 ) {
			py0 = offsetY + ( j * yr );
			py1 = py0 + yr;
			py2 = py1 + yr;
			py3 = py2 + yr;

			// Full 4x4 tiles strictly within the upper triangle: rows i..i+3 with i+3 <= j
			for ( i = 0; i + 3 <= j; i += 4 ) {
				c00=0.0; c10=0.0; c20=0.0; c30=0.0;
				c01=0.0; c11=0.0; c21=0.0; c31=0.0;
				c02=0.0; c12=0.0; c22=0.0; c32=0.0;
				c03=0.0; c13=0.0; c23=0.0; c33=0.0;

				px0 = offsetX + ( i * xr );
				px1 = px0 + xr;
				px2 = px1 + xr;
				px3 = px2 + xr;

				for ( l = 0; l < K; l++ ) {
					pxk = l * xk;
					pyk = l * yk;
					a0 = X[ px0 + pxk ]; a1 = X[ px1 + pxk ]; a2 = X[ px2 + pxk ]; a3 = X[ px3 + pxk ];
					b0 = Y[ py0 + pyk ]; b1 = Y[ py1 + pyk ]; b2 = Y[ py2 + pyk ]; b3 = Y[ py3 + pyk ];
					c00+=a0*b0; c10+=a1*b0; c20+=a2*b0; c30+=a3*b0;
					c01+=a0*b1; c11+=a1*b1; c21+=a2*b1; c31+=a3*b1;
					c02+=a0*b2; c12+=a1*b2; c22+=a2*b2; c32+=a3*b2;
					c03+=a0*b3; c13+=a1*b3; c23+=a2*b3; c33+=a3*b3;
				}

				pc = offsetC + ( i * sc1 ) + ( j * sc2 );
				pcc = pc;
				C[pcc]+=alpha*c00; C[pcc+sc1]+=alpha*c10; C[pcc+(2*sc1)]+=alpha*c20; C[pcc+(3*sc1)]+=alpha*c30;
				pcc = pc + sc2;
				C[pcc]+=alpha*c01; C[pcc+sc1]+=alpha*c11; C[pcc+(2*sc1)]+=alpha*c21; C[pcc+(3*sc1)]+=alpha*c31;
				pcc = pc + (2*sc2);
				C[pcc]+=alpha*c02; C[pcc+sc1]+=alpha*c12; C[pcc+(2*sc1)]+=alpha*c22; C[pcc+(3*sc1)]+=alpha*c32;
				pcc = pc + (3*sc2);
				C[pcc]+=alpha*c03; C[pcc+sc1]+=alpha*c13; C[pcc+(2*sc1)]+=alpha*c23; C[pcc+(3*sc1)]+=alpha*c33;
			}

			// Diagonal-straddling fringe: rows i..jj for each column jj (scalar, exact bounds)
			for ( jj = j; jj < j + 4; jj++ ) {
				py = offsetY + ( jj * yr );
				for ( ii = i; ii <= jj; ii++ ) {
					tt = 0.0;
					px = offsetX + ( ii * xr );
					for ( l = 0; l < K; l++ ) {
						tt += X[ px + ( l * xk ) ] * Y[ py + ( l * yk ) ];
					}
					C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
				}
			}
		}

		// Remainder columns nb..N-1 (scalar, exact triangle bounds)
		for ( jj = nb; jj < N; jj++ ) {
			py = offsetY + ( jj * yr );
			for ( ii = 0; ii <= jj; ii++ ) {
				tt = 0.0;
				px = offsetX + ( ii * xr );
				for ( l = 0; l < K; l++ ) {
					tt += X[ px + ( l * xk ) ] * Y[ py + ( l * yk ) ];
				}
				C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
			}
		}
		return C;
	}
	for ( j = 0; j < nb; j += 4 ) {
		py0 = offsetY + ( j * yr );
		py1 = py0 + yr;
		py2 = py1 + yr;
		py3 = py2 + yr;

		// Diagonal-straddling fringe: rows jj..j+3 for each column jj (scalar, exact bounds)
		for ( jj = j; jj < j + 4; jj++ ) {
			py = offsetY + ( jj * yr );
			for ( ii = jj; ii < j + 4; ii++ ) {
				tt = 0.0;
				px = offsetX + ( ii * xr );
				for ( l = 0; l < K; l++ ) {
					tt += X[ px + ( l * xk ) ] * Y[ py + ( l * yk ) ];
				}
				C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
			}
		}

		// Full 4x4 tiles strictly below the diagonal block: rows i..i+3 with i >= j+4
		for ( i = j + 4; i + 4 <= N; i += 4 ) {
			c00=0.0; c10=0.0; c20=0.0; c30=0.0;
			c01=0.0; c11=0.0; c21=0.0; c31=0.0;
			c02=0.0; c12=0.0; c22=0.0; c32=0.0;
			c03=0.0; c13=0.0; c23=0.0; c33=0.0;

			px0 = offsetX + ( i * xr );
			px1 = px0 + xr;
			px2 = px1 + xr;
			px3 = px2 + xr;

			for ( l = 0; l < K; l++ ) {
				pxk = l * xk;
				pyk = l * yk;
				a0 = X[ px0 + pxk ]; a1 = X[ px1 + pxk ]; a2 = X[ px2 + pxk ]; a3 = X[ px3 + pxk ];
				b0 = Y[ py0 + pyk ]; b1 = Y[ py1 + pyk ]; b2 = Y[ py2 + pyk ]; b3 = Y[ py3 + pyk ];
				c00+=a0*b0; c10+=a1*b0; c20+=a2*b0; c30+=a3*b0;
				c01+=a0*b1; c11+=a1*b1; c21+=a2*b1; c31+=a3*b1;
				c02+=a0*b2; c12+=a1*b2; c22+=a2*b2; c32+=a3*b2;
				c03+=a0*b3; c13+=a1*b3; c23+=a2*b3; c33+=a3*b3;
			}

			pc = offsetC + ( i * sc1 ) + ( j * sc2 );
			pcc = pc;
			C[pcc]+=alpha*c00; C[pcc+sc1]+=alpha*c10; C[pcc+(2*sc1)]+=alpha*c20; C[pcc+(3*sc1)]+=alpha*c30;
			pcc = pc + sc2;
			C[pcc]+=alpha*c01; C[pcc+sc1]+=alpha*c11; C[pcc+(2*sc1)]+=alpha*c21; C[pcc+(3*sc1)]+=alpha*c31;
			pcc = pc + (2*sc2);
			C[pcc]+=alpha*c02; C[pcc+sc1]+=alpha*c12; C[pcc+(2*sc1)]+=alpha*c22; C[pcc+(3*sc1)]+=alpha*c32;
			pcc = pc + (3*sc2);
			C[pcc]+=alpha*c03; C[pcc+sc1]+=alpha*c13; C[pcc+(2*sc1)]+=alpha*c23; C[pcc+(3*sc1)]+=alpha*c33;
		}

		// Remainder rows i..N-1 (scalar; all four columns are stored here)
		for ( jj = j; jj < j + 4; jj++ ) {
			py = offsetY + ( jj * yr );
			for ( ii = i; ii < N; ii++ ) {
				tt = 0.0;
				px = offsetX + ( ii * xr );
				for ( l = 0; l < K; l++ ) {
					tt += X[ px + ( l * xk ) ] * Y[ py + ( l * yk ) ];
				}
				C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
			}
		}
	}

	// Remainder columns nb..N-1 (scalar, exact triangle bounds)
	for ( jj = nb; jj < N; jj++ ) {
		py = offsetY + ( jj * yr );
		for ( ii = jj; ii < N; ii++ ) {
			tt = 0.0;
			px = offsetX + ( ii * xr );
			for ( l = 0; l < K; l++ ) {
				tt += X[ px + ( l * xk ) ] * Y[ py + ( l * yk ) ];
			}
			C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
		}
	}
	return C;
}


// MAIN //

/**
* Performs one of the symmetric rank-2k operations:.
* C := alpha_A_B^T + alpha_B_A^T + beta_C,  or
* C := alpha_A^T_B + alpha_B^T_A + beta_C
* where alpha and beta are scalars, C is an N-by-N symmetric matrix,
* and A and B are N-by-K matrices in the first case and K-by-N matrices
* in the second case. Only the upper or lower triangular part of C is
* updated.
*
* ## Notes
*
* -   4x4 register-tiled kernel over the stored triangle (dgemm pattern; see
*     lib/blas/base/dgemm/lib/base.js and bench/dgemm-opt/). Beta scaling is
*     applied to the triangle first (reference order), then the two rank-k
*     products are accumulated in two sequential tiled passes over the
*     triangle: `C += alpha*op(A)*op(B)^T`, then `C += alpha*op(B)*op(A)^T`.
*     The second pass is the first with `A` and `B` swapped, so one private
*     helper covers both. Fusing the two products into a single tile pass
*     would need 32 accumulators, which spills in V8 (see bench/dgemm-opt/).
* -   General-stride formulation: effective strides (`ar`, `ak`) and (`br`,
*     `bk`) derived from the transpose flag cover both trans modes and both
*     layouts with one kernel. C(i,j) += op(A)(i,:)·op(B)(j,:) + op(B)(i,:)·op(A)(j,:).
* -   The opposite triangle of C is never read or written; A and B are never
*     written.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A and B (if trans = 'no-transpose') or rows (if trans = 'transpose')
* @param {number} alpha - scalar multiplier for A*B^T + B*A^T
* @param {Float64Array} A - first input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - second input matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dsyr2k( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	var upper;
	var nota;
	var sc1;
	var sc2;
	var ar;
	var ak;
	var br;
	var bk;
	var ic;
	var i;
	var j;

	upper = ( uplo === 'upper' );
	nota = ( trans === 'no-transpose' );

	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	sc1 = strideC1;
	sc2 = strideC2;

	// Effective strides: op(A) is N-by-K and op(A)(i,l) = A[ offsetA + (i*ar) + (l*ak) ]...
	ar = ( nota ) ? strideA1 : strideA2;
	ak = ( nota ) ? strideA2 : strideA1;
	br = ( nota ) ? strideB1 : strideB2;
	bk = ( nota ) ? strideB2 : strideB1;

	// Apply beta to the stored triangle first (reference behavior)...
	if ( beta !== 1.0 ) {
		if ( upper ) {
			if ( beta === 0.0 ) {
				for ( j = 0; j < N; j++ ) {
					ic = offsetC + ( j * sc2 );
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] = 0.0;
						ic += sc1;
					}
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					ic = offsetC + ( j * sc2 );
					for ( i = 0; i <= j; i++ ) {
						C[ ic ] *= beta;
						ic += sc1;
					}
				}
			}
		} else if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i++ ) {
					C[ ic ] = 0.0;
					ic += sc1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * sc1 ) + ( j * sc2 );
				for ( i = j; i < N; i++ ) {
					C[ ic ] *= beta;
					ic += sc1;
				}
			}
		}
	}
	if ( alpha === 0.0 || K === 0 ) {
		return C;
	}

	// C(triangle) += alpha*op(A)*op(B)^T, then C(triangle) += alpha*op(B)*op(A)^T...
	tiled( upper, N, K, alpha, A, ar, ak, offsetA, B, br, bk, offsetB, C, sc1, sc2, offsetC );
	tiled( upper, N, K, alpha, B, br, bk, offsetB, A, ar, ak, offsetA, C, sc1, sc2, offsetC );
	return C;
}


// EXPORTS //

export default dsyr2k;
