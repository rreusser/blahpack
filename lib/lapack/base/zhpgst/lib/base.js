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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import zaxpy from '../../../../blas/base/zaxpy/lib/base.js';
import zdscal from '../../../../blas/base/zdscal/lib/base.js';
import zdotc from '../../../../blas/base/zdotc/lib/base.js';
import zhpmv from '../../../../blas/base/zhpmv/lib/base.js';
import zhpr2 from '../../../../blas/base/zhpr2/lib/base.js';
import ztpmv from '../../../../blas/base/ztpmv/lib/base.js';
import ztpsv from '../../../../blas/base/ztpsv/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// MAIN //

/**
* Reduces a complex Hermitian-definite generalized eigenproblem to standard form, using packed storage.
*
* If `itype = 1`, the problem is `A*x = lambda*B*x`,
* and A is overwritten by `inv(U**H)*A*inv(U)` or `inv(L)*A*inv(L**H)`.
*
* If `itype = 2` or `3`, the problem is `A*B*x = lambda*x` or `B*A*x = lambda*x`,
* and A is overwritten by `U*A*U**H` or `L**H*A*L`.
*
* B must have been previously factorized as `U**H*U` or `L*L**H` by `zpptrf`.
*
* @private
* @param {integer} itype - problem type (1, 2, or 3)
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} AP - input/output Hermitian matrix in packed storage
* @param {integer} strideAP - stride length for `AP` (in complex elements)
* @param {NonNegativeInteger} offsetAP - starting index for `AP` (in complex elements)
* @param {Complex128Array} BP - triangular factor from Cholesky factorization of B in packed storage
* @param {integer} strideBP - stride length for `BP` (in complex elements)
* @param {NonNegativeInteger} offsetBP - starting index for `BP` (in complex elements)
* @returns {integer} info - 0 if successful
*/
function zhpgst( itype, uplo, N, AP, strideAP, offsetAP, BP, strideBP, offsetBP ) {
	var upper;
	var k1k1;
	var j1j1;
	var ajj;
	var akk;
	var bjj;
	var bkk;
	var APv;
	var BPv;
	var sap;
	var sbp;
	var oap;
	var obp;
	var ct;
	var jj;
	var kk;
	var j1;
	var k1;
	var j;
	var k;

	if ( N === 0 ) {
		return 0;
	}

	upper = ( uplo === 'upper' );

	// Reinterpret Complex128Arrays as Float64Arrays for direct element access:
	APv = reinterpret( AP, 0 );
	BPv = reinterpret( BP, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets:
	sap = strideAP * 2;
	sbp = strideBP * 2;
	oap = offsetAP * 2;
	obp = offsetBP * 2;

	if ( itype === 1 ) {
		if ( upper ) {
			// Compute inv(U**H)*A*inv(U)
			// jj is 0-based complex-element index of A(j,j) in packed upper storage
			jj = 0;
			for ( j = 1; j <= N; j++ ) {
				j1 = jj;       // 0-based complex index of A(1,j)
				jj += j;       // after: jj-1 is 0-based complex index of A(j,j)

				// Ensure diagonal is real (Hermitian property):
				APv[ oap + ( ( jj - 1 ) * sap ) + 1 ] = 0.0;

				bjj = BPv[ obp + ( ( jj - 1 ) * sbp ) ];

				// ZTPSV( 'U', 'Conjugate transpose', 'Non-unit', j, BP, AP(J1), 1 )
				ztpsv( uplo, 'conjugate-transpose', 'non-unit', j, BP, strideBP, offsetBP, AP, strideAP, offsetAP + j1 );

				// ZHPMV( 'U', j-1, -CONE, AP, BP(J1), 1, CONE, AP(J1), 1 )
				if ( j - 1 > 0 ) {
					zhpmv( uplo, j - 1, CNONE, AP, strideAP, offsetAP, BP, strideBP, offsetBP + j1, CONE, AP, strideAP, offsetAP + j1 );
				}

				// ZDSCAL( j-1, 1/BJJ, AP(J1), 1 )
				if ( j - 1 > 0 ) {
					zdscal( j - 1, 1.0 / bjj, AP, strideAP, offsetAP + j1 );
				}

				// AP(JJ) = ( AP(JJ) - real(ZDOTC(j-1, AP(J1), 1, BP(J1), 1)) ) / BJJ
				APv[ oap + ( ( jj - 1 ) * sap ) ] = ( APv[ oap + ( ( jj - 1 ) * sap ) ] - ( ( j - 1 > 0 ) ? real( zdotc( j - 1, AP, strideAP, offsetAP + j1, BP, strideBP, offsetBP + j1 ) ) : 0.0 ) ) / bjj;
				APv[ oap + ( ( jj - 1 ) * sap ) + 1 ] = 0.0;
			}
		} else {
			// Compute inv(L)*A*inv(L**H)
			// kk is 0-based complex-element index of A(k,k) in packed lower storage
			kk = 0;
			for ( k = 1; k <= N; k++ ) {
				k1k1 = kk + N - k + 1; // 0-based complex index of A(k+1,k+1)

				akk = APv[ oap + ( kk * sap ) ];
				bkk = BPv[ obp + ( kk * sbp ) ];
				akk /= ( bkk * bkk );
				APv[ oap + ( kk * sap ) ] = akk;
				APv[ oap + ( kk * sap ) + 1 ] = 0.0;
				if ( k < N ) {
					// ZDSCAL( N-K, 1/BKK, AP(KK+1), 1 )
					zdscal( N - k, 1.0 / bkk, AP, strideAP, offsetAP + kk + 1 );

					ct = new Complex128( -0.5 * akk, 0.0 );

					// ZAXPY( N-K, CT, BP(KK+1), 1, AP(KK+1), 1 )
					zaxpy( N - k, ct, BP, strideBP, offsetBP + kk + 1, AP, strideAP, offsetAP + kk + 1 );

					// ZHPR2( 'L', N-K, -CONE, AP(KK+1), 1, BP(KK+1), 1, AP(K1K1) )
					zhpr2( uplo, N - k, CNONE, AP, strideAP, offsetAP + kk + 1, BP, strideBP, offsetBP + kk + 1, AP, strideAP, offsetAP + k1k1 );

					// ZAXPY( N-K, CT, BP(KK+1), 1, AP(KK+1), 1 )
					zaxpy( N - k, ct, BP, strideBP, offsetBP + kk + 1, AP, strideAP, offsetAP + kk + 1 );

					// ZTPSV( 'L', 'No transpose', 'Non-unit', N-K, BP(K1K1), AP(KK+1), 1 )
					ztpsv( uplo, 'no-transpose', 'non-unit', N - k, BP, strideBP, offsetBP + k1k1, AP, strideAP, offsetAP + kk + 1 );
				}
				kk = k1k1;
			}
		}
	} else if ( upper ) {
		// Compute U*A*U**H
		// kk is 0-based complex-element index of A(k,k) in packed upper storage
		kk = 0;
		for ( k = 1; k <= N; k++ ) {
			k1 = kk;          // 0-based complex index of A(1,k)
			kk += k;           // after: kk-1 is 0-based complex index of A(k,k)

			akk = APv[ oap + ( ( kk - 1 ) * sap ) ];
			bkk = BPv[ obp + ( ( kk - 1 ) * sbp ) ];

			// ZTPMV( 'U', 'No transpose', 'Non-unit', k-1, BP, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				ztpmv( uplo, 'no-transpose', 'non-unit', k - 1, BP, strideBP, offsetBP, AP, strideAP, offsetAP + k1 );
			}

			ct = new Complex128( 0.5 * akk, 0.0 );

			// ZAXPY( k-1, CT, BP(K1), 1, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				zaxpy( k - 1, ct, BP, strideBP, offsetBP + k1, AP, strideAP, offsetAP + k1 );
			}

			// ZHPR2( 'U', k-1, CONE, AP(K1), 1, BP(K1), 1, AP )
			if ( k - 1 > 0 ) {
				zhpr2( uplo, k - 1, CONE, AP, strideAP, offsetAP + k1, BP, strideBP, offsetBP + k1, AP, strideAP, offsetAP );
			}

			// ZAXPY( k-1, CT, BP(K1), 1, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				zaxpy( k - 1, ct, BP, strideBP, offsetBP + k1, AP, strideAP, offsetAP + k1 );
			}

			// ZDSCAL( k-1, BKK, AP(K1), 1 )
			if ( k - 1 > 0 ) {
				zdscal( k - 1, bkk, AP, strideAP, offsetAP + k1 );
			}

			// AP(KK) = AKK * BKK^2
			APv[ oap + ( ( kk - 1 ) * sap ) ] = akk * bkk * bkk;
			APv[ oap + ( ( kk - 1 ) * sap ) + 1 ] = 0.0;
		}
	} else {
		// Compute L**H*A*L
		// jj is 0-based complex-element index of A(j,j) in packed lower storage
		jj = 0;
		for ( j = 1; j <= N; j++ ) {
			j1j1 = jj + N - j + 1; // 0-based complex index of A(j+1,j+1)

			ajj = APv[ oap + ( jj * sap ) ];
			bjj = BPv[ obp + ( jj * sbp ) ];

			// AP(JJ) = AJJ*BJJ + ZDOTC( N-J, AP(JJ+1), 1, BP(JJ+1), 1 ) — full complex (ZTPMV uses it below)
			if ( N - j > 0 ) {
				ct = zdotc( N - j, AP, strideAP, offsetAP + jj + 1, BP, strideBP, offsetBP + jj + 1 );
				APv[ oap + ( jj * sap ) ] = ( ajj * bjj ) + real( ct );
				APv[ oap + ( jj * sap ) + 1 ] = imag( ct );
			} else {
				APv[ oap + ( jj * sap ) ] = ajj * bjj;
				APv[ oap + ( jj * sap ) + 1 ] = 0.0;
			}

			// ZDSCAL( N-J, BJJ, AP(JJ+1), 1 )
			if ( N - j > 0 ) {
				zdscal( N - j, bjj, AP, strideAP, offsetAP + jj + 1 );
			}

			// ZHPMV( 'L', N-J, CONE, AP(J1J1), BP(JJ+1), 1, CONE, AP(JJ+1), 1 )
			if ( N - j > 0 ) {
				zhpmv( uplo, N - j, CONE, AP, strideAP, offsetAP + j1j1, BP, strideBP, offsetBP + jj + 1, CONE, AP, strideAP, offsetAP + jj + 1 );
			}

			// ZTPMV( 'L', 'Conjugate transpose', 'Non-unit', N-J+1, BP(JJ), AP(JJ), 1 )
			ztpmv( uplo, 'conjugate-transpose', 'non-unit', N - j + 1, BP, strideBP, offsetBP + jj, AP, strideAP, offsetAP + jj );

			jj = j1j1;
		}
	}
	return 0;
}


// EXPORTS //

export default zhpgst;
