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

// VARIABLES //

// Cache-blocking parameters (matching lib/blas/base/dgemm):
var NC = 64;
var KC = 256;

// Packing buffer: four rows of the symmetric operand, one KC-panel wide.
// Module-level scratch (8 KiB) reused across calls; safe because the kernel
// never calls out while the buffer is live.
var PACK = new Float64Array( 4 * KC );


// FUNCTIONS //

/**
* Packs rows `i..i+nr-1` of the (virtual) symmetric matrix S over the K-panel
* `[kc, kcEnd)` into `PACK`, materializing entries from the stored triangle.
*
* Row `r` of S is: S[r,l] = A[r,l] for l on the stored side of the diagonal,
* and A[l,r] otherwise. Rows are packed densely: row `q` of the group starts
* at `PACK[ q*kcLen ]`.
*
* @private
* @param {Float64Array} A - symmetric matrix (stored triangle only)
* @param {integer} sa1 - stride of the first dimension of A
* @param {integer} sa2 - stride of the second dimension of A
* @param {NonNegativeInteger} oa - index offset for A
* @param {boolean} upper - whether the upper triangle is stored
* @param {NonNegativeInteger} i - first row to pack
* @param {NonNegativeInteger} nr - number of rows to pack (1-4)
* @param {NonNegativeInteger} kc - panel start
* @param {NonNegativeInteger} kcEnd - panel end (exclusive)
*/
function packRows( A, sa1, sa2, oa, upper, i, nr, kc, kcEnd ) {
	var split;
	var pLo;
	var pHi;
	var sLo;
	var sHi;
	var q;
	var r;
	var l;

	q = 0;
	for ( r = i; r < i + nr; r++ ) {
		// Clamp the diagonal crossing into the panel:
		split = r;
		if ( split < kc ) { split = kc; }
		if ( split > kcEnd ) { split = kcEnd; }

		// For l < r the entry lives on the opposite side of the diagonal from
		// the stored triangle of row r; for l >= r it is stored as-is (upper)
		// or mirrored (lower):
		if ( upper ) {
			pLo = oa + ( kc * sa1 ) + ( r * sa2 ); // A[l,r], walk l via sa1
			sLo = sa1;
			pHi = oa + ( r * sa1 ) + ( split * sa2 ); // A[r,l], walk l via sa2
			sHi = sa2;
		} else {
			pLo = oa + ( r * sa1 ) + ( kc * sa2 ); // A[r,l], walk l via sa2
			sLo = sa2;
			pHi = oa + ( split * sa1 ) + ( r * sa2 ); // A[l,r], walk l via sa1
			sHi = sa1;
		}
		for ( l = kc; l < split; l++ ) {
			PACK[ q ] = A[ pLo ];
			pLo += sLo;
			q += 1;
		}
		for ( l = split; l < kcEnd; l++ ) {
			PACK[ q ] = A[ pHi ];
			pHi += sHi;
			q += 1;
		}
	}
}


// MAIN //

