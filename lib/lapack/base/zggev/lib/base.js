/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zggbal from '../../zggbal/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zgghrd from '../../zgghrd/lib/base.js';
import zhgeqz from '../../zhgeqz/lib/base.js';
import zggbak from '../../zggbak/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zunmqr from '../../zunmqr/lib/base.js';
import ztgevc from '../../ztgevc/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;
const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );


// FUNCTIONS //

/**
* ABS1: |re| + |im| (cheap complex absolute value).
*
* @private
* @param {Float64Array} arr - Float64 view of complex array
* @param {integer} idx - Float64 index of real part
* @returns {number} |re| + |im|
*/
function abs1( arr, idx ) {
	return Math.abs( arr[ idx ] ) + Math.abs( arr[ idx + 1 ] );
}


// MAIN //

/**
* Compute the generalized eigenvalues and optionally the left and/or.
* right generalized eigenvectors of a complex matrix pair (A, B).
*
* A, B, ALPHA, BETA, VL, VR, WORK are Complex128Arrays; RWORK is a Float64Array.
* Strides and offsets for the complex arrays are in complex elements.
*
* @private
* @param {string} jobvl - `'none'` or `'compute'`
* @param {string} jobvr - `'none'` or `'compute'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix
* @param {integer} strideVL1 - stride of the first dimension of VL (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix
* @param {integer} strideVR1 - stride of the first dimension of VR (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Complex128Array} WORK - caller-provided complex workspace (length >= N + max(1,(N*32)+(33*32)))
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for WORK (complex elements)
* @param {Float64Array} RWORK - caller-provided real workspace (length >= max(1,8*N))
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} INFO: 0=success, 1..N=QZ iteration failed to converge, N+1=other QZ failure, N+2=ZTGEVC error
*/
function zggev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let anrmto, bnrmto, ilascl, ilbscl, smlnum, bignum, chtemp, icols, anrm;
	let bnrm, info, ierr, temp, sVL1, sVL2, sVR1, sVR2, VLv, VRv, oVL, oVR, jc;
	let jr;

	// Decode input
	const ilvl = ( jobvl === 'compute' );
	const ilvr = ( jobvr === 'compute' );
	const ilv = ilvl || ilvr;

	info = 0;

	// Quick return if possible
	if ( N === 0 ) {
		return info;
	}

	// Partition the caller-provided complex WORK array:
	//   WORK[0..N-1] : TAU (Householder scalar factors, length N)
	//   WORK[N..]    : scratch for zgeqrf/zunmqr/zungqr/zhgeqz/ztgevc
	const oTAU = offsetWork;
	const oWRK = offsetWork + ( N * strideWork );

	// Partition the caller-provided real RWORK array, mirroring the Fortran
	// ZGGEV layout:
	//   RWORK[0..N-1]   : LSCALE (Fortran: RWORK(ILEFT), ILEFT=1)
	//   RWORK[N..2N-1]  : RSCALE (Fortran: RWORK(IRIGHT), IRIGHT=N+1)
	//   RWORK[2N..]     : scratch (Fortran: RWORK(IRWRK), IRWRK=2N+1)
	//     - zggbal / zhgeqz use this region while it holds no scale factors
	//     - ztgevc reuses it after the QZ iteration (LSCALE/RSCALE at
	//       RWORK[0..2N-1] are still needed by zggbak, so must not be clobbered)
	const ileft = offsetRWork;
	const iright = offsetRWork + ( N * strideRWork );
	const irwrk = offsetRWork + ( 2 * N * strideRWork );

	// Get machine constants
	const eps = dlamch( 'epsilon' ) * dlamch( 'base' );
	smlnum = dlamch( 'safe-minimum' );
	bignum = ONE / smlnum;
	smlnum = Math.sqrt( smlnum ) / eps;
	bignum = ONE / smlnum;

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, irwrk );
	ilascl = false;
	anrmto = 0.0;
	if ( anrm > ZERO && anrm < smlnum ) {
		anrmto = smlnum;
		ilascl = true;
	} else if ( anrm > bignum ) {
		anrmto = bignum;
		ilascl = true;
	}
	if ( ilascl ) {
		zlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = zlange( 'max', N, N, B, strideB1, strideB2, offsetB, RWORK, strideRWork, irwrk );
	ilbscl = false;
	bnrmto = 0.0;
	if ( bnrm > ZERO && bnrm < smlnum ) {
		bnrmto = smlnum;
		ilbscl = true;
	} else if ( bnrm > bignum ) {
		bnrmto = bignum;
		ilbscl = true;
	}
	if ( ilbscl ) {
		zlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute the matrices A, B to isolate eigenvalues
	const bal = zggbal( 'permute', N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, RWORK, strideRWork, ileft, RWORK, strideRWork, iright, RWORK, strideRWork, irwrk );
	const ilo = bal.ilo;
	const ihi = bal.ihi;

	// Compute active block dimensions (1-based ilo, ihi)
	const irows = ihi - ilo + 1;
	if ( ilv ) {
		icols = N - ilo + 1;
	} else {
		icols = irows;
	}

	// QR factorize B(ilo:ihi, ilo:icols) using ZGEQRF
	zgeqrf(irows, icols, B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), WORK, strideWork, oTAU, WORK, strideWork, oWRK);

	// Apply Q^H to A from the left
	zunmqr('left', 'conjugate-transpose', irows, icols, irows, B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), WORK, strideWork, oTAU, A, strideA1, strideA2, offsetA + (( ilo - 1 ) * strideA1) + (( ilo - 1 ) * strideA2), WORK, strideWork, oWRK );

	// Initialize VL and generate Q
	if ( ilvl ) {
		zlaset( 'Full', N, N, CZERO, CONE, VL, strideVL1, strideVL2, offsetVL );

		if ( irows > 1 ) {
			zlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + (ilo * strideB1) + (( ilo - 1 ) * strideB2), VL, strideVL1, strideVL2, offsetVL + (ilo * strideVL1) + (( ilo - 1 ) * strideVL2));
		}

		zungqr(irows, irows, irows, VL, strideVL1, strideVL2, offsetVL + (( ilo - 1 ) * strideVL1) + (( ilo - 1 ) * strideVL2), WORK, strideWork, oTAU, WORK, strideWork, oWRK );
	}

	// Initialize VR
	if ( ilvr ) {
		zlaset( 'Full', N, N, CZERO, CONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	// Zgghrd expects compq/compz: 'none'/'update'/'initialize'
	if ( ilv ) {
		zgghrd(( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR);
	} else {
		zgghrd('none', 'none', irows, 1, irows, A, strideA1, strideA2, offsetA + (( ilo - 1 ) * strideA1) + (( ilo - 1 ) * strideA2), B, strideB1, strideB2, offsetB + (( ilo - 1 ) * strideB1) + (( ilo - 1 ) * strideB2), VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR);
	}

	// QZ algorithm: compute eigenvalues and optionally Schur form
	if ( ilv ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}
	ierr = zhgeqz(chtemp, ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, oWRK, RWORK, strideRWork, irwrk);
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		return finalize();
	}

	// Compute eigenvectors
	// Ztgevc side: 'left'/'right'/'both'
	if ( ilv ) {
		if ( ilvl ) {
			if ( ilvr ) {
				chtemp = 'both';
			} else {
				chtemp = 'left';
			}
		} else {
			chtemp = 'right';
		}

		// Use the scratch region RWORK[2N..] for ztgevc so it doesn't clobber
		// the LSCALE/RSCALE at RWORK[0..2N-1] needed by zggbak
		ierr = ztgevc(chtemp, 'backtransform', null, 0, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, [ 0 ], WORK, strideWork, oWRK, RWORK, strideRWork, irwrk);
		if ( ierr !== 0 ) {
			info = N + 2;
			return finalize();
		}

		// Undo balancing on VL and VR, and normalize
		// Get Float64Array views for direct element access
		if ( ilvl ) {
			VLv = reinterpret( VL, 0 );
			sVL1 = strideVL1 * 2;
			sVL2 = strideVL2 * 2;
			oVL = offsetVL * 2;

			zggbak( 'permute', 'left', N, ilo, ihi, RWORK, strideRWork, ileft, RWORK, strideRWork, iright, N, VL, strideVL1, strideVL2, offsetVL);

			// Normalize left eigenvectors
			for ( jc = 0; jc < N; jc++ ) {
				temp = ZERO;
				for ( jr = 0; jr < N; jr++ ) {
					temp = Math.max( temp, abs1( VLv, oVL + (jr * sVL1) + (jc * sVL2) ) );
				}
				if ( temp < smlnum ) {
					continue;
				}
				temp = ONE / temp;
				for ( jr = 0; jr < N; jr++ ) {
					VLv[ oVL + (jr * sVL1) + (jc * sVL2) ] *= temp;
					VLv[ oVL + (jr * sVL1) + (jc * sVL2) + 1 ] *= temp;
				}
			}
		}

		if ( ilvr ) {
			VRv = reinterpret( VR, 0 );
			sVR1 = strideVR1 * 2;
			sVR2 = strideVR2 * 2;
			oVR = offsetVR * 2;

			zggbak( 'permute', 'right', N, ilo, ihi, RWORK, strideRWork, ileft, RWORK, strideRWork, iright, N, VR, strideVR1, strideVR2, offsetVR);

			// Normalize right eigenvectors
			for ( jc = 0; jc < N; jc++ ) {
				temp = ZERO;
				for ( jr = 0; jr < N; jr++ ) {
					temp = Math.max( temp, abs1( VRv, oVR + (jr * sVR1) + (jc * sVR2) ) );
				}
				if ( temp < smlnum ) {
					continue;
				}
				temp = ONE / temp;
				for ( jr = 0; jr < N; jr++ ) {
					VRv[ oVR + (jr * sVR1) + (jc * sVR2) ] *= temp;
					VRv[ oVR + (jr * sVR1) + (jc * sVR2) + 1 ] *= temp;
				}
			}
		}
	}

	return finalize();

	/**
	* Undo scaling on ALPHA and BETA if necessary, then return info.
	*
	* @private
	* @returns {integer} info
	*/
	function finalize() {
		if ( ilascl ) {
			zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, 1, offsetALPHA);
		}
		if ( ilbscl ) {
			zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, 1, offsetBETA);
		}
		return info;
	}
}


// EXPORTS //

export default zggev;
