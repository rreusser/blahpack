/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-lines-per-function, max-statements, max-lines, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlange from '../../dlange/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dgeqrf from '../../dgeqrf/lib/base.js';
import dorgqr from '../../dorgqr/lib/base.js';
import dgelqf from '../../dgelqf/lib/base.js';
import dorglq from '../../dorglq/lib/base.js';
import dgebrd from '../../dgebrd/lib/base.js';
import dorgbr from '../../dorgbr/lib/base.js';
import dormbr from '../../dormbr/lib/base.js';
import dbdsqr from '../../dbdsqr/lib/base.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';


// VARIABLES //

// Block size the blocked callees use (their stand-in for ILAENV(1)); it enters only the optimal-workspace sizes (the callees' workspace queries).
const NB = 32;


// FUNCTIONS //

/**
* Returns the optimal workspace that dGEQRF reports for an M-by-N matrix (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {PositiveInteger} optimal workspace size
*/
function lworkGeqrf( M, N ) {
	if ( Math.min( M, N ) === 0 ) {
		return 1;
	}
	return N * NB;
}

/**
* Returns the optimal workspace that dGELQF reports for an M-by-N matrix (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @returns {PositiveInteger} optimal workspace size
*/
function lworkGelqf( M ) {
	return M * NB;
}

/**
* Returns the optimal workspace that DORGGQR reports (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} N - number of columns of Q
* @returns {PositiveInteger} optimal workspace size
*/
function lworkOrgqr( N ) {
	return Math.max( 1, N ) * NB;
}

/**
* Returns the optimal workspace that DORGGLQ reports (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q
* @returns {PositiveInteger} optimal workspace size
*/
function lworkOrglq( M ) {
	return Math.max( 1, M ) * NB;
}

/**
* Returns the optimal workspace that dGEBRD reports for an M-by-N matrix (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {PositiveInteger} optimal workspace size
*/
function lworkGebrd( M, N ) {
	return ( M + N ) * NB;
}

/**
* Returns the optimal workspace that DORGGBR reports (its LWORK = -1 query).
*
* @private
* @param {string} vect - `'apply-Q'` or `'apply-P'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of reflectors
* @returns {PositiveInteger} optimal workspace size
*/
function lworkOrgbr( vect, M, N, K ) {
	let lwkopt = 1;
	if ( vect === 'apply-Q' ) {
		if ( M >= K ) {
			lwkopt = lworkOrgqr( N );
		} else if ( M > 1 ) {
			lwkopt = lworkOrgqr( M - 1 );
		}
	} else if ( K < N ) {
		lwkopt = lworkOrglq( M );
	} else if ( N > 1 ) {
		lwkopt = lworkOrglq( N - 1 );
	}
	return Math.max( lwkopt, Math.min( M, N ) );
}