/**
* Performs one of the symmetric matrix-matrix operations:.
* C := alpha_A_B + beta_C, or C := alpha_B_A + beta_C,
* where alpha and beta are scalars, A is a symmetric matrix, and B and C
* are M-by-N matrices.
*
* ## Notes
*
* -   4x4 register-tiled kernel with KC x NC cache blocking (dgemm-style).
*     The symmetric operand is packed four rows at a time: each row's full
*     length-K entries are materialized from the stored triangle into a small
*     contiguous buffer, after which the inner K-loop is a plain gemm
*     microkernel with unit-stride packed reads. Packing is O(4K) amortized
*     over an NC-wide panel of C — negligible against the 8*K flops per row.
* -   `side='right'` is folded into the same kernel by transposition:
*     C := alpha*B*A + beta*C is C^T := alpha*A*B^T + beta*C^T with A
*     symmetric, so the kernel runs with M/N and the B/C stride pairs swapped.
* -   Small/degenerate shapes (symmetric dimension < 4, or a single output
*     column) fall back to the reference loops, which are faster there.
*
* @private
* @param {string} side - 'left' if A is on the left, 'right' if A is on the right
* @param {string} uplo - 'upper' or 'lower', specifies which triangle of A is stored
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {number} alpha - scalar multiplier for A*B or B*A
* @param {Float64Array} A - symmetric matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @param {number} beta - scalar multiplier for C
* @param {Float64Array} C - input/output matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - index offset for C
* @returns {Float64Array} `C`
*/
function dsymm( side, uplo, M, N, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	// 16 register accumulators declared first — V8 register allocation is
	// Sensitive to declaration order (see bench/dgemm-opt/reports/).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;
	var a0; var a1; var a2; var a3; var b0; var b1; var b2; var b3;
	var upper; var lside; var K; var NN; var sb1; var sb2; var sc1; var sc2;
	var pb0; var pb1; var pb2; var pb3; var pc; var pcc; var pb;
	var jc; var kc; var j; var i; var k; var l; var jj; var ii; var jcEnd; var kcEnd; var kcLen; var nb; var mb; var bz; var k1; var k2; var k3; var ic; var temp; var temp1; var temp2;

	if ( M === 0 || N === 0 || ( alpha === 0.0 && beta === 1.0 ) ) {
		return C;
	}

	// When alpha is zero, just scale C
	if ( alpha === 0.0 ) {
		if ( beta === 0.0 ) {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * strideC2 );
				for ( i = 0; i < M; i++ ) {
					C[ ic ] = 0.0;
					ic += strideC1;
				}
			}
		} else {
			for ( j = 0; j < N; j++ ) {
				ic = offsetC + ( j * strideC2 );
				for ( i = 0; i < M; i++ ) {
					C[ ic ] *= beta;
					ic += strideC1;
				}
			}
		}
		return C;
	}

	upper = ( uplo === 'upper' );
	lside = ( side === 'left' );

	// Small/degenerate shapes: the tiled kernel needs 4-row groups in the
	// symmetric dimension and at least two output columns to amortize
	// packing; below that, use the reference loops:
	if ( ( lside && ( M < 4 || N < 2 ) ) || ( !lside && ( N < 4 || M < 2 ) ) ) {
		if ( lside ) {
			// C := alpha*A*B + beta*C
			if ( upper ) {
				for ( j = 0; j < N; j++ ) {
					for ( i = 0; i < M; i++ ) {
						temp1 = alpha * B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ];
						temp2 = 0.0;
						for ( k = 0; k < i; k++ ) {
							C[ offsetC + ( k * strideC1 ) + ( j * strideC2 ) ] += temp1 * A[ offsetA + ( k * strideA1 ) + ( i * strideA2 ) ];
							temp2 += B[ offsetB + ( k * strideB1 ) + ( j * strideB2 ) ] * A[ offsetA + ( k * strideA1 ) + ( i * strideA2 ) ];
						}
						if ( beta === 0.0 ) {
							C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = ( temp1 * A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] ) + ( alpha * temp2 );
						} else {
							C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = ( beta * C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] ) + ( temp1 * A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] ) + ( alpha * temp2 );
						}
					}
				}
			} else {
				for ( j = 0; j < N; j++ ) {
					for ( i = M - 1; i >= 0; i-- ) {
						temp1 = alpha * B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ];
						temp2 = 0.0;
						for ( k = i + 1; k < M; k++ ) {
							C[ offsetC + ( k * strideC1 ) + ( j * strideC2 ) ] += temp1 * A[ offsetA + ( k * strideA1 ) + ( i * strideA2 ) ];
							temp2 += B[ offsetB + ( k * strideB1 ) + ( j * strideB2 ) ] * A[ offsetA + ( k * strideA1 ) + ( i * strideA2 ) ];
						}
						if ( beta === 0.0 ) {
							C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = ( temp1 * A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] ) + ( alpha * temp2 );
						} else {
							C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = ( beta * C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] ) + ( temp1 * A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] ) + ( alpha * temp2 );
						}
					}
				}
			}
		} else {
			// C := alpha*B*A + beta*C
			for ( j = 0; j < N; j++ ) {
				temp1 = alpha * A[ offsetA + ( j * strideA1 ) + ( j * strideA2 ) ];
				if ( beta === 0.0 ) {
					for ( i = 0; i < M; i++ ) {
						C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = temp1 * B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ];
					}
				} else {
					for ( i = 0; i < M; i++ ) {
						C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] = ( beta * C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] ) + ( temp1 * B[ offsetB + ( i * strideB1 ) + ( j * strideB2 ) ] );
					}
				}
				for ( k = 0; k < j; k++ ) {
					if ( upper ) {
						temp1 = alpha * A[ offsetA + ( k * strideA1 ) + ( j * strideA2 ) ];
					} else {
						temp1 = alpha * A[ offsetA + ( j * strideA1 ) + ( k * strideA2 ) ];
					}
					for ( i = 0; i < M; i++ ) {
						C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] += temp1 * B[ offsetB + ( i * strideB1 ) + ( k * strideB2 ) ];
					}
				}
				for ( k = j + 1; k < N; k++ ) {
					if ( upper ) {
						temp1 = alpha * A[ offsetA + ( j * strideA1 ) + ( k * strideA2 ) ];
					} else {
						temp1 = alpha * A[ offsetA + ( k * strideA1 ) + ( j * strideA2 ) ];
					}
					for ( i = 0; i < M; i++ ) {
						C[ offsetC + ( i * strideC1 ) + ( j * strideC2 ) ] += temp1 * B[ offsetB + ( i * strideB1 ) + ( k * strideB2 ) ];
					}
				}
			}
		}
		return C;
	}

	// Reduce both sides to C' := alpha*S*B' + beta*C' with S = A symmetric
	// K x K, C' being K x NN. For side='right', C' = C^T and B' = B^T:
	if ( lside ) {
		K = M;
		NN = N;
		sb1 = strideB1;
		sb2 = strideB2;
		sc1 = strideC1;
		sc2 = strideC2;
	} else {
		K = N;
		NN = M;
		sb1 = strideB2;
		sb2 = strideB1;
		sc1 = strideC2;
		sc2 = strideC1;
	}

	mb = K - ( K % 4 ); // last full 4-row group boundary

	for ( jc = 0; jc < NN; jc += NC ) {
		jcEnd = jc + NC;
		if ( jcEnd > NN ) { jcEnd = NN; }
		nb = jc + ( ( jcEnd - jc ) - ( ( jcEnd - jc ) % 4 ) ); // last col index rounded down to multiple of 4

		for ( kc = 0; kc < K; kc += KC ) {
			kcEnd = kc + KC;
			if ( kcEnd > K ) { kcEnd = K; }
			kcLen = kcEnd - kc;
			bz = ( kc === 0 ) ? beta : 1.0; // accumulate across K-panels; only apply beta on first panel
			k1 = kcLen;
			k2 = 2 * kcLen;
			k3 = 3 * kcLen;

			// 4-row groups: pack the rows once, then sweep the column panel
			for ( i = 0; i < mb; i += 4 ) {
				packRows( A, strideA1, strideA2, offsetA, upper, i, 4, kc, kcEnd );

				// 4x4 tiled kernel over full 4-column groups:
				for ( j = jc; j < nb; j += 4 ) {
					pb0 = offsetB + ( j * sb2 ) + ( kc * sb1 );
					pb1 = pb0 + sb2;
					pb2 = pb1 + sb2;
					pb3 = pb2 + sb2;

					c00=0.0; c10=0.0; c20=0.0; c30=0.0;
					c01=0.0; c11=0.0; c21=0.0; c31=0.0;
					c02=0.0; c12=0.0; c22=0.0; c32=0.0;
					c03=0.0; c13=0.0; c23=0.0; c33=0.0;

					for ( l = 0; l < kcLen; l++ ) {
						a0 = PACK[ l ]; a1 = PACK[ k1 + l ]; a2 = PACK[ k2 + l ]; a3 = PACK[ k3 + l ];
						b0 = B[ pb0 + ( l * sb1 ) ]; b1 = B[ pb1 + ( l * sb1 ) ]; b2 = B[ pb2 + ( l * sb1 ) ]; b3 = B[ pb3 + ( l * sb1 ) ];
						c00+=a0*b0; c10+=a1*b0; c20+=a2*b0; c30+=a3*b0;
						c01+=a0*b1; c11+=a1*b1; c21+=a2*b1; c31+=a3*b1;
						c02+=a0*b2; c12+=a1*b2; c22+=a2*b2; c32+=a3*b2;
						c03+=a0*b3; c13+=a1*b3; c23+=a2*b3; c33+=a3*b3;
					}

					pc = offsetC + ( i * sc1 ) + ( j * sc2 );
					if ( bz === 0.0 ) {
						pcc = pc;
						C[pcc]=alpha*c00; C[pcc+sc1]=alpha*c10; C[pcc+2*sc1]=alpha*c20; C[pcc+3*sc1]=alpha*c30;
						pcc = pc + sc2;
						C[pcc]=alpha*c01; C[pcc+sc1]=alpha*c11; C[pcc+2*sc1]=alpha*c21; C[pcc+3*sc1]=alpha*c31;
						pcc = pc + 2*sc2;
						C[pcc]=alpha*c02; C[pcc+sc1]=alpha*c12; C[pcc+2*sc1]=alpha*c22; C[pcc+3*sc1]=alpha*c32;
						pcc = pc + 3*sc2;
						C[pcc]=alpha*c03; C[pcc+sc1]=alpha*c13; C[pcc+2*sc1]=alpha*c23; C[pcc+3*sc1]=alpha*c33;
					} else {
						pcc = pc;
						C[pcc]=alpha*c00+bz*C[pcc]; C[pcc+sc1]=alpha*c10+bz*C[pcc+sc1]; C[pcc+2*sc1]=alpha*c20+bz*C[pcc+2*sc1]; C[pcc+3*sc1]=alpha*c30+bz*C[pcc+3*sc1];
						pcc = pc + sc2;
						C[pcc]=alpha*c01+bz*C[pcc]; C[pcc+sc1]=alpha*c11+bz*C[pcc+sc1]; C[pcc+2*sc1]=alpha*c21+bz*C[pcc+2*sc1]; C[pcc+3*sc1]=alpha*c31+bz*C[pcc+3*sc1];
						pcc = pc + 2*sc2;
						C[pcc]=alpha*c02+bz*C[pcc]; C[pcc+sc1]=alpha*c12+bz*C[pcc+sc1]; C[pcc+2*sc1]=alpha*c22+bz*C[pcc+2*sc1]; C[pcc+3*sc1]=alpha*c32+bz*C[pcc+3*sc1];
						pcc = pc + 3*sc2;
						C[pcc]=alpha*c03+bz*C[pcc]; C[pcc+sc1]=alpha*c13+bz*C[pcc+sc1]; C[pcc+2*sc1]=alpha*c23+bz*C[pcc+2*sc1]; C[pcc+3*sc1]=alpha*c33+bz*C[pcc+3*sc1];
					}
				}

				// Edge columns [nb, jcEnd): 4x1 kernel against the packed rows
				for ( jj = nb; jj < jcEnd; jj++ ) {
					pb = offsetB + ( jj * sb2 ) + ( kc * sb1 );
					c00 = 0.0; c10 = 0.0; c20 = 0.0; c30 = 0.0;
					for ( l = 0; l < kcLen; l++ ) {
						b0 = B[ pb + ( l * sb1 ) ];
						c00 += PACK[ l ] * b0;
						c10 += PACK[ k1 + l ] * b0;
						c20 += PACK[ k2 + l ] * b0;
						c30 += PACK[ k3 + l ] * b0;
					}
					pc = offsetC + ( i * sc1 ) + ( jj * sc2 );
					if ( bz === 0.0 ) {
						C[ pc ] = alpha * c00;
						C[ pc + sc1 ] = alpha * c10;
						C[ pc + 2*sc1 ] = alpha * c20;
						C[ pc + 3*sc1 ] = alpha * c30;
					} else {
						C[ pc ] = ( alpha * c00 ) + ( bz * C[ pc ] );
						C[ pc + sc1 ] = ( alpha * c10 ) + ( bz * C[ pc + sc1 ] );
						C[ pc + 2*sc1 ] = ( alpha * c20 ) + ( bz * C[ pc + 2*sc1 ] );
						C[ pc + 3*sc1 ] = ( alpha * c30 ) + ( bz * C[ pc + 3*sc1 ] );
					}
				}
			}

			// Edge rows [mb, K): pack one row at a time, scalar dot per column
			for ( ii = mb; ii < K; ii++ ) {
				packRows( A, strideA1, strideA2, offsetA, upper, ii, 1, kc, kcEnd );
				for ( jj = jc; jj < jcEnd; jj++ ) {
					pb = offsetB + ( jj * sb2 ) + ( kc * sb1 );
					temp = 0.0;
					for ( l = 0; l < kcLen; l++ ) {
						temp += PACK[ l ] * B[ pb + ( l * sb1 ) ];
					}
					pc = offsetC + ( ii * sc1 ) + ( jj * sc2 );
					C[ pc ] = ( bz === 0.0 ) ? alpha * temp : ( alpha * temp ) + ( bz * C[ pc ] );
				}
			}
		}
	}
	return C;
}


// EXPORTS //

export default dsymm;
