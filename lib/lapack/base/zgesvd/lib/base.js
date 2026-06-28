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

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import zbdsqr from '../../zbdsqr/lib/base.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zungbr from '../../zungbr/lib/base.js';


// VARIABLES //

var CZERO = new Complex128( 0.0, 0.0 );


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A.
* optionally computing the left and/or right singular vectors.
*
* The SVD is written: `A = U*SIGMA*conjugate-transpose(V)`
*
* where SIGMA is an M-by-N matrix which is zero except for its min(M,N) diagonal
* elements, U is an M-by-M unitary matrix, and V is an N-by-N unitary matrix.
* The diagonal elements of SIGMA are the singular values of A; they are real and
* non-negative, and are returned in descending order. The first min(M,N) columns
* of U and V are the left and right singular vectors of A.
*
* @private
* @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {string} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix (column-major)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} s - output array of real singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Complex128Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U (in complex elements)
* @param {integer} strideU2 - stride of the second dimension of U (in complex elements)
* @param {NonNegativeInteger} offsetU - starting index for U (in complex elements)
* @param {Complex128Array} VT - output matrix for right singular vectors
* @param {integer} strideVT1 - stride of the first dimension of VT (in complex elements)
* @param {integer} strideVT2 - stride of the second dimension of VT (in complex elements)
* @param {NonNegativeInteger} offsetVT - starting index for VT (in complex elements)
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWork - stride for WORK (in complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (in complex elements)
* @param {integer} lwork - length of WORK array (in complex elements)
* @param {Float64Array} RWORK - real workspace array (length >= 5*min(M,N))
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if ZBDSQR did not converge
*/
function zgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	var wntuas;
	var wntvas;
	var bignum;
	var smlnum;
	var irwork;
	var wntua;
	var wntus;
	var wntuo;
	var wntun;
	var wntva;
	var wntvs;
	var wntvo;
	var minmn;
	var itauq;
	var itaup;
	var iwork;
	var anrm;
	var iscl;
	var info;
	var ncvt;
	var nrvt;
	var itau;
	var svt1;
	var svt2;
	var eps;
	var ncu;
	var nru;
	var sa1;
	var sa2;
	var su1;
	var su2;
	var wsz;
	var ie;
	var WK;

	// Compute stride variables for Float64 indexing (complex element strides * 2)
	sa1 = strideA1;
	sa2 = strideA2;
	su1 = strideU1;
	su2 = strideU2;
	svt1 = strideVT1;
	svt2 = strideVT2;

	minmn = Math.min( M, N );

	// Decode job flags
	wntua = ( jobu === 'all-columns' );
	wntus = ( jobu === 'economy' );
	wntuo = ( jobu === 'overwrite' );
	wntun = ( jobu === 'none' );
	wntva = ( jobvt === 'all-rows' );
	wntvs = ( jobvt === 'economy' );
	wntvo = ( jobvt === 'overwrite' );
	wntuas = wntua || wntus;
	wntvas = wntva || wntvs;

	info = 0;

	// Quick return
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	wsz = Math.max( 1, (3 * minmn) + Math.max( M, N ) + (minmn * Math.max( M, N )) );
	if ( lwork >= wsz ) {
		WK = WORK;
	} else {
		WK = new Complex128Array( wsz );
	}

	// Compute machine parameters
	eps = dlamch( 'precision' );
	smlnum = Math.sqrt( dlamch( 'safe-minimum' ) ) / eps;
	bignum = 1.0 / smlnum;

	// Scale A if max element outside range [smlnum, bignum]

	// zlange('max') does not use the WORK parameter, so pass a minimal dummy
	anrm = zlange( 'max', M, N, A, sa1, sa2, offsetA, RWORK, strideRWork, offsetRWork );
	iscl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		iscl = 1;
		zlascl( 'general', 0, 0, anrm, smlnum, M, N, A, sa1, sa2, offsetA );
	} else if ( anrm > bignum ) {
		iscl = 1;
		zlascl( 'general', 0, 0, anrm, bignum, M, N, A, sa1, sa2, offsetA );
	}

	if ( M >= N ) {
		// A has at least as many rows as columns (M >= N)

		if ( wntun && M >= 2 * N ) {
			// Path 1 (M much larger than N, JOBU='N')
			// No left singular vectors to be computed.
			// First QR-factorize the tall M×N matrix, then bidiagonalize the
			// Small N×N upper-triangular R. This reduces work by ~40% when M >> N.

			itau = 0;             // TAU from QR in WK at itau
			iwork = itau + N;     // WORK start in WK at iwork

			// Compute A = Q * R
			zgeqrf(M, N, A, sa1, sa2, offsetA, WK, 1, itau, WK, 1, iwork);

			// Zero out below R (the lower triangle of A(1:N, 0:N))
			if ( N > 1 ) {
				// A(2,1) in Fortran → offsetA + 1*sa1 + 0*sa2 in 0-based
				zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
			}

			ie = 0;            // E in RWORK at offsetRWork + ie
			itauq = 0;         // TAUQ in WK at itauq
			itaup = itauq + N; // TAUP in WK at itaup
			iwork = itaup + N; // WORK start in WK at iwork

			// Bidiagonalize R in A (N×N upper triangle)
			zgebrd(N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork);

			ncvt = 0;
			if ( wntvo || wntvas ) {
				// If right singular vectors desired, generate P^H in A
				zungbr('apply-P', N, N, N, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
				ncvt = N;
			}
			irwork = ie + N;

			// Perform bidiagonal QR iteration, computing right singular

			// Vectors of A in A if desired (NRU=0: no left vectors)
			info = zbdsqr('upper', N, ncvt, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA,  // U dummy (NRU=0)
				A, sa1, sa2, offsetA,  // C dummy (NCC=0)
				RWORK, strideRWork, offsetRWork + irwork);

			// If right singular vectors desired in VT, copy them there
			if ( wntvas ) {
				zlacpy( 'full', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
			}
		} else {
			// Path 10: direct bidiagonal reduction (M >= N, but M not much larger)

			ie = 0;           // E in RWORK at offsetRWork + ie
			itauq = 0;        // TAUQ in WK at itauq
			itaup = itauq + N; // TAUP in WK at itaup
			iwork = itaup + N; // WORK start in WK at iwork

			// Bidiagonalize A (reduce to upper bidiagonal)
			zgebrd(M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork);

			if ( wntuas ) {
				// Copy lower triangle of A to U, then generate Q
				zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				ncu = ( wntus ) ? N : M;
				zungbr('apply-Q', M, ncu, N, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
			}
			if ( wntvas ) {
				// Copy upper triangle of A to VT, then generate P^H
				zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				zungbr('apply-P', N, N, N, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
			}
			if ( wntuo ) {
				// Generate Q in A
				zungbr('apply-Q', M, N, N, A, sa1, sa2, offsetA, WK, 1, itauq, WK, 1, iwork );
			}
			if ( wntvo ) {
				// Generate P^H in A
				zungbr('apply-P', N, N, N, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
			}
			irwork = ie + N;

			// Determine dimensions for ZBDSQR
			nru = 0;
			ncvt = 0;
			if ( wntuas || wntuo ) {
				nru = M;
			}
			if ( wntvas || wntvo ) {
				ncvt = N;
			}

			// Perform bidiagonal SVD
			if ( ( !wntuo ) && ( !wntvo ) ) {
				// Neither U nor VT overwrite A
				info = zbdsqr('upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, A, sa1, sa2, offsetA,  // C dummy (NCC=0)
					RWORK, strideRWork, offsetRWork + irwork);
			} else if ( ( !wntuo ) && wntvo ) {
				// VT overwrites A
				info = zbdsqr('upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, A, sa1, sa2, offsetA, // C dummy (NCC=0)
					RWORK, strideRWork, offsetRWork + irwork);
			} else {
				// U overwrites A, or both overwrite A
				info = zbdsqr('upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA, // C dummy (NCC=0)
					RWORK, strideRWork, offsetRWork + irwork);
			}
		}
	} else {
		// M < N: A has more columns than rows
		// Direct bidiagonal reduction path

		ie = 0;           // E in RWORK
		itauq = 0;        // TAUQ in WK
		itaup = itauq + M; // TAUP in WK
		iwork = itaup + M; // WORK start in WK

		// Bidiagonalize A (reduce to lower bidiagonal when M < N)
		zgebrd(M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, WK, 1, itauq, WK, 1, itaup, WK, 1, iwork, wsz - iwork);

		if ( wntuas ) {
			// Copy lower triangle of A to U, then generate Q
			zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
			zungbr('apply-Q', M, M, N, U, su1, su2, offsetU, WK, 1, itauq, WK, 1, iwork );
		}
		if ( wntvas ) {
			// Copy upper triangle of A to VT, then generate P^H
			zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
			nrvt = ( wntva ) ? N : M;
			zungbr('apply-P', nrvt, N, M, VT, svt1, svt2, offsetVT, WK, 1, itaup, WK, 1, iwork );
		}
		if ( wntuo ) {
			// Generate Q in A
			zungbr('apply-Q', M, M, N, A, sa1, sa2, offsetA, WK, 1, itauq, WK, 1, iwork );
		}
		if ( wntvo ) {
			// Generate P^H in A
			zungbr('apply-P', M, N, M, A, sa1, sa2, offsetA, WK, 1, itaup, WK, 1, iwork );
		}
		irwork = ie + M;

		// Determine dimensions for ZBDSQR
		nru = 0;
		ncvt = 0;
		if ( wntuas || wntuo ) {
			nru = M;
		}
		if ( wntvas || wntvo ) {
			ncvt = N;
		}

		// Perform bidiagonal SVD (lower bidiagonal when M < N)
		if ( ( !wntuo ) && ( !wntvo ) ) {
			info = zbdsqr('lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, A, sa1, sa2, offsetA, RWORK, strideRWork, offsetRWork + irwork);
		} else if ( ( !wntuo ) && wntvo ) {
			info = zbdsqr('lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, A, sa1, sa2, offsetA, RWORK, strideRWork, offsetRWork + irwork);
		} else {
			info = zbdsqr('lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, A, sa1, sa2, offsetA, RWORK, strideRWork, offsetRWork + irwork);
		}
	}

	// Undo scaling if necessary
	if ( iscl === 1 ) {
		if ( anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, s, strideS, 1, offsetS );
		}
		if ( info !== 0 && anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn - 1, 1, RWORK, strideRWork, 1, offsetRWork + ie );
		}
		if ( anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, s, strideS, 1, offsetS );
		}
		if ( info !== 0 && anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn - 1, 1, RWORK, strideRWork, 1, offsetRWork + ie );
		}
	}

	return info;
}


// EXPORTS //

export default zgesvd;
