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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';
import zsyconv from './../../../../lapack/base/zsyconv/lib/base.js';
import zheswapr from './../../../../lapack/base/zheswapr/lib/base.js';
import ztrtri from './../../../../lapack/base/ztrtri/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the inverse of a complex Hermitian indefinite matrix `A` using the factorization `A = U*D*U**H` or `A = L*D*L**H` produced by `zhetrf` (classic Bunch-Kaufman). This is the blocked worker routine called by `zhetri2`.
*
* ## Notes
*
* -   The block-diagonal factor `D` and the triangular factor are stored in `A` using the classic Bunch-Kaufman packed layout: for a `1x1` pivot the diagonal entry of `D` sits on `A[k,k]` (real-valued), and for a `2x2` pivot the super-/sub-diagonal entry of `D` sits in the nominal `A[k-1,k]` (upper) or `A[k+1,k]` (lower) slot.
* -   `IPIV` follows the JS convention used by `zsyconv`: non-negative entries denote `1x1` pivot blocks and encode the interchange target as a `0`-based row index; negative entries denote `2x2` pivot blocks and encode the interchange target as `~IPIV[k]` (bitwise NOT).
* -   The workspace `WORK` is logically a 2D `Complex128Array` of shape `(N+nb+1) x (nb+3)` stored column-major with leading dimension `N+nb+1`. `zsyconv` writes the off-diagonal of `D` into the first column of `WORK`; subsequent columns hold the `U01/L21` copy block, the `U11/L11` block (starting at row `N`), and the two inverse-`D` columns at column offset `invd = nb+1`.
* -   Hermitian (vs. symmetric) routines force imaginary parts of `D` diagonals to zero, take complex conjugates on mirror reads, and use `'conjugate-transpose'` rather than `'transpose'` in BLAS-3 calls.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zhetrf`; on exit, the inverse stored as a Hermitian matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace of length `(N+nb+1)*(nb+3)` (in complex elements)
* @param {integer} strideWORK - row stride of `WORK` (in complex elements; typically `1`)
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK` (in complex elements)
* @param {PositiveInteger} nb - block size
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*
* @example
* var Complex128Array = require( '@stdlib/array/complex128' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var A = new Complex128Array( [ 4.0, 0.0 ] );
* var IPIV = new Int32Array( [ 0 ] );
* var WORK = new Complex128Array( ( 1 + 2 + 1 ) * ( 2 + 3 ) );
*
* var info = zhetri2x( 'lower', 1, A, 1, 1, 0, IPIV, 1, 0, WORK, 1, 0, 2 );
* // returns 0
*/
function zhetri2x( uplo, N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK, nb ) {
	var u01ip1jR;
	var u01ip1jI;
	var u11ip1jR;
	var u11ip1jI;
	var akkp1R;
	var akkp1I;
	var u01ijR;
	var u01ijI;
	var u11ijR;
	var u11ijI;
	var icount;
	var ldwork;
	var upper;
	var akp1;
	var info;
	var invd;
	var sa1;
	var sa2;
	var sw1;
	var sw2;
	var nnb;
	var raw;
	var u11;
	var cut;
	var oA;
	var oW;
	var Av;
	var Wv;
	var ip;
	var ak;
	var b1;
	var b2;
	var c1;
	var c2;
	var i;
	var j;
	var k;
	var t;
	var d;
	var p;
	var q;
	var r;

	info = 0;
	upper = ( uplo === 'upper' );

	// Quick return.
	if ( N === 0 ) {
		return info;
	}

	// Float64 views and doubled strides/offsets for direct element access.
	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;
	sw1 = strideWORK * 2;
	oW = offsetWORK * 2;

	// Convert A: extract off-diagonal of D into WORK(:,0) and apply permutations to the triangular factor.
	zsyconv( uplo, 'convert', N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWORK, offsetWORK );

	// Check that the diagonal matrix D is nonsingular. Fortran returns the first singular 1x1 index (1-based).
	if ( upper ) {
		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			p = oA + ( i * sa1 ) + ( i * sa2 );
			if ( raw >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return i + 1;
			}
		}
	} else {
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			p = oA + ( i * sa1 ) + ( i * sa2 );
			if ( raw >= 0 && Av[ p ] === 0.0 && Av[ p + 1 ] === 0.0 ) {
				return i + 1;
			}
		}
	}

	// Logical leading dimension of WORK (treated as 2D with shape (N+nb+1, nb+3), column-major in complex elements).
	ldwork = N + nb + 1;

	// Column stride of WORK in complex elements (== ldwork * strideWORK for tight column-major).
	sw2 = ldwork * sw1;

	// 0-based row offset in WORK where the U11 block begins. In Fortran U11 = N (1-based, so U11+1..U11+NNB are rows N+1..N+NNB). In JS we represent this as u11 such that row index u11+1 corresponds to Fortran row U11+1; we use u11 = N - 1 so that u11 + 1 + i (0-based) walks rows N..N+NNB-1.
	u11 = N - 1;

	// 0-based column offset in WORK for the inverse-D block (Fortran INVD = NB+2 1-based -> NB+1 0-based).
	invd = nb + 1;

	if ( upper ) {
		// InvA = P * inv(U**H)*inv(D)*inv(U)*P**H. Invert the upper triangle of A in place (unit diagonal).
		ztrtri( 'upper', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) and inv(D)*inv(U) into WORK columns invd, invd+1. The diagonal of D is real-valued in the Hermitian case.
		k = 0;
		while ( k < N ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot: WORK(k, invd) = 1 / real(A(k,k)); WORK(k, invd+1) = 0.
				p = oA + ( k * sa1 ) + ( k * sa2 );
				q = oW + ( k * sw1 ) + ( invd * sw2 );
				Wv[ q ] = 1.0 / Av[ p ];
				Wv[ q + 1 ] = 0.0;
				q = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = 0.0;
				Wv[ q + 1 ] = 0.0;
			} else {
				// 2x2 pivot: off-diagonal of D is in WORK(k+1, 0) (complex).
				p = oW + ( ( k + 1 ) * sw1 );
				t = cmplx.absAt( Wv, p ); // T = |WORK(k+1,0)|

				// ak = real(A(k,k)) / t  (diagonal real, T real)
				p = oA + ( k * sa1 ) + ( k * sa2 );
				ak = Av[ p ] / t;

				// akp1 = real(A(k+1,k+1)) / t
				p = oA + ( ( k + 1 ) * sa1 ) + ( ( k + 1 ) * sa2 );
				akp1 = Av[ p ] / t;

				// akkp1 = WORK(k+1, 0) / t (complex / real)
				p = oW + ( ( k + 1 ) * sw1 );
				akkp1R = Wv[ p ] / t;
				akkp1I = Wv[ p + 1 ] / t;

				// d = t * (ak * akp1 - 1) (real)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// WORK(k, invd) = akp1 / d (real)
				q = oW + ( k * sw1 ) + ( invd * sw2 );
				Wv[ q ] = akp1 / d;
				Wv[ q + 1 ] = 0.0;

				// WORK(k+1, invd+1) = ak / d (real)
				q = oW + ( ( k + 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = ak / d;
				Wv[ q + 1 ] = 0.0;

				// WORK(k, invd+1) = -akkp1 / d (complex)
				q = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = -akkp1R / d;
				Wv[ q + 1 ] = -akkp1I / d;

				// WORK(k+1, invd) = conj(WORK(k, invd+1)) (Hermitian)
				p = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				q = oW + ( ( k + 1 ) * sw1 ) + ( invd * sw2 );
				Wv[ q ] = Wv[ p ];
				Wv[ q + 1 ] = -Wv[ p + 1 ];

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
					p = oA + ( i * sa1 ) + ( ( cut + j ) * sa2 );
					q = oW + ( i * sw1 ) + ( j * sw2 );
					Wv[ q ] = Av[ p ];
					Wv[ q + 1 ] = Av[ p + 1 ];
				}
			}

			// U11 block: unit upper triangular copy of A[cut..cut+nnb-1, cut..cut+nnb-1] into WORK rows u11+1..u11+nnb.
			for ( i = 0; i < nnb; i++ ) {
				q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( i * sw2 );
				Wv[ q ] = 1.0;
				Wv[ q + 1 ] = 0.0;
				for ( j = 0; j < i; j++ ) {
					q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					Wv[ q ] = 0.0;
					Wv[ q + 1 ] = 0.0;
				}
				for ( j = i + 1; j < nnb; j++ ) {
					p = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					Wv[ q ] = Av[ p ];
					Wv[ q + 1 ] = Av[ p + 1 ];
				}
			}

			// InvD * U01.
			i = 0;
			while ( i < cut ) {
				raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
				if ( raw >= 0 ) {
					// 1x1 pivot: WORK(i, j) = WORK(i, invd) * WORK(i, j) (complex multiply).
					p = oW + ( i * sw1 ) + ( invd * sw2 );
					b1 = Wv[ p ];
					b2 = Wv[ p + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						q = oW + ( i * sw1 ) + ( j * sw2 );
						r = Wv[ q ];
						c1 = ( b1 * r ) - ( b2 * Wv[ q + 1 ] );
						c2 = ( b1 * Wv[ q + 1 ] ) + ( b2 * r );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;
					}
				} else {
					// 2x2 pivot. WORK(i,j) = invd_ii * U01_ij + invd_ip1_i * U01_ip1_j; WORK(i+1,j) = invd_i_ip1 * U01_ij + invd_ip1_ip1 * U01_ip1_j.
					for ( j = 0; j < nnb; j++ ) {
						// u01ij = WORK(i,j); u01ip1j = WORK(i+1,j)
						q = oW + ( i * sw1 ) + ( j * sw2 );
						u01ijR = Wv[ q ];
						u01ijI = Wv[ q + 1 ];
						p = oW + ( ( i + 1 ) * sw1 ) + ( j * sw2 );
						u01ip1jR = Wv[ p ];
						u01ip1jI = Wv[ p + 1 ];

						// WORK(i,j) = WORK(i,invd)*u01ij + WORK(i,invd+1)*u01ip1j
						r = oW + ( i * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u01ijR ) - ( b2 * u01ijI );
						c2 = ( b1 * u01ijI ) + ( b2 * u01ijR );
						r = oW + ( i * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u01ip1jR ) - ( b2 * u01ip1jI );
						c2 += ( b1 * u01ip1jI ) + ( b2 * u01ip1jR );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;

						// WORK(i+1,j) = WORK(i+1,invd)*u01ij + WORK(i+1,invd+1)*u01ip1j
						r = oW + ( ( i + 1 ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u01ijR ) - ( b2 * u01ijI );
						c2 = ( b1 * u01ijI ) + ( b2 * u01ijR );
						r = oW + ( ( i + 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u01ip1jR ) - ( b2 * u01ip1jI );
						c2 += ( b1 * u01ip1jI ) + ( b2 * u01ip1jR );
						Wv[ p ] = c1;
						Wv[ p + 1 ] = c2;
					}
					i += 1;
				}
				i += 1;
			}

			// invD1 * U11. Indexed by cut+i in invd column. Fortran lines 320-337.
			i = 0;
			while ( i < nnb ) {
				raw = IPIV[ offsetIPIV + ( ( cut + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					// 1x1 pivot: WORK(u11+1+i, j) = WORK(cut+i, invd) * WORK(u11+1+i, j).
					p = oW + ( ( cut + i ) * sw1 ) + ( invd * sw2 );
					b1 = Wv[ p ];
					b2 = Wv[ p + 1 ];
					for ( j = i; j < nnb; j++ ) {
						q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						r = Wv[ q ];
						c1 = ( b1 * r ) - ( b2 * Wv[ q + 1 ] );
						c2 = ( b1 * Wv[ q + 1 ] ) + ( b2 * r );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;
					}
				} else {
					// 2x2 pivot. Mirrors Fortran lines 327-336.
					for ( j = i; j < nnb; j++ ) {
						q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						u11ijR = Wv[ q ];
						u11ijI = Wv[ q + 1 ];
						p = oW + ( ( u11 + 1 + i + 1 ) * sw1 ) + ( j * sw2 );
						u11ip1jR = Wv[ p ];
						u11ip1jI = Wv[ p + 1 ];

						// WORK(u11+1+i, j) = WORK(cut+i, invd) * WORK(u11+1+i, j) + WORK(cut+i, invd+1) * u11_ip1_j
						r = oW + ( ( cut + i ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u11ijR ) - ( b2 * u11ijI );
						c2 = ( b1 * u11ijI ) + ( b2 * u11ijR );
						r = oW + ( ( cut + i ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u11ip1jR ) - ( b2 * u11ip1jI );
						c2 += ( b1 * u11ip1jI ) + ( b2 * u11ip1jR );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;

						// WORK(u11+1+i+1, j) = WORK(cut+i+1, invd) * u11_i_j + WORK(cut+i+1, invd+1) * u11_ip1_j
						r = oW + ( ( cut + i + 1 ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u11ijR ) - ( b2 * u11ijI );
						c2 = ( b1 * u11ijI ) + ( b2 * u11ijR );
						r = oW + ( ( cut + i + 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u11ip1jR ) - ( b2 * u11ip1jI );
						c2 += ( b1 * u11ip1jI ) + ( b2 * u11ip1jR );
						Wv[ p ] = c1;
						Wv[ p + 1 ] = c2;
					}
					i += 1;
				}
				i += 1;
			}

			// U11**H * invD1*U11 -> U11. Fortran: ZTRMM('L','U','C','U', nnb, nnb, ONE, A(cut+1,cut+1), LDA, WORK(U11+1,1), N+NB+1).
			ztrmm( 'left', 'upper', 'conjugate-transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Copy U11 result back into upper triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					p = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					q = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					Av[ q ] = Wv[ p ];
					Av[ q + 1 ] = Wv[ p + 1 ];
				}
			}

			// U01**H * invD * U01 -> WORK(U11+1, 1). Fortran: ZGEMM('C','N',nnb,nnb,cut,ONE,A(1,cut+1),LDA,WORK,N+NB+1,ZERO,WORK(U11+1,1),N+NB+1).
			zgemm( 'conjugate-transpose', 'no-transpose', nnb, nnb, cut, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, CZERO, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// A11 += U01**H*invD*U01 (upper triangle).
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					p = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					q = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					Av[ q ] += Wv[ p ];
					Av[ q + 1 ] += Wv[ p + 1 ];
				}
			}

			// U01 = U00**-H * invD * U01. Fortran: ZTRMM('L', UPLO, 'C', 'U', cut, nnb, ONE, A, LDA, WORK, N+NB+1).
			ztrmm( 'left', uplo, 'conjugate-transpose', 'unit', cut, nnb, CONE, A, strideA1, strideA2, offsetA, WORK, strideWORK, ldwork * strideWORK, offsetWORK );

			// Copy U01 result back into A[0..cut-1, cut..cut+nnb-1].
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					p = oW + ( i * sw1 ) + ( j * sw2 );
					q = oA + ( i * sa1 ) + ( ( cut + j ) * sa2 );
					Av[ q ] = Wv[ p ];
					Av[ q + 1 ] = Wv[ p + 1 ];
				}
			}
		}

		// Apply permutations P and P**H: inv(A) = P * inv(U**H)*inv(D)*inv(U) * P**H.
		i = 0;
		while ( i < N ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				ip = raw;
				if ( i < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			} else {
				ip = ~raw;
				i += 1;
				if ( ( i - 1 ) < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i - 1, ip );
				} else if ( ( i - 1 ) > ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i - 1 );
				}
			}
			i += 1;
		}
	} else {
		// LOWER. Fortran calls ZTRTRI(UPLO,'U',...) but the 'U' is the DIAG arg meaning "unit triangular" — UPLO here is 'L'.
		ztrtri( 'lower', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D) into WORK columns invd, invd+1.
		k = N - 1;
		while ( k >= 0 ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// 1x1 pivot.
				p = oA + ( k * sa1 ) + ( k * sa2 );
				q = oW + ( k * sw1 ) + ( invd * sw2 );
				Wv[ q ] = 1.0 / Av[ p ];
				Wv[ q + 1 ] = 0.0;
				q = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = 0.0;
				Wv[ q + 1 ] = 0.0;
			} else {
				// 2x2 pivot: off-diagonal of D is in WORK(k-1, 0).
				p = oW + ( ( k - 1 ) * sw1 );
				t = cmplx.absAt( Wv, p );

				// ak = real(A(k-1, k-1)) / t
				p = oA + ( ( k - 1 ) * sa1 ) + ( ( k - 1 ) * sa2 );
				ak = Av[ p ] / t;

				// akp1 = real(A(k, k)) / t
				p = oA + ( k * sa1 ) + ( k * sa2 );
				akp1 = Av[ p ] / t;

				// akkp1 = WORK(k-1, 0) / t (complex)
				p = oW + ( ( k - 1 ) * sw1 );
				akkp1R = Wv[ p ] / t;
				akkp1I = Wv[ p + 1 ] / t;

				// d = t * (ak * akp1 - 1)
				d = t * ( ( ak * akp1 ) - 1.0 );

				// WORK(k-1, invd) = akp1 / d (real)
				q = oW + ( ( k - 1 ) * sw1 ) + ( invd * sw2 );
				Wv[ q ] = akp1 / d;
				Wv[ q + 1 ] = 0.0;

				// WORK(k, invd) = ak / d (real)
				q = oW + ( k * sw1 ) + ( invd * sw2 );
				Wv[ q ] = ak / d;
				Wv[ q + 1 ] = 0.0;

				// WORK(k, invd+1) = -akkp1 / d (complex)
				q = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = -akkp1R / d;
				Wv[ q + 1 ] = -akkp1I / d;

				// WORK(k-1, invd+1) = conj(WORK(k, invd+1)) (Hermitian)
				p = oW + ( k * sw1 ) + ( ( invd + 1 ) * sw2 );
				q = oW + ( ( k - 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
				Wv[ q ] = Wv[ p ];
				Wv[ q + 1 ] = -Wv[ p + 1 ];

				k -= 1;
			}
			k -= 1;
		}

		cut = 0;
		while ( cut < N ) {
			nnb = nb;
			if ( ( cut + nnb ) >= N ) {
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
					p = oA + ( ( cut + nnb + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					q = oW + ( i * sw1 ) + ( j * sw2 );
					Wv[ q ] = Av[ p ];
					Wv[ q + 1 ] = Av[ p + 1 ];
				}
			}

			// L11 block: unit lower triangular copy.
			for ( i = 0; i < nnb; i++ ) {
				q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( i * sw2 );
				Wv[ q ] = 1.0;
				Wv[ q + 1 ] = 0.0;
				for ( j = i + 1; j < nnb; j++ ) {
					q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					Wv[ q ] = 0.0;
					Wv[ q + 1 ] = 0.0;
				}
				for ( j = 0; j < i; j++ ) {
					p = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					Wv[ q ] = Av[ p ];
					Wv[ q + 1 ] = Av[ p + 1 ];
				}
			}

			// InvD * L21. Fortran lines 468-486.
			i = ( N - cut - nnb ) - 1;
			while ( i >= 0 ) {
				raw = IPIV[ offsetIPIV + ( ( cut + nnb + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					p = oW + ( ( cut + nnb + i ) * sw1 ) + ( invd * sw2 );
					b1 = Wv[ p ];
					b2 = Wv[ p + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						q = oW + ( i * sw1 ) + ( j * sw2 );
						r = Wv[ q ];
						c1 = ( b1 * r ) - ( b2 * Wv[ q + 1 ] );
						c2 = ( b1 * Wv[ q + 1 ] ) + ( b2 * r );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;
					}
				} else {
					// 2x2 pivot. Fortran lines 476-483:
					//   U01_I_J = WORK(I,J); U01_IP1_J = WORK(I-1,J)
					//   WORK(I,J)=WORK(CUT+NNB+I,INVD)*U01_I_J + WORK(CUT+NNB+I,INVD+1)*U01_IP1_J
					//   WORK(I-1,J)=WORK(CUT+NNB+I-1,INVD+1)*U01_I_J + WORK(CUT+NNB+I-1,INVD)*U01_IP1_J
					for ( j = 0; j < nnb; j++ ) {
						q = oW + ( i * sw1 ) + ( j * sw2 );
						u01ijR = Wv[ q ];
						u01ijI = Wv[ q + 1 ];
						p = oW + ( ( i - 1 ) * sw1 ) + ( j * sw2 );
						u01ip1jR = Wv[ p ];
						u01ip1jI = Wv[ p + 1 ];

						// WORK(i,j) = WORK(cut+nnb+i, invd)*u01ij + WORK(cut+nnb+i, invd+1)*u01ip1j
						r = oW + ( ( cut + nnb + i ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u01ijR ) - ( b2 * u01ijI );
						c2 = ( b1 * u01ijI ) + ( b2 * u01ijR );
						r = oW + ( ( cut + nnb + i ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u01ip1jR ) - ( b2 * u01ip1jI );
						c2 += ( b1 * u01ip1jI ) + ( b2 * u01ip1jR );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;

						// WORK(i-1,j) = WORK(cut+nnb+i-1, invd+1)*u01ij + WORK(cut+nnb+i-1, invd)*u01ip1j
						r = oW + ( ( cut + nnb + i - 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u01ijR ) - ( b2 * u01ijI );
						c2 = ( b1 * u01ijI ) + ( b2 * u01ijR );
						r = oW + ( ( cut + nnb + i - 1 ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u01ip1jR ) - ( b2 * u01ip1jI );
						c2 += ( b1 * u01ip1jI ) + ( b2 * u01ip1jR );
						Wv[ p ] = c1;
						Wv[ p + 1 ] = c2;
					}
					i -= 1;
				}
				i -= 1;
			}

			// invD1 * L11. Fortran lines 490-508.
			i = nnb - 1;
			while ( i >= 0 ) {
				raw = IPIV[ offsetIPIV + ( ( cut + i ) * strideIPIV ) ];
				if ( raw >= 0 ) {
					p = oW + ( ( cut + i ) * sw1 ) + ( invd * sw2 );
					b1 = Wv[ p ];
					b2 = Wv[ p + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						r = Wv[ q ];
						c1 = ( b1 * r ) - ( b2 * Wv[ q + 1 ] );
						c2 = ( b1 * Wv[ q + 1 ] ) + ( b2 * r );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;
					}
				} else {
					// 2x2 pivot. Fortran lines 498-505:
					//   U11_I_J = WORK(U11+I,J); U11_IP1_J = WORK(U11+I-1,J)
					//   WORK(U11+I,J)=WORK(CUT+I,INVD)*WORK(U11+I,J) + WORK(CUT+I,INVD+1)*U11_IP1_J
					//   WORK(U11+I-1,J)=WORK(CUT+I-1,INVD+1)*U11_I_J + WORK(CUT+I-1,INVD)*U11_IP1_J
					for ( j = 0; j < nnb; j++ ) {
						q = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						u11ijR = Wv[ q ];
						u11ijI = Wv[ q + 1 ];
						p = oW + ( ( u11 + 1 + i - 1 ) * sw1 ) + ( j * sw2 );
						u11ip1jR = Wv[ p ];
						u11ip1jI = Wv[ p + 1 ];

						// WORK(u11+1+i, j) = WORK(cut+i, invd) * WORK(u11+1+i, j) + WORK(cut+i, invd+1) * u11_ip1_j
						r = oW + ( ( cut + i ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u11ijR ) - ( b2 * u11ijI );
						c2 = ( b1 * u11ijI ) + ( b2 * u11ijR );
						r = oW + ( ( cut + i ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u11ip1jR ) - ( b2 * u11ip1jI );
						c2 += ( b1 * u11ip1jI ) + ( b2 * u11ip1jR );
						Wv[ q ] = c1;
						Wv[ q + 1 ] = c2;

						// WORK(u11+1+i-1, j) = WORK(cut+i-1, invd+1) * u11_i_j + WORK(cut+i-1, invd) * u11_ip1_j
						r = oW + ( ( cut + i - 1 ) * sw1 ) + ( ( invd + 1 ) * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 = ( b1 * u11ijR ) - ( b2 * u11ijI );
						c2 = ( b1 * u11ijI ) + ( b2 * u11ijR );
						r = oW + ( ( cut + i - 1 ) * sw1 ) + ( invd * sw2 );
						b1 = Wv[ r ];
						b2 = Wv[ r + 1 ];
						c1 += ( b1 * u11ip1jR ) - ( b2 * u11ip1jI );
						c2 += ( b1 * u11ip1jI ) + ( b2 * u11ip1jR );
						Wv[ p ] = c1;
						Wv[ p + 1 ] = c2;
					}
					i -= 1;
				}
				i -= 1;
			}

			// L11**H * invD1*L11 -> L11.
			ztrmm( 'left', uplo, 'conjugate-transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

			// Write L11 back into lower triangle of A[cut..cut+nnb-1, cut..cut+nnb-1].
			for ( i = 0; i < nnb; i++ ) {
				for ( j = 0; j <= i; j++ ) {
					p = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
					q = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
					Av[ q ] = Wv[ p ];
					Av[ q + 1 ] = Wv[ p + 1 ];
				}
			}

			if ( ( cut + nnb ) < N ) {
				// L21**H * invD2 * L21 -> WORK(U11+1, 1).
				zgemm( 'conjugate-transpose', 'no-transpose', nnb, nnb, N - nnb - cut, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( cut * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK, CZERO, WORK, strideWORK, ldwork * strideWORK, offsetWORK + ( ( u11 + 1 ) * strideWORK ) );

				// A11 += L21**H*invD*L21 (lower triangle).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						p = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						q = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
						Av[ q ] += Wv[ p ];
						Av[ q + 1 ] += Wv[ p + 1 ];
					}
				}

				// L21 = L22**-H * invD * L21.
				ztrmm( 'left', uplo, 'conjugate-transpose', 'unit', N - nnb - cut, nnb, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( ( cut + nnb ) * strideA2 ), WORK, strideWORK, ldwork * strideWORK, offsetWORK );

				// Copy L21 back into A[cut+nnb..N-1, cut..cut+nnb-1].
				for ( i = 0; i < ( N - cut - nnb ); i++ ) {
					for ( j = 0; j < nnb; j++ ) {
						p = oW + ( i * sw1 ) + ( j * sw2 );
						q = oA + ( ( cut + nnb + i ) * sa1 ) + ( ( cut + j ) * sa2 );
						Av[ q ] = Wv[ p ];
						Av[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			} else {
				// Final block: mirrors Fortran else branch (Fortran lines 548-557).
				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						p = oW + ( ( u11 + 1 + i ) * sw1 ) + ( j * sw2 );
						q = oA + ( ( cut + i ) * sa1 ) + ( ( cut + j ) * sa2 );
						Av[ q ] = Wv[ p ];
						Av[ q + 1 ] = Wv[ p + 1 ];
					}
				}
			}

			cut += nnb;
		}

		// Apply permutations P and P**H: inv(A) = P * inv(L**H)*inv(D)*inv(L) * P**H. Fortran lower path (lines 566-579).
		i = N - 1;
		while ( i >= 0 ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			if ( raw >= 0 ) {
				ip = raw;
				if ( i < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			} else {
				ip = ~raw;
				if ( i < ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else if ( i > ip ) {
					zheswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
				i -= 1;
			}
			i -= 1;
		}
	}

	return info;
}


// EXPORTS //

export default zhetri2x;
