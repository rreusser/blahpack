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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines */

// MODULES //

import dgemm from './../../../../blas/base/dgemm/lib/base.js';
import dtrmm from './../../../../blas/base/dtrmm/lib/base.js';
import dsyswapr from './../../../../lapack/base/dsyswapr/lib/base.js';
import dtrtri from './../../../../lapack/base/dtrtri/lib/base.js';


// MAIN //

/**
* Computes the inverse of a real symmetric indefinite matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` produced by `dsytrf_rk` (rook, bounded Bunch-Kaufman). This is the worker routine called by `dsytri_3`.
*
* The diagonal block matrix `D` is stored such that `A[k,k]` holds diagonal entries while `e` holds the super- (UPLO='upper') or sub- (UPLO='lower') diagonal entries describing `2x2` pivot blocks. `IPIV` follows the Fortran-style convention: `IPIV[k] >= 0` denotes a `1x1` pivot block (row `k` was interchanged with row `IPIV[k]`), while `IPIV[k] < 0` denotes a `2x2` pivot block (swap target row is `~IPIV[k]`).
*
* The workspace `WORK` is logically a 2D array of dimension `(N+nb+1) x (nb+1)` stored column-major with leading dimension `N+nb+1`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Float64Array} A - input/output matrix; on entry, the factored form from `dsytrf_rk`; on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} e - super- or sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Int32Array} IPIV - pivot indices from `dsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} WORK - workspace of length `(N+nb+1)*(nb+1)`
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {PositiveInteger} nb - block size
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function dsytri3x( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, nb ) {
	var u01ip1j;
	var u11ip1j;
	var icount;
	var ldwork;
	var akkp1;
	var u01ij;
	var u11ij;
	var upper;
	var akp1;
	var info;
	var invd;
	var nnb;
	var raw;
	var u11;
	var cut;
	var ip;
	var ak;
	var i;
	var j;
	var k;
	var t;
	var d;

	info = 0;
	upper = ( uplo === 'upper' );

	// Quick return.
	if ( N === 0 ) {
		return info;
	}

	// Logical leading dimension of WORK (treated as 2D with shape (N+nb+1, nb+1), column-major).
	ldwork = N + nb + 1;

	// Helper offsets: WORK(i,j) = WORK[offsetWORK + (i-1)*strideWORK + (j-1)*ldwork*strideWORK].

	// We use 0-based throughout: WORK(i+1, j+1) -> WORK[offsetWORK + i*strideWORK + j*ldwork*strideWORK].

	// Copy E into WORK( :, 1 ).
	for ( k = 0; k < N; k++ ) {
		WORK[ offsetWORK + ( k * strideWORK ) ] = e[ offsetE + ( k * strideE ) ];
	}

	// Check that the diagonal matrix D is nonsingular. Scan from the start of the factorization order; return the first index (1-based) of a singular 1x1 diagonal block.
	if ( upper ) {
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 && A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] === 0.0 ) {
				return i + 1;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 && A[ offsetA + ( i * strideA1 ) + ( i * strideA2 ) ] === 0.0 ) {
				return i + 1;
			}
		}
	}

	// 0-based row index in WORK for the U11 block.
	u11 = N - 1;

	// 0-based column indices in WORK for the inverse-D block.
	invd = nb + 1;

	if ( upper ) {
		// Invert the upper triangle of A in place (treating A as unit triangular, since L*D*L^T factorization).
		dtrtri( 'upper', 'unit', N, A, strideA1, strideA2, offsetA );

		// inv(D) is built into WORK( :, invd .. invd+1 ).
		k = 0;
		while ( k < N ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot.
				WORK[ offsetWORK + ( k * strideWORK ) + ( invd * ldwork * strideWORK ) ] = 1.0 / A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ];
				WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = 0.0;
			} else {
				// 2x2 pivot: rows k, k+1; e[k+1] holds the off-diagonal entry of D.
				t = WORK[ offsetWORK + ( ( k + 1 ) * strideWORK ) ];
				ak = A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ] / t;
				akp1 = A[ offsetA + ( ( k + 1 ) * strideA1 ) + ( ( k + 1 ) * strideA2 ) ] / t;
				akkp1 = WORK[ offsetWORK + ( ( k + 1 ) * strideWORK ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				WORK[ offsetWORK + ( k * strideWORK ) + ( invd * ldwork * strideWORK ) ] = akp1 / d;
				WORK[ offsetWORK + ( ( k + 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = ak / d;
				WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = -akkp1 / d;
				WORK[ offsetWORK + ( ( k + 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ];
				k += 1;
			}
			k += 1;
		}

		// Compute inv(A) by blocks: outer loop over diagonal blocks of width NNB.
		cut = N;
		while ( cut > 0 ) {
			nnb = nb;
			if ( cut <= nnb ) {
				nnb = cut;
			} else {
				icount = 0;
				for ( i = ( cut - nnb ); i < cut; i++ ) {
					if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
						icount += 1;
					}
				}
				if ( ( icount % 2 ) === 1 ) {
					nnb += 1;
				}
			}

			cut -= nnb;

			// U01 block: copy A[0..cut-1, cut..cut+nnb-1] into WORK[0..cut-1, 0..nnb-1].
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = A[ offsetA + ( i * strideA1 ) + ( ( cut + j ) * strideA2 ) ];
				}
			}

			// U11 block: unit upper triangular copy of A[cut..cut+nnb-1, cut..cut+nnb-1] into WORK[u11+1..u11+nnb, 0..nnb-1] (0-based: rows u11+1..u11+nnb).
			for ( i = 0; i < nnb; i++ ) {
				WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( i * ldwork * strideWORK ) ] = 1.0;
				for ( j = 0; j < i; j++ ) {
					WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = 0.0;
				}
				for ( j = i + 1; j < nnb; j++ ) {
					WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ];
				}
			}

			// InvD * U01.
			i = 0;
			while ( i < cut ) {
				raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( raw >= 0 ) {
					for ( j = 0; j < nnb; j++ ) {
						WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( i * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				} else {
					for ( j = 0; j < nnb; j++ ) {
						u01ij = WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
						u01ip1j = WORK[ offsetWORK + ( ( i + 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( i * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u01ij ) + ( WORK[ offsetWORK + ( i * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u01ip1j );
						WORK[ offsetWORK + ( ( i + 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( i + 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u01ij ) + ( WORK[ offsetWORK + ( ( i + 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u01ip1j );
					}
					i += 1;
				}
				i += 1;
			}

			// invD1 * U11.
			i = 0;
			while ( i < nnb ) {
				raw = IPIV[ offsetIPIV + ( ( cut + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					for ( j = i; j < nnb; j++ ) {
						WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				} else {
					for ( j = i; j < nnb; j++ ) {
						u11ij = WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						u11ip1j = WORK[ offsetWORK + ( ( u11 + 1 + i + 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] ) + ( WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( ( u11 + 1 + i + 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ] );
						WORK[ offsetWORK + ( ( u11 + 1 + i + 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + i + 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u11ij ) + ( WORK[ offsetWORK + ( ( cut + i + 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u11ip1j );
					}
					i += 1;
				}
				i += 1;
			}

			// U11^T * invD1*U11 -> U11.
			dtrmm( 'left', 'upper', 'transpose', 'unit', nnb, nnb, 1.0, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Copy U11 result back into upper triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] = WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
				}
			}

			// U01^T * invD * U01 -> WORK( U11+1, 1 ).
			dgemm( 'transpose', 'no-transpose', nnb, nnb, cut, 1.0, A, strideA1, strideA2, offsetA + ( 0 * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, 0.0, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// A11 += U01^T*invD*U01 (upper triangle).
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] += WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
				}
			}

			// U01 = U^-T * invD * U01 = U^-T * WORK_{0..cut-1, 0..nnb-1}.
			dtrmm( 'left', 'upper', 'transpose', 'unit', cut, nnb, 1.0, A, strideA1, strideA2, offsetA, WORK, strideWORK, ldwork * strideWORK, offsetWORK );

			// Copy U01 result back into A[0..cut-1, cut..cut+nnb-1].
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					A[ offsetA + ( i * strideA1 ) + ( ( cut + j ) * strideA2 ) ] = WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
				}
			}
		}

		// Apply permutations P to inv(A): for I = 0..N-1.
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					dsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					dsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	} else {
		// LOWER.
		dtrtri( 'lower', 'unit', N, A, strideA1, strideA2, offsetA );

		// inv(D) into WORK columns invd, invd+1.
		k = N - 1;
		while ( k >= 0 ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				WORK[ offsetWORK + ( k * strideWORK ) + ( invd * ldwork * strideWORK ) ] = 1.0 / A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ];
				WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = 0.0;
			} else {
				// 2x2 pivot: rows k-1, k.
				t = WORK[ offsetWORK + ( ( k - 1 ) * strideWORK ) ];
				ak = A[ offsetA + ( ( k - 1 ) * strideA1 ) + ( ( k - 1 ) * strideA2 ) ] / t;
				akp1 = A[ offsetA + ( k * strideA1 ) + ( k * strideA2 ) ] / t;
				akkp1 = WORK[ offsetWORK + ( ( k - 1 ) * strideWORK ) ] / t;
				d = t * ( ( ak * akp1 ) - 1.0 );
				WORK[ offsetWORK + ( ( k - 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] = akp1 / d;
				WORK[ offsetWORK + ( k * strideWORK ) + ( invd * ldwork * strideWORK ) ] = ak / d;
				WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = -akkp1 / d;
				WORK[ offsetWORK + ( ( k - 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( k * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ];
				k -= 1;
			}
			k -= 1;
		}

		cut = 0;
		while ( cut < N ) {
			nnb = nb;
			if ( ( cut + nnb ) > N ) {
				nnb = N - cut;
			} else {
				icount = 0;
				for ( i = cut; i < cut + nnb; i++ ) {
					if ( IPIV[ offsetIPIV + ( i * strideIPIV ) ] < 0 ) {
						icount += 1;
					}
				}
				if ( ( icount % 2 ) === 1 ) {
					nnb += 1;
				}
			}

			// L21 block: copy A[cut+nnb..N-1, cut..cut+nnb-1] into WORK[0..N-cut-nnb-1, 0..nnb-1].
			for ( i = 0; i < ( N - cut - nnb ); i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = A[ offsetA + ( ( cut + nnb + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ];
				}
			}

			// L11 block: unit lower triangular copy of A[cut..cut+nnb-1, cut..cut+nnb-1] into WORK rows u11+1..u11+nnb.
			for ( i = 0; i < nnb; i++ ) {
				WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( i * ldwork * strideWORK ) ] = 1.0;
				for ( j = i + 1; j < nnb; j++ ) {
					WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = 0.0;
				}
				for ( j = 0; j < i; j++ ) {
					WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ];
				}
			}

			// InvD * L21.
			i = ( N - cut - nnb ) - 1;
			while ( i >= 0 ) {
				raw = IPIV[ offsetIPIV + ( ( cut + nnb + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					for ( j = 0; j < nnb; j++ ) {
						WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( ( cut + nnb + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				} else {
					for ( j = 0; j < nnb; j++ ) {
						u01ij = WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
						u01ip1j = WORK[ offsetWORK + ( ( i - 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + nnb + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u01ij ) + ( WORK[ offsetWORK + ( ( cut + nnb + i ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u01ip1j );
						WORK[ offsetWORK + ( ( i - 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + nnb + i - 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u01ij ) + ( WORK[ offsetWORK + ( ( cut + nnb + i - 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u01ip1j );
					}
					i -= 1;
				}
				i -= 1;
			}

			// invD1 * L11.
			i = nnb - 1;
			while ( i >= 0 ) {
				raw = IPIV[ offsetIPIV + ( ( cut + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					for ( j = 0; j < nnb; j++ ) {
						WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				} else {
					for ( j = 0; j < nnb; j++ ) {
						u11ij = WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						u11ip1j = WORK[ offsetWORK + ( ( u11 + 1 + i - 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
						WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ] ) + ( WORK[ offsetWORK + ( ( cut + i ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u11ip1j );
						WORK[ offsetWORK + ( ( u11 + 1 + i - 1 ) * strideWORK ) + ( j * ldwork * strideWORK ) ] = ( WORK[ offsetWORK + ( ( cut + i - 1 ) * strideWORK ) + ( ( invd + 1 ) * ldwork * strideWORK ) ] * u11ij ) + ( WORK[ offsetWORK + ( ( cut + i - 1 ) * strideWORK ) + ( invd * ldwork * strideWORK ) ] * u11ip1j );
					}
					i -= 1;
				}
				i -= 1;
			}

			// L11^T * invD1*L11 -> L11.
			dtrmm( 'left', 'lower', 'transpose', 'unit', nnb, nnb, 1.0, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Write L11 result back into lower triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = 0; j <= i; j++ ) {
					A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] = WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
				}
			}

			if ( ( cut + nnb ) < N ) {
				// L21^T * invD * L21 -> WORK( U11+1, 1 ).
				dgemm( 'transpose', 'no-transpose', nnb, nnb, N - nnb - cut, 1.0, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, 0.0, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

				// A11 += L21^T*invD*L21 (lower triangle).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] += WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				}

				// L21 = L^-T * invD * L21.
				dtrmm( 'left', 'lower', 'transpose', 'unit', N - nnb - cut, nnb, 1.0, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( ( cut + nnb ) * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK );

				// Copy L21 result back into A[cut+nnb..N-1, cut..cut+nnb-1].
				for ( i = 0; i < ( N - cut - nnb ); i++ ) {
					for ( j = 0; j < nnb; j++ ) {
						A[ offsetA + ( ( cut + nnb + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] = WORK[ offsetWORK + ( i * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				}
			} else {
				// Final block: just write L11 result into the lower triangle (already done above; mirrors Fortran else branch).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						A[ offsetA + ( ( cut + i ) * strideA1 ) + ( ( cut + j ) * strideA2 ) ] = WORK[ offsetWORK + ( ( u11 + 1 + i ) * strideWORK ) + ( j * ldwork * strideWORK ) ];
					}
				}
			}

			cut += nnb;
		}

		// Apply permutations P to inv(A): for I = N-1..0.
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					dsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					dsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default dsytri3x;
