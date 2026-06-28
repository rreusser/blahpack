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

/* eslint-disable max-len, max-params, max-depth, max-statements */

// MODULES //

import dcopy from '../../../../blas/base/dcopy/lib/base.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dspmv from '../../../../blas/base/dspmv/lib/base.js';
import dswap from '../../../../blas/base/dswap/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric matrix stored in packed format.
*
* The routine uses the factorization `A = U * D * U^T` or
* `A = L * D * L^T` computed by `dsptrf`.
*
* On entry, `AP` contains the block diagonal matrix D and the multipliers
* used to obtain the factor U (or L) as computed by `dsptrf`, stored in
* packed format. On exit, if `info === 0`, `AP` contains the upper (or
* lower) triangle of the inverse of A in packed storage.
*
* `IPIV` stores 0-based pivot indices from `dsptrf`. If `IPIV[k] >= 0`,
* a 1x1 pivot was used. If `IPIV[k] < 0` (for a 2x2 pivot), then
* `IPIV[k] = ~p` where `p` is the 0-based row/column that was
* interchanged.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} AP - packed symmetric matrix, length N*(N+1)/2
* @param {integer} strideAP - stride length for `AP`
* @param {NonNegativeInteger} offsetAP - starting index for `AP`
* @param {Int32Array} IPIV - pivot index array from dsptrf, length N
* @param {integer} strideIPIV - stride for IPIV
* @param {NonNegativeInteger} offsetIPIV - index offset for IPIV
* @param {Float64Array} WORK - workspace array, length N
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - index offset for WORK
* @returns {integer} info - 0 if successful, k>0 if D(k,k) is zero (1-based)
*/
function dsptri( uplo, N, AP, strideAP, offsetAP, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) { // eslint-disable-line max-len
	var kcnext;
	var kstep;
	var akkp1;
	var temp;
	var info;
	var akp1;
	var kpc;
	var npp;
	var ak;
	var kp;
	var kx;
	var kc;
	var d;
	var t;
	var k;
	var j;

	info = 0;

	if ( N === 0 ) {
		return 0;
	}

	// Check that the diagonal of D is non-zero (singularity check)...
	if ( uplo === 'upper' ) {
		kp = ( ( N * ( N + 1 ) / 2 )|0 );
		for ( info = N; info >= 1; info-- ) {
			// IPIV[info-1] >= 0 means 1x1 pivot (Fortran: IPIV(INFO) > 0)
			if ( IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ] >= 0 && AP[ offsetAP + ( ( kp - 1 ) * strideAP ) ] === 0.0 ) {
				return info;
			}
			kp -= info;
		}
	} else {
		kp = 1;
		for ( info = 1; info <= N; info++ ) {
			if ( IPIV[ offsetIPIV + ( ( info - 1 ) * strideIPIV ) ] >= 0 && AP[ offsetAP + ( ( kp - 1 ) * strideAP ) ] === 0.0 ) {
				return info;
			}
			kp += N - info + 1;
		}
	}
	info = 0;

	if ( uplo === 'upper' ) {
		// Compute inv(A) from the factorization A = U*D*U**T.
		// K is the main loop index, increasing from 1 to N in steps of 1 or 2
		// (depending on the size of the diagonal blocks).

		k = 1;
		kc = 1;

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			if ( k > N ) {
				break;
			}

			kcnext = kc + k;

			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 diagonal block: invert the diagonal block
				AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] = 1.0 / AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ];

				// Form column k of the inverse
				if ( k > 1 ) {
					dcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, k - 1, -1.0, AP, strideAP, offsetAP, WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
				}
				kstep = 1;
			} else {
				// 2x2 diagonal block: invert the diagonal block
				t = Math.abs( AP[ offsetAP + ( ( kcnext + k - 2 ) * strideAP ) ] );
				ak = AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] / t;
				akp1 = AP[ offsetAP + ( ( kcnext + k - 1 ) * strideAP ) ] / t;
				akkp1 = AP[ offsetAP + ( ( kcnext + k - 2 ) * strideAP ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] = akp1 / d;
				AP[ offsetAP + ( ( kcnext + k - 1 ) * strideAP ) ] = ak / d;
				AP[ offsetAP + ( ( kcnext + k - 2 ) * strideAP ) ] = -akkp1 / d;

				// Form columns k and k+1 of the inverse
				if ( k > 1 ) {
					dcopy( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, k - 1, -1.0, AP, strideAP, offsetAP, WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ) );
					AP[ offsetAP + ( ( kcnext + k - 2 ) * strideAP ) ] -= ddot( k - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					dcopy( k - 1, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, k - 1, -1.0, AP, strideAP, offsetAP, WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
					AP[ offsetAP + ( ( kcnext + k - 1 ) * strideAP ) ] -= ddot( k - 1, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( ( kcnext - 1 ) * strideAP ) );
				}
				kstep = 2;
				kcnext += k + 1;
			}

			// Convert 0-based IPIV to 1-based kp for pivot application
			kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( kp < 0 ) {
				kp = ~kp;
			}
			kp += 1; // Convert from 0-based to 1-based

			if ( kp !== k ) {
				// Interchange rows and columns k and kp in the leading submatrix
				kpc = ( ( ( kp - 1 ) * kp / 2 )|0 ) + 1;
				dswap( kp - 1, AP, strideAP, offsetAP + ( ( kc - 1 ) * strideAP ), AP, strideAP, offsetAP + ( ( kpc - 1 ) * strideAP ) );
				kx = kpc + kp - 1;
				for ( j = kp + 1; j <= k - 1; j++ ) {
					kx += j - 1;
					temp = AP[ offsetAP + ( ( kc + j - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc + j - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ];
					AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] = temp;
				}
				temp = AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ];
				AP[ offsetAP + ( ( kc + k - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kpc + kp - 2 ) * strideAP ) ];
				AP[ offsetAP + ( ( kpc + kp - 2 ) * strideAP ) ] = temp;
				if ( kstep === 2 ) {
					temp = AP[ offsetAP + ( ( kc + k + k - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc + k + k - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kc + k + kp - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc + k + kp - 2 ) * strideAP ) ] = temp;
				}
			}

			k += kstep;
			kc = kcnext;
		}
	} else {
		// Compute inv(A) from the factorization A = L*D*L**T.
		// K is the main loop index, decreasing from N to 1 in steps of 1 or 2.

		npp = ( ( N * ( N + 1 ) / 2 )|0 );
		k = N;
		kc = npp;

		// eslint-disable-next-line no-constant-condition
		while ( true ) {
			if ( k < 1 ) {
				break;
			}

			kcnext = kc - ( N - k + 2 );

			if ( IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ] >= 0 ) {
				// 1x1 diagonal block: invert the diagonal block
				AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] = 1.0 / AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ];

				// Form column k of the inverse
				if ( k < N ) {
					dcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, N - k, -1.0, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( kc * strideAP ) );
					AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] -= ddot( N - k, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( kc * strideAP ) );
				}
				kstep = 1;
			} else {
				// 2x2 diagonal block: invert the diagonal block
				t = Math.abs( AP[ offsetAP + ( kcnext * strideAP ) ] );
				ak = AP[ offsetAP + ( ( kcnext - 1 ) * strideAP ) ] / t;
				akp1 = AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] / t;
				akkp1 = AP[ offsetAP + ( kcnext * strideAP ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				AP[ offsetAP + ( ( kcnext - 1 ) * strideAP ) ] = akp1 / d;
				AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] = ak / d;
				AP[ offsetAP + ( kcnext * strideAP ) ] = -akkp1 / d;

				// Form columns k-1 and k of the inverse
				if ( k < N ) {
					dcopy( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, N - k, -1.0, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( kc * strideAP ) );
					AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] -= ddot( N - k, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( kc * strideAP ) );
					AP[ offsetAP + ( kcnext * strideAP ) ] -= ddot( N - k, AP, strideAP, offsetAP + ( kc * strideAP ), AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					dcopy( N - k, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ), WORK, strideWork, offsetWork );
					dspmv( uplo, N - k, -1.0, AP, strideAP, offsetAP + ( ( kc + N - k ) * strideAP ), WORK, strideWork, offsetWork, 0.0, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
					AP[ offsetAP + ( ( kcnext - 1 ) * strideAP ) ] -= ddot( N - k, WORK, strideWork, offsetWork, AP, strideAP, offsetAP + ( ( kcnext + 1 ) * strideAP ) );
				}
				kstep = 2;
				kcnext -= ( N - k + 3 );
			}

			// Convert 0-based IPIV to 1-based kp for pivot application
			kp = IPIV[ offsetIPIV + ( ( k - 1 ) * strideIPIV ) ];
			if ( kp < 0 ) {
				kp = ~kp;
			}
			kp += 1; // Convert from 0-based to 1-based

			if ( kp !== k ) {
				// Interchange rows and columns k and kp in the trailing submatrix
				kpc = npp - ( ( ( N - kp + 1 ) * ( N - kp + 2 ) / 2 )|0 ) + 1;
				if ( kp < N ) {
					dswap( N - kp, AP, strideAP, offsetAP + ( ( kc + kp - k ) * strideAP ), AP, strideAP, offsetAP + ( kpc * strideAP ) );
				}
				kx = kc + kp - k;
				for ( j = k + 1; j <= kp - 1; j++ ) {
					kx += N - j + 1;
					temp = AP[ offsetAP + ( ( kc + j - k - 1 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc + j - k - 1 ) * strideAP ) ] = AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ];
					AP[ offsetAP + ( ( kx - 1 ) * strideAP ) ] = temp;
				}
				temp = AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ];
				AP[ offsetAP + ( ( kc - 1 ) * strideAP ) ] = AP[ offsetAP + ( ( kpc - 1 ) * strideAP ) ];
				AP[ offsetAP + ( ( kpc - 1 ) * strideAP ) ] = temp;
				if ( kstep === 2 ) {
					temp = AP[ offsetAP + ( ( kc - N + k - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc - N + k - 2 ) * strideAP ) ] = AP[ offsetAP + ( ( kc - N + kp - 2 ) * strideAP ) ];
					AP[ offsetAP + ( ( kc - N + kp - 2 ) * strideAP ) ] = temp;
				}
			}

			k -= kstep;
			kc = kcnext;
		}
	}

	return info;
}


// EXPORTS //

export default dsptri;
