/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth */

// VARIABLES //

// Three-level cache-blocking parameters (tuned on Apple M3; conservative values
// that are broadly beneficial across architectures):
var MC = 128;
var NC = 64;
var KC = 256;


// MAIN //

/**
* Performs one of the matrix-matrix operations:.
* C := alpha_op(A)_op(B) + beta*C
* where op(X) is one of X or X**T.
*
* ## Notes
*
* -   4×4 register-tiled kernel with three-level (MC×NC×KC) cache blocking.
*     Holds a 4×4 block of C in scalar registers across the full inner-K loop so
*     each loaded A/B value is reused 4 times before eviction. Cache blocking
*     bounds A/B memory traffic for large matrices (fixes the bandwidth cliff that
*     unblocked register-tile kernels hit past L2/L3).
* -   General-stride formulation: effective row/column strides (ar, ak, bk, bn)
*     are derived from the transpose flags and the caller's strides, so all four
*     transpose combinations (NN/TN/NT/TT) and both row- and column-major layouts
*     are covered by the same kernel without dispatch.
* -   Speedup vs naive reference: ~4× at cache-resident sizes, ~3.8× for large
*     square matrices, ~13× for row-major inputs (which have poor cache behavior
*     in the naive kernel). See bench/dgemm-opt/ for the full study.
*
* @private
* @param {string} transa - specifies op(A): `'no-transpose'` or `'transpose'`
* @param {string} transb - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of op(A) and C
* @param {NonNegativeInteger} N - number of columns of op(B) and C
* @param {NonNegativeInteger} K - number of columns of op(A) / rows of op(B)
* @param {number} alpha - scalar multiplier for op(A)*op(B)
* @param {Float64Array} A - first input matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - index offset for A
* @param {Float64Array} B - second input matrix
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
function dgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	// 16 register accumulators declared first — V8 register allocation is
	// Sensitive to declaration order; accumulators before loop variables gives
	// A reproducible ~15% improvement (see bench/dgemm-opt/reports/).
	var c00; var c01; var c02; var c03; var c10; var c11; var c12; var c13; var c20; var c21; var c22; var c23; var c30; var c31; var c32; var c33;
	var nota; var notb; var ar; var ak; var bk; var bn;
	var a0; var a1; var a2; var a3; var b0; var b1; var b2; var b3;
	var pa0; var pa1; var pa2; var pa3; var pb0; var pb1; var pb2; var pb3; var pc; var pcc; var pak;
	var jc; var kc; var ic; var j; var i; var l; var jcEnd; var kcEnd; var icEnd; var kcLen; var nb; var mb; var bz; var jj; var ii; var pa; var pb; var temp;

	if ( M === 0 || N === 0 || ( ( alpha === 0.0 || K === 0 ) && beta === 1.0 ) ) {
		return C;
	}

	nota = ( transa === 'no-transpose' );
	notb = ( transb === 'no-transpose' );

	// Effective row/column strides for A and B after accounting for transposition
	ar = ( nota ) ? strideA1 : strideA2; // stride along A's row dimension (within a column of op(A))
	ak = ( nota ) ? strideA2 : strideA1; // stride along A's column dimension (the K loop)
	bk = ( notb ) ? strideB1 : strideB2; // stride along B's row dimension (the K loop)
	bn = ( notb ) ? strideB2 : strideB1; // stride along B's column dimension (output columns)

	if ( alpha === 0.0 || K === 0 ) {
		for ( j = 0; j < N; j++ ) {
			pc = offsetC + ( j * strideC2 );
			if ( beta === 0.0 ) {
				for ( i = 0; i < M; i++ ) { C[ pc ] = 0.0; pc += strideC1; }
			} else {
				for ( i = 0; i < M; i++ ) { C[ pc ] *= beta; pc += strideC1; }
			}
		}
		return C;
	}

	// Three-level blocked loop: jc (N-panels of NC), kc (K-panels of KC), ic (M-panels of MC)
	for ( jc = 0; jc < N; jc += NC ) {
		jcEnd = jc + NC;
		if ( jcEnd > N ) { jcEnd = N; }
		nb = jc + ( ( jcEnd - jc ) - ( ( jcEnd - jc ) % 4 ) ); // last col index rounded down to multiple of 4

		for ( kc = 0; kc < K; kc += KC ) {
			kcEnd = kc + KC;
			if ( kcEnd > K ) { kcEnd = K; }
			kcLen = kcEnd - kc;
			bz = ( kc === 0 ) ? beta : 1.0; // accumulate across K-panels; only apply beta on first panel

			for ( ic = 0; ic < M; ic += MC ) {
				icEnd = ic + MC;
				if ( icEnd > M ) { icEnd = M; }
				mb = ic + ( ( icEnd - ic ) - ( ( icEnd - ic ) % 4 ) ); // last row rounded down to multiple of 4

				// 4×4 tiled inner kernel: process 4 rows × 4 cols of C at a time
				for ( j = jc; j < nb; j += 4 ) {
					pb0 = offsetB + ( j * bn ) + ( kc * bk );
					pb1 = pb0 + bn;
					pb2 = pb1 + bn;
					pb3 = pb2 + bn;

					for ( i = ic; i < mb; i += 4 ) {
						c00=0.0; c10=0.0; c20=0.0; c30=0.0;
						c01=0.0; c11=0.0; c21=0.0; c31=0.0;
						c02=0.0; c12=0.0; c22=0.0; c32=0.0;
						c03=0.0; c13=0.0; c23=0.0; c33=0.0;

						pa0 = offsetA + ( i * ar ) + ( kc * ak );
						pa1 = pa0 + ar;
						pa2 = pa1 + ar;
						pa3 = pa2 + ar;

						for ( l = 0; l < kcLen; l++ ) {
							pak = l * ak;
							a0 = A[ pa0 + pak ]; a1 = A[ pa1 + pak ]; a2 = A[ pa2 + pak ]; a3 = A[ pa3 + pak ];
							b0 = B[ pb0 + ( l * bk ) ]; b1 = B[ pb1 + ( l * bk ) ]; b2 = B[ pb2 + ( l * bk ) ]; b3 = B[ pb3 + ( l * bk ) ];
							c00+=a0*b0; c10+=a1*b0; c20+=a2*b0; c30+=a3*b0;
							c01+=a0*b1; c11+=a1*b1; c21+=a2*b1; c31+=a3*b1;
							c02+=a0*b2; c12+=a1*b2; c22+=a2*b2; c32+=a3*b2;
							c03+=a0*b3; c13+=a1*b3; c23+=a2*b3; c33+=a3*b3;
						}

						pc = offsetC + ( i * strideC1 ) + ( j * strideC2 );
						if ( bz === 0.0 ) {
							pcc = pc;
							C[pcc]=alpha*c00; C[pcc+strideC1]=alpha*c10; C[pcc+2*strideC1]=alpha*c20; C[pcc+3*strideC1]=alpha*c30;
							pcc = pc + strideC2;
							C[pcc]=alpha*c01; C[pcc+strideC1]=alpha*c11; C[pcc+2*strideC1]=alpha*c21; C[pcc+3*strideC1]=alpha*c31;
							pcc = pc + 2*strideC2;
							C[pcc]=alpha*c02; C[pcc+strideC1]=alpha*c12; C[pcc+2*strideC1]=alpha*c22; C[pcc+3*strideC1]=alpha*c32;
							pcc = pc + 3*strideC2;
							C[pcc]=alpha*c03; C[pcc+strideC1]=alpha*c13; C[pcc+2*strideC1]=alpha*c23; C[pcc+3*strideC1]=alpha*c33;
						} else {
							pcc = pc;
							C[pcc]=alpha*c00+bz*C[pcc]; C[pcc+strideC1]=alpha*c10+bz*C[pcc+strideC1]; C[pcc+2*strideC1]=alpha*c20+bz*C[pcc+2*strideC1]; C[pcc+3*strideC1]=alpha*c30+bz*C[pcc+3*strideC1];
							pcc = pc + strideC2;
							C[pcc]=alpha*c01+bz*C[pcc]; C[pcc+strideC1]=alpha*c11+bz*C[pcc+strideC1]; C[pcc+2*strideC1]=alpha*c21+bz*C[pcc+2*strideC1]; C[pcc+3*strideC1]=alpha*c31+bz*C[pcc+3*strideC1];
							pcc = pc + 2*strideC2;
							C[pcc]=alpha*c02+bz*C[pcc]; C[pcc+strideC1]=alpha*c12+bz*C[pcc+strideC1]; C[pcc+2*strideC1]=alpha*c22+bz*C[pcc+2*strideC1]; C[pcc+3*strideC1]=alpha*c32+bz*C[pcc+3*strideC1];
							pcc = pc + 3*strideC2;
							C[pcc]=alpha*c03+bz*C[pcc]; C[pcc+strideC1]=alpha*c13+bz*C[pcc+strideC1]; C[pcc+2*strideC1]=alpha*c23+bz*C[pcc+2*strideC1]; C[pcc+3*strideC1]=alpha*c33+bz*C[pcc+3*strideC1];
						}
					}
				}

				// Edge rows [mb, icEnd) for columns jc..nb-1
				for ( jj = jc; jj < nb; jj++ ) {
					pb = offsetB + ( jj * bn ) + ( kc * bk );
					for ( ii = mb; ii < icEnd; ii++ ) {
						temp = 0.0;
						pa = offsetA + ( ii * ar ) + ( kc * ak );
						for ( l = 0; l < kcLen; l++ ) {
							temp += A[ pa + ( l * ak ) ] * B[ pb + ( l * bk ) ];
						}
						pc = offsetC + ( ii * strideC1 ) + ( jj * strideC2 );
						C[ pc ] = ( bz === 0.0 ) ? alpha * temp : ( alpha * temp ) + ( bz * C[ pc ] );
					}
				}
			}
		}

		// Edge columns [nb, jcEnd) over all rows (scalar, full K)
		for ( jj = nb; jj < jcEnd; jj++ ) {
			pb = offsetB + ( jj * bn );
			for ( ii = 0; ii < M; ii++ ) {
				temp = 0.0;
				pa = offsetA + ( ii * ar );
				for ( l = 0; l < K; l++ ) {
					temp += A[ pa + ( l * ak ) ] * B[ pb + ( l * bk ) ];
				}
				pc = offsetC + ( ii * strideC1 ) + ( jj * strideC2 );
				C[ pc ] = ( beta === 0.0 ) ? alpha * temp : ( alpha * temp ) + ( beta * C[ pc ] );
			}
		}
	}
	return C;
}


// EXPORTS //

export default dgemm;
