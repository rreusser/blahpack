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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import zgemm from './../../../../blas/base/zgemm/lib/base.js';
import ztrmm from './../../../../blas/base/ztrmm/lib/base.js';
import zsyswapr from './../../../../lapack/base/zsyswapr/lib/base.js';
import ztrtri from './../../../../lapack/base/ztrtri/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var CONE = new Complex128( 1.0, 0.0 );
var CZERO = new Complex128( 0.0, 0.0 );


// FUNCTIONS //

/**
* Inlined complex multiply: (aR,aI) * (bR,bI).
*
* @private
* @param {Array<number>} out - 2-element out [re, im]
* @param {number} aR - real part of a
* @param {number} aI - imag part of a
* @param {number} bR - real part of b
* @param {number} bI - imag part of b
*/
function cmul( out, aR, aI, bR, bI ) {
	out[ 0 ] = ( aR * bR ) - ( aI * bI );
	out[ 1 ] = ( aR * bI ) + ( aI * bR );
}


// MAIN //

/**
* Computes the inverse of a complex symmetric indefinite matrix `A` using the factorization `A = P*U*D*U^T*P^T` or `A = P*L*D*L^T*P^T` produced by `zsytrf_rk` (rook, bounded Bunch-Kaufman). This is the worker routine called by `zsytri_3`.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`, must match the factorization
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {Complex128Array} A - input/output matrix; on entry, the factored form from `zsytrf_rk`; on exit, the inverse stored in symmetric form
* @param {integer} strideA1 - first-dimension stride of `A` (in complex elements)
* @param {integer} strideA2 - second-dimension stride of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} e - super- or sub-diagonal of the block diagonal matrix `D`
* @param {integer} strideE - stride length for `e` (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for `e` (in complex elements)
* @param {Int32Array} IPIV - pivot indices from `zsytrf_rk`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} WORK - workspace of logical dimension `(N+nb+1) x (nb+3)` stored column-major
* @param {integer} strideWork - stride length for `WORK` (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (in complex elements)
* @param {PositiveInteger} nb - block size
* @returns {integer} status code (`0` = success; `> 0` = the `(k,k)` element of `D` is exactly zero so the inverse cannot be computed)
*/
function zsytri3x( uplo, N, A, strideA1, strideA2, offsetA, e, strideE, offsetE, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork, nb ) {
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
	var Ev;
	var ia;
	var iw;
	var i;
	var j;
	var k;

	tmp = [ 0.0, 0.0 ];
	ibuf = [ 0.0, 0.0 ];

	info = 0;
	if ( N === 0 ) {
		return info;
	}
	upper = ( uplo === 'upper' );

	Av = reinterpret( A, 0 );
	Wv = reinterpret( WORK, 0 );
	Ev = reinterpret( e, 0 );

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

	u11 = N - 1;
	invd = nb + 1;

	if ( upper ) {
		ztrtri( 'upper', 'unit', N, A, strideA1, strideA2, offsetA );

		// Build inv(D).
		k = 0;
		while ( k < N ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				// WORK(k,invd) = 1 / A(k,k) (complex division).
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( Wv, iw, [ 1.0, 0.0 ], 0, Av, ia );
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// T = WORK(k+1,1) (complex).
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF );
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

				// AKKP1 = WORK(k+1,1) / T = 1 (since both equal T). But Fortran re-computes anyway.
				akkp1R = 1.0;
				akkp1I = 0.0;

				// D = T * (AK*AKP1 - 1).
				cmul( tmp, akR, akI, akp1R, akp1I );
				cmul( tmp, tR, tI, tmp[ 0 ] - 1.0, tmp[ 1 ] );
				dR = tmp[ 0 ];
				dI = tmp[ 1 ];

				// WORK(k,invd) = AKP1 / D.
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akp1R, akp1I ], 0, [ dR, dI ], 0 );

				// WORK(k+1,invd+1) = AK / D.
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ akR, akI ], 0, [ dR, dI ], 0 );

				// WORK(k,invd+1) = -AKKP1 / D.
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ -akkp1R, -akkp1I ], 0, [ dR, dI ], 0 );

				// WORK(k+1,invd) = WORK(k,invd+1).
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cr = Wv[ iw ];
				ci = Wv[ iw + 1 ];
				iw = ( offsetWork * 2 ) + ( ( k + 1 ) * sWF ) + ( invd * ldwF );
				Wv[ iw ] = cr;
				Wv[ iw + 1 ] = ci;
				k += 1;
			}
			k += 1;
		}

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

			// U01 copy.
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// U11 unit upper triangular copy.
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
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						u01ijR = Wv[ iw ];
						u01ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
						u01ip1jR = Wv[ iw ];
						u01ip1jI = Wv[ iw + 1 ];

						// WORK[i,j] = invd00 * u01ij + invd01 * u01ip1j.
						cmul( tmp, invd00R, invd00I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u01ip1jR, u01ip1jI );
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						// WORK[i+1,j] = invd10 * u01ij + invd11 * u01ip1j.
						cmul( tmp, invd10R, invd10I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u01ip1jR, u01ip1jI );
						iw = ( offsetWork * 2 ) + ( ( i + 1 ) * sWF ) + ( j * ldwF );
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
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( invd * ldwF );
					invd10R = Wv[ iw ];
					invd10I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i + 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
					for ( j = i; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						u11ijR = Wv[ iw ];
						u11ijI = Wv[ iw + 1 ];
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						u11ip1jR = Wv[ iw ];
						u11ip1jI = Wv[ iw + 1 ];

						cmul( tmp, invd00R, invd00I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u11ip1jR, u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u11ip1jR, u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i + 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
					}
					i += 1;
				}
				i += 1;
			}

			// U11^T * invD1*U11 -> U11.
			ztrmm( 'left', 'upper', 'transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// Copy U11 result back into upper triangle.
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			// U01^T * invD * U01 -> WORK(U11+1, 1).
			zgemm( 'transpose', 'no-transpose', nnb, nnb, cut, CONE, A, strideA1, strideA2, offsetA + ( 0 * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork, CZERO, WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// A11 += U01^T*invD*U01 (upper triangle).
			for ( i = 0; i < nnb; i++ ) {
				for ( j = i; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] += Wv[ iw ];
					Av[ ia + 1 ] += Wv[ iw + 1 ];
				}
			}

			// U01 = U^-T * invD * U01.
			ztrmm( 'left', 'upper', 'transpose', 'unit', cut, nnb, CONE, A, strideA1, strideA2, offsetA, WORK, strideWork, ldwork * strideWork, offsetWork );

			// Copy U01 back.
			for ( i = 0; i < cut; i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					ia = ( offsetA * 2 ) + ( i * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}
		}

		// Apply permutations.
		for ( i = 0; i < N; i++ ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	} else {
		// LOWER.
		ztrtri( 'lower', 'unit', N, A, strideA1, strideA2, offsetA );

		k = N - 1;
		while ( k >= 0 ) {
			raw = IPIV[ offsetIPIV + ( k * strideIPIV ) ];
			if ( raw >= 0 ) {
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				ia = ( offsetA * 2 ) + ( k * sa1F ) + ( k * sa2F );
				cmplx.divAt( Wv, iw, [ 1.0, 0.0 ], 0, Av, ia );
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				Wv[ iw ] = 0.0;
				Wv[ iw + 1 ] = 0.0;
			} else {
				// T = WORK(k-1, 1).
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF );
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
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akp1R, akp1I ], 0, [ dR, dI ], 0 );

				// WORK(k,invd) = AK / D.
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( invd * ldwF );
				cmplx.divAt( Wv, iw, [ akR, akI ], 0, [ dR, dI ], 0 );

				// WORK(k,invd+1) = -AKKP1 / D.
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cmplx.divAt( Wv, iw, [ -akkp1R, -akkp1I ], 0, [ dR, dI ], 0 );

				// WORK(k-1,invd+1) = WORK(k,invd+1).
				iw = ( offsetWork * 2 ) + ( k * sWF ) + ( ( invd + 1 ) * ldwF );
				cr = Wv[ iw ];
				ci = Wv[ iw + 1 ];
				iw = ( offsetWork * 2 ) + ( ( k - 1 ) * sWF ) + ( ( invd + 1 ) * ldwF );
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

			// L21 copy.
			for ( i = 0; i < ( N - cut - nnb ); i++ ) {
				for ( j = 0; j < nnb; j++ ) {
					iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
					ia = ( offsetA * 2 ) + ( ( cut + nnb + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					Wv[ iw ] = Av[ ia ];
					Wv[ iw + 1 ] = Av[ ia + 1 ];
				}
			}

			// L11 copy.
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
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + nnb + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
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

						cmul( tmp, invd00R, invd00I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u01ip1jR, u01ip1jI );
						iw = ( offsetWork * 2 ) + ( i * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u01ijR, u01ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u01ip1jR, u01ip1jI );
						iw = ( offsetWork * 2 ) + ( ( i - 1 ) * sWF ) + ( j * ldwF );
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
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					for ( j = 0; j < nnb; j++ ) {
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						cmul( tmp, invd00R, invd00I, Wv[ iw ], Wv[ iw + 1 ] );
						Wv[ iw ] = tmp[ 0 ];
						Wv[ iw + 1 ] = tmp[ 1 ];
					}
				} else {
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( invd * ldwF );
					invd00R = Wv[ iw ];
					invd00I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i ) * sWF ) + ( ( invd + 1 ) * ldwF );
					invd01R = Wv[ iw ];
					invd01I = Wv[ iw + 1 ];
					iw = ( offsetWork * 2 ) + ( ( cut + i - 1 ) * sWF ) + ( invd * ldwF );
					invd11R = Wv[ iw ];
					invd11I = Wv[ iw + 1 ];
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

						cmul( tmp, invd00R, invd00I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd01R, invd01I, u11ip1jR, u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];

						cmul( tmp, invd10R, invd10I, u11ijR, u11ijI );
						cr = tmp[ 0 ];
						ci = tmp[ 1 ];
						cmul( tmp, invd11R, invd11I, u11ip1jR, u11ip1jI );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i - 1 ) * sWF ) + ( j * ldwF );
						Wv[ iw ] = cr + tmp[ 0 ];
						Wv[ iw + 1 ] = ci + tmp[ 1 ];
					}
					i -= 1;
				}
				i -= 1;
			}

			// L11^T * invD1*L11 -> L11.
			ztrmm( 'left', 'lower', 'transpose', 'unit', nnb, nnb, CONE, A, strideA1, strideA2, offsetA + ( cut * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

			// Write L11 back.
			for ( i = 0; i < nnb; i++ ) {
				for ( j = 0; j <= i; j++ ) {
					ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
					iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
					Av[ ia ] = Wv[ iw ];
					Av[ ia + 1 ] = Wv[ iw + 1 ];
				}
			}

			if ( ( cut + nnb ) < N ) {
				zgemm( 'transpose', 'no-transpose', nnb, nnb, N - nnb - cut, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( cut * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork, CZERO, WORK, strideWork, ldwork * strideWork, offsetWork + ( ( u11 + 1 ) * strideWork ) );

				for ( i = 0; i < nnb; i++ ) {
					for ( j = 0; j <= i; j++ ) {
						ia = ( offsetA * 2 ) + ( ( cut + i ) * sa1F ) + ( ( cut + j ) * sa2F );
						iw = ( offsetWork * 2 ) + ( ( u11 + 1 + i ) * sWF ) + ( j * ldwF );
						Av[ ia ] += Wv[ iw ];
						Av[ ia + 1 ] += Wv[ iw + 1 ];
					}
				}

				ztrmm( 'left', 'lower', 'transpose', 'unit', N - nnb - cut, nnb, CONE, A, strideA1, strideA2, offsetA + ( ( cut + nnb ) * strideA1 ) + ( ( cut + nnb ) * strideA2 ), WORK, strideWork, ldwork * strideWork, offsetWork );

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

		for ( i = N - 1; i >= 0; i-- ) {
			raw = IPIV[ offsetIPIV + ( i * strideIPIV ) ];
			ip = ( raw >= 0 ) ? raw : ~raw;
			if ( ip !== i ) {
				if ( i < ip ) {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, i, ip );
				} else {
					zsyswapr( uplo, N, A, strideA1, strideA2, offsetA, ip, i );
				}
			}
		}
	}

	return info;
}


// EXPORTS //

export default zsytri3x;
