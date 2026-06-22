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
import zgemv from '../../../../blas/base/zgemv/lib/base.js';
import zgeru from '../../../../blas/base/zgeru/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zswap from '../../../../blas/base/zswap/lib/base.js';
import zlacgv from '../../zlacgv/lib/base.js';

var CONE = new Complex128( 1.0, 0.0 );
var NCONE = new Complex128( -1.0, 0.0 );


// VARIABLES //

/**
* Real part of complex division result.
*
* @private
* @type {number}
*/
var cdR = 0.0;

/**
* Imaginary part of complex division result.
*
* @private
* @type {number}
*/
var cdI = 0.0;


// FUNCTIONS //

/**
* Perform complex division, storing result in module-level cdR and cdI.
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
		d = br + (bi * r);
		cdR = ( ar + (ai * r) ) / d;
		cdI = ( ai - (ar * r) ) / d;
	} else {
		r = br / bi;
		d = bi + (br * r);
		cdR = ( (ar * r) + ai ) / d;
		cdI = ( (ai * r) - ar ) / d;
	}
}


// MAIN //

/**
* Solves a system of linear equations `A * X = B` with a Hermitian packed matrix.
*
* IPIV uses 0-based convention:
*   IPIV[k] >= 0: 1x1 pivot, row k was interchanged with row IPIV[k]
*   IPIV[k] < 0: 2x2 pivot, IPIV[k] = ~kp (bitwise NOT of 0-based index)
*
* @private
* @param {string} uplo - 'upper' or 'lower', must match the factorization
* @param {integer} N - order of the matrix
* @param {integer} nrhs - number of right-hand sides
* @param {Complex128Array} AP - factored matrix from zhptrf (packed storage)
* @param {integer} strideAP - stride for AP (in complex elements)
* @param {integer} offsetAP - offset into AP (in complex elements)
* @param {Int32Array} IPIV - pivot indices from zhptrf (0-based)
* @param {integer} strideIPIV - stride of IPIV
* @param {integer} offsetIPIV - offset into IPIV
* @param {Complex128Array} B - input/output right-hand side matrix
* @param {integer} strideB1 - first stride of B (in complex elements)
* @param {integer} strideB2 - second stride of B (in complex elements)
* @param {integer} offsetB - offset into B (in complex elements)
* @returns {integer} info value (0 = success)
*/
function zhptrs( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var denomR;
	var denomI;
	var akm1kR;
	var akm1kI;
	var akm1R;
	var akm1I;
	var bkm1R;
	var bkm1I;
	var sap;
	var sb1;
	var sb2;
	var akR;
	var akI;
	var bkR;
	var bkI;
	var APv;
	var Bv;
	var kc;
	var kp;
	var tr;
	var ti;
	var p1;
	var p2;
	var s;
	var k;
	var j;

	sap = strideAP * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	APv = reinterpret( AP, 0 );
	Bv = reinterpret( B, 0 );

	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U*D*U**H (packed upper triangle).

		// Phase 1: Solve U*D*X' = B, overwriting B with X'.
		// Process from k = N-1 down to 0.
		// KC tracks the packed position of the start of column k in upper storage.
		// In Fortran (1-based): KC = N*(N+1)/2 + 1, then KC -= (k+1) each step.
		// In 0-based: KC starts at N*(N+1)/2 - N (start of column N-1).
		k = N - 1;
		kc = ( N * ( N + 1 ) / 2 ) - N; // 0-based start of column N-1
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(U(K)): B(0:k-1,:) -= AP(kc:kc+k-1) * B(k,:)
				// AP(kc..kc+k-1) are the k elements above diagonal in column k
				if ( k > 0 ) {
					zgeru( k, nrhs, NCONE, AP, strideAP, offsetAP + (kc * strideAP), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );
				}

				// Multiply by inv(D(K)): B(k,:) *= 1/real(AP(kc+k))
				// AP(kc+k) is the diagonal element A(k,k)
				p1 = (offsetAP * 2) + ((kc + k) * sap);
				s = 1.0 / APv[ p1 ]; // real part only (Hermitian diagonal is real)
				zdscal( nrhs, s, B, strideB2, offsetB + (k * strideB1) );

				kc -= k; // move to start of column k-1
				k -= 1;
			} else {
				// 2x2 pivot block: columns k-1 and k

				// Interchange rows k-1 and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k - 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(U(K)): update B(0:k-2,:)
				if ( k > 1 ) {
					// Column k: AP(kc..kc+k-1) has k elements (rows 0..k-1)
					zgeru( k - 1, nrhs, NCONE, AP, strideAP, offsetAP + (kc * strideAP), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB );

					// Column k-1: starts at kc-k (has k-1 elements above diagonal)
					zgeru( k - 1, nrhs, NCONE, AP, strideAP, offsetAP + ((kc - k) * strideAP), B, strideB2, offsetB + (( k - 1 ) * strideB1), B, strideB1, strideB2, offsetB );
				}

				// Multiply by inv(D(K)): solve 2x2 system
				// AKM1K = AP(kc+k-1) -- the off-diagonal element A(k-1,k)
				p1 = (offsetAP * 2) + ((kc + k - 1) * sap);
				akm1kR = APv[ p1 ];
				akm1kI = APv[ p1 + 1 ];

				// AKM1 = AP(kc-1) / AKM1K  -- A(k-1,k-1) is the diagonal of column k-1

				// Column k-1 starts at kc-k, diagonal at kc-k+(k-1) = kc-1
				p2 = (offsetAP * 2) + ((kc - 1) * sap);
				cDiv( APv[ p2 ], 0.0, akm1kR, akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = AP(kc+k) / conj(AKM1K)  -- A(k,k) is the diagonal of column k
				p2 = (offsetAP * 2) + ((kc + k) * sap);
				cDiv( APv[ p2 ], 0.0, akm1kR, -akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1 * AK - 1
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

				// Move kc back past column k-1:
				// kc currently points to start of column k
				// Column k-1 starts at kc - k, and column k-2 starts at kc - k - (k-1)
				kc = kc - k - ( k - 1 );
				k -= 2;
			}
		}

		// Phase 2: Solve U**H * X = X', computing X from X'.
		// Process columns from 0 up to N-1.
		k = 0;
		kc = 0; // start of column 0
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				if ( k > 0 ) {
					// Conjugate B(k,:), apply conjugate-transpose gemv, unconjugate
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, AP, strideAP, offsetAP + (kc * strideAP), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
				}

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				kc += k + 1; // advance to start of column k+1
				k += 1;
			} else {
				// 2x2 pivot block
				if ( k > 0 ) {
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, AP, strideAP, offsetAP + (kc * strideAP), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );

					zlacgv( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
					zgemv( 'conjugate-transpose', k, nrhs, NCONE, B, strideB1, strideB2, offsetB, AP, strideAP, offsetAP + ((kc + k + 1) * strideAP), CONE, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				kc += (2 * k) + 3; // skip columns k and k+1
				k += 2;
			}
		}
	} else {
		// Solve A*X = B where A = L*D*L**H (packed lower triangle).

		// Phase 1: Solve L*D*X' = B, overwriting B with X'.
		// Process from k = 0 up to N-1.
		k = 0;
		kc = 0; // start of column 0 in lower packed storage
		while ( k < N ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(L(K)): B(k+1:N-1,:) -= AP(kc+1:kc+N-k-1) * B(k,:)
				if ( k < N - 1 ) {
					zgeru( N - k - 1, nrhs, NCONE, AP, strideAP, offsetAP + ((kc + 1) * strideAP), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1) );
				}

				// Multiply by inv(D(K)): B(k,:) *= 1/real(AP(kc))
				p1 = (offsetAP * 2) + (kc * sap);
				s = 1.0 / APv[ p1 ];
				zdscal( nrhs, s, B, strideB2, offsetB + (k * strideB1) );

				kc += N - k; // advance to start of next column
				k += 1;
			} else {
				// 2x2 pivot block: columns k and k+1

				// Interchange rows k+1 and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k + 1 ) {
					zswap( nrhs, B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				// Multiply by inv(L(K)): update B(k+2:N-1,:)
				if ( k < N - 2 ) {
					// Column k: AP(kc+2..kc+N-k-1) has N-k-2 elements below (k+1)
					zgeru( N - k - 2, nrhs, NCONE, AP, strideAP, offsetAP + ((kc + 2) * strideAP), B, strideB2, offsetB + (k * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );

					// Column k+1: starts at kc+(N-k), subdiagonal at kc+(N-k)+1
					zgeru( N - k - 2, nrhs, NCONE, AP, strideAP, offsetAP + ((kc + N - k + 1) * strideAP), B, strideB2, offsetB + (( k + 1 ) * strideB1), B, strideB1, strideB2, offsetB + (( k + 2 ) * strideB1) );
				}

				// Multiply by inv(D(K)): solve 2x2 system
				// AKM1K = AP(kc+1) -- the off-diagonal A(k+1,k)
				p1 = (offsetAP * 2) + ((kc + 1) * sap);
				akm1kR = APv[ p1 ];
				akm1kI = APv[ p1 + 1 ];

				// AKM1 = AP(kc) / conj(AKM1K)  -- A(k,k) diagonal
				p2 = (offsetAP * 2) + (kc * sap);
				cDiv( APv[ p2 ], 0.0, akm1kR, -akm1kI );
				akm1R = cdR;
				akm1I = cdI;

				// AK = AP(kc+N-k) / AKM1K  -- A(k+1,k+1) diagonal

				// Column k+1 starts at kc+(N-k), its diagonal is the first element
				p2 = (offsetAP * 2) + ((kc + N - k) * sap);
				cDiv( APv[ p2 ], 0.0, akm1kR, akm1kI );
				akR = cdR;
				akI = cdI;

				// DENOM = AKM1 * AK - 1
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

				kc += (2 * N) - (2 * k) - 1; // skip columns k and k+1
				k += 2;
			}
		}

		// Phase 2: Solve L**H * X = X', computing X from X'.
		// Process from k = N-1 down to 0.
		k = N - 1;
		kc = ( N * ( N + 1 ) / 2 ) - 1; // packed index of diagonal of column N-1
		while ( k >= 0 ) {
			if ( IPIV[ offsetIPIV + (k * strideIPIV) ] >= 0 ) {
				// 1x1 pivot block
				if ( k < N - 1 ) {
					// Conjugate B(k,:), apply conjugate-transpose gemv, unconjugate
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), AP, strideAP, offsetAP + ((kc + 1) * strideAP), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
				}

				// Interchange rows k and IPIV[k]
				kp = IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				kc -= ( N - k + 1 ); // move to diagonal of column k-1
				k -= 1;
			} else {
				// 2x2 pivot block
				if ( k < N - 1 ) {
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), AP, strideAP, offsetAP + ((kc + 1) * strideAP), CONE, B, strideB2, offsetB + (k * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (k * strideB1) );

					zlacgv( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
					zgemv( 'conjugate-transpose', N - k - 1, nrhs, NCONE, B, strideB1, strideB2, offsetB + (( k + 1 ) * strideB1), AP, strideAP, offsetAP + ((kc - N + k + 1) * strideAP), CONE, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
					zlacgv( nrhs, B, strideB2, offsetB + (( k - 1 ) * strideB1) );
				}

				// Interchange rows k and ~IPIV[k]
				kp = ~IPIV[ offsetIPIV + (k * strideIPIV) ];
				if ( kp !== k ) {
					zswap( nrhs, B, strideB2, offsetB + (k * strideB1), B, strideB2, offsetB + (kp * strideB1) );
				}

				kc -= (2 * N) - (2 * k) + 3; // move back past two columns
				k -= 2;
			}
		}
	}
	return 0;
}


// EXPORTS //

export default zhptrs;
