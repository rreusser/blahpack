/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
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
import ztgsna from '../../ztgsna/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';


// VARIABLES //

const ZERO = 0.0;
const ONE = 1.0;
const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );

// Machine constants (hoisted to module scope)
const EPS = dlamch( 'precision' );
const SAFMIN = dlamch( 'safe-minimum' );
const SMLNUM = Math.sqrt( SAFMIN ) / EPS;
const BIGNUM = ONE / SMLNUM;


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
* Computes for a pair of N-by-N complex nonsymmetric matrices (A,B) the.
* generalized eigenvalues, and optionally, the left and/or right generalized
* eigenvectors. Optionally also computes a balancing transformation to
* improve the conditioning of the eigenvalues and eigenvectors (ilo, ihi,
* lscale, rscale, abnrm, bbnrm), reciprocal condition numbers for the
* eigenvalues (rconde), and reciprocal condition numbers for the right
* eigenvectors (rcondv).
*
* ## Notes
*
* -   A, B, ALPHA, BETA, VL, VR are Complex128Arrays. Strides and offsets
*     are in complex elements.
*
* -   When `sense` is `'eigenvalues'`, `'right-vectors'`, or `'both'`,
*     eigenvalue / right-eigenvector reciprocal condition numbers are
*     computed one eigenvalue at a time via `ztgevc('selected')` +
*     `ztgsna`, mirroring the Fortran reference.
*
* @private
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'no-vectors'` or `'compute-vectors'`
* @param {string} jobvr - `'no-vectors'` or `'compute-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Complex128Array} A - first complex matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} B - second complex matrix (modified in-place)
* @param {integer} strideB1 - stride of the first dimension of B (complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (complex elements)
* @param {Complex128Array} ALPHA - output eigenvalue numerators (length N)
* @param {integer} strideALPHA - stride for ALPHA (complex elements)
* @param {NonNegativeInteger} offsetALPHA - starting index for ALPHA (complex elements)
* @param {Complex128Array} BETA - output eigenvalue denominators (length N)
* @param {integer} strideBETA - stride for BETA (complex elements)
* @param {NonNegativeInteger} offsetBETA - starting index for BETA (complex elements)
* @param {Complex128Array} VL - left eigenvector matrix (N x N)
* @param {integer} strideVL1 - stride of the first dimension of VL (complex elements)
* @param {integer} strideVL2 - stride of the second dimension of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - starting index for VL (complex elements)
* @param {Complex128Array} VR - right eigenvector matrix (N x N)
* @param {integer} strideVR1 - stride of the first dimension of VR (complex elements)
* @param {integer} strideVR2 - stride of the second dimension of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - starting index for VR (complex elements)
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are integer values such that on exit A(i,j) = 0 and B(i,j) = 0 if i > j and j = 1,...,ILO-1 or i = IHI+1,...,N
* @param {Float64Array} LSCALE - output: details of left permutations/scaling (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: details of right permutations/scaling (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} abnrm - output (length-1 array): the one-norm of the balanced matrix A
* @param {Float64Array} bbnrm - output (length-1 array): the one-norm of the balanced matrix B
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Complex128Array} WORK - complex workspace (see ndarray.js for the minimum length)
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {NonNegativeInteger} offsetWork - offset for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace, length >= 6*N if balanc is 'scale' or 'both', else >= 2*N
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - offset for RWORK
* @param {Int32Array} IWORK - integer workspace, length >= N+6 if sense is 'right-vectors' or 'both' (unreferenced otherwise)
* @param {integer} strideIWork - stride for IWORK
* @param {NonNegativeInteger} offsetIWork - offset for IWORK
* @param {Uint8Array} BWORK - boolean workspace, length >= N if sense is not 'none' (unreferenced otherwise)
* @param {integer} strideBWork - stride for BWORK
* @param {NonNegativeInteger} offsetBWork - offset for BWORK
* @returns {integer} status code (0 = success)
*/
function zggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, abnrm, bbnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork, IWORK, strideIWork, offsetIWork, BWORK, strideBWork, offsetBWork ) {
	const m = new Int32Array( 1 );
	const iloOut = new Int32Array( 1 );
	const ihiOut = new Int32Array( 1 );
	let rcondeS, rcondvS, snaJob, snaRes, anrmto, bnrmto, iwrk1, iwrk;
	let ilascl, ilbscl, chtemp, icols, iIdx, jVal;
	let anrm, bnrm, info, ierr, temp, sVL1, sVL2, sVR1, sVR2, VLv, VRv, oVL;
	let oVR, jc, jr, i;

	// Decode input strings
	const ilvl = ( jobvl === 'compute-vectors' );
	const ilvr = ( jobvr === 'compute-vectors' );
	const ilv = ilvl || ilvr;

	const noscl = ( balanc === 'none' ) || ( balanc === 'permute' );
	const wantsn = ( sense === 'none' );
	const wantse = ( sense === 'eigenvalues' );
	const wantsv = ( sense === 'right-vectors' );
	const wantsb = ( sense === 'both' );

	info = 0;

	// Validate string inputs.
	if ( !( noscl || balanc === 'scale' || balanc === 'both' ) ) {
		info = -1;
	} else if ( !ilvl && jobvl !== 'no-vectors' ) {
		info = -2;
	} else if ( !ilvr && jobvr !== 'no-vectors' ) {
		info = -3;
	} else if ( !( wantsn || wantse || wantsv || wantsb ) ) {
		info = -4;
	}
	if ( info !== 0 ) {
		ilo[ 0 ] = 0;
		ihi[ 0 ] = 0;
		abnrm[ 0 ] = 0.0;
		bbnrm[ 0 ] = 0.0;
		return info;
	}

	// Quick return
	if ( N === 0 ) {
		ilo[ 0 ] = 1;
		ihi[ 0 ] = 0;
		abnrm[ 0 ] = 0.0;
		bbnrm[ 0 ] = 0.0;
		return 0;
	}

	// Caller-owned workspaces (sizes asserted in ndarray.js). As in the reference, TAU occupies WORK(1:IROWS) during the QR step, with the zgeqrf/zunmqr/zungqr scratch after it; zhgeqz and ztgevc then reuse WORK from its start.
	const itau = offsetWork;
	const Mout = new Int32Array( 1 );

	// Scale A if max element outside range [SMLNUM, BIGNUM]
	anrm = zlange( 'max', N, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );
	ilascl = false;
	anrmto = 0.0;
	if ( anrm > ZERO && anrm < SMLNUM ) {
		anrmto = SMLNUM;
		ilascl = true;
	} else if ( anrm > BIGNUM ) {
		anrmto = BIGNUM;
		ilascl = true;
	}
	if ( ilascl ) {
		zlascl( 'general', 0, 0, anrm, anrmto, N, N, A, strideA1, strideA2, offsetA );
	}

	// Scale B if max element outside range [SMLNUM, BIGNUM]
	bnrm = zlange( 'max', N, N, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork );
	ilbscl = false;
	bnrmto = 0.0;
	if ( bnrm > ZERO && bnrm < SMLNUM ) {
		bnrmto = SMLNUM;
		ilbscl = true;
	} else if ( bnrm > BIGNUM ) {
		bnrmto = BIGNUM;
		ilbscl = true;
	}
	if ( ilbscl ) {
		zlascl( 'general', 0, 0, bnrm, bnrmto, N, N, B, strideB1, strideB2, offsetB );
	}

	// Permute and/or scale balancing. Note: zggbal writes LSCALE/RSCALE.
	zggbal( balanc, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, iloOut, ihiOut, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RWORK, strideRWork, offsetRWork );
	ilo[ 0 ] = iloOut[ 0 ]; // 1-based
	ihi[ 0 ] = ihiOut[ 0 ]; // 1-based

	// Compute 1-norms of the balanced A and B
	abnrm[ 0 ] = zlange( 'one-norm', N, N, A, strideA1, strideA2, offsetA, RWORK, strideRWork, offsetRWork );
	if ( ilascl ) {
		RWORK[ offsetRWork ] = abnrm[ 0 ];
		dlascl( 'general', 0, 0, anrmto, anrm, 1, 1, RWORK, 1, 1, offsetRWork );
		abnrm[ 0 ] = RWORK[ offsetRWork ];
	}

	bbnrm[ 0 ] = zlange( 'one-norm', N, N, B, strideB1, strideB2, offsetB, RWORK, strideRWork, offsetRWork );
	if ( ilbscl ) {
		RWORK[ offsetRWork ] = bbnrm[ 0 ];
		dlascl( 'general', 0, 0, bnrmto, bnrm, 1, 1, RWORK, 1, 1, offsetRWork );
		bbnrm[ 0 ] = RWORK[ offsetRWork ];
	}

	// Compute active block dimensions
	const irows = ihi[ 0 ] + 1 - ilo[ 0 ];
	iwrk = itau + ( irows * strideWork );
	if ( ilv || !wantsn ) {
		icols = N + 1 - ilo[ 0 ];
	} else {
		icols = irows;
	}

	// QR factorize B(ilo:ihi, ilo:icols) using zgeqrf
	zgeqrf( irows, icols, B, strideB1, strideB2, offsetB + ( ( ilo[ 0 ] - 1 ) * strideB1 ) + ( ( ilo[ 0 ] - 1 ) * strideB2 ), WORK, strideWork, itau, WORK, strideWork, iwrk );

	// Apply Q^H to A from the left
	zunmqr( 'left', 'conjugate-transpose', irows, icols, irows, B, strideB1, strideB2, offsetB + ( ( ilo[ 0 ] - 1 ) * strideB1 ) + ( ( ilo[ 0 ] - 1 ) * strideB2 ), WORK, strideWork, itau, A, strideA1, strideA2, offsetA + ( ( ilo[ 0 ] - 1 ) * strideA1 ) + ( ( ilo[ 0 ] - 1 ) * strideA2 ), WORK, strideWork, iwrk );

	// Initialize VL and generate Q
	if ( ilvl ) {
		zlaset( 'full', N, N, CZERO, CONE, VL, strideVL1, strideVL2, offsetVL );

		if ( irows > 1 ) {
			zlacpy( 'lower', irows - 1, irows - 1, B, strideB1, strideB2, offsetB + ( ilo[ 0 ] * strideB1 ) + ( ( ilo[ 0 ] - 1 ) * strideB2 ), VL, strideVL1, strideVL2, offsetVL + ( ilo[ 0 ] * strideVL1 ) + ( ( ilo[ 0 ] - 1 ) * strideVL2 ) );
		}

		zungqr( irows, irows, irows, VL, strideVL1, strideVL2, offsetVL + ( ( ilo[ 0 ] - 1 ) * strideVL1 ) + ( ( ilo[ 0 ] - 1 ) * strideVL2 ), WORK, strideWork, itau, WORK, strideWork, iwrk );
	}

	// Initialize VR
	if ( ilvr ) {
		zlaset( 'full', N, N, CZERO, CONE, VR, strideVR1, strideVR2, offsetVR );
	}

	// Reduce to generalized Hessenberg form
	if ( ilv || !wantsn ) {
		zgghrd( ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	} else {
		zgghrd( 'none', 'none', irows, 1, irows, A, strideA1, strideA2, offsetA + ( ( ilo[ 0 ] - 1 ) * strideA1 ) + ( ( ilo[ 0 ] - 1 ) * strideA2 ), B, strideB1, strideB2, offsetB + ( ( ilo[ 0 ] - 1 ) * strideB1 ) + ( ( ilo[ 0 ] - 1 ) * strideB2 ), VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR );
	}

	// QZ iteration, computing Schur form
	if ( ilv || !wantsn ) {
		chtemp = 'schur';
	} else {
		chtemp = 'eigenvalues';
	}

	ierr = zhgeqz( chtemp, ( ( ilvl ) ? 'update' : 'none' ), ( ( ilvr ) ? 'update' : 'none' ), N, ilo[ 0 ], ihi[ 0 ], A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHA, strideALPHA, offsetALPHA, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
	if ( ierr !== 0 ) {
		if ( ierr > 0 && ierr <= N ) {
			info = ierr;
		} else if ( ierr > N && ierr <= 2 * N ) {
			info = ierr - N;
		} else {
			info = N + 1;
		}
		const result = finalize();
		ilo[ 0 ] = result.ilo;
		ihi[ 0 ] = result.ihi;
		abnrm[ 0 ] = result.abnrm;
		bbnrm[ 0 ] = result.bbnrm;
		return result.info;
	}

	// Compute eigenvectors via ztgevc when requested
	if ( ilv || !wantsn ) {
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

			ierr = ztgevc( chtemp, 'backtransform', null, 0, 0, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, N, Mout, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork );
			if ( ierr !== 0 ) {
				info = N + 2;
				const result = finalize();
				ilo[ 0 ] = result.ilo;
				ihi[ 0 ] = result.ihi;
				abnrm[ 0 ] = result.abnrm;
				bbnrm[ 0 ] = result.bbnrm;
				return result.info;
			}
		}
		if ( !wantsn ) {
			// Compute reciprocal condition numbers one eigenvalue at a time, using ztgevc (in 'selected' mode) to recompute a pair of eigenvectors of the Schur form (S,T) and ztgsna to estimate their condition numbers. We cannot reuse VL/VR because ztgsna requires eigenvectors of (S,T), not the back-transformed versions.
			// Map zggevx SENSE to ztgsna job: 'right-vectors' → 'eigenvectors'.
			if ( wantse ) {
				snaJob = 'eigenvalues';
			} else if ( wantsv ) {
				snaJob = 'eigenvectors';
			} else {
				snaJob = 'both';
			}
			rcondeS = new Float64Array( 1 );
			rcondvS = new Float64Array( 1 );

			// As in the reference, each selected eigenvector pair of (S,T) is held in WORK: the left vector at WORK(1:N), the right at WORK(IWRK) = WORK(N+1:2N); ztgevc/ztgsna scratch starts at WORK(IWRK1) = WORK(2N+1).
			iwrk = offsetWork + ( N * strideWork );
			iwrk1 = iwrk + ( N * strideWork );
			for ( iIdx = 0; iIdx < N; iIdx++ ) {
				for ( jVal = 0; jVal < N; jVal++ ) {
					BWORK[ offsetBWork + ( jVal * strideBWork ) ] = 0;
				}
				BWORK[ offsetBWork + ( iIdx * strideBWork ) ] = 1;

				// Compute a single eigenvector pair of (S,T) for ztgsna.
				if ( wantse || wantsb ) {
					Mout[ 0 ] = 0;
					ierr = ztgevc( 'both', 'selected', BWORK, strideBWork, offsetBWork, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, N * strideWork, offsetWork, WORK, strideWork, N * strideWork, iwrk, 1, Mout, WORK, strideWork, iwrk1, RWORK, strideRWork, offsetRWork );
					if ( ierr !== 0 ) {
						info = N + 2;
						const result = finalize();
						ilo[ 0 ] = result.ilo;
						ihi[ 0 ] = result.ihi;
						abnrm[ 0 ] = result.abnrm;
						bbnrm[ 0 ] = result.bbnrm;
						return result.info;
					}
				}

				rcondeS[ 0 ] = ZERO;
				rcondvS[ 0 ] = ZERO;
				m[ 0 ] = 0;
				snaRes = ztgsna( snaJob, 'selected', BWORK, strideBWork, offsetBWork, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, WORK, strideWork, N * strideWork, offsetWork, WORK, strideWork, N * strideWork, iwrk, rcondeS, 1, 0, rcondvS, 1, 0, 1, m, WORK, strideWork, iwrk1, IWORK, strideIWork, offsetIWork );
				if ( snaRes < 0 ) {
					info = N + 2;
					const result = finalize();
					ilo[ 0 ] = result.ilo;
					ihi[ 0 ] = result.ihi;
					abnrm[ 0 ] = result.abnrm;
					bbnrm[ 0 ] = result.bbnrm;
					return result.info;
				}
				if ( wantse || wantsb ) {
					RCONDE[ offsetRCONDE + ( iIdx * strideRCONDE ) ] = rcondeS[ 0 ];
				}
				if ( wantsv || wantsb ) {
					RCONDV[ offsetRCONDV + ( iIdx * strideRCONDV ) ] = rcondvS[ 0 ];
				}
			}
		}
	}

	// Undo balancing on VL and VR, and normalize
	if ( ilvl ) {
		zggbak( balanc, 'left', N, ilo[ 0 ], ihi[ 0 ], LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VL, strideVL1, strideVL2, offsetVL );

		VLv = reinterpret( VL, 0 );
		sVL1 = strideVL1 * 2;
		sVL2 = strideVL2 * 2;
		oVL = offsetVL * 2;
		for ( jc = 0; jc < N; jc++ ) {
			temp = ZERO;
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, abs1( VLv, oVL + ( jr * sVL1 ) + ( jc * sVL2 ) ) );
			}
			if ( temp < SMLNUM ) {
				continue;
			}
			temp = ONE / temp;
			for ( jr = 0; jr < N; jr++ ) {
				i = oVL + ( jr * sVL1 ) + ( jc * sVL2 );
				VLv[ i ] *= temp;
				VLv[ i + 1 ] *= temp;
			}
		}
	}

	if ( ilvr ) {
		zggbak( balanc, 'right', N, ilo[ 0 ], ihi[ 0 ], LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, N, VR, strideVR1, strideVR2, offsetVR );

		VRv = reinterpret( VR, 0 );
		sVR1 = strideVR1 * 2;
		sVR2 = strideVR2 * 2;
		oVR = offsetVR * 2;
		for ( jc = 0; jc < N; jc++ ) {
			temp = ZERO;
			for ( jr = 0; jr < N; jr++ ) {
				temp = Math.max( temp, abs1( VRv, oVR + ( jr * sVR1 ) + ( jc * sVR2 ) ) );
			}
			if ( temp < SMLNUM ) {
				continue;
			}
			temp = ONE / temp;
			for ( jr = 0; jr < N; jr++ ) {
				i = oVR + ( jr * sVR1 ) + ( jc * sVR2 );
				VRv[ i ] *= temp;
				VRv[ i + 1 ] *= temp;
			}
		}
	}

	const result = finalize();
	ilo[ 0 ] = result.ilo;
	ihi[ 0 ] = result.ihi;
	abnrm[ 0 ] = result.abnrm;
	bbnrm[ 0 ] = result.bbnrm;
	return result.info;

	/**
	* Undo scaling on ALPHA/BETA and return the result object.
	*
	* @private
	* @returns {Object} result
	*/
	function finalize() {
		if ( ilascl ) {
			zlascl( 'general', 0, 0, anrmto, anrm, N, 1, ALPHA, strideALPHA, strideALPHA, offsetALPHA );
		}
		if ( ilbscl ) {
			zlascl( 'general', 0, 0, bnrmto, bnrm, N, 1, BETA, strideBETA, strideBETA, offsetBETA );
		}
		return {
			'info': info,
			'ilo': ilo[ 0 ],
			'ihi': ihi[ 0 ],
			'abnrm': abnrm[ 0 ],
			'bbnrm': bbnrm[ 0 ]
		};
	}
}


// EXPORTS //

export default zggevx;
