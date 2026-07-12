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

// MAIN //

/**
* Performs one of the symmetric rank-k operations:.
* C := alpha_A_A^T + beta_C,  or  C := alpha_A^T_A + beta_C
* where alpha and beta are scalars, C is an N-by-N symmetric matrix,
* and A is an N-by-K matrix in the first case and a K-by-N matrix in
* the second case. Only the upper or lower triangular part of C is
* updated.
*
* ## Notes
*
* -   4×4 register-tiled kernel over the stored triangle (dgemm pattern; see
*     lib/blas/base/dgemm/lib/base.js and bench/dgemm-opt/). Beta scaling is
*     applied to the triangle first (reference order), then alpha*op(A)*op(A)^T
*     is accumulated: full 4×4 tiles that lie entirely within the triangle use
*     the register-tiled K-loop; the diagonal-straddling fringe and row/column
*     remainders use reference-style scalar loops with exact triangle bounds.
* -   General-stride formulation: effective strides (ar, ak) derived from the
*     transpose flag cover both trans modes and both layouts with one kernel.
*     C(i,j) += op(A)(i,:)·op(A)(j,:) — row i and row j of op(A) are addressed
*     through the same effective strides, exactly like dgemm's op(A)/op(B).
* -   The opposite triangle of C is never read or written.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of matrix C
* @param {NonNegativeInteger} K - number of columns of A (if trans = 'no-transpose') or rows (if trans = 'transpose')
* @param {number} alpha - scalar multiplier for A*A^T or A^T*A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output symmetric matrix (only upper or lower triangle accessed)
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dsyrk( uplo, trans, N, K, alpha, A, strideA1, strideA2, offsetA, beta, C, strideC1, strideC2, offsetC ) {
	// 16 register accumulators declared first — V8 register allocation is
	// Sensitive to declaration order; accumulators before loop variables gives
	// A reproducible ~15% improvement (see bench/dgemm-opt/reports/).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;
	var pa0; var pa1; var pa2; var pa3; var pb0; var pb1; var pb2; var pb3; var pcc; var pak; var sc1; var sc2;
	var up; var nt; var ar; var ak; var a0; var a1; var a2; var a3; var b0; var b1; var b2; var b3;
	var pc; var ic; var nb; var jj; var ii; var pa; var pb; var tt;
	var i; var j; var l;

	up = ( uplo === 'upper' );
	nt = ( trans === 'no-transpose' );

	if ( N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	sc1 = strideC1;
	sc2 = strideC2;

	// Effective strides: op(A) is N×K and op(A)(i,l) = A[ offsetA + (i*ar) + (l*ak) ]
	ar = ( nt ) ? strideA1 : strideA2;
	ak = ( nt ) ? strideA2 : strideA1;

	// Apply beta to the stored triangle first (reference behavior)...
	if ( beta !== 1.0 ) {
		if ( up ) {
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

	// Accumulate C(triangle) += alpha * op(A) * op(A)^T with 4×4 register tiles...
	nb = N - ( N % 4 ); // last full 4-column block boundary
	if ( up ) {
		for ( j = 0; j < nb; j += 4 ) {
			pb0 = offsetA + ( j * ar );
			pb1 = pb0 + ar;
			pb2 = pb1 + ar;
			pb3 = pb2 + ar;

			// Full 4×4 tiles strictly within the upper triangle: rows i..i+3 with i+3 <= j
			for ( i = 0; i + 3 <= j; i += 4 ) {
				c00=0.0; c10=0.0; c20=0.0; c30=0.0;
				c01=0.0; c11=0.0; c21=0.0; c31=0.0;
				c02=0.0; c12=0.0; c22=0.0; c32=0.0;
				c03=0.0; c13=0.0; c23=0.0; c33=0.0;

				pa0 = offsetA + ( i * ar );
				pa1 = pa0 + ar;
				pa2 = pa1 + ar;
				pa3 = pa2 + ar;

				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					a0 = A[ pa0 + pak ]; a1 = A[ pa1 + pak ]; a2 = A[ pa2 + pak ]; a3 = A[ pa3 + pak ];
					b0 = A[ pb0 + pak ]; b1 = A[ pb1 + pak ]; b2 = A[ pb2 + pak ]; b3 = A[ pb3 + pak ];
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
				pb = offsetA + ( jj * ar );
				for ( ii = i; ii <= jj; ii++ ) {
					tt = 0.0;
					pa = offsetA + ( ii * ar );
					for ( l = 0; l < K; l++ ) {
						tt += A[ pa + ( l * ak ) ] * A[ pb + ( l * ak ) ];
					}
					C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
				}
			}
		}

		// Remainder columns nb..N-1 (scalar, exact triangle bounds)
		for ( jj = nb; jj < N; jj++ ) {
			pb = offsetA + ( jj * ar );
			for ( ii = 0; ii <= jj; ii++ ) {
				tt = 0.0;
				pa = offsetA + ( ii * ar );
				for ( l = 0; l < K; l++ ) {
					tt += A[ pa + ( l * ak ) ] * A[ pb + ( l * ak ) ];
				}
				C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
			}
		}
	} else {
		for ( j = 0; j < nb; j += 4 ) {
			pb0 = offsetA + ( j * ar );
			pb1 = pb0 + ar;
			pb2 = pb1 + ar;
			pb3 = pb2 + ar;

			// Diagonal-straddling fringe: rows jj..j+3 for each column jj (scalar, exact bounds)
			for ( jj = j; jj < j + 4; jj++ ) {
				pb = offsetA + ( jj * ar );
				for ( ii = jj; ii < j + 4; ii++ ) {
					tt = 0.0;
					pa = offsetA + ( ii * ar );
					for ( l = 0; l < K; l++ ) {
						tt += A[ pa + ( l * ak ) ] * A[ pb + ( l * ak ) ];
					}
					C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
				}
			}

			// Full 4×4 tiles strictly below the diagonal block: rows i..i+3 with i >= j+4
			for ( i = j + 4; i + 4 <= N; i += 4 ) {
				c00=0.0; c10=0.0; c20=0.0; c30=0.0;
				c01=0.0; c11=0.0; c21=0.0; c31=0.0;
				c02=0.0; c12=0.0; c22=0.0; c32=0.0;
				c03=0.0; c13=0.0; c23=0.0; c33=0.0;

				pa0 = offsetA + ( i * ar );
				pa1 = pa0 + ar;
				pa2 = pa1 + ar;
				pa3 = pa2 + ar;

				for ( l = 0; l < K; l++ ) {
					pak = l * ak;
					a0 = A[ pa0 + pak ]; a1 = A[ pa1 + pak ]; a2 = A[ pa2 + pak ]; a3 = A[ pa3 + pak ];
					b0 = A[ pb0 + pak ]; b1 = A[ pb1 + pak ]; b2 = A[ pb2 + pak ]; b3 = A[ pb3 + pak ];
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
				pb = offsetA + ( jj * ar );
				for ( ii = i; ii < N; ii++ ) {
					tt = 0.0;
					pa = offsetA + ( ii * ar );
					for ( l = 0; l < K; l++ ) {
						tt += A[ pa + ( l * ak ) ] * A[ pb + ( l * ak ) ];
					}
					C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
				}
			}
		}

		// Remainder columns nb..N-1 (scalar, exact triangle bounds)
		for ( jj = nb; jj < N; jj++ ) {
			pb = offsetA + ( jj * ar );
			for ( ii = jj; ii < N; ii++ ) {
				tt = 0.0;
				pa = offsetA + ( ii * ar );
				for ( l = 0; l < K; l++ ) {
					tt += A[ pa + ( l * ak ) ] * A[ pb + ( l * ak ) ];
				}
				C[ offsetC + ( ii * sc1 ) + ( jj * sc2 ) ] += alpha * tt;
			}
		}
	}
	return C;
}


// EXPORTS //

export default dsyrk;
