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
import zsyconv from './../../../../lapack/base/zsyconv/lib/base.js';
import zsyswapr from './../../../../lapack/base/zsyswapr/lib/base.js';
import ztrtri from './../../../../lapack/base/ztrtri/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// FUNCTIONS //

/**
* Inlined complex multiply: `(aR,aI) * (bR,bI)`.
*
* @private
* @param {Array<number>} out - 2-element out `[re, im]`
* @param {number} aR - real part of `a`
* @param {number} aI - imaginary part of `a`
* @param {number} bR - real part of `b`
* @param {number} bI - imaginary part of `b`
*/
function cmul( out, aR, aI, bR, bI ) {
	out[ 0 ] = ( aR * bR ) - ( aI * bI );
	out[ 1 ] = ( aR * bI ) + ( aI * bR );
}


// MAIN //

/**
* Computes the inverse of a complex symmetric indefinite matrix `A` using the factorization `A = U*D*U^T` or `A = L*D*L^T` produced by `zsytrf` (classic Bunch-Kaufman). This is the worker routine called by `zsytri2`.
*
* The diagonal block matrix `D` and the triangular factor are stored in `A` using the classic Bunch-Kaufman packed layout: for a `1x1` pivot the diagonal entry of `D` sits on `A[k,k]`, and for a `2x2` pivot the super-/sub-diagonal entry of `D` sits in the nominal `A[k-1,k]` (upper) or `A[k+1,k]` (lower) slot. The routine internally invokes `zsyconv` to move that off-diagonal of `D` into the first column of `WORK` before constructing `inv(D)`. `IPIV` follows the JS convention used by `zsyconv`: non-negative entries denote `1x1` pivot blocks and encode the interchange target as a `0`-based row index; negative entries denote `2x2` pivot blocks and encode the interchange target as `~IPIV[k]` (bitwise NOT).
*
* The workspace `WORK` is logically a 2D array of shape `(N+nb+1) x (nb+3)` stored column-major with leading dimension `N+nb+1`. The first column holds the off-diagonal of `D` written by `zsyconv`; subsequent columns hold the `U01/L21` copy block, the `U11/L11` block (starting at `WORK` row `N`), and the two inverse-`D` columns at column offset `invd = nb+1`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zsytrf`; on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - first-dimension stride of `A` (in complex elements)
* @param {integer} strideA2 - second-dimension stride of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zsytrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace of logical dimension `(N+nb+1) x (nb+3)` stored column-major
* @param {integer} strideWORK - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @param {PositiveInteger} nb - block size
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function zsytri2x( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, nb ) {
	var u01ip1jR;
	var u01ip1jI;
	var u11ip1jR;
	var u11ip1jI;
	var invd00R;
	var invd00I;
	var invd01R;
	var invd01I;
	var invd10R;
	var invd10I;
	var invd11R;
	var invd11I;
	var akkp1R;
	var akkp1I;
	var u01ijR;
	var u01ijI;
	var u11ijR;
	var u11ijI;
	var ldwork;
	var icount;
	var akp1R;
	var akp1I;
	var upper;
	var ldwF;
	var sa1F;
	var sa2F;
	var invd;
	var info;
	var ibuf;
	var tmp;
	var sWF;
	var akR;
	var akI;
	var nnb;
	var raw;
	var u11;
	var cut;
	var cr;
	var ci;
	var tR;
	var tI;
	var dR;
	var dI;
	var ip;
	var Av;
	var Wv;
	var ia;
	var iw;
	var i;
	var j;
	var k;

	tmp = [ 0.0, 0.0 ];
	ibuf = [ 0.0, 0.0 ];

	info = 0;
	upper = ( uplo === 'upper' );

	// Quick return.
	if ( N === 0 ) {
		return info;
	}

	// Convert A: extract off-diagonal of D into WORK(:,0) and apply permutations to the triangular factor.
	zsyconv( uplo, 'convert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK );

	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );

	sa1F = strideA1 * 2;
	sa2F = strideA2 * 2;
	sWF = strideWORK * 2;

	ldwork = N + nb + 1;
	ldwF = ldwork * strideWORK * 2;

	// Check that the diagonal D is nonsingular. Fortran returns the first singular 1x1 index (1-based).
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

	// 0-based row offset in WORK where the U11 block begins (Fortran U11 = N, 1-based row N+1 -> 0-based row N = u11+1 with u11 = N-1).
	u11 = N - 1;

	// 0-based column offset in WORK for the inverse-D block (Fortran INVD = NB+2 1-based -> NB+1 0-based).
	invd = nb + 1;

	if ( upper ) {
		// Invert the upper triangle of A in place (unit diagonal).
		ztrtri( 'upper', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) into WORK columns invd, invd+1.
		k = 0;
		while ( k < N ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot: WORK(k,invd) = 1 / A(k,k).
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( Wv, iw, [ 1.0, 0.0 ], 0, Av, ia );
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// 2x2 pivot: T = WORK(k+1,0) (off-diagonal of D as set by zsyconv).
				iw = ( offsetWORK * 2 ) + ( ( k + 1 ) * sWF );
				tR = Wv[ iw ];
				tI = Wv[ iw + 1 ];

				// AK = A(k,k) / T.
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( ibuf, 0, Av, ia, [ tR, tI ], 0 );
				akR = ibuf[ 0 ];
				akI = ibuf[ 1 ];

				// AKP1 = A(k+1,k+1) / T.
				ia = ( offsetA * 2 ) + ( ( k + 1 ) * sa1F ) + ( ( k + 1 ) * sa2F );
				cmplx.divAt( ibuf, 0, Av, ia, [ tR, tI ], 0 );
				akp1R = ibuf[ 0 ];
				akp1I = ibuf[ 1 ];

				// AKKP1 = WORK(k+1,0) / T = T/T = 1.
				akkp1R = 1.0;
				akkp1I = 0.0;

				// D = T * (AK*AKP1 - 1).
				cmul( tmp, akR, akI, akp1R, akp1I );
				cmul( tmp, tR, tI, tmp[ 0 ] - 1.0, tmp[ 1 ] );
				dR = tmp[ 0 ];
				dI = tmp[ 1 ];

				// WORK(k,invd) = AKP1 / D.
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akp1R, akp1I ], 0, [ dR, dI ], 0 );

				// WORK(k+1,invd+1) = AK / D.
				iw = ( offsetWORK * 2 ) + ( ( k + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ akR, akI ], 0, [ dR, dI ], 0 );

				// WORK(k,invd+1) = -AKKP1 / D.
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ -akkp1R, -akkp1I ], 0, [ dR, dI ], 0 );

				// WORK(k+1,invd) = -AKKP1 / D (same as WORK(k,invd+1)).
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cr = Wv[ iw ];
				ci = Wv[ iw + 1 ];
				iw = ( offsetWORK * 2 ) + ( ( k + 1 ) * sWF ) + ( invd * ldwF );
				Wv[ iw ] = cr;
				Wv[ iw + 1 ] = ci;
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
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// U11 block: unit upper triangular copy of A[cut..cut+nnb-1, cut..cut+nnb-1] into WORK rows u11+1..u11+nnb.
			for ( i = 0; i < nnb; i++ ) {
				iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( i * ldwF );
				Wv[ iw ] = 1.0;
				Wv[ iw + 1 ] = 0.0;
				for ( j = 0; j < i; j++ ) {
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Wv[ iw ] = 0.0;
					Wv[ iw + 1 ] = 0.0;
				}
				for ( j = i + 1; j < nnb; j++ ) {
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
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
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						u01ijR = Wv[ iw ];
						u01ijI = Wv[ iw + 1 ];
						iw = ( offsetWORK * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
						u01ip1jR = Wv[ iw ];
						u01ip1jI = Wv[ iw + 1 ];

						// WORK[i,j] = invd00 * u01ij + invd01 * u01ip1j.
						cmul( tmp, invd00R, invd00I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u01ip1jR, u01ip1jI );
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						// WORK[i+1,j] = invd10 * u01ij + invd11 * u01ip1j.
						cmul( tmp, invd10R, invd10I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u01ip1jR, u01ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
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
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						u11ijR = Wv[ iw ];
						u11ijI = Wv[ iw + 1 ];
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						u11ip1jR = Wv[ iw ];
						u11ip1jI = Wv[ iw + 1 ];

						cmul( tmp, invd00R, invd00I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u11ip1jR, u11ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u11ip1jR, u11ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
					}
					i += 1;
				}
				i += 1;
			}

			// U11^T * invD1*U11 -> U11.
			ztrmm( 'left', 'upper', 'transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Copy U11 result back into upper triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			// U01^T * invD * U01 -> WORK(U11+1, 1).
			zgemm( 'transpose', 'no-transpose', nnb, nnb, cut, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, CZERO, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// A11 += U01^T*invD*U01 (upper triangle).
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] += Wv[ iw ];
					Av[ ia + 1 ] += Wv[ iw + 1 ];
				}
			}

			// U01 = U00^-T * invD * U01.
			ztrmm( 'left', 'upper', 'transpose', 'unit', cut, nnb, CONE, A, strideA1, strideA2, offsetA, WORK, strideWORK, ldwork * strideWORK, offsetWORK );

			// Copy U01 result back into A[0..cut-1, cut..cut+nnb-1].
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}
		}

		// Apply permutations P and P^T: inv(A) = P * inv(U^T)*inv(D)*inv(U) * P^T.
		i = 0;
		while ( i < N ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				ip = raw;
				if ( i < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			} else {
				ip = ~raw;
				i += 1;
				if ( ( i - 1 ) < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i - 1, ip );
				} else if ( ( i - 1 ) > ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i - 1 );
				}
			}
			i += 1;
		}
	} else {
		// LOWER.
		ztrtri( 'lower', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) into WORK columns invd, invd+1.
		k = N - 1;
		while ( k >= 0 ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( Wv, iw, [ 1.0, 0.0 ], 0, Av, ia );
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// 2x2 pivot: T = WORK(k-1, 0).
				iw = ( offsetWORK * 2 ) + ( ( k - 1 ) * sWF );
				tR = Wv[ iw ];
				tI = Wv[ iw + 1 ];
				ia = ( offsetA * 2 ) + ( ( k - 1 ) * sa1F ) + ( ( k - 1 ) * sa2F );
				cmplx.divAt( ibuf, 0, Av, ia, [ tR, tI ], 0 );
				akR = ibuf[ 0 ];
				akI = ibuf[ 1 ];
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( ibuf, 0, Av, ia, [ tR, tI ], 0 );
				akp1R = ibuf[ 0 ];
				akp1I = ibuf[ 1 ];
				akkp1R = 1.0;
				akkp1I = 0.0;
				cmul( tmp, akR, akI, akp1R, akp1I );
				cmul( tmp, tR, tI, tmp[ 0 ] - 1.0, tmp[ 1 ] );
				dR = tmp[ 0 ];
				dI = tmp[ 1 ];

				// WORK(k-1,invd) = AKP1 / D.
				iw = ( offsetWORK * 2 ) + ( ( k - 1 ) * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akp1R, akp1I ], 0, [ dR, dI ], 0 );

				// WORK(k,invd) = AK / D.
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akR, akI ], 0, [ dR, dI ], 0 );

				// WORK(k,invd+1) = -AKKP1 / D.
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ -akkp1R, -akkp1I ], 0, [ dR, dI ], 0 );

				// WORK(k-1,invd+1) = -AKKP1 / D (same as WORK(k,invd+1)).
				iw = ( offsetWORK * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cr = Wv[ iw ];
				ci = Wv[ iw + 1 ];
				iw = ( offsetWORK * 2 ) + ( ( k - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = cr;
				Wv[ iw + 1 ] = ci;
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

			// L21 block.
			for ( i = 0; i < ( N - cut - nnb ); i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( ( cut + nnb + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// L11 block: unit lower triangular copy.
			for ( i = 0; i < nnb; i++ ) {
				iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( i * ldwF );
				Wv[ iw ] = 1.0;
				Wv[ iw + 1 ] = 0.0;
				for ( j = i + 1; j < nnb; j++ ) {
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Wv[ iw ] = 0.0;
					Wv[ iw + 1 ] = 0.0;
				}
				for ( j = 0; j < i; j++ ) {
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
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
					iw = ( offsetWORK * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWORK * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + nnb + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + nnb + i - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						u01ijR = Wv[ iw ];
						u01ijI = Wv[ iw + 1 ];
						iw = ( offsetWORK * 2 ) + ( ( i - 1 ) * sWF ) + ( j * ldwF );
						u01ip1jR = Wv[ iw ];
						u01ip1jI = Wv[ iw + 1 ];

						cmul( tmp, invd00R, invd00I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u01ip1jR, u01ip1jI );
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u01ip1jR, u01ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( i - 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
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
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					iw = ( offsetWORK * 2 ) + ( ( cut + i - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						u11ijR = Wv[ iw ];
						u11ijI = Wv[ iw + 1 ];
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i - 1 ) * sWF ) + ( j * ldwF );
						u11ip1jR = Wv[ iw ];
						u11ip1jI = Wv[ iw + 1 ];

						cmul( tmp, invd00R, invd00I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u11ip1jR, u11ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u11ip1jR, u11ip1jI );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i - 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
					}
					i -= 1;
				}
				i -= 1;
			}

			// L11^T * invD1*L11 -> L11.
			ztrmm( 'left', 'lower', 'transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Write L11 back into lower triangle.
			for ( i = 0; i < nnb; i++ ) {
				for ( j = 0; j <= i; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			if ( ( cut + nnb ) < N ) {
				// L21^T * invD * L21 -> WORK(U11+1, 1).
				zgemm( 'transpose', 'no-transpose', nnb, nnb, N - nnb - cut, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, CZERO, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

				// A11 += L21^T*invD*L21 (lower triangle).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Av[ ia ] += Wv[ iw ];
						Av[ ia + 1 ] += Wv[ iw + 1 ];
					}
				}

				// L21 = L22^-T * invD * L21.
				ztrmm( 'left', 'lower', 'transpose', 'unit', N - nnb - cut, nnb, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( ( cut + nnb ) * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK );

				// Copy L21 back.
				for ( i = 0; i < ( N - cut - nnb ); i++ ) {
					for ( j = 0; j < nnb; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + nnb + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWORK * 2 ) + ( i * sWF ) + ( j * ldwF );
						Av[ ia ] = Wv[ iw ];
						Av[ ia + 1 ] = Wv[ iw + 1 ];
					}
				}
			} else {
				// Final block: mirrors Fortran else branch.
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWORK * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Av[ ia ] = Wv[ iw ];
						Av[ ia + 1 ] = Wv[ iw + 1 ];
					}
				}
			}

			cut += nnb;
		}

		// Apply permutations P and P^T (lower variant): mirrors the Fortran reverse traversal with 2x2 handling.
		i = N - 1;
		while ( i >= 0 ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				ip = raw;
				if ( i < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			} else {
				ip = ~raw;
				if ( i < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
				i -= 1;
			}
			i -= 1;
		}
	}

	return info;
}


// EXPORTS //

export default zsytri2x;
