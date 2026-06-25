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

/* eslint-disable max-len, max-params, max-statements, no-var */

// MODULES //

import dscal from '../../../../blas/base/dscal/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import idamax from '../../../../blas/base/idamax/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dgebal from '../../dgebal/lib/base.js';
import dgebak from '../../dgebak/lib/base.js';
import dgehrd from '../../dgehrd/lib/base.js';
import dorghr from '../../dorghr/lib/base.js';
import dhseqr from '../../dhseqr/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dtrevc3 from '../../dtrevc3/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Machine constants (hoisted to module scope)
var EPS = dlamch( 'precision' );
var SMLNUM_BASE = dlamch( 'safe-minimum' );
var BIGNUM_BASE = ONE / SMLNUM_BASE;
var SMLNUM = Math.sqrt( SMLNUM_BASE ) / EPS;
var BIGNUM = ONE / SMLNUM;

// Scratch arrays
var DLARTG_OUT = new Float64Array( 3 );


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors
* of a real N-by-N nonsymmetric matrix A.
*
* The right eigenvector v(j) of A satisfies A * v(j) = lambda(j) * v(j).
* The left eigenvector u(j) of A satisfies u(j)**H * A = lambda(j) * u(j)**H.
*
* The computed eigenvectors are normalized to have Euclidean norm equal to 1
* and largest component real.
*
* Workspace layout (mirrors the Fortran LAPACK convention):
*
* - `work[ offsetWork + 0 .. offsetWork + N - 1 ]`   — SCALE (dgebal output)
* - `work[ offsetWork + N .. offsetWork + 2N - 1 ]`   — TAU (dgehrd/dorghr)
* - `work[ offsetWork + 2N .. ]`                      — scratch (dgehrd/dorghr blocked path)
*
* After dorghr, IWRK is reset to ITAU (offset N), so the range
* `work[ offsetWork + N .. ]` is reused for dhseqr, dtrevc3, and
* eigenvector normalization scratch. This reuse is safe because TAU is
* no longer needed after dorghr completes.
*
* Minimum workspace sizes (consistent with Fortran LAPACK):
* - eigenvalues only (jobvl='no-vectors', jobvr='no-vectors'): `max(1, 3*N)`
* - with eigenvectors (either jobvl or jobvr is 'compute-vectors'): `max(1, 4*N)`
*
* @private
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - offset for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - offset for WI
* @param {Float64Array} VL - output: left eigenvectors (N x N), not referenced if jobvl=`'no-vectors'`
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N), not referenced if jobvr=`'no-vectors'`
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} work - caller-provided workspace (see size requirements above)
* @param {integer} strideWork - stride for work (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for work
* @returns {integer} info - 0 on success, >0 if QR failed (eigenvalues info+1:N have converged)
*/
function dgeev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, work, strideWork, offsetWork ) { // eslint-disable-line max-params
	var oScale;
	var oTau;
	var oScratch;
	var lworkScratch;
	var wantvl;
	var wantvr;
	var scalea;
	var cscale;
	var anrm;
	var info;
	var ilo;
	var ihi;
	var SCALE;
	var TAU;
	var SELECT;
	var side;
	var scl;
	var cs;
	var sn;
	var r;
	var bal;
	var nout;
	var k;
	var i;

	wantvl = ( jobvl === 'compute-vectors' );
	wantvr = ( jobvr === 'compute-vectors' );

	// Quick return
	if ( N === 0 ) {
		return 0;
	}

	// Handle N=1 case
	if ( N === 1 ) {
		WR[ offsetWR ] = A[ offsetA ];
		WI[ offsetWI ] = ZERO;
		if ( wantvl ) {
			VL[ offsetVL ] = ONE;
		}
		if ( wantvr ) {
			VR[ offsetVR ] = ONE;
		}
		return 0;
	}

	// Carve workspace sub-arrays from caller-provided `work` (mirrors Fortran layout):
	//   work[ offsetWork + 0 .. offsetWork + N - 1 ]   SCALE (dgebal output)
	//   work[ offsetWork + N .. offsetWork + 2N - 1 ]  TAU (dgehrd / dorghr)
	//   work[ offsetWork + 2N .. ]                     scratch for dgehrd blocked path
	// After dorghr completes, the TAU section is no longer needed, so dhseqr,
	// dtrevc3, and eigenvector normalization reuse work[ offsetWork + N .. ].
	oScale = offsetWork;
	oTau = offsetWork + N;
	oScratch = offsetWork + 2 * N;
	lworkScratch = work.length - oScratch;
	SCALE = work.subarray( oScale, oScale + N );
	TAU = work.subarray( oTau, oTau + N );
	SELECT = new Uint8Array( 1 ); // unused but required by dtrevc3

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = dlange( 'max', N, N, A, strideA1, strideA2, offsetA, work, 1, 0 );
	scalea = false;
	cscale = 0.0;
	if ( anrm > ZERO && anrm < SMLNUM ) {
		scalea = true;
		cscale = SMLNUM;
	} else if ( anrm > BIGNUM ) {
		scalea = true;
		cscale = BIGNUM;
	}
	if ( scalea ) {
		dlascl( 'general', 0, 0, anrm, cscale, N, N, A, strideA1, strideA2, offsetA );
	}

	// Balance the matrix (Workspace: need N)
	bal = dgebal( 'both', N, A, strideA1, strideA2, offsetA, work, 1, oScale );
	ilo = bal.ilo;
	ihi = bal.ihi;

	// Reduce to upper Hessenberg form (Workspace: blocked path needs
	// N*NB + NB*NB elements; scratch starts at oScratch with lworkScratch elements)
	dgehrd( N, ilo, ihi, A, strideA1, strideA2, offsetA, work, 1, oTau, work, 1, oScratch, lworkScratch );

	if ( wantvl ) {
		// Want left eigenvectors
		side = 'left';

		// Copy Householder vectors to VL
		dlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VL, strideVL1, strideVL2, offsetVL );

		// Generate orthogonal matrix in VL
		dorghr( N, ilo, ihi, VL, strideVL1, strideVL2, offsetVL, work, 1, oTau, work, 1, oScratch, lworkScratch );

		// After dorghr, TAU section is free; reuse work[oTau..] as scratch for dhseqr
		// (Fortran: IWRK = ITAU, LWORK - IWRK + 1 = total - N)
		info = dhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, work, 1, oTau );

		if ( wantvr ) {
			// Want both left and right eigenvectors
			side = 'both';
			// Copy Schur vectors to VR
			dlacpy( 'full', N, N, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
		}
	} else if ( wantvr ) {
		// Want right eigenvectors only
		side = 'right';

		// Copy Householder vectors to VR
		dlacpy( 'lower', N, N, A, strideA1, strideA2, offsetA, VR, strideVR1, strideVR2, offsetVR );

		// Generate orthogonal matrix in VR
		dorghr( N, ilo, ihi, VR, strideVR1, strideVR2, offsetVR, work, 1, oTau, work, 1, oScratch, lworkScratch );

		// After dorghr, TAU section is free; reuse work[oTau..] as scratch for dhseqr
		info = dhseqr( 'schur', 'update', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VR, strideVR1, strideVR2, offsetVR, work, 1, oTau );
	} else {
		// Compute eigenvalues only (Fortran: IWRK = ITAU, so scratch = work[oTau..])
		info = dhseqr( 'eigenvalues', 'none', N, ilo, ihi, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VR, strideVR1, strideVR2, offsetVR, work, 1, oTau );
	}

	// If DHSEQR failed, quit
	if ( info !== 0 ) {
		// Undo scaling if necessary before returning
		if ( scalea ) {
			dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WR, strideWR, 1, offsetWR + info * strideWR );
			dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WI, strideWI, 1, offsetWI + info * strideWI );
			if ( info > 0 ) {
				dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WR, strideWR, 1, offsetWR );
				dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WI, strideWI, 1, offsetWI );
			}
		}
		return info;
	}

	if ( wantvl || wantvr ) {
		// Compute eigenvectors from the Schur form.
		// Reuse work[oTau..] as scratch (mirrors Fortran: IWRK=ITAU, 3*N elements needed).
		nout = 0;
		dtrevc3( side, 'backtransform', SELECT, 1, 0, N, A, strideA1, strideA2, offsetA,
			VL, strideVL1, strideVL2, offsetVL,
			VR, strideVR1, strideVR2, offsetVR,
			N, nout, work, 1, oTau, work.length - oTau );
	}

	// Normalize left eigenvectors and make largest component real
	if ( wantvl ) {
		// Undo balancing of left eigenvectors
		dgebak( 'both', 'left', N, ilo, ihi, SCALE, 1, 0, N, VL, strideVL1, strideVL2, offsetVL );

		for ( i = 0; i < N; i++ ) {
			if ( WI[ offsetWI + i * strideWI ] === ZERO ) {
				// Real eigenvalue: normalize
				scl = ONE / dnrm2( N, VL, strideVL1, offsetVL + i * strideVL2 );
				dscal( N, scl, VL, strideVL1, offsetVL + i * strideVL2 );
			} else if ( WI[ offsetWI + i * strideWI ] > ZERO ) {
				// First of complex pair: normalize both columns
				scl = ONE / dlapy2(
					dnrm2( N, VL, strideVL1, offsetVL + i * strideVL2 ),
					dnrm2( N, VL, strideVL1, offsetVL + ( i + 1 ) * strideVL2 )
				);
				dscal( N, scl, VL, strideVL1, offsetVL + i * strideVL2 );
				dscal( N, scl, VL, strideVL1, offsetVL + ( i + 1 ) * strideVL2 );

				// Find the element with largest magnitude in the two columns
				// (Reuse work[oTau..oTau+N-1] as scratch, mirrors Fortran WORK(IWRK+K-1))
				for ( k = 0; k < N; k++ ) {
					work[ oTau + k ] = VL[ offsetVL + k * strideVL1 + i * strideVL2 ] * VL[ offsetVL + k * strideVL1 + i * strideVL2 ] +
						VL[ offsetVL + k * strideVL1 + ( i + 1 ) * strideVL2 ] * VL[ offsetVL + k * strideVL1 + ( i + 1 ) * strideVL2 ];
				}
				k = idamax( N, work, 1, oTau );

				// Generate rotation to make largest component real
				dlartg( VL[ offsetVL + k * strideVL1 + i * strideVL2 ],
					VL[ offsetVL + k * strideVL1 + ( i + 1 ) * strideVL2 ], DLARTG_OUT );
				cs = DLARTG_OUT[ 0 ];
				sn = DLARTG_OUT[ 1 ];

				drot( N, VL, strideVL1, offsetVL + i * strideVL2,
					VL, strideVL1, offsetVL + ( i + 1 ) * strideVL2, cs, sn );
				VL[ offsetVL + k * strideVL1 + ( i + 1 ) * strideVL2 ] = ZERO;
			}
		}
	}

	// Normalize right eigenvectors and make largest component real
	if ( wantvr ) {
		// Undo balancing of right eigenvectors
		dgebak( 'both', 'right', N, ilo, ihi, SCALE, 1, 0, N, VR, strideVR1, strideVR2, offsetVR );

		for ( i = 0; i < N; i++ ) {
			if ( WI[ offsetWI + i * strideWI ] === ZERO ) {
				// Real eigenvalue: normalize
				scl = ONE / dnrm2( N, VR, strideVR1, offsetVR + i * strideVR2 );
				dscal( N, scl, VR, strideVR1, offsetVR + i * strideVR2 );
			} else if ( WI[ offsetWI + i * strideWI ] > ZERO ) {
				// First of complex pair: normalize both columns
				scl = ONE / dlapy2(
					dnrm2( N, VR, strideVR1, offsetVR + i * strideVR2 ),
					dnrm2( N, VR, strideVR1, offsetVR + ( i + 1 ) * strideVR2 )
				);
				dscal( N, scl, VR, strideVR1, offsetVR + i * strideVR2 );
				dscal( N, scl, VR, strideVR1, offsetVR + ( i + 1 ) * strideVR2 );

				// Find the element with largest magnitude in the two columns
				// (Reuse work[oTau..oTau+N-1] as scratch, mirrors Fortran WORK(IWRK+K-1))
				for ( k = 0; k < N; k++ ) {
					work[ oTau + k ] = VR[ offsetVR + k * strideVR1 + i * strideVR2 ] * VR[ offsetVR + k * strideVR1 + i * strideVR2 ] +
						VR[ offsetVR + k * strideVR1 + ( i + 1 ) * strideVR2 ] * VR[ offsetVR + k * strideVR1 + ( i + 1 ) * strideVR2 ];
				}
				k = idamax( N, work, 1, oTau );

				// Generate rotation to make largest component real
				dlartg( VR[ offsetVR + k * strideVR1 + i * strideVR2 ],
					VR[ offsetVR + k * strideVR1 + ( i + 1 ) * strideVR2 ], DLARTG_OUT );
				cs = DLARTG_OUT[ 0 ];
				sn = DLARTG_OUT[ 1 ];

				drot( N, VR, strideVR1, offsetVR + i * strideVR2,
					VR, strideVR1, offsetVR + ( i + 1 ) * strideVR2, cs, sn );
				VR[ offsetVR + k * strideVR1 + ( i + 1 ) * strideVR2 ] = ZERO;
			}
		}
	}

	// Undo scaling if necessary
	if ( scalea ) {
		dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WR, strideWR, 1, offsetWR + info * strideWR );
		dlascl( 'general', 0, 0, cscale, anrm, N - info, 1, WI, strideWI, 1, offsetWI + info * strideWI );
		if ( info > 0 ) {
			dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WR, strideWR, 1, offsetWR );
			dlascl( 'general', 0, 0, cscale, anrm, ilo - 1, 1, WI, strideWI, 1, offsetWI );
		}
	}

	return info;
}


// EXPORTS //

export default dgeev;