/**
* Computes the reference's workspace sizes: MINWRK, MAXWRK, and the MNTHR crossover and WRKBL that select the path.
*
* @private
* @param {string} jobu - left singular vector option
* @param {string} jobvt - right singular vector option
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @returns {{minwrk: number, maxwrk: number, mnthr: number, wrkbl: number, bdspac: number}} `minwrk`, `maxwrk`, `mnthr`, `wrkbl`, `bdspac`
*/
function workspace( jobu, jobvt, M, N ) {
	let lwkGebrd, lwkGelqf, lwkGeqrf, lwkOrgbrP, lwkOrgbrQ, lwkOrglqM, lwkOrglqN, lwkOrgqrM, lwkOrgqrN;
	let bdspac = 0;
	let wrkbl = 0;
	let minwrk;
	let maxwrk;
	let mnthr;

	const minmn = Math.min( M, N );
	const wntua = ( jobu === 'all-columns' );
	const wntus = ( jobu === 'economy' );
	const wntuas = wntua || wntus;
	const wntuo = ( jobu === 'overwrite' );
	const wntun = ( jobu === 'none' );
	const wntva = ( jobvt === 'all-rows' );
	const wntvs = ( jobvt === 'economy' );
	const wntvas = wntva || wntvs;
	const wntvo = ( jobvt === 'overwrite' );
	const wntvn = ( jobvt === 'none' );

	minwrk = 1;
	maxwrk = 1;
	mnthr = 0;
	if ( M >= N && minmn > 0 ) {
		// Compute space needed for DBDSQR
		mnthr = Math.floor( 1.6 * minmn );
		bdspac = 5 * N;
		// Compute space needed for DGEQRF
		lwkGeqrf = lworkGeqrf( M, N );
		// Compute space needed for DORGQR
		lwkOrgqrN = lworkOrgqr( N );
		lwkOrgqrM = lworkOrgqr( M );
		// Compute space needed for DGEBRD
		lwkGebrd = lworkGebrd( N, N );
		// Compute space needed for DORGBR P
		lwkOrgbrP = lworkOrgbr( 'apply-P', N, N, N );
		// Compute space needed for DORGBR Q
		lwkOrgbrQ = lworkOrgbr( 'apply-Q', N, N, N );
		if ( M >= mnthr ) {
			if ( wntun ) {
				// Path 1 (M much larger than N, JOBU='N')
				maxwrk = N + lwkGeqrf;
				maxwrk = Math.max( maxwrk, 3 * N + lwkGebrd );
				if ( wntvo || wntvas ) {
					maxwrk = Math.max( maxwrk, 3 * N + lwkOrgbrP );
				}
				maxwrk = Math.max( maxwrk, bdspac );
				minwrk = Math.max( 4 * N, bdspac );
			} else if ( wntuo && wntvn ) {
				// Path 2 (M much larger than N, JOBU='O', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrN );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = Math.max( N * N + wrkbl, N * N + M * N + N );
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntuo && wntvas ) {
				// Path 3 (M much larger than N, JOBU='O', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrN );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = Math.max( N * N + wrkbl, N * N + M * N + N );
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntus && wntvn ) {
				// Path 4 (M much larger than N, JOBU='S', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrN );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntus && wntvo ) {
				// Path 5 (M much larger than N, JOBU='S', JOBVT='O')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrN );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = 2 * N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntus && wntvas ) {
				// Path 6 (M much larger than N, JOBU='S', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrN );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntua && wntvn ) {
				// Path 7 (M much larger than N, JOBU='A', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrM );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntua && wntvo ) {
				// Path 8 (M much larger than N, JOBU='A', JOBVT='O')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrM );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = 2 * N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			} else if ( wntua && wntvas ) {
				// Path 9 (M much larger than N, JOBU='A', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkOrgqrM );
				wrkbl = Math.max( wrkbl, 3 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, 3 * N + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = N * N + wrkbl;
				minwrk = Math.max( 3 * N + M, bdspac );
			}
		} else {
			// Path 10 (M at least N, but not much larger)
			lwkGebrd = lworkGebrd( M, N );
			maxwrk = 3 * N + lwkGebrd;
			if ( wntus || wntuo ) {
				lwkOrgbrQ = lworkOrgbr( 'apply-Q', M, N, N );
				maxwrk = Math.max( maxwrk, 3 * N + lwkOrgbrQ );
			}
			if ( wntua ) {
				lwkOrgbrQ = lworkOrgbr( 'apply-Q', M, M, N );
				maxwrk = Math.max( maxwrk, 3 * N + lwkOrgbrQ );
			}
			if ( !wntvn ) {
				maxwrk = Math.max( maxwrk, 3 * N + lwkOrgbrP );
			}
			maxwrk = Math.max( maxwrk, bdspac );
			minwrk = Math.max( 3 * N + M, bdspac );
		}
	} else if ( minmn > 0 ) {
		// Compute space needed for DBDSQR
		mnthr = Math.floor( 1.6 * minmn );
		bdspac = 5 * M;
		// Compute space needed for DGELQF
		lwkGelqf = lworkGelqf( M );
		// Compute space needed for DORGLQ
		lwkOrglqN = lworkOrglq( N );
		lwkOrglqM = lworkOrglq( M );
		// Compute space needed for DGEBRD
		lwkGebrd = lworkGebrd( M, M );
		// Compute space needed for DORGBR P
		lwkOrgbrP = lworkOrgbr( 'apply-P', M, M, M );
		// Compute space needed for DORGBR Q
		lwkOrgbrQ = lworkOrgbr( 'apply-Q', M, M, M );
		if ( N >= mnthr ) {
			if ( wntvn ) {
				// Path 1t(N much larger than M, JOBVT='N')
				maxwrk = M + lwkGelqf;
				maxwrk = Math.max( maxwrk, 3 * M + lwkGebrd );
				if ( wntuo || wntuas ) {
					maxwrk = Math.max( maxwrk, 3 * M + lwkOrgbrQ );
				}
				maxwrk = Math.max( maxwrk, bdspac );
				minwrk = Math.max( 4 * M, bdspac );
			} else if ( wntvo && wntun ) {
				// Path 2t(N much larger than M, JOBU='N', JOBVT='O')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqM );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = Math.max( M * M + wrkbl, M * M + M * N + M );
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntvo && wntuas ) {
				// Path 3t(N much larger than M, JOBU='S' or 'A', JOBVT='O')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqM );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = Math.max( M * M + wrkbl, M * M + M * N + M );
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntvs && wntun ) {
				// Path 4t(N much larger than M, JOBU='N', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqM );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntvs && wntuo ) {
				// Path 5t(N much larger than M, JOBU='O', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqM );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = 2 * M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntvs && wntuas ) {
				// Path 6t(N much larger than M, JOBU='S' or 'A', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqM );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntva && wntun ) {
				// Path 7t(N much larger than M, JOBU='N', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqN );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntva && wntuo ) {
				// Path 8t(N much larger than M, JOBU='O', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqN );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = 2 * M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			} else if ( wntva && wntuas ) {
				// Path 9t(N much larger than M, JOBU='S' or 'A', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkOrglqN );
				wrkbl = Math.max( wrkbl, 3 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrP );
				wrkbl = Math.max( wrkbl, 3 * M + lwkOrgbrQ );
				wrkbl = Math.max( wrkbl, bdspac );
				maxwrk = M * M + wrkbl;
				minwrk = Math.max( 3 * M + N, bdspac );
			}
		} else {
			// Path 10t(N greater than M, but not much larger)
			lwkGebrd = lworkGebrd( M, N );
			maxwrk = 3 * M + lwkGebrd;
			if ( wntvs || wntvo ) {
				// Compute space needed for DORGBR P
				lwkOrgbrP = lworkOrgbr( 'apply-P', M, N, M );
				maxwrk = Math.max( maxwrk, 3 * M + lwkOrgbrP );
			}
			if ( wntva ) {
				lwkOrgbrP = lworkOrgbr( 'apply-P', N, N, M );
				maxwrk = Math.max( maxwrk, 3 * M + lwkOrgbrP );
			}
			if ( !wntun ) {
				maxwrk = Math.max( maxwrk, 3 * M + lwkOrgbrQ );
			}
			maxwrk = Math.max( maxwrk, bdspac );
			minwrk = Math.max( 3 * M + N, bdspac );
		}
	}
	maxwrk = Math.max( maxwrk, minwrk );
	maxwrk = Math.max( maxwrk, minwrk );
	return {
		'minwrk': minwrk,
		'maxwrk': maxwrk,
		'mnthr': mnthr,
		'wrkbl': wrkbl,
		'bdspac': bdspac
	};
}

/**
* Returns the minimum workspace length (the reference's MINWRK) for the given options and dimensions.
*
* @param {string} jobu - left singular vector option
* @param {string} jobvt - right singular vector option
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @returns {PositiveInteger} minimum workspace length
*/
function computeMinWorkSize( jobu, jobvt, M, N ) {
	return workspace( jobu, jobvt, M, N ).minwrk;
}

/**
* Returns the optimal workspace length (the reference's MAXWRK) for the given options and dimensions; it enables the fast QR/LQ paths and the callees' blocked code.
*
* @param {string} jobu - left singular vector option
* @param {string} jobvt - right singular vector option
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @returns {PositiveInteger} optimal workspace length
*/
function computeWorkSize( jobu, jobvt, M, N ) {
	return workspace( jobu, jobvt, M, N ).maxwrk;
}


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a real M-by-N matrix A, optionally computing the left and/or right singular vectors.
*
* The SVD is written `A = U * SIGMA * V^T`, where SIGMA is an M-by-N matrix which is zero except for its min(M,N) diagonal elements, U is an M-by-M orthogonal matrix, and V is an N-by-N orthogonal matrix. The diagonal elements of SIGMA are the singular values of A; they are real and non-negative, and are returned in descending order. The first min(M,N) columns of U and V are the left and right singular vectors of A.
*
* Like the reference, the routine picks its path from the workspace it is given: for M much larger than N (or N much larger than M) it reduces A by QR (LQ) first, and uses a work matrix for the fast variant only when `lwork` holds it.
*
* @private
* @param {('all-columns'|'economy'|'overwrite'|'none')} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {('all-rows'|'economy'|'overwrite'|'none')} jobvt - `'all-rows'`: all N rows of V^T returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} s - output array of singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Float64Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Float64Array} VT - output matrix for right singular vectors (V^T)
* @param {integer} strideVT1 - stride of the first dimension of VT
* @param {integer} strideVT2 - stride of the second dimension of VT
* @param {NonNegativeInteger} offsetVT - starting index for VT
* @param {Float64Array} WORK - workspace of `lwork = WORK.length - offsetWork` elements (stride 1). The minimum is the reference's MINWRK, `computeMinWorkSize( jobu, jobvt, M, N )` (at most `max( 1, 3*min(M,N) + max(M,N), 5*min(M,N) )`); `computeWorkSize( jobu, jobvt, M, N )` (the reference's MAXWRK) selects the fast QR/LQ paths and the callees' blocked code. Between the two, the routine chooses its path and block sizes from `lwork`, as the reference does from LWORK. If the bidiagonal QR iteration fails to converge (`info > 0`), `WORK[ offsetWork+1 : offsetWork+min(M,N) ]` holds the unconverged superdiagonal
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {integer} info - 0 if successful, >0 if dBDSQR did not converge
*/
function dgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWork, offsetWork ) {
	let blk = 0;
	let chunk = 0;
	let ie = 0;
	let ir = 0;
	let itau = 0;
	let itaup = 0;
	let itauq = 0;
	let iu = 0;
	let iwork = 0;
	let ldwrkr = 0;
	let ldwrku = 0;
	let ncu = 0;
	let ncvt = 0;
	let nru = 0;
	let nrvt = 0;
	let i = 0;
	let iscl;
	let info;

	// The JS LWORK is the workspace's length (CONVENTIONS W1/W6):
	const lwork = Math.floor( ( WORK.length - offsetWork ) / Math.abs( strideWork ) );

	// Rebase the workspace so the reference's WORK pointers (ITAU, IE, IR, IU, IWORK, ...) are 0-based indices; a view, not a copy. Each callee then sees the reference's LWORK-IWORK+1 as the length past its offset.
	WORK = WORK.subarray( offsetWork );

	const sa1 = strideA1;
	const sa2 = strideA2;
	const su1 = strideU1;
	const su2 = strideU2;
	const svt1 = strideVT1;
	const svt2 = strideVT2;

	info = 0;
	const minmn = Math.min( M, N );

	const wntua = ( jobu === 'all-columns' );
	const wntus = ( jobu === 'economy' );
	const wntuas = wntua || wntus;
	const wntuo = ( jobu === 'overwrite' );
	const wntun = ( jobu === 'none' );
	const wntva = ( jobvt === 'all-rows' );
	const wntvs = ( jobvt === 'economy' );
	const wntvas = wntva || wntvs;
	const wntvo = ( jobvt === 'overwrite' );
	const wntvn = ( jobvt === 'none' );

	// Quick return if possible
	if ( M === 0 || N === 0 ) {
		return 0;
	}

	const ws = workspace( jobu, jobvt, M, N );
	const mnthr = ws.mnthr;
	const wrkbl = ws.wrkbl;
	const bdspac = ws.bdspac;

	// The reference sizes its work matrices with LDA (LDA*N, LDA*M); A here is addressed by strides, so use the smallest LDA the reference allows, max(1,M). The work matrices then depend on the workspace only, not on how A is stored.
	const lda = Math.max( 1, M );

	const DUM = new Float64Array( 1 );

	// Get machine constants
	const eps = dlamch( 'precision' );
	const smlnum = Math.sqrt( dlamch( 'safe-minimum' ) ) / eps;
	const bignum = 1.0 / smlnum;

	// Scale A if max element outside range [SMLNUM,BIGNUM]
	const anrm = dlange( 'max', M, N, A, sa1, sa2, offsetA, DUM, 1, 0 );
	iscl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		iscl = 1;
		dlascl( 'general', 0, 0, anrm, smlnum, M, N, A, sa1, sa2, offsetA );
	} else if ( anrm > bignum ) {
		iscl = 1;
		dlascl( 'general', 0, 0, anrm, bignum, M, N, A, sa1, sa2, offsetA );
	}

	if ( M >= N ) {
		// A has at least as many rows as columns. If A has sufficiently more rows than columns, first reduce using the QR decomposition (if sufficient workspace available)
		if ( M >= mnthr ) {
			if ( wntun ) {
				// Path 1 (M much larger than N, JOBU='N') No left singular vectors to be computed
				itau = 0;
				iwork = itau + N;
				// Compute A=Q*R (Workspace: need 2*N, prefer N + N*NB)
				dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
				// Zero out below R
				if ( N > 1 ) {
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
				}
				ie = 0;
				itauq = ie + N;
				itaup = itauq + N;
				iwork = itaup + N;
				// Bidiagonalize R in A (Workspace: need 4*N, prefer 3*N + 2*N*NB)
				dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
				ncvt = 0;
				if ( wntvo || wntvas ) {
					// If right singular vectors desired, generate P'. (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
					dorgbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
					ncvt = N;
				}
				iwork = ie + N;
				// Perform bidiagonal QR iteration, computing right singular vectors of A in A if desired (Workspace: need BDSPAC)
				info = dbdsqr( 'upper', N, ncvt, 0, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
				// If right singular vectors desired in VT, copy them there
				if ( wntvas ) {
					dlacpy( 'all', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				}
			} else if ( wntuo && wntvn ) {
				// Path 2 (M much larger than N, JOBU='O', JOBVT='N') N left singular vectors to be overwritten on A and no right singular vectors to be computed
				if ( lwork >= N * N + Math.max( 4 * N, bdspac ) ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N + N ) + lda * N ) {
						// WORK(IU) is LDA by N, WORK(IR) is LDA by N
						ldwrku = lda;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N + N ) + N * N ) {
						// WORK(IU) is LDA by N, WORK(IR) is N by N
						ldwrku = lda;
						ldwrkr = N;
					} else {
						// WORK(IU) is LDWRKU by N, WORK(IR) is N by N
						ldwrku = Math.trunc( ( lwork - N * N - N ) / N );
						ldwrkr = N;
					}
					itau = ir + ldwrkr * N;
					iwork = itau + N;
					// Compute A=Q*R (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
					dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to WORK(IR) and zero out below it
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
					dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + 1 );
					// Generate Q in A (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
					dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
					dgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing R (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
					dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
					iwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (Workspace: need N*N + BDSPAC)
					info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
					iu = ie + N;
					// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in WORK(IU) and copying to A (Workspace: need N*N + 2*N, prefer N*N + M*N + N)
					for ( i = 0; i < M; i += ldwrku ) {
						chunk = Math.min( M - i, ldwrku );
						dgemm( 'no-transpose', 'no-transpose', chunk, N, N, 1.0, A, sa1, sa2, offsetA + ( i * sa1 ), WORK, 1, ldwrkr, ir, 0.0, WORK, 1, ldwrku, iu );
						dlacpy( 'all', chunk, N, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa1 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					ie = 0;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize A (Workspace: need 3*N + M, prefer 3*N + (M + N)*NB)
					dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing A (Workspace: need 4*N, prefer 3*N + N*NB)
					dorgbr( 'apply-Q', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
					iwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in A (Workspace: need BDSPAC)
					info = dbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
				}
			} else if ( wntuo && wntvas ) {
				// Path 3 (M much larger than N, JOBU='O', JOBVT='S' or 'A') N left singular vectors to be overwritten on A and N right singular vectors to be computed in VT
				if ( lwork >= N * N + Math.max( 4 * N, bdspac ) ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N + N ) + lda * N ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by N
						ldwrku = lda;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N + N ) + N * N ) {
						// WORK(IU) is LDA by N and WORK(IR) is N by N
						ldwrku = lda;
						ldwrkr = N;
					} else {
						// WORK(IU) is LDWRKU by N and WORK(IR) is N by N
						ldwrku = Math.trunc( ( lwork - N * N - N ) / N );
						ldwrkr = N;
					}
					itau = ir + ldwrkr * N;
					iwork = itau + N;
					// Compute A=Q*R (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
					dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to VT, zeroing out below it
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					if ( N > 1 ) {
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, VT, svt1, svt2, offsetVT + svt1 );
					}
					// Generate Q in A (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
					dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in VT, copying result to WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
					dgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					dlacpy( 'lower', N, N, VT, svt1, svt2, offsetVT, WORK, 1, ldwrkr, ir );
					// Generate left vectors bidiagonalizing R in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
					dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing R in VT (Workspace: need N*N + 4*N-1, prefer N*N + 3*N + (N-1)*NB)
					dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
					iwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) and computing right singular vectors of R in VT (Workspace: need N*N + BDSPAC)
					info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
					iu = ie + N;
					// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in WORK(IU) and copying to A (Workspace: need N*N + 2*N, prefer N*N + M*N + N)
					for ( i = 0; i < M; i += ldwrku ) {
						chunk = Math.min( M - i, ldwrku );
						dgemm( 'no-transpose', 'no-transpose', chunk, N, N, 1.0, A, sa1, sa2, offsetA + ( i * sa1 ), WORK, 1, ldwrkr, ir, 0.0, WORK, 1, ldwrku, iu );
						dlacpy( 'all', chunk, N, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa1 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					itau = 0;
					iwork = itau + N;
					// Compute A=Q*R (Workspace: need 2*N, prefer N + N*NB)
					dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to VT, zeroing out below it
					dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					if ( N > 1 ) {
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, VT, svt1, svt2, offsetVT + svt1 );
					}
					// Generate Q in A (Workspace: need 2*N, prefer N + N*NB)
					dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + N;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in VT (Workspace: need 4*N, prefer 3*N + 2*N*NB)
					dgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Multiply Q in A by left vectors bidiagonalizing R (Workspace: need 3*N + M, prefer 3*N + M*NB)
					dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, A, sa1, sa2, offsetA, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing R in VT (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
					dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
					iwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in A and computing right singular vectors of A in VT (Workspace: need BDSPAC)
					info = dbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
				}
			} else if ( wntus ) {
				if ( wntvn ) {
					// Path 4 (M much larger than N, JOBU='S', JOBVT='N') N left singular vectors to be computed in U and no right singular vectors to be computed
					if ( lwork >= N * N + Math.max( 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						ir = 0;
						if ( lwork >= wrkbl + lda * N ) {
							// WORK(IR) is LDA by N
							ldwrkr = lda;
						} else {
							// WORK(IR) is N by N
							ldwrkr = N;
						}
						itau = ir + ldwrkr * N;
						iwork = itau + N;
						// Compute A=Q*R (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IR), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + 1 );
						// Generate Q in A (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left vectors bidiagonalizing R in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (Workspace: need N*N + BDSPAC)
						info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in U (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir, 0.0, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need 2*N, prefer N + N*NB)
						dorgqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left vectors bidiagonalizing R (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntvo ) {
					// Path 5 (M much larger than N, JOBU='S', JOBVT='O') N left singular vectors to be computed in U and N right singular vectors to be overwritten on A
					if ( lwork >= 2 * N * N + Math.max( 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + 2 * lda * N ) {
							// WORK(IU) is LDA by N and WORK(IR) is LDA by N
							ldwrku = lda;
							ir = iu + ldwrku * N;
							ldwrkr = lda;
						} else if ( lwork >= wrkbl + ( lda + N ) * N ) {
							// WORK(IU) is LDA by N and WORK(IR) is N by N
							ldwrku = lda;
							ir = iu + ldwrku * N;
							ldwrkr = N;
						} else {
							// WORK(IU) is N by N and WORK(IR) is N by N
							ldwrku = N;
							ir = iu + ldwrku * N;
							ldwrkr = N;
						}
						itau = ir + ldwrkr * N;
						iwork = itau + N;
						// Compute A=Q*R (Workspace: need 2*N*N + 2*N, prefer 2*N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + 1 );
						// Generate Q in A (Workspace: need 2*N*N + 2*N, prefer 2*N*N + N + N*NB)
						dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to WORK(IR) (Workspace: need 2*N*N + 4*N, prefer 2*N*N+3*N+2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate left bidiagonalizing vectors in WORK(IU) (Workspace: need 2*N*N + 4*N, prefer 2*N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (Workspace: need 2*N*N + 4*N-1, prefer 2*N*N+3*N+(N-1)*NB)
						dorgbr( 'apply-P', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in WORK(IR) (Workspace: need 2*N*N + BDSPAC)
						info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, WORK, 1, ldwrku, iu, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in A by left singular vectors of R in WORK(IU), storing result in U (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu, 0.0, U, su1, su2, offsetU );
						// Copy right singular vectors of R to A (Workspace: need N*N)
						dlacpy( 'all', N, N, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need 2*N, prefer N + N*NB)
						dorgqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left vectors bidiagonalizing R (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right vectors bidiagonalizing R in A (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
						dorgbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntvas ) {
					// Path 6 (M much larger than N, JOBU='S', JOBVT='S' or 'A') N left singular vectors to be computed in U and N right singular vectors to be computed in VT
					if ( lwork >= N * N + Math.max( 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + lda * N ) {
							// WORK(IU) is LDA by N
							ldwrku = lda;
						} else {
							// WORK(IU) is N by N
							ldwrku = N;
						}
						itau = iu + ldwrku * N;
						iwork = itau + N;
						// Compute A=Q*R (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + 1 );
						// Generate Q in A (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dorgqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to VT (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );
						// Generate left bidiagonalizing vectors in WORK(IU) (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (Workspace: need N*N + 4*N-1, prefer N*N+3*N+(N-1)*NB)
						dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in VT (Workspace: need N*N + BDSPAC)
						info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, WORK, 1, ldwrku, iu, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in A by left singular vectors of R in WORK(IU), storing result in U (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu, 0.0, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need 2*N, prefer N + N*NB)
						dorgqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to VT, zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, VT, svt1, svt2, offsetVT + svt1 );
						}
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in VT (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in VT (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
						dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				}
			} else if ( wntua ) {
				if ( wntvn ) {
					// Path 7 (M much larger than N, JOBU='A', JOBVT='N') M left singular vectors to be computed in U and no right singular vectors to be computed
					if ( lwork >= N * N + Math.max( N + M, 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						ir = 0;
						if ( lwork >= wrkbl + lda * N ) {
							// WORK(IR) is LDA by N
							ldwrkr = lda;
						} else {
							// WORK(IR) is N by N
							ldwrkr = N;
						}
						itau = ir + ldwrkr * N;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Copy R to WORK(IR), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + 1 );
						// Generate Q in U (Workspace: need N*N + N + M, prefer N*N + N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (Workspace: need N*N + BDSPAC)
						info = dbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in U by left singular vectors of R in WORK(IR), storing result in A (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WORK, 1, ldwrkr, ir, 0.0, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need N + M, prefer N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in A (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntvo ) {
					// Path 8 (M much larger than N, JOBU='A', JOBVT='O') M left singular vectors to be computed in U and N right singular vectors to be overwritten on A
					if ( lwork >= 2 * N * N + Math.max( N + M, 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + 2 * lda * N ) {
							// WORK(IU) is LDA by N and WORK(IR) is LDA by N
							ldwrku = lda;
							ir = iu + ldwrku * N;
							ldwrkr = lda;
						} else if ( lwork >= wrkbl + ( lda + N ) * N ) {
							// WORK(IU) is LDA by N and WORK(IR) is N by N
							ldwrku = lda;
							ir = iu + ldwrku * N;
							ldwrkr = N;
						} else {
							// WORK(IU) is N by N and WORK(IR) is N by N
							ldwrku = N;
							ir = iu + ldwrku * N;
							ldwrkr = N;
						}
						itau = ir + ldwrkr * N;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N*N + 2*N, prefer 2*N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need 2*N*N + N + M, prefer 2*N*N + N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + 1 );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to WORK(IR) (Workspace: need 2*N*N + 4*N, prefer 2*N*N+3*N+2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate left bidiagonalizing vectors in WORK(IU) (Workspace: need 2*N*N + 4*N, prefer 2*N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (Workspace: need 2*N*N + 4*N-1, prefer 2*N*N+3*N+(N-1)*NB)
						dorgbr( 'apply-P', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in WORK(IR) (Workspace: need 2*N*N + BDSPAC)
						info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, WORK, 1, ldwrku, iu, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in U by left singular vectors of R in WORK(IU), storing result in A (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WORK, 1, ldwrku, iu, 0.0, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Copy right singular vectors of R from WORK(IR) to A
						dlacpy( 'all', N, N, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need N + M, prefer N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in A (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in A (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
						dorgbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntvas ) {
					// Path 9 (M much larger than N, JOBU='A', JOBVT='S' or 'A') M left singular vectors to be computed in U and N right singular vectors to be computed in VT
					if ( lwork >= N * N + Math.max( N + M, 4 * N, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + lda * N ) {
							// WORK(IU) is LDA by N
							ldwrku = lda;
						} else {
							// WORK(IU) is N by N
							ldwrku = N;
						}
						itau = iu + ldwrku * N;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need N*N + 2*N, prefer N*N + N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need N*N + N + M, prefer N*N + N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + 1 );
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to VT (Workspace: need N*N + 4*N, prefer N*N + 3*N + 2*N*NB)
						dgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );
						// Generate left bidiagonalizing vectors in WORK(IU) (Workspace: need N*N + 4*N, prefer N*N + 3*N + N*NB)
						dorgbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (Workspace: need N*N + 4*N-1, prefer N*N+3*N+(N-1)*NB)
						dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in VT (Workspace: need N*N + BDSPAC)
						info = dbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, WORK, 1, ldwrku, iu, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply Q in U by left singular vectors of R in WORK(IU), storing result in A (Workspace: need N*N)
						dgemm( 'no-transpose', 'no-transpose', M, N, N, 1.0, U, su1, su2, offsetU, WORK, 1, ldwrku, iu, 0.0, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (Workspace: need 2*N, prefer N + N*NB)
						dgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (Workspace: need N + M, prefer N + M*NB)
						dorgqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R from A to VT, zeroing out below it
						dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						if ( N > 1 ) {
							dlaset( 'lower', N - 1, N - 1, 0.0, 0.0, VT, svt1, svt2, offsetVT + svt1 );
						}
						ie = itau;
						itauq = ie + N;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in VT (Workspace: need 4*N, prefer 3*N + 2*N*NB)
						dgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in VT (Workspace: need 3*N + M, prefer 3*N + M*NB)
						dormbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
						dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				}
			}
		} else {
			// M .LT. MNTHR
			// Path 10 (M at least N, but not much larger) Reduce to bidiagonal form without QR decomposition
			ie = 0;
			itauq = ie + N;
			itaup = itauq + N;
			iwork = itaup + N;
			// Bidiagonalize A (Workspace: need 3*N + M, prefer 3*N + (M + N)*NB)
			dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
			if ( wntuas ) {
				// If left singular vectors desired in U, copy result to U and generate left bidiagonalizing vectors in U (Workspace: need 3*N + NCU, prefer 3*N + NCU*NB)
				dlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				if ( wntus ) {
					ncu = N;
				}
				if ( wntua ) {
					ncu = M;
				}
				dorgbr( 'apply-Q', M, ncu, N, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvas ) {
				// If right singular vectors desired in VT, copy result to VT and generate right bidiagonalizing vectors in VT (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
				dlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				dorgbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
			}
			if ( wntuo ) {
				// If left singular vectors desired in A, generate left bidiagonalizing vectors in A (Workspace: need 4*N, prefer 3*N + N*NB)
				dorgbr( 'apply-Q', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvo ) {
				// If right singular vectors desired in A, generate right bidiagonalizing vectors in A (Workspace: need 4*N-1, prefer 3*N + (N-1)*NB)
				dorgbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
			}
			iwork = ie + N;
			if ( wntuas || wntuo ) {
				nru = M;
			}
			if ( wntun ) {
				nru = 0;
			}
			if ( wntvas || wntvo ) {
				ncvt = N;
			}
			if ( wntvn ) {
				ncvt = 0;
			}
			if ( ( !wntuo ) && ( !wntvo ) ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in VT (Workspace: need BDSPAC)
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
			} else if ( ( !wntuo ) && wntvo ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in A (Workspace: need BDSPAC)
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
			} else {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in A and computing right singular vectors in VT (Workspace: need BDSPAC)
				info = dbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
			}
		}
	} else {
		// A has more columns than rows. If A has sufficiently more columns than rows, first reduce using the LQ decomposition (if sufficient workspace available)
		if ( N >= mnthr ) {
			if ( wntvn ) {
				// Path 1t(N much larger than M, JOBVT='N') No right singular vectors to be computed
				itau = 0;
				iwork = itau + M;
				// Compute A=L*Q (Workspace: need 2*M, prefer M + M*NB)
				dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
				// Zero out above L
				dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
				ie = 0;
				itauq = ie + M;
				itaup = itauq + M;
				iwork = itaup + M;
				// Bidiagonalize L in A (Workspace: need 4*M, prefer 3*M + 2*M*NB)
				dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
				if ( wntuo || wntuas ) {
					// If left singular vectors desired, generate Q (Workspace: need 4*M, prefer 3*M + M*NB)
					dorgbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
				}
				iwork = ie + M;
				nru = 0;
				if ( wntuo || wntuas ) {
					nru = M;
				}
				// Perform bidiagonal QR iteration, computing left singular vectors of A in A if desired (Workspace: need BDSPAC)
				info = dbdsqr( 'upper', M, 0, nru, 0, s, strideS, offsetS, WORK, 1, ie, DUM, 1, 1, 0, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
				// If left singular vectors desired in U, copy them there
				if ( wntuas ) {
					dlacpy( 'all', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				}
			} else if ( wntvo && wntun ) {
				// Path 2t(N much larger than M, JOBU='N', JOBVT='O') M right singular vectors to be overwritten on A and no left singular vectors to be computed
				if ( lwork >= M * M + Math.max( 4 * M, bdspac ) ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N + M ) + lda * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N + M ) + M * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is M by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = M;
					} else {
						// WORK(IU) is M by CHUNK and WORK(IR) is M by M
						ldwrku = M;
						chunk = Math.trunc( ( lwork - M * M - M ) / M );
						ldwrkr = M;
					}
					itau = ir + ldwrkr * M;
					iwork = itau + M;
					// Compute A=L*Q (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
					dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to WORK(IR) and zero out above it
					dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
					dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + ldwrkr );
					// Generate Q in A (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
					dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + M;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in WORK(IR) (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
					dgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing L (Workspace: need M*M + 4*M-1, prefer M*M + 3*M + (M-1)*NB)
					dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
					iwork = ie + M;
					// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (Workspace: need M*M + BDSPAC)
					info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
					iu = ie + M;
					// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in WORK(IU) and copying to A (Workspace: need M*M + 2*M, prefer M*M + M*N + M)
					for ( i = 0; i < N; i += chunk ) {
						blk = Math.min( N - i, chunk );
						dgemm( 'no-transpose', 'no-transpose', M, blk, M, 1.0, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + ( i * sa2 ), 0.0, WORK, 1, ldwrku, iu );
						dlacpy( 'all', M, blk, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa2 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					ie = 0;
					itauq = ie + M;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize A (Workspace: need 3*M + N, prefer 3*M + (M + N)*NB)
					dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing A (Workspace: need 4*M, prefer 3*M + M*NB)
					dorgbr( 'apply-P', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
					iwork = ie + M;
					// Perform bidiagonal QR iteration, computing right singular vectors of A in A (Workspace: need BDSPAC)
					info = dbdsqr( 'lower', M, N, 0, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
				}
			} else if ( wntvo && wntuas ) {
				// Path 3t(N much larger than M, JOBU='S' or 'A', JOBVT='O') M right singular vectors to be overwritten on A and M left singular vectors to be computed in U
				if ( lwork >= M * M + Math.max( 4 * M, bdspac ) ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N + M ) + lda * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N + M ) + M * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is M by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = M;
					} else {
						// WORK(IU) is M by CHUNK and WORK(IR) is M by M
						ldwrku = M;
						chunk = Math.trunc( ( lwork - M * M - M ) / M );
						ldwrkr = M;
					}
					itau = ir + ldwrkr * M;
					iwork = itau + M;
					// Compute A=L*Q (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
					dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to U, zeroing about above it
					dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, U, su1, su2, offsetU + su2 );
					// Generate Q in A (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
					dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + M;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in U, copying result to WORK(IR) (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
					dgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					dlacpy( 'upper', M, M, U, su1, su2, offsetU, WORK, 1, ldwrkr, ir );
					// Generate right vectors bidiagonalizing L in WORK(IR) (Workspace: need M*M + 4*M-1, prefer M*M + 3*M + (M-1)*NB)
					dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing L in U (Workspace: need M*M + 4*M, prefer M*M + 3*M + M*NB)
					dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
					iwork = ie + M;
					// Perform bidiagonal QR iteration, computing left singular vectors of L in U, and computing right singular vectors of L in WORK(IR) (Workspace: need M*M + BDSPAC)
					info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					iu = ie + M;
					// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in WORK(IU) and copying to A (Workspace: need M*M + 2*M, prefer M*M + M*N + M))
					for ( i = 0; i < N; i += chunk ) {
						blk = Math.min( N - i, chunk );
						dgemm( 'no-transpose', 'no-transpose', M, blk, M, 1.0, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + ( i * sa2 ), 0.0, WORK, 1, ldwrku, iu );
						dlacpy( 'all', M, blk, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa2 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					itau = 0;
					iwork = itau + M;
					// Compute A=L*Q (Workspace: need 2*M, prefer M + M*NB)
					dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to U, zeroing out above it
					dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, U, su1, su2, offsetU + su2 );
					// Generate Q in A (Workspace: need 2*M, prefer M + M*NB)
					dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = itau;
					itauq = ie + M;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in U (Workspace: need 4*M, prefer 3*M + 2*M*NB)
					dgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Multiply right vectors bidiagonalizing L by Q in A (Workspace: need 3*M + N, prefer 3*M + N*NB)
					dormbr( 'apply-P', 'left', 'transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, A, sa1, sa2, offsetA, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing L in U (Workspace: need 4*M, prefer 3*M + M*NB)
					dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
					iwork = ie + M;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (Workspace: need BDSPAC)
					info = dbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
				}
			} else if ( wntvs ) {
				if ( wntun ) {
					// Path 4t(N much larger than M, JOBU='N', JOBVT='S') M right singular vectors to be computed in VT and no left singular vectors to be computed
					if ( lwork >= M * M + Math.max( 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						ir = 0;
						if ( lwork >= wrkbl + lda * M ) {
							// WORK(IR) is LDA by M
							ldwrkr = lda;
						} else {
							// WORK(IR) is M by M
							ldwrkr = M;
						}
						itau = ir + ldwrkr * M;
						iwork = itau + M;
						// Compute A=L*Q (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IR), zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + ldwrkr );
						// Generate Q in A (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IR) (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate right vectors bidiagonalizing L in WORK(IR) (Workspace: need M*M + 4*M, prefer M*M + 3*M + (M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (Workspace: need M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in VT (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy result to VT
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need 2*M, prefer M + M*NB)
						dorglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right vectors bidiagonalizing L by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, 0, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntuo ) {
					// Path 5t(N much larger than M, JOBU='O', JOBVT='S') M right singular vectors to be computed in VT and M left singular vectors to be overwritten on A
					if ( lwork >= 2 * M * M + Math.max( 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + 2 * lda * M ) {
							// WORK(IU) is LDA by M and WORK(IR) is LDA by M
							ldwrku = lda;
							ir = iu + ldwrku * M;
							ldwrkr = lda;
						} else if ( lwork >= wrkbl + ( lda + M ) * M ) {
							// WORK(IU) is LDA by M and WORK(IR) is M by M
							ldwrku = lda;
							ir = iu + ldwrku * M;
							ldwrkr = M;
						} else {
							// WORK(IU) is M by M and WORK(IR) is M by M
							ldwrku = M;
							ir = iu + ldwrku * M;
							ldwrkr = M;
						}
						itau = ir + ldwrkr * M;
						iwork = itau + M;
						// Compute A=L*Q (Workspace: need 2*M*M + 2*M, prefer 2*M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out below it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + ldwrku );
						// Generate Q in A (Workspace: need 2*M*M + 2*M, prefer 2*M*M + M + M*NB)
						dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to WORK(IR) (Workspace: need 2*M*M + 4*M, prefer 2*M*M+3*M+2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate right bidiagonalizing vectors in WORK(IU) (Workspace: need 2*M*M + 4*M-1, prefer 2*M*M+3*M+(M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (Workspace: need 2*M*M + 4*M, prefer 2*M*M + 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in WORK(IR) and computing right singular vectors of L in WORK(IU) (Workspace: need 2*M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IU) by Q in A, storing result in VT (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );
						// Copy left singular vectors of L to A (Workspace: need M*M)
						dlacpy( 'all', M, M, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need 2*M, prefer M + M*NB)
						dorglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right vectors bidiagonalizing L by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors of L in A (Workspace: need 4*M, prefer 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, compute left singular vectors of A in A and compute right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntuas ) {
					// Path 6t(N much larger than M, JOBU='S' or 'A', JOBVT='S') M right singular vectors to be computed in VT and M left singular vectors to be computed in U
					if ( lwork >= M * M + Math.max( 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + lda * M ) {
							// WORK(IU) is LDA by N
							ldwrku = lda;
						} else {
							// WORK(IU) is LDA by M
							ldwrku = M;
						}
						itau = iu + ldwrku * M;
						iwork = itau + M;
						// Compute A=L*Q (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + ldwrku );
						// Generate Q in A (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dorglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to U (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, U, su1, su2, offsetU );
						// Generate right bidiagonalizing vectors in WORK(IU) (Workspace: need M*M + 4*M-1, prefer M*M+3*M+(M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (Workspace: need M*M + 4*M, prefer M*M + 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in U and computing right singular vectors of L in WORK(IU) (Workspace: need M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrku, iu, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IU) by Q in A, storing result in VT (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA, 0.0, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need 2*M, prefer M + M*NB)
						dorglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to U, zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, U, su1, su2, offsetU + su2 );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in U (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in U by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (Workspace: need 4*M, prefer 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				}
			} else if ( wntva ) {
				if ( wntun ) {
					// Path 7t(N much larger than M, JOBU='N', JOBVT='A') N right singular vectors to be computed in VT and no left singular vectors to be computed
					if ( lwork >= M * M + Math.max( N + M, 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						ir = 0;
						if ( lwork >= wrkbl + lda * M ) {
							// WORK(IR) is LDA by M
							ldwrkr = lda;
						} else {
							// WORK(IR) is M by M
							ldwrkr = M;
						}
						itau = ir + ldwrkr * M;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Copy L to WORK(IR), zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrkr, ir + ldwrkr );
						// Generate Q in VT (Workspace: need M*M + M + N, prefer M*M + M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IR) (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (Workspace: need M*M + 4*M-1, prefer M*M+3*M+(M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (Workspace: need M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IR) by Q in VT, storing result in A (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrkr, ir, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need M + N, prefer M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in A by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, 0, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, DUM, 1, 1, 0, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntuo ) {
					// Path 8t(N much larger than M, JOBU='O', JOBVT='A') N right singular vectors to be computed in VT and M left singular vectors to be overwritten on A
					if ( lwork >= 2 * M * M + Math.max( N + M, 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + 2 * lda * M ) {
							// WORK(IU) is LDA by M and WORK(IR) is LDA by M
							ldwrku = lda;
							ir = iu + ldwrku * M;
							ldwrkr = lda;
						} else if ( lwork >= wrkbl + ( lda + M ) * M ) {
							// WORK(IU) is LDA by M and WORK(IR) is M by M
							ldwrku = lda;
							ir = iu + ldwrku * M;
							ldwrkr = M;
						} else {
							// WORK(IU) is M by M and WORK(IR) is M by M
							ldwrku = M;
							ir = iu + ldwrku * M;
							ldwrkr = M;
						}
						itau = ir + ldwrkr * M;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M*M + 2*M, prefer 2*M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need 2*M*M + M + N, prefer 2*M*M + M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + ldwrku );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to WORK(IR) (Workspace: need 2*M*M + 4*M, prefer 2*M*M+3*M+2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate right bidiagonalizing vectors in WORK(IU) (Workspace: need 2*M*M + 4*M-1, prefer 2*M*M+3*M+(M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (Workspace: need 2*M*M + 4*M, prefer 2*M*M + 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in WORK(IR) and computing right singular vectors of L in WORK(IU) (Workspace: need 2*M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IU) by Q in VT, storing result in A (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Copy left singular vectors of A from WORK(IR) to A
						dlacpy( 'all', M, M, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need M + N, prefer M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in A by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in A (Workspace: need 4*M, prefer 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in A and computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				} else if ( wntuas ) {
					// Path 9t(N much larger than M, JOBU='S' or 'A', JOBVT='A') N right singular vectors to be computed in VT and M left singular vectors to be computed in U
					if ( lwork >= M * M + Math.max( N + M, 4 * M, bdspac ) ) {
						// Sufficient workspace for a fast algorithm
						iu = 0;
						if ( lwork >= wrkbl + lda * M ) {
							// WORK(IU) is LDA by M
							ldwrku = lda;
						} else {
							// WORK(IU) is M by M
							ldwrku = M;
						}
						itau = iu + ldwrku * M;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need M*M + 2*M, prefer M*M + M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need M*M + M + N, prefer M*M + M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, WORK, 1, ldwrku, iu + ldwrku );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to U (Workspace: need M*M + 4*M, prefer M*M + 3*M + 2*M*NB)
						dgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						dlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, U, su1, su2, offsetU );
						// Generate right bidiagonalizing vectors in WORK(IU) (Workspace: need M*M + 4*M, prefer M*M + 3*M + (M-1)*NB)
						dorgbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (Workspace: need M*M + 4*M, prefer M*M + 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in U and computing right singular vectors of L in WORK(IU) (Workspace: need M*M + BDSPAC)
						info = dbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, WORK, 1, ie, WORK, 1, ldwrku, iu, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
						// Multiply right singular vectors of L in WORK(IU) by Q in VT, storing result in A (Workspace: need M*M)
						dgemm( 'no-transpose', 'no-transpose', M, N, M, 1.0, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, 0.0, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						dlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (Workspace: need 2*M, prefer M + M*NB)
						dgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (Workspace: need M + N, prefer M + N*NB)
						dorglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to U, zeroing out above it
						dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						dlaset( 'upper', M - 1, M - 1, 0.0, 0.0, U, su1, su2, offsetU + su2 );
						ie = itau;
						itauq = ie + M;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in U (Workspace: need 4*M, prefer 3*M + 2*M*NB)
						dgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in U by Q in VT (Workspace: need 3*M + N, prefer 3*M + N*NB)
						dormbr( 'apply-P', 'left', 'transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (Workspace: need 4*M, prefer 3*M + M*NB)
						dorgbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						iwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (Workspace: need BDSPAC)
						info = dbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
					}
				}
			}
		} else {
			// N .LT. MNTHR
			// Path 10t(N greater than M, but not much larger) Reduce to bidiagonal form without LQ decomposition
			ie = 0;
			itauq = ie + M;
			itaup = itauq + M;
			iwork = itaup + M;
			// Bidiagonalize A (Workspace: need 3*M + N, prefer 3*M + (M + N)*NB)
			dgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, WORK, 1, ie, WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
			if ( wntuas ) {
				// If left singular vectors desired in U, copy result to U and generate left bidiagonalizing vectors in U (Workspace: need 4*M-1, prefer 3*M + (M-1)*NB)
				dlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				dorgbr( 'apply-Q', M, M, N, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvas ) {
				// If right singular vectors desired in VT, copy result to VT and generate right bidiagonalizing vectors in VT (Workspace: need 3*M + NRVT, prefer 3*M + NRVT*NB)
				dlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				if ( wntva ) {
					nrvt = N;
				}
				if ( wntvs ) {
					nrvt = M;
				}
				dorgbr( 'apply-P', nrvt, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
			}
			if ( wntuo ) {
				// If left singular vectors desired in A, generate left bidiagonalizing vectors in A (Workspace: need 4*M-1, prefer 3*M + (M-1)*NB)
				dorgbr( 'apply-Q', M, M, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvo ) {
				// If right singular vectors desired in A, generate right bidiagonalizing vectors in A (Workspace: need 4*M, prefer 3*M + M*NB)
				dorgbr( 'apply-P', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
			}
			iwork = ie + M;
			if ( wntuas || wntuo ) {
				nru = M;
			}
			if ( wntun ) {
				nru = 0;
			}
			if ( wntvas || wntvo ) {
				ncvt = N;
			}
			if ( wntvn ) {
				ncvt = 0;
			}
			if ( ( !wntuo ) && ( !wntvo ) ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in VT (Workspace: need BDSPAC)
				info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
			} else if ( ( !wntuo ) && wntvo ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in A (Workspace: need BDSPAC)
				info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, A, sa1, sa2, offsetA, U, su1, su2, offsetU, DUM, 1, 1, 0, WORK, 1, iwork );
			} else {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in A and computing right singular vectors in VT (Workspace: need BDSPAC)
				info = dbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, WORK, 1, ie, VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, DUM, 1, 1, 0, WORK, 1, iwork );
			}
		}
	}
	// If DBDSQR failed to converge, copy unconverged superdiagonals to WORK( 2:MINMN ) (0-based WORK[ 1 : minmn-1 ])
	if ( info !== 0 ) {
		if ( ie > 1 ) {
			for ( i = 1; i <= minmn - 1; i++ ) {
				WORK[ i ] = WORK[ i + ie - 1 ];
			}
		}
		if ( ie < 1 ) {
			for ( i = minmn - 1; i >= 1; i-- ) {
				WORK[ i ] = WORK[ i + ie - 1 ];
			}
		}
	}

	// Undo scaling if necessary
	if ( iscl === 1 ) {
		if ( anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, s, strideS, minmn * strideS, offsetS );
		}
		if ( info !== 0 && anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn - 1, 1, WORK, 1, minmn, 1 );
		}
		if ( anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, s, strideS, minmn * strideS, offsetS );
		}
		if ( info !== 0 && anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn - 1, 1, WORK, 1, minmn, 1 );
		}
	}

	return info;
}


// EXPORTS //

export default dgesvd;
export { computeMinWorkSize, computeWorkSize };
