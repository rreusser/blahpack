/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zgeru from './../../../../blas/base/zgeru/lib/base.js';
import zdscal from './../../../../blas/base/zdscal/lib/base.js';
import zswap from './../../../../blas/base/zswap/lib/base.js';
import zlacgv from './../../zlacgv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var NCONE = new Complex128( -1.0, 0.0 );

// Module-level scratch for cDiv result. Hot loops avoid allocation by reading these after each call.
var cdR = 0.0;
var cdI = 0.0;


// FUNCTIONS //

/**
* Performs robust complex division `(ar+ai*i) / (br+bi*i)` using the Smith algorithm and stores the result in module-level `cdR` and `cdI`.
*
* @private
* @param {number} ar - real part of numerator
* @param {number} ai - imaginary part of numerator
* @param {number} br - real part of denominator
* @param {number} bi - imaginary part of denominator
*/
function cDiv( ar, ai, br, bi ) {
	var r;
	var d;
	if ( Math.abs( bi ) <= Math.abs( br ) ) {
		r = bi / br;
		d = br + ( bi * r );
		cdR = ( ar + ( ai * r ) ) / d;
		cdI = ( ai - ( ar * r ) ) / d;
	} else {
		r = br / bi;
		d = bi + ( br * r );
		cdR = ( ( ar * r ) + ai ) / d;
		cdI = ( ( ai * r ) - ar ) / d;
	}
}


// MAIN //

