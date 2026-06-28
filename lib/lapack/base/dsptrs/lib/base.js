/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dger from '../../../../blas/base/dger/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Solves a system of linear equations A _ X = B with a real symmetric matrix A.
_ stored in packed format, using the factorization A = U_D_U^T or A = L_D*L^T
* computed by dsptrf.
*
* All internal variables use Fortran 1-based indexing conventions. The packed
* array is accessed as `AP[ offsetAP + (pos-1)*strideAP ]` where `pos` is
* 1-based.
*
* IPIV uses 0-based conventions:
*
* -   `IPIV[k]` >= 0: 1x1 pivot, row k was interchanged with row `IPIV[k]`
* -   `IPIV[k]` < 0: 2x2 pivot, `IPIV[k]` = ~kp (bitwise NOT of 0-based index)
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side vectors
* @param {Float64Array} AP - factored packed matrix from dsptrf, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Int32Array} IPIV - pivot indices from dsptrf
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} B - input/output right-hand side / solution matrix
* @param {integer} strideB1 - stride of the first dimension of B
* @param {integer} strideB2 - stride of the second dimension of B
* @param {NonNegativeInteger} offsetB - index offset for B
* @returns {integer} info - 0 on success
*/
function dsptrs( uplo, N, nrhs, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var denom;
	var akm1k;
	var akm1;
	var bkm1;
	var sb1;
	var sb2;
	var ak;
	var bk;
	var kp;
	var kc;
	var k;
	var j;

	sb1 = strideB1;
	sb2 = strideB2;

	// Quick return
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// Internal variables use 1-based Fortran conventions.
	// kc is the 1-based position in the packed array of the start of column k.
	// AP is accessed as AP[ offsetAP + (pos-1)*strideAP ] where pos is 1-based.

	if ( uplo === 'upper' ) {
		// Solve A*X = B where A = U*D*U^T

		// First solve U*D*X = B, overwriting B with X.
		// K decreases from N to 1 (1-based).
		// KC = position of start of column K in packed upper storage (1-based).
		k = N;
		kc = ( ( N * ( N + 1 ) / 2 ) | 0 ) + 1;
		while ( k >= 1 ) {
			kc -= k;
			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot block

				// Interchange rows K and IPIV[K-1] (0-based)
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}

				// Apply multiplier: B(1:k-1,:) -= AP(kc:kc+k-2) * B(k,:)
				if ( k > 1 ) {
					dger( k - 1, nrhs, -1.0, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb1, sb2, offsetB );
				}

				// Divide row k by pivot D(k,k) = AP(kc+k-1) (1-based)
				dscal( nrhs, 1.0 / AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ], B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
				k -= 1;
			} else {
				// 2x2 pivot block

				// Interchange rows K-1 and ~IPIV[K-1] (0-based)
				kp = ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 2 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 2 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}

				// Apply multipliers
				if ( k > 2 ) {
					dger( k - 2, nrhs, -1.0, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb1, sb2, offsetB );
					dger( k - 2, nrhs, -1.0, AP, strideAP, offsetAP + ( ( kc - ( k - 1 ) - 1 ) * strideAP ), B, sb2, offsetB + ( ( k - 2 ) * sb1 ), B, sb1, sb2, offsetB );
				}

				// Solve 2x2 system D * [x(k-1); x(k)] = [b(k-1); b(k)]
				// Fortran: AKM1K = AP(KC+K-2), AKM1 = AP(KC-1)/AKM1K, AK = AP(KC+K-1)/AKM1K
				// KC+K-2 is 1-based position of off-diagonal element
				akm1k = AP[ offsetAP + ( ( kc + k - 3 ) * strideAP ) ];
				akm1 = AP[ offsetAP + ( ( kc - 2 ) * strideAP ) ] / akm1k;
				ak = AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] / akm1k;
				denom = ( akm1 * ak ) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + ( ( k - 2 ) * sb1 ) + ( j * sb2 ) ] / akm1k;
					bk = B[ offsetB + ( ( k - 1 ) * sb1 ) + ( j * sb2 ) ] / akm1k;
					B[ offsetB + ( ( k - 2 ) * sb1 ) + ( j * sb2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
					B[ offsetB + ( ( k - 1 ) * sb1 ) + ( j * sb2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
				}
				kc -= k - 1;
				k -= 2;
			}
		}

		// Next solve U^T * X = B, overwriting B with X.
		// K increases from 1 to N (1-based).
		k = 1;
		kc = 1;
		while ( k <= N ) {
			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot

				// Apply multiplier: B(k,:) -= AP(kc:kc+k-2)^T * B(1:k-1,:)
				if ( k > 1 ) {
					dgemv( 'transpose', k - 1, nrhs, -1.0, B, sb1, sb2, offsetB, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), 1.0, B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
				}

				// Interchange rows K and IPIV[K-1]
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				kc += k;
				k += 1;
			} else {
				// 2x2 pivot

				if ( k > 1 ) {
					dgemv( 'transpose', k - 1, nrhs, -1.0, B, sb1, sb2, offsetB, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), 1.0, B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
					dgemv( 'transpose', k - 1, nrhs, -1.0, B, sb1, sb2, offsetB, AP, strideAP, offsetAP + ( ( kc + k - 1 ) * strideAP ), 1.0, B, sb2, offsetB + ( k * sb1 ) );
				}

				// Interchange rows K and ~IPIV[K-1]
				kp = ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				kc += ( 2 * k ) + 1;
				k += 2;
			}
		}
	} else {
		// Solve A*X = B where A = L*D*L^T

		// First solve L*D*X = B, overwriting B with X.
		// K increases from 1 to N (1-based).
		k = 1;
		kc = 1;
		while ( k <= N ) {
			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot

				// Interchange rows K and IPIV[K-1] (0-based)
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}

				// Apply multiplier: B(k+1:N,:) -= AP(kc+1:kc+N-k) * B(k,:)
				if ( k < N ) {
					dger( N - k, nrhs, -1.0, AP, strideAP, offsetAP + ( kc * strideAP ), B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb1, sb2, offsetB + ( k * sb1 ) );
				}

				// Divide row k by pivot D(k,k) = AP(kc) (1-based)
				dscal( nrhs, 1.0 / AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ], B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
				kc += N - k + 1;
				k += 1;
			} else {
				// 2x2 pivot

				// Interchange rows K+1 and ~IPIV[K-1] (0-based)
				kp = ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k ) {
					dswap( nrhs, B, sb2, offsetB + ( k * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}

				// Apply multipliers
				if ( k < N - 1 ) {
					dger( N - k - 1, nrhs, -1.0, AP, strideAP, offsetAP + ( ( kc + 1 ) * strideAP ), B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) );
					dger( N - k - 1, nrhs, -1.0, AP, strideAP, offsetAP + ( ( kc + N - k + 1 ) * strideAP ), B, sb2, offsetB + ( k * sb1 ), B, sb1, sb2, offsetB + ( ( k + 1 ) * sb1 ) );
				}

				// Solve 2x2 system
				// Fortran: AKM1K = AP(KC+1), AKM1 = AP(KC)/AKM1K, AK = AP(KC+N-K+1)/AKM1K
				akm1k = AP[ offsetAP + ( kc * strideAP ) ];
				akm1 = AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] / akm1k;
				ak = AP[ offsetAP + ( ( kc + N - k ) * strideAP ) ] / akm1k;
				denom = ( akm1 * ak ) - 1.0;
				for ( j = 0; j < nrhs; j++ ) {
					bkm1 = B[ offsetB + ( ( k - 1 ) * sb1 ) + ( j * sb2 ) ] / akm1k;
					bk = B[ offsetB + ( k * sb1 ) + ( j * sb2 ) ] / akm1k;
					B[ offsetB + ( ( k - 1 ) * sb1 ) + ( j * sb2 ) ] = ( ( ak * bkm1 ) - bk ) / denom;
					B[ offsetB + ( k * sb1 ) + ( j * sb2 ) ] = ( ( akm1 * bk ) - bkm1 ) / denom;
				}
				kc += ( 2 * ( N - k ) ) + 1;
				k += 2;
			}
		}

		// Next solve L^T * X = B, overwriting B with X.
		// K decreases from N to 1 (1-based).
		k = N;
		kc = ( ( N * ( N + 1 ) / 2 ) | 0 ) + 1;
		while ( k >= 1 ) {
			kc -= N - k + 1;
			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 pivot

				// Apply multiplier: B(k,:) -= AP(kc+1:kc+N-k)^T * B(k+1:N,:)
				if ( k < N ) {
					dgemv( 'transpose', N - k, nrhs, -1.0, B, sb1, sb2, offsetB + ( k * sb1 ), AP, strideAP, offsetAP + ( kc * strideAP ), 1.0, B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
				}

				// Interchange rows K and IPIV[K-1]
				kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				k -= 1;
			} else {
				// 2x2 pivot

				if ( k < N ) {
					dgemv( 'transpose', N - k, nrhs, -1.0, B, sb1, sb2, offsetB + ( k * sb1 ), AP, strideAP, offsetAP + ( kc * strideAP ), 1.0, B, sb2, offsetB + ( ( k - 1 ) * sb1 ) );
					dgemv( 'transpose', N - k, nrhs, -1.0, B, sb1, sb2, offsetB + ( k * sb1 ), AP, strideAP, offsetAP + ( ( kc - ( N - k ) - 1 ) * strideAP ), 1.0, B, sb2, offsetB + ( ( k - 2 ) * sb1 ) );
				}

				// Interchange rows K and ~IPIV[K-1]
				kp = ~IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
				if ( kp !== k - 1 ) {
					dswap( nrhs, B, sb2, offsetB + ( ( k - 1 ) * sb1 ), B, sb2, offsetB + ( kp * sb1 ) );
				}
				kc -= N - k + 2;
				k -= 2;
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dsptrs;
