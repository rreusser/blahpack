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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';
import zheswapr from './../../../../lapack/base/zheswapr/lib/base.js';
import ztrtri from './../../../../lapack/base/ztrtri/lib/base.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian indefinite matrix `A` using the factorization `A = P*U*D*U^H*P^T` or `A = P*L*D*L^H*P^T` produced by `zhetrf_rk` (rook, bounded Bunch-Kaufman). This is the worker routine called by `zhetri_3`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zhetrf_rk`; on exit, the inverse stored in Hermitian form
* @param {integer} strideA1 - first-dimension stride of `A` (in complex elements)
* @param {integer} strideA2 - second-dimension stride of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} e - super- or sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace of logical dimension `(N+nb+1) x (nb+3)` stored column-major with leading dimension `N+nb+1`
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {PositiveInteger} nb - block size
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function zhetri3x( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, nb ) {
	var u01ip1jR;
	var u01ip1jI;
	var u11ip1jR;
	var u11ip1jI;
	var invd00R;
	var invd01R;
	var invd01I;
	var invd10R;
	var invd10I;
	var invd11R;
	var akkp1R;
	var akkp1I;
	var u01ijR;
	var u01ijI;
	var u11ijR;
	var u11ijI;
	var ldwork;
	var icount;
	var upper;
	var ldwF;
	var sa1F;
	var sa2F;
	var akp1;
	var invd;
	var info;
	var sWF;
	var nnb;
	var raw;
	var u11;
	var cut;
	var cr;
	var ci;
	var dr;
	var ak;
	var ip;
	var Av;
	var Wv;
	var Ev;
	var ia;
	var iw;
	var i;
	var j;
	var k;
	var t;

	info = 0;
	if ( N === 0 ) {
		return info;
	}
	upper = ( uplo === 'upper' );

	// Float64 views (for direct indexed access).
	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );
	Ev = reinterpret( e, 0 );

	// Float64 stride conversions (complex → real pairs).
	sa1F = strideA1 * 2;
	sa2F = strideA2 * 2;
	sWF = strideWork * 2;

	ldwork = N + nb + 1;
	ldwF = ldwork * strideWork * 2;

	// Copy E into WORK(:, 1).
	for ( k = 0; k < N; k++ ) {
		iw = ( offsetWork * 2 ) + ( k * sWF );
		ia = ( offsetE * 2 ) + ( k * strideE * 2 );
		Wv[ iw ] = Ev[ ia ];
		Wv[ iw + 1 ] = Ev[ ia + 1 ];
	}

	// Check that the diagonal D is nonsingular.
	if ( upper ) {
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ia = ( offsetA * 2 ) + ( i * sa1F ) + ( i * sa2F );
			if ( raw >= 0 && Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
				return i + 1;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ia = ( offsetA * 2 ) + ( i * sa1F ) + ( i * sa2F );
			if ( raw >= 0 && Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
				return i + 1;
			}
		}
	}

	// 0-based row index in WORK for the U11 block.
	u11 = N - 1;

	// 0-based column indices in WORK for the inverse-D block.
	invd = nb + 1;

	if ( upper ) {
		// Invert the upper triangle of A in place (unit diagonal — L*D*L^H factorization).
		ztrtri( 'upper', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) into WORK( :, invd .. invd+1 ).
		k = 0;
		while ( k < N ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot: diagonal is real.
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				Wv[ iw ] = 1.0 / Av[ ia ];
				Wv[ iw + 1 ] = 0.0;
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// 2x2 pivot: rows k, k+1.
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF );
				t = Math.hypot( Wv[ iw ], Wv[ iw + 1 ] );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				ak = Av[ ia ] / t;
				ia = ( offsetA * 2 ) + ( ( k + 1 ) * sa1F ) + ( ( k + 1 ) * sa2F );
				akp1 = Av[ ia ] / t;
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF );
				akkp1R = Wv[ iw ] / t;
				akkp1I = Wv[ iw + 1 ] / t;

				// D = T*(AK*AKP1 - 1), all real.
				dr = t * ( ( ak * akp1 ) - 1.0 );

				// WORK(K,INVD) = AKP1/D (real).
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				Wv[ iw ] = akp1 / dr;
				Wv[ iw + 1 ] = 0.0;

				// WORK(K+1,INVD+1) = AK/D (real).
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = ak / dr;
				Wv[ iw + 1 ] = 0.0;

				// WORK(K,INVD+1) = -AKKP1/D (complex).
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = -akkp1R / dr;
				Wv[ iw + 1 ] = -akkp1I / dr;

				// WORK(K+1,INVD) = conj(WORK(K,INVD+1)).
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF ) + ( invd * ldwF );
				Wv[ iw ] = -akkp1R / dr;
				Wv[ iw + 1 ] = akkp1I / dr;
				k += 1;
			}
			k += 1;
		}

		// Outer block loop over diagonal blocks of width NNB.
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
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// U11 block: unit upper-triangular copy of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( i * ldwF );
				Wv[ iw ] = 1.0;
				Wv[ iw + 1 ] = 0.0;
				for ( j = 0; j < i; j++ ) {
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Wv[ iw ] = 0.0;
					Wv[ iw + 1 ] = 0.0;
				}
				for ( j = i + 1; j < nnb; j++ ) {
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// InvD * U01.
			i = 0;
			while ( i < cut ) {
				raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( raw >= 0 ) {
					// 1x1 pivot: diagonal inv is real (imag = 0).
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = invd00R * Wv[ iw ];
						Wv[ iw + 1 ] = invd00R * Wv[ iw + 1 ];
					}
				} else {
					// 2x2 pivot: load inv(D) block (diagonals real, off-diagonals complex conjugate pair).
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						u01ijR = Wv[ iw ];
						u01ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
						u01ip1jR = Wv[ iw ];
						u01ip1jI = Wv[ iw + 1 ];

						// WORK[i,j] = invd00*u01ij + invd01*u01ip1j.
						cr = ( invd00R * u01ijR ) + ( invd01R * u01ip1jR ) - ( invd01I * u01ip1jI );
						ci = ( invd00R * u01ijI ) + ( invd01R * u01ip1jI ) + ( invd01I * u01ip1jR );
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;

						// WORK[i+1,j] = invd10*u01ij + invd11*u01ip1j.
						cr = ( invd10R * u01ijR ) - ( invd10I * u01ijI ) + ( invd11R * u01ip1jR );
						ci = ( invd10R * u01ijI ) + ( invd10I * u01ijR ) + ( invd11R * u01ip1jI );
						iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;
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
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = invd00R * Wv[ iw ];
						Wv[ iw + 1 ] = invd00R * Wv[ iw + 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						u11ijR = Wv[ iw ];
						u11ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						u11ip1jR = Wv[ iw ];
						u11ip1jI = Wv[ iw + 1 ];

						cr = ( invd00R * u11ijR ) + ( invd01R * u11ip1jR ) - ( invd01I * u11ip1jI );
						ci = ( invd00R * u11ijI ) + ( invd01R * u11ip1jI ) + ( invd01I * u11ip1jR );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;

						cr = ( invd10R * u11ijR ) - ( invd10I * u11ijI ) + ( invd11R * u11ip1jR );
						ci = ( invd10R * u11ijI ) + ( invd10I * u11ijR ) + ( invd11R * u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;
					}
					i += 1;
				}
				i += 1;
			}

			// U11^H * invD1*U11 -> U11.
			ztrmm( 'left', 'upper', 'conjugate-transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// Copy U11 result back into upper triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			// U01^H * invD * U01 -> WORK(U11+1, 1).
			zgemm( 'conjugate-transpose', 'no-transpose', nnb, nnb, cut, CONE, A, strideA1, strideA2, offsetA + ( 0 * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork, CZERO, WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// A11 += U01^H*invD*U01 (upper triangle).
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] += Wv[ iw ];
					Av[ ia + 1 ] += Wv[ iw + 1 ];
				}
			}

			// U01 = U^-H * invD * U01.
			ztrmm( 'left', 'upper', 'conjugate-transpose', 'unit', cut, nnb, CONE, A, strideA1, strideA2, offsetA, WORK, strideWork, ldwork * strideWork, offsetWork );

			// Copy U01 result back into A[0..cut-1, cut..cut+nnb-1].
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}
		}

		// Apply permutations P to inv(A).
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	} else {
		// LOWER.
		ztrtri( 'lower', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) into WORK columns invd, invd+1.
		k = N - 1;
		while ( k >= 0 ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				Wv[ iw ] = 1.0 / Av[ ia ];
				Wv[ iw + 1 ] = 0.0;
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// 2x2 pivot: rows k-1, k.
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF );
				t = Math.hypot( Wv[ iw ], Wv[ iw + 1 ] );
				ia = ( offsetA * 2 ) + ( ( k - 1 ) * sa1F ) + ( ( k - 1 ) * sa2F );
				ak = Av[ ia ] / t;
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				akp1 = Av[ ia ] / t;
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF );
				akkp1R = Wv[ iw ] / t;
				akkp1I = Wv[ iw + 1 ] / t;
				dr = t * ( ( ak * akp1 ) - 1.0 );
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF ) + ( invd * ldwF );
				Wv[ iw ] = akp1 / dr;
				Wv[ iw + 1 ] = 0.0;
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				Wv[ iw ] = ak / dr;
				Wv[ iw + 1 ] = 0.0;
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = -akkp1R / dr;
				Wv[ iw + 1 ] = -akkp1I / dr;
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = -akkp1R / dr;
				Wv[ iw + 1 ] = akkp1I / dr;
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
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( ( cut + nnb + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// L11 block: unit lower triangular copy.
			for ( i = 0; i < nnb; i++ ) {
				iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( i * ldwF );
				Wv[ iw ] = 1.0;
				Wv[ iw + 1 ] = 0.0;
				for ( j = i + 1; j < nnb; j++ ) {
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Wv[ iw ] = 0.0;
					Wv[ iw + 1 ] = 0.0;
				}
				for ( j = 0; j < i; j++ ) {
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// InvD * L21.
			i = ( N - cut - nnb ) - 1;
			while ( i >= 0 ) {
				raw = IPIV[ offsetIPIV + ( ( cut + nnb + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = invd00R * Wv[ iw ];
						Wv[ iw + 1 ] = invd00R * Wv[ iw + 1 ];
					}
				} else {
					// 2x2: rows cut+nnb+i-1 (first) and cut+nnb+i (second).
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						u01ijR = Wv[ iw ];
						u01ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( i - 1 ) * sWF ) + ( j * ldwF );
						u01ip1jR = Wv[ iw ];
						u01ip1jI = Wv[ iw + 1 ];

						// WORK[i,j] = invd00*u01ij + invd01*u01ip1j.
						cr = ( invd00R * u01ijR ) + ( invd01R * u01ip1jR ) - ( invd01I * u01ip1jI );
						ci = ( invd00R * u01ijI ) + ( invd01R * u01ip1jI ) + ( invd01I * u01ip1jR );
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;

						// WORK[i-1,j] = invd10*u01ij + invd11*u01ip1j.
						cr = ( invd10R * u01ijR ) - ( invd10I * u01ijI ) + ( invd11R * u01ip1jR );
						ci = ( invd10R * u01ijI ) + ( invd10I * u01ijR ) + ( invd11R * u01ip1jI );
						iw = ( offsetWork * 2 ) + ( ( i - 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;
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
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = invd00R * Wv[ iw ];
						Wv[ iw + 1 ] = invd00R * Wv[ iw + 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					iw = ( offsetWork * 2 ) + ( ( cut + i - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						u11ijR = Wv[ iw ];
						u11ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i - 1 ) * sWF ) + ( j * ldwF );
						u11ip1jR = Wv[ iw ];
						u11ip1jI = Wv[ iw + 1 ];

						cr = ( invd00R * u11ijR ) + ( invd01R * u11ip1jR ) - ( invd01I * u11ip1jI );
						ci = ( invd00R * u11ijI ) + ( invd01R * u11ip1jI ) + ( invd01I * u11ip1jR );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;

						cr = ( invd10R * u11ijR ) - ( invd10I * u11ijI ) + ( invd11R * u11ip1jR );
						ci = ( invd10R * u11ijI ) + ( invd10I * u11ijR ) + ( invd11R * u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i - 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr;
						Wv[ iw + 1 ] = ci;
					}
					i -= 1;
				}
				i -= 1;
			}

			// L11^H * invD1*L11 -> L11.
			ztrmm( 'left', 'lower', 'conjugate-transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// Write L11 result back into lower triangle.
			for ( i = 0; i < nnb; i++ ) {
				for ( j = 0; j <= i; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			if ( ( cut + nnb ) < N ) {
				// L21^H * invD * L21 -> WORK(U11+1, 1).
				zgemm( 'conjugate-transpose', 'no-transpose', nnb, nnb, N - nnb - cut, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork, CZERO, WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

				// A11 += L21^H*invD*L21 (lower triangle).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Av[ ia ] += Wv[ iw ];
						Av[ ia + 1 ] += Wv[ iw + 1 ];
					}
				}

				// L21 = L^-H * invD * L21.
				ztrmm( 'left', 'lower', 'conjugate-transpose', 'unit', N - nnb - cut, nnb, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( ( cut + nnb ) * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork );

				// Copy L21 result back into A[cut+nnb..N-1, cut..cut+nnb-1].
				for ( i = 0; i < ( N - cut - nnb ); i++ ) {
					for ( j = 0; j < nnb; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + nnb + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Av[ ia ] = Wv[ iw ];
						Av[ ia + 1 ] = Wv[ iw + 1 ];
					}
				}
			} else {
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Av[ ia ] = Wv[ iw ];
						Av[ ia + 1 ] = Wv[ iw + 1 ];
					}
				}
			}

			cut += nnb;
		}

		// Apply permutations P to inv(A).
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default zhetri3x;