/**
* Solves a system of linear equations `A*X = B` with a complex Hermitian matrix `A` using the factorization `A = U*D*U^H` or `A = L*D*L^H` computed by `zhetrf_rook`.
*
* IPIV uses the same 0-based convention as `zhetf2_rook`/`zhetrf_rook`:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`.
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = `~kp` (bitwise NOT of 0-based index). For rook pivoting, BOTH entries of a 2x2 block are negative, each encoding its own swap target.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Complex128Array} A - factored matrix from `zhetrf_rook`
* @param {integer} strideA1 - first stride of `A` (in complex elements)
* @param {integer} strideA2 - second stride of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - offset into `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf_rook`
* @param {integer} strideIPIV - stride of `IPIV`
* @param {NonNegativeInteger} offsetIPIV - offset into `IPIV`
* @param {Complex128Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - first stride of `B` (in complex elements)
* @param {integer} strideB2 - second stride of `B` (in complex elements)
* @param {NonNegativeInteger} offsetB - offset into `B` (in complex elements)
* @returns {integer} info - 0 on success
*/
function zhetrsRook( uplo, N, nrhs, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var denomR;
	var denomI;
	var akm1kR;
	var akm1kI;
	var akm1R;
	var akm1I;
	var bkm1R;
	var bkm1I;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var akR;
	var akI;
	var bkR;
	var bkI;
	var Av;
	var Bv;
	var kp;
	var tr;
	var ti;
	var p1;
	var p2;
	var s;
	var k;
	var j;

	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U*D*U^H

		// Phase 1: Solve U*D*X' = B, overwriting B with X'. K starts at N-1 and decreases.
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(U(K)): B(0:k-1,:) -= A(0:k-1,k) * B(k,:)
				if ( k > 0 ) {
					zgeru( k, nrhs, NCONE, A, strideA1, offsetA + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );
				}

				// Multiply by inv(D(K)): Hermitian diagonal is real
				p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
				s = 1.0 / Av[ p1 ];
				zdscal( nrhs, s, B, strideB2, offsetB + (k * strideB1) );
				k -= 1;
			} else {
				// 2x2 pivot block (rook): TWO row swaps

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Interchange rows k-1 and ~IPIV[k-1]
				kp = ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ];
				if ( kp !== k - 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(U(K)): update B(0:k-2,:)
				if ( k > 1 ) {
					zgeru( k - 1, nrhs, NCONE, A, strideA1, offsetA + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );
					zgeru( k - 1, nrhs, NCONE, A, strideA1, offsetA + (( k - 1 ) * strideA2), B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB1, strideB2, offsetB );
				}

				// Multiply by inv(D(K)): solve the 2x2 system
				// AKM1K = A(k-1, k)
				p1 = (offsetA * 2) + (( k - 1 ) * sa1) + (k * sa2);
				akm1kR = Av[ p1 ];
				akm1kI = Av[ p1 + 1 ];

				// AKM1 = A(k-1,k-1) / AKM1K  (Hermitian: A(k-1,k-1) is real)
				p2 = (offsetA * 2) + (( k - 1 ) * sa1) + (( k - 1 ) * sa2);
				cDiv( Av[ p2 ], 0.0, akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = A(k,k) / conj(AKM1K)  (Hermitian: A(k,k) is real)
				p2 = (offsetA * 2) + (k * sa1) + (k * sa2);
				cDiv( Av[ p2 ], 0.0, akm1kR, -akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1*AK - 1
				denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
				denomI = (akm1R * akI) + (akm1I * akR);

				for ( j = 0; j < nrhs; j++ ) {
					// BKM1 = B(k-1,j) / AKM1K
					p1 = (offsetB * 2) + (( k - 1 ) * sb1) + (j * sb2);
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;

					// BK = B(k,j) / conj(AKM1K)
					p2 = (offsetB * 2) + (k * sb1) + (j * sb2);
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, -akm1kI );
					bkR = cdR;
					bkI = cdI;

					// B(k-1,j) = (AK*BKM1 - BK) / DENOM
					tr = (akR * bkm1R) - (akI * bkm1I) - bkR;
					ti = (akR * bkm1I) + (akI * bkm1R) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;

					// B(k,j) = (AKM1*BK - BKM1) / DENOM
					tr = (akm1R * bkR) - (akm1I * bkI) - bkm1R;
					ti = (akm1R * bkI) + (akm1I * bkR) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				k -= 2;
			}
		}

		// Phase 2: Solve U^H * X = X', computing X from X'. K starts at 0 and increases.
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				if ( k > 0 ) {
					// Conjugate B(k,:), apply conjugate-transpose gemv, unconjugate
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
				}

				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 1;
			} else {
				// 2x2 pivot block (rook)
				if ( k > 0 ) {
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );

					zlacgv( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, A, strideA1, offsetA + (( k + 1 ) * strideA2), CONE, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Interchange rows k+1 and ~IPIV[k+1]
				kp = ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ];
				if ( kp !== k + 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k += 2;
			}
		}
	} else {
		// Solve A*X = B where A = L*D*L^H

		// Phase 1: Solve L*D*X' = B, overwriting B with X'. K starts at 0 and increases.
		k = 0;
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(L(K)): B(k+1:n-1,:) -= A(k+1:n-1,k) * B(k,:)
				if ( k < N - 1 ) {
					zgeru( N - k - 1, nrhs, NCONE, A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}

				// Multiply by inv(D(K)): Hermitian diagonal is real
				p1 = (offsetA * 2) + (k * sa1) + (k * sa2);
				s = 1.0 / Av[ p1 ];
				zdscal( nrhs, s, B, strideB2, offsetB + (k * strideB1) );
				k += 1;
			} else {
				// 2x2 pivot block (rook): TWO row swaps

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Interchange rows k+1 and ~IPIV[k+1]
				kp = ~IPIV[ offsetIPIV + (( k + 1 ) * strideIPIV) ];
				if ( kp !== k + 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(L(K)): update B(k+2:n-1,:)
				if ( k < N - 2 ) {
					zgeru( N - k - 2, nrhs, NCONE, A, strideA1, offsetA + (( k + 2 ) * strideA1) + (k * strideA2), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );
					zgeru( N - k - 2, nrhs, NCONE, A, strideA1, offsetA + (( k + 2 ) * strideA1) + (( k + 1 ) * strideA2), B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );
				}

				// Multiply by inv(D(K)): solve the 2x2 system
				// AKM1K = A(k+1, k)
				p1 = (offsetA * 2) + (( k + 1 ) * sa1) + (k * sa2);
				akm1kR = Av[ p1 ];
				akm1kI = Av[ p1 + 1 ];

				// AKM1 = A(k,k) / conj(AKM1K)  (Hermitian: A(k,k) is real)
				p2 = (offsetA * 2) + (k * sa1) + (k * sa2);
				cDiv( Av[ p2 ], 0.0, akm1kR, -akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = A(k+1,k+1) / AKM1K  (Hermitian: A(k+1,k+1) is real)
				p2 = (offsetA * 2) + (( k + 1 ) * sa1) + (( k + 1 ) * sa2);
				cDiv( Av[ p2 ], 0.0, akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1*AK - 1
				denomR = (akm1R * akR) - (akm1I * akI) - 1.0;
				denomI = (akm1R * akI) + (akm1I * akR);

				for ( j = 0; j < nrhs; j++ ) {
					// BKM1 = B(k,j) / conj(AKM1K)
					p1 = (offsetB * 2) + (k * sb1) + (j * sb2);
					cDiv( Bv[ p1 ], Bv[ p1 + 1 ], akm1kR, -akm1kI );
					bkm1R = cdR;
					bkm1I = cdI;

					// BK = B(k+1,j) / AKM1K
					p2 = (offsetB * 2) + (( k + 1 ) * sb1) + (j * sb2);
					cDiv( Bv[ p2 ], Bv[ p2 + 1 ], akm1kR, akm1kI );
					bkR = cdR;
					bkI = cdI;

					// B(k,j) = (AK*BKM1 - BK) / DENOM
					tr = (akR * bkm1R) - (akI * bkm1I) - bkR;
					ti = (akR * bkm1I) + (akI * bkm1R) - bkI;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p1 ] = cdR;
					Bv[ p1 + 1 ] = cdI;

					// B(k+1,j) = (AKM1*BK - BKM1) / DENOM
					tr = (akm1R * bkR) - (akm1I * bkI) - bkm1R;
					ti = (akm1R * bkI) + (akm1I * bkR) - bkm1I;
					cDiv( tr, ti, denomR, denomI );
					Bv[ p2 ] = cdR;
					Bv[ p2 + 1 ] = cdI;
				}
				k += 2;
			}
		}

		// Phase 2: Solve L^H * X = X', computing X from X'. K starts at N-1 and decreases.
		k = N - 1;
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				if ( k < N - 1 ) {
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
				}

				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 1;
			} else {
				// 2x2 pivot block (rook)
				if ( k < N - 1 ) {
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (k * strideA2), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );

					zlacgv( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), A, strideA1, offsetA + (( k + 1 ) * strideA1) + (( k - 1 ) * strideA2), CONE, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Interchange rows k-1 and ~IPIV[k-1]
				kp = ~IPIV[ offsetIPIV + (( k - 1 ) * strideIPIV) ];
				if ( kp !== k - 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}
				k -= 2;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zhetrsRook;
