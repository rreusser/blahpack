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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlascl from '../../dlascl/lib/base.js';
import zbdsqr from '../../zbdsqr/lib/base.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zgelqf from '../../zgelqf/lib/base.js';
import zgeqrf from '../../zgeqrf/lib/base.js';
import zlacpy from '../../zlacpy/lib/base.js';
import zlange from '../../zlange/lib/base.js';
import zlascl from '../../zlascl/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zungbr from '../../zungbr/lib/base.js';
import zunglq from '../../zunglq/lib/base.js';
import zungqr from '../../zungqr/lib/base.js';
import zunmbr from '../../zunmbr/lib/base.js';
import zgemm from '../../../../blas/base/zgemm/lib/base.js';
import ilaenv from '../../ilaenv/lib/base.js';


// VARIABLES //

// The reference's `JOBU // JOBVT`, the OPTS of its MNTHR query, by JS option:
/** @type {Object<string, Object<string, string>>} */
const JOBUVT = {
	'all-columns': {
		'all-rows': 'AA',
		'economy': 'AS',
		'overwrite': 'AO',
		'none': 'AN'
	},
	'economy': {
		'all-rows': 'SA',
		'economy': 'SS',
		'overwrite': 'SO',
		'none': 'SN'
	},
	'overwrite': {
		'all-rows': 'OA',
		'economy': 'OS',
		'overwrite': 'OO',
		'none': 'ON'
	},
	'none': {
		'all-rows': 'NA',
		'economy': 'NS',
		'overwrite': 'NO',
		'none': 'NN'
	}
};
const CZERO = new Complex128( 0.0, 0.0 );
const CONE = new Complex128( 1.0, 0.0 );


// FUNCTIONS //

/**
* Returns the optimal workspace that ZGEQRF reports for an M-by-N matrix (its LWORK = -1 query).
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
	return N * ilaenv( 1, 'ZGEQRF', ' ', M, N, -1, -1 );
}

/**
* Returns the optimal workspace that ZGELQF reports for an M-by-N matrix (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {PositiveInteger} optimal workspace size
*/
function lworkGelqf( M, N ) {
	return M * ilaenv( 1, 'ZGELQF', ' ', M, N, -1, -1 );
}

/**
* Returns the optimal workspace that ZUNGQR reports (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q
* @param {NonNegativeInteger} N - number of columns of Q
* @param {NonNegativeInteger} K - number of reflectors
* @returns {PositiveInteger} optimal workspace size
*/
function lworkUngqr( M, N, K ) {
	return Math.max( 1, N ) * ilaenv( 1, 'ZUNGQR', ' ', M, N, K, -1 );
}

/**
* Returns the optimal workspace that ZUNGLQ reports (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows of Q
* @param {NonNegativeInteger} N - number of columns of Q
* @param {NonNegativeInteger} K - number of reflectors
* @returns {PositiveInteger} optimal workspace size
*/
function lworkUnglq( M, N, K ) {
	return Math.max( 1, M ) * ilaenv( 1, 'ZUNGLQ', ' ', M, N, K, -1 );
}

/**
* Returns the optimal workspace that ZGEBRD reports for an M-by-N matrix (its LWORK = -1 query).
*
* @private
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @returns {PositiveInteger} optimal workspace size
*/
function lworkGebrd( M, N ) {
	return ( M + N ) * Math.max( 1, ilaenv( 1, 'ZGEBRD', ' ', M, N, -1, -1 ) );
}

/**
* Returns the optimal workspace that ZUNGBR reports (its LWORK = -1 query, which queries ZUNGQR or ZUNGLQ).
*
* @private
* @param {string} vect - `'apply-Q'` or `'apply-P'`
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of reflectors
* @returns {PositiveInteger} optimal workspace size
*/
function lworkUngbr( vect, M, N, K ) {
	let lwkopt = 1;
	if ( vect === 'apply-Q' ) {
		if ( M >= K ) {
			lwkopt = lworkUngqr( M, N, K );
		} else if ( M > 1 ) {
			lwkopt = lworkUngqr( M - 1, M - 1, M - 1 );
		}
	} else if ( K < N ) {
		lwkopt = lworkUnglq( M, N, K );
	} else if ( N > 1 ) {
		lwkopt = lworkUnglq( N - 1, N - 1, N - 1 );
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
* @returns {{minwrk: number, maxwrk: number, mnthr: number, wrkbl: number}} `minwrk`, `maxwrk`, `mnthr`, `wrkbl`
*/
function workspace( jobu, jobvt, M, N ) {
	let lwkGebrd, lwkGelqf, lwkGeqrf, lwkUngbrP, lwkUngbrQ, lwkUnglqM, lwkUnglqN, lwkUngqrM, lwkUngqrN;
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
		// Space needed for ZBDSQR is BDSPAC = 5*N
		mnthr = ilaenv( 6, 'ZGESVD', JOBUVT[ jobu ][ jobvt ], M, N, 0, 0 );
		// Compute space needed for ZGEQRF
		lwkGeqrf = lworkGeqrf( M, N );
		// Compute space needed for ZUNGQR
		lwkUngqrN = lworkUngqr( M, N, N );
		lwkUngqrM = lworkUngqr( M, M, N );
		// Compute space needed for ZGEBRD
		lwkGebrd = lworkGebrd( N, N );
		// Compute space needed for ZUNGBR
		lwkUngbrP = lworkUngbr( 'apply-P', N, N, N );
		lwkUngbrQ = lworkUngbr( 'apply-Q', N, N, N );
		if ( M >= mnthr ) {
			if ( wntun ) {
				// Path 1 (M much larger than N, JOBU='N')
				maxwrk = N + lwkGeqrf;
				maxwrk = Math.max( maxwrk, 2 * N + lwkGebrd );
				if ( wntvo || wntvas ) {
					maxwrk = Math.max( maxwrk, 2 * N + lwkUngbrP );
				}
				minwrk = 3 * N;
			} else if ( wntuo && wntvn ) {
				// Path 2 (M much larger than N, JOBU='O', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrN );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				maxwrk = Math.max( N * N + wrkbl, N * N + M * N );
				minwrk = 2 * N + M;
			} else if ( wntuo && wntvas ) {
				// Path 3 (M much larger than N, JOBU='O', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrN );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrP );
				maxwrk = Math.max( N * N + wrkbl, N * N + M * N );
				minwrk = 2 * N + M;
			} else if ( wntus && wntvn ) {
				// Path 4 (M much larger than N, JOBU='S', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrN );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				maxwrk = N * N + wrkbl;
				minwrk = 2 * N + M;
			} else if ( wntus && wntvo ) {
				// Path 5 (M much larger than N, JOBU='S', JOBVT='O')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrN );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrP );
				maxwrk = 2 * N * N + wrkbl;
				minwrk = 2 * N + M;
			} else if ( wntus && wntvas ) {
				// Path 6 (M much larger than N, JOBU='S', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrN );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrP );
				maxwrk = N * N + wrkbl;
				minwrk = 2 * N + M;
			} else if ( wntua && wntvn ) {
				// Path 7 (M much larger than N, JOBU='A', JOBVT='N')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrM );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				maxwrk = N * N + wrkbl;
				minwrk = 2 * N + M;
			} else if ( wntua && wntvo ) {
				// Path 8 (M much larger than N, JOBU='A', JOBVT='O')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrM );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrP );
				maxwrk = 2 * N * N + wrkbl;
				minwrk = 2 * N + M;
			} else if ( wntua && wntvas ) {
				// Path 9 (M much larger than N, JOBU='A', JOBVT='S' or 'A')
				wrkbl = N + lwkGeqrf;
				wrkbl = Math.max( wrkbl, N + lwkUngqrM );
				wrkbl = Math.max( wrkbl, 2 * N + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrQ );
				wrkbl = Math.max( wrkbl, 2 * N + lwkUngbrP );
				maxwrk = N * N + wrkbl;
				minwrk = 2 * N + M;
			}
		} else {
			// Path 10 (M at least N, but not much larger)
			lwkGebrd = lworkGebrd( M, N );
			maxwrk = 2 * N + lwkGebrd;
			if ( wntus || wntuo ) {
				lwkUngbrQ = lworkUngbr( 'apply-Q', M, N, N );
				maxwrk = Math.max( maxwrk, 2 * N + lwkUngbrQ );
			}
			if ( wntua ) {
				lwkUngbrQ = lworkUngbr( 'apply-Q', M, M, N );
				maxwrk = Math.max( maxwrk, 2 * N + lwkUngbrQ );
			}
			if ( !wntvn ) {
				maxwrk = Math.max( maxwrk, 2 * N + lwkUngbrP );
			}
			minwrk = 2 * N + M;
		}
	} else if ( minmn > 0 ) {
		// Space needed for ZBDSQR is BDSPAC = 5*M
		mnthr = ilaenv( 6, 'ZGESVD', JOBUVT[ jobu ][ jobvt ], M, N, 0, 0 );
		// Compute space needed for ZGELQF
		lwkGelqf = lworkGelqf( M, N );
		// Compute space needed for ZUNGLQ
		lwkUnglqN = lworkUnglq( N, N, M );
		lwkUnglqM = lworkUnglq( M, N, M );
		// Compute space needed for ZGEBRD
		lwkGebrd = lworkGebrd( M, M );
		// Compute space needed for ZUNGBR P
		lwkUngbrP = lworkUngbr( 'apply-P', M, M, M );
		// Compute space needed for ZUNGBR Q
		lwkUngbrQ = lworkUngbr( 'apply-Q', M, M, M );
		if ( N >= mnthr ) {
			if ( wntvn ) {
				// Path 1t(N much larger than M, JOBVT='N')
				maxwrk = M + lwkGelqf;
				maxwrk = Math.max( maxwrk, 2 * M + lwkGebrd );
				if ( wntuo || wntuas ) {
					maxwrk = Math.max( maxwrk, 2 * M + lwkUngbrQ );
				}
				minwrk = 3 * M;
			} else if ( wntvo && wntun ) {
				// Path 2t(N much larger than M, JOBU='N', JOBVT='O')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqM );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				maxwrk = Math.max( M * M + wrkbl, M * M + M * N );
				minwrk = 2 * M + N;
			} else if ( wntvo && wntuas ) {
				// Path 3t(N much larger than M, JOBU='S' or 'A', JOBVT='O')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqM );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrQ );
				maxwrk = Math.max( M * M + wrkbl, M * M + M * N );
				minwrk = 2 * M + N;
			} else if ( wntvs && wntun ) {
				// Path 4t(N much larger than M, JOBU='N', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqM );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				maxwrk = M * M + wrkbl;
				minwrk = 2 * M + N;
			} else if ( wntvs && wntuo ) {
				// Path 5t(N much larger than M, JOBU='O', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqM );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrQ );
				maxwrk = 2 * M * M + wrkbl;
				minwrk = 2 * M + N;
			} else if ( wntvs && wntuas ) {
				// Path 6t(N much larger than M, JOBU='S' or 'A', JOBVT='S')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqM );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrQ );
				maxwrk = M * M + wrkbl;
				minwrk = 2 * M + N;
			} else if ( wntva && wntun ) {
				// Path 7t(N much larger than M, JOBU='N', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqN );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				maxwrk = M * M + wrkbl;
				minwrk = 2 * M + N;
			} else if ( wntva && wntuo ) {
				// Path 8t(N much larger than M, JOBU='O', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqN );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrQ );
				maxwrk = 2 * M * M + wrkbl;
				minwrk = 2 * M + N;
			} else if ( wntva && wntuas ) {
				// Path 9t(N much larger than M, JOBU='S' or 'A', JOBVT='A')
				wrkbl = M + lwkGelqf;
				wrkbl = Math.max( wrkbl, M + lwkUnglqN );
				wrkbl = Math.max( wrkbl, 2 * M + lwkGebrd );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrP );
				wrkbl = Math.max( wrkbl, 2 * M + lwkUngbrQ );
				maxwrk = M * M + wrkbl;
				minwrk = 2 * M + N;
			}
		} else {
			// Path 10t(N greater than M, but not much larger)
			lwkGebrd = lworkGebrd( M, N );
			maxwrk = 2 * M + lwkGebrd;
			if ( wntvs || wntvo ) {
				// Compute space needed for ZUNGBR P
				lwkUngbrP = lworkUngbr( 'apply-P', M, N, M );
				maxwrk = Math.max( maxwrk, 2 * M + lwkUngbrP );
			}
			if ( wntva ) {
				lwkUngbrP = lworkUngbr( 'apply-P', N, N, M );
				maxwrk = Math.max( maxwrk, 2 * M + lwkUngbrP );
			}
			if ( !wntun ) {
				maxwrk = Math.max( maxwrk, 2 * M + lwkUngbrQ );
			}
			minwrk = 2 * M + N;
		}
	}
	maxwrk = Math.max( maxwrk, minwrk );
	maxwrk = Math.max( maxwrk, minwrk );
	return {
		'minwrk': minwrk,
		'maxwrk': maxwrk,
		'mnthr': mnthr,
		'wrkbl': wrkbl
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
* Computes the singular value decomposition (SVD) of a complex M-by-N matrix A, optionally computing the left and/or right singular vectors.
*
* The SVD is written `A = U * SIGMA * V^H`, where SIGMA is an M-by-N matrix which is zero except for its min(M,N) diagonal elements, U is an M-by-M unitary matrix, and V is an N-by-N unitary matrix. The diagonal elements of SIGMA are the singular values of A; they are real and non-negative, and are returned in descending order. The first min(M,N) columns of U and V are the left and right singular vectors of A.
*
* Like the reference, the routine picks its path from the workspace it is given: for M much larger than N (or N much larger than M) it reduces A by QR (LQ) first, and uses a work matrix for the fast variant only when `lwork` holds it.
*
* @private
* @param {('all-columns'|'economy'|'overwrite'|'none')} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {('all-rows'|'economy'|'overwrite'|'none')} jobvt - `'all-rows'`: all N rows of V^H returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} s - output array of singular values (length min(M,N))
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - starting index for s
* @param {Complex128Array} U - output matrix for left singular vectors
* @param {integer} strideU1 - stride of the first dimension of U
* @param {integer} strideU2 - stride of the second dimension of U
* @param {NonNegativeInteger} offsetU - starting index for U
* @param {Complex128Array} VT - output matrix for right singular vectors (V^H)
* @param {integer} strideVT1 - stride of the first dimension of VT
* @param {integer} strideVT2 - stride of the second dimension of VT
* @param {NonNegativeInteger} offsetVT - starting index for VT
* @param {Complex128Array} WORK - complex workspace of `lwork = WORK.length - offsetWork` elements (stride 1). The minimum is the reference's MINWRK, `computeMinWorkSize( jobu, jobvt, M, N )` (at most `max( 1, 2*min(M,N) + max(M,N) )`); `computeWorkSize( jobu, jobvt, M, N )` (the reference's MAXWRK) selects the fast QR/LQ paths and the callees' blocked code. Between the two, the routine chooses its path and block sizes from `lwork`, as the reference does from LWORK
* @param {integer} strideWork - stride for WORK (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {Float64Array} RWORK - real workspace of at least `5*min(M,N)` elements. If `info > 0`, `RWORK[ offsetRWork : offsetRWork+min(M,N)-1 ]` holds the unconverged superdiagonal
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @returns {integer} info - 0 if successful, >0 if zBDSQR did not converge
*/
function zgesvd( jobu, jobvt, M, N, A, strideA1, strideA2, offsetA, s, strideS, offsetS, U, strideU1, strideU2, offsetU, VT, strideVT1, strideVT2, offsetVT, WORK, strideWork, offsetWork, RWORK, strideRWork, offsetRWork ) {
	let blk = 0;
	let chunk = 0;
	let ie = 0;
	let ir = 0;
	let irwork = 0;
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

	// The reference sizes its work matrices with LDA (LDA*N, LDA*M); A here is addressed by strides, so use the smallest LDA the reference allows, max(1,M). The work matrices then depend on the workspace only, not on how A is stored.
	const lda = Math.max( 1, M );

	const DUM = new Float64Array( 1 );
	const CDUM = new Complex128Array( 1 );

	// Get machine constants
	const eps = dlamch( 'precision' );
	const smlnum = Math.sqrt( dlamch( 'safe-minimum' ) ) / eps;
	const bignum = 1.0 / smlnum;

	// Scale A if max element outside range [SMLNUM,BIGNUM]
	const anrm = zlange( 'max', M, N, A, sa1, sa2, offsetA, DUM, 1, 0 );
	iscl = 0;
	if ( anrm > 0.0 && anrm < smlnum ) {
		iscl = 1;
		zlascl( 'general', 0, 0, anrm, smlnum, M, N, A, sa1, sa2, offsetA );
	} else if ( anrm > bignum ) {
		iscl = 1;
		zlascl( 'general', 0, 0, anrm, bignum, M, N, A, sa1, sa2, offsetA );
	}

	if ( M >= N ) {
		// A has at least as many rows as columns. If A has sufficiently more rows than columns, first reduce using the QR decomposition (if sufficient workspace available)
		if ( M >= mnthr ) {
			if ( wntun ) {
				// Path 1 (M much larger than N, JOBU='N') No left singular vectors to be computed
				itau = 0;
				iwork = itau + N;
				// Compute A=Q*R (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: need 0)
				zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
				// Zero out below R
				if ( N > 1 ) {
					zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
				}
				ie = 0;
				itauq = 0;
				itaup = itauq + N;
				iwork = itaup + N;
				// Bidiagonalize R in A (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
				zgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
				ncvt = 0;
				if ( wntvo || wntvas ) {
					// If right singular vectors desired, generate P'. (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
					zungbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
					ncvt = N;
				}
				irwork = ie + N;
				// Perform bidiagonal QR iteration, computing right singular vectors of A in A if desired (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'upper', N, ncvt, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				// If right singular vectors desired in VT, copy them there
				if ( wntvas ) {
					zlacpy( 'all', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				}
			} else if ( wntuo && wntvn ) {
				// Path 2 (M much larger than N, JOBU='O', JOBVT='N') N left singular vectors to be overwritten on A and no right singular vectors to be computed
				if ( lwork >= N * N + 3 * N ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N ) + lda * N ) {
						// WORK(IU) is LDA by N, WORK(IR) is LDA by N
						ldwrku = lda;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N ) + N * N ) {
						// WORK(IU) is LDA by N, WORK(IR) is N by N
						ldwrku = lda;
						ldwrkr = N;
					} else {
						// WORK(IU) is LDWRKU by N, WORK(IR) is N by N
						ldwrku = Math.trunc( ( lwork - N * N ) / N );
						ldwrkr = N;
					}
					itau = ir + ldwrkr * N;
					iwork = itau + N;
					// Compute A=Q*R (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
					zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to WORK(IR) and zero out below it
					zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
					zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + 1 );
					// Generate Q in A (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
					zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
					zgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing R (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: need 0)
					zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
					irwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					iu = itauq;
					// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in WORK(IU) and copying to A (CWorkspace: need N*N+N, prefer N*N+M*N) (RWorkspace: 0)
					for ( i = 0; i < M; i += ldwrku ) {
						chunk = Math.min( M - i, ldwrku );
						zgemm( 'no-transpose', 'no-transpose', chunk, N, N, CONE, A, sa1, sa2, offsetA + ( i * sa1 ), WORK, 1, ldwrkr, ir, CZERO, WORK, 1, ldwrku, iu );
						zlacpy( 'all', chunk, N, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa1 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					ie = 0;
					itauq = 0;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize A (CWorkspace: need 2*N+M, prefer 2*N+(M+N)*NB) (RWorkspace: N)
					zgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing A (CWorkspace: need 3*N, prefer 2*N+N*NB) (RWorkspace: 0)
					zungbr( 'apply-Q', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
					irwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in A (CWorkspace: need 0) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				}
			} else if ( wntuo && wntvas ) {
				// Path 3 (M much larger than N, JOBU='O', JOBVT='S' or 'A') N left singular vectors to be overwritten on A and N right singular vectors to be computed in VT
				if ( lwork >= N * N + 3 * N ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N ) + lda * N ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by N
						ldwrku = lda;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N ) + N * N ) {
						// WORK(IU) is LDA by N and WORK(IR) is N by N
						ldwrku = lda;
						ldwrkr = N;
					} else {
						// WORK(IU) is LDWRKU by N and WORK(IR) is N by N
						ldwrku = Math.trunc( ( lwork - N * N ) / N );
						ldwrkr = N;
					}
					itau = ir + ldwrkr * N;
					iwork = itau + N;
					// Compute A=Q*R (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
					zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to VT, zeroing out below it
					zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					if ( N > 1 ) {
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, VT, svt1, svt2, offsetVT + svt1 );
					}
					// Generate Q in A (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
					zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in VT, copying result to WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
					zgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					zlacpy( 'lower', N, N, VT, svt1, svt2, offsetVT, WORK, 1, ldwrkr, ir );
					// Generate left vectors bidiagonalizing R in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: 0)
					zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing R in VT (CWorkspace: need N*N+3*N-1, prefer N*N+2*N+(N-1)*NB) (RWorkspace: 0)
					zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
					irwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) and computing right singular vectors of R in VT (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					iu = itauq;
					// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in WORK(IU) and copying to A (CWorkspace: need N*N+N, prefer N*N+M*N) (RWorkspace: 0)
					for ( i = 0; i < M; i += ldwrku ) {
						chunk = Math.min( M - i, ldwrku );
						zgemm( 'no-transpose', 'no-transpose', chunk, N, N, CONE, A, sa1, sa2, offsetA + ( i * sa1 ), WORK, 1, ldwrkr, ir, CZERO, WORK, 1, ldwrku, iu );
						zlacpy( 'all', chunk, N, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa1 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					itau = 0;
					iwork = itau + N;
					// Compute A=Q*R (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
					zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy R to VT, zeroing out below it
					zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					if ( N > 1 ) {
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, VT, svt1, svt2, offsetVT + svt1 );
					}
					// Generate Q in A (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
					zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + N;
					iwork = itaup + N;
					// Bidiagonalize R in VT (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: N)
					zgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Multiply Q in A by left vectors bidiagonalizing R (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
					zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, A, sa1, sa2, offsetA, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing R in VT (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
					zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
					irwork = ie + N;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in A and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				}
			} else if ( wntus ) {
				if ( wntvn ) {
					// Path 4 (M much larger than N, JOBU='S', JOBVT='N') N left singular vectors to be computed in U and no right singular vectors to be computed
					if ( lwork >= N * N + 3 * N ) {
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
						// Compute A=Q*R (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IR), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + 1 );
						// Generate Q in A (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left vectors bidiagonalizing R in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in A by left singular vectors of R in WORK(IR), storing result in U (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir, CZERO, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left vectors bidiagonalizing R (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntvo ) {
					// Path 5 (M much larger than N, JOBU='S', JOBVT='O') N left singular vectors to be computed in U and N right singular vectors to be overwritten on A
					if ( lwork >= 2 * N * N + 3 * N ) {
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
						// Compute A=Q*R (CWorkspace: need 2*N*N+2*N, prefer 2*N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + 1 );
						// Generate Q in A (CWorkspace: need 2*N*N+2*N, prefer 2*N*N+N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to WORK(IR) (CWorkspace: need   2*N*N+3*N, prefer 2*N*N+2*N+2*N*NB) (RWorkspace: need   N)
						zgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate left bidiagonalizing vectors in WORK(IU) (CWorkspace: need 2*N*N+3*N, prefer 2*N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (CWorkspace: need   2*N*N+3*N-1, prefer 2*N*N+2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in WORK(IR) (CWorkspace: need 2*N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, WORK, 1, ldwrku, iu, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in A by left singular vectors of R in WORK(IU), storing result in U (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu, CZERO, U, su1, su2, offsetU );
						// Copy right singular vectors of R to A (CWorkspace: need N*N) (RWorkspace: 0)
						zlacpy( 'all', N, N, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left vectors bidiagonalizing R (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right vectors bidiagonalizing R in A (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntvas ) {
					// Path 6 (M much larger than N, JOBU='S', JOBVT='S' or 'A') N left singular vectors to be computed in U and N right singular vectors to be computed in VT
					if ( lwork >= N * N + 3 * N ) {
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
						// Compute A=Q*R (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + 1 );
						// Generate Q in A (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to VT (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );
						// Generate left bidiagonalizing vectors in WORK(IU) (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (CWorkspace: need   N*N+3*N-1, prefer N*N+2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in VT (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, WORK, 1, ldwrku, iu, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in A by left singular vectors of R in WORK(IU), storing result in U (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu, CZERO, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zungqr( M, N, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to VT, zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, VT, svt1, svt2, offsetVT + svt1 );
						}
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in VT (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in VT (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				}
			} else if ( wntua ) {
				if ( wntvn ) {
					// Path 7 (M much larger than N, JOBU='A', JOBVT='N') M left singular vectors to be computed in U and no right singular vectors to be computed
					if ( lwork >= N * N + Math.max( N + M, 3 * N ) ) {
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
						// Compute A=Q*R, copying result to U (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Copy R to WORK(IR), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + 1 );
						// Generate Q in U (CWorkspace: need N*N+N+M, prefer N*N+N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IR) (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, 0, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in U by left singular vectors of R in WORK(IR), storing result in A (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, U, su1, su2, offsetU, WORK, 1, ldwrkr, ir, CZERO, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need N+M, prefer N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in A (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, 0, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntvo ) {
					// Path 8 (M much larger than N, JOBU='A', JOBVT='O') M left singular vectors to be computed in U and N right singular vectors to be overwritten on A
					if ( lwork >= 2 * N * N + Math.max( N + M, 3 * N ) ) {
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
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N*N+2*N, prefer 2*N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need 2*N*N+N+M, prefer 2*N*N+N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + 1 );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to WORK(IR) (CWorkspace: need   2*N*N+3*N, prefer 2*N*N+2*N+2*N*NB) (RWorkspace: need   N)
						zgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate left bidiagonalizing vectors in WORK(IU) (CWorkspace: need 2*N*N+3*N, prefer 2*N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (CWorkspace: need   2*N*N+3*N-1, prefer 2*N*N+2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in WORK(IR) (CWorkspace: need 2*N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, WORK, 1, ldwrku, iu, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in U by left singular vectors of R in WORK(IU), storing result in A (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, U, su1, su2, offsetU, WORK, 1, ldwrku, iu, CZERO, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Copy right singular vectors of R from WORK(IR) to A
						zlacpy( 'all', N, N, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need N+M, prefer N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Zero out below R in A
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa1 );
						}
						// Bidiagonalize R in A (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in A (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in A (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntvas ) {
					// Path 9 (M much larger than N, JOBU='A', JOBVT='S' or 'A') M left singular vectors to be computed in U and N right singular vectors to be computed in VT
					if ( lwork >= N * N + Math.max( N + M, 3 * N ) ) {
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
						// Compute A=Q*R, copying result to U (CWorkspace: need N*N+2*N, prefer N*N+N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need N*N+N+M, prefer N*N+N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R to WORK(IU), zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + 1 );
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in WORK(IU), copying result to VT (CWorkspace: need N*N+3*N, prefer N*N+2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'upper', N, N, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT );
						// Generate left bidiagonalizing vectors in WORK(IU) (CWorkspace: need N*N+3*N, prefer N*N+2*N+N*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', N, N, N, WORK, 1, ldwrku, iu, WORK, 1, itauq, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (CWorkspace: need   N*N+3*N-1, prefer N*N+2*N+(N-1)*NB) (RWorkspace: need   0)
						zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of R in WORK(IU) and computing right singular vectors of R in VT (CWorkspace: need N*N) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, N, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, WORK, 1, ldwrku, iu, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply Q in U by left singular vectors of R in WORK(IU), storing result in A (CWorkspace: need N*N) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, N, CONE, U, su1, su2, offsetU, WORK, 1, ldwrku, iu, CZERO, A, sa1, sa2, offsetA );
						// Copy left singular vectors of A from A to U
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + N;
						// Compute A=Q*R, copying result to U (CWorkspace: need 2*N, prefer N+N*NB) (RWorkspace: 0)
						zgeqrf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						// Generate Q in U (CWorkspace: need N+M, prefer N+M*NB) (RWorkspace: 0)
						zungqr( M, M, N, U, su1, su2, offsetU, WORK, 1, itau, WORK, 1, iwork );
						// Copy R from A to VT, zeroing out below it
						zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						if ( N > 1 ) {
							zlaset( 'lower', N - 1, N - 1, CZERO, CZERO, VT, svt1, svt2, offsetVT + svt1 );
						}
						ie = 0;
						itauq = itau;
						itaup = itauq + N;
						iwork = itaup + N;
						// Bidiagonalize R in VT (CWorkspace: need 3*N, prefer 2*N+2*N*NB) (RWorkspace: need N)
						zgebrd( N, N, VT, svt1, svt2, offsetVT, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply Q in U by left bidiagonalizing vectors in VT (CWorkspace: need 2*N+M, prefer 2*N+M*NB) (RWorkspace: 0)
						zunmbr( 'apply-Q', 'right', 'no-transpose', M, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itauq, U, su1, su2, offsetU, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in VT (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + N;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', N, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				}
			}
		} else {
			// M .LT. MNTHR
			// Path 10 (M at least N, but not much larger) Reduce to bidiagonal form without QR decomposition
			ie = 0;
			itauq = 0;
			itaup = itauq + N;
			iwork = itaup + N;
			// Bidiagonalize A (CWorkspace: need 2*N+M, prefer 2*N+(M+N)*NB) (RWorkspace: need N)
			zgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
			if ( wntuas ) {
				// If left singular vectors desired in U, copy result to U and generate left bidiagonalizing vectors in U (CWorkspace: need 2*N+NCU, prefer 2*N+NCU*NB) (RWorkspace: 0)
				zlacpy( 'lower', M, N, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				if ( wntus ) {
					ncu = N;
				}
				if ( wntua ) {
					ncu = M;
				}
				zungbr( 'apply-Q', M, ncu, N, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvas ) {
				// If right singular vectors desired in VT, copy result to VT and generate right bidiagonalizing vectors in VT (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
				zlacpy( 'upper', N, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				zungbr( 'apply-P', N, N, N, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
			}
			if ( wntuo ) {
				// If left singular vectors desired in A, generate left bidiagonalizing vectors in A (CWorkspace: need 3*N, prefer 2*N+N*NB) (RWorkspace: 0)
				zungbr( 'apply-Q', M, N, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvo ) {
				// If right singular vectors desired in A, generate right bidiagonalizing vectors in A (CWorkspace: need 3*N-1, prefer 2*N+(N-1)*NB) (RWorkspace: 0)
				zungbr( 'apply-P', N, N, N, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
			}
			irwork = ie + N;
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
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			} else if ( ( !wntuo ) && wntvo ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			} else {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in A and computing right singular vectors in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'upper', N, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			}
		}
	} else {
		// A has more columns than rows. If A has sufficiently more columns than rows, first reduce using the LQ decomposition (if sufficient workspace available)
		if ( N >= mnthr ) {
			if ( wntvn ) {
				// Path 1t(N much larger than M, JOBVT='N') No right singular vectors to be computed
				itau = 0;
				iwork = itau + M;
				// Compute A=L*Q (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
				zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
				// Zero out above L
				zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa2 );
				ie = 0;
				itauq = 0;
				itaup = itauq + M;
				iwork = itaup + M;
				// Bidiagonalize L in A (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
				zgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
				if ( wntuo || wntuas ) {
					// If left singular vectors desired, generate Q (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
					zungbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
				}
				irwork = ie + M;
				nru = 0;
				if ( wntuo || wntuas ) {
					nru = M;
				}
				// Perform bidiagonal QR iteration, computing left singular vectors of A in A if desired (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'upper', M, 0, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), CDUM, 1, 1, 0, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				// If left singular vectors desired in U, copy them there
				if ( wntuas ) {
					zlacpy( 'all', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				}
			} else if ( wntvo && wntun ) {
				// Path 2t(N much larger than M, JOBU='N', JOBVT='O') M right singular vectors to be overwritten on A and no left singular vectors to be computed
				if ( lwork >= M * M + 3 * M ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N ) + lda * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N ) + M * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is M by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = M;
					} else {
						// WORK(IU) is M by CHUNK and WORK(IR) is M by M
						ldwrku = M;
						chunk = Math.trunc( ( lwork - M * M ) / M );
						ldwrkr = M;
					}
					itau = ir + ldwrkr * M;
					iwork = itau + M;
					// Compute A=L*Q (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
					zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to WORK(IR) and zero out above it
					zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
					zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + ldwrkr );
					// Generate Q in A (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
					zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in WORK(IR) (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
					zgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing L (CWorkspace: need M*M+3*M-1, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
					zungbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
					irwork = ie + M;
					// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					iu = itauq;
					// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in WORK(IU) and copying to A (CWorkspace: need M*M+M, prefer M*M+M*N) (RWorkspace: 0)
					for ( i = 0; i < N; i += chunk ) {
						blk = Math.min( N - i, chunk );
						zgemm( 'no-transpose', 'no-transpose', M, blk, M, CONE, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + ( i * sa2 ), CZERO, WORK, 1, ldwrku, iu );
						zlacpy( 'all', M, blk, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa2 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					ie = 0;
					itauq = 0;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize A (CWorkspace: need 2*M+N, prefer 2*M+(M+N)*NB) (RWorkspace: need M)
					zgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Generate right vectors bidiagonalizing A (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
					zungbr( 'apply-P', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
					irwork = ie + M;
					// Perform bidiagonal QR iteration, computing right singular vectors of A in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'lower', M, N, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				}
			} else if ( wntvo && wntuas ) {
				// Path 3t(N much larger than M, JOBU='S' or 'A', JOBVT='O') M right singular vectors to be overwritten on A and M left singular vectors to be computed in U
				if ( lwork >= M * M + 3 * M ) {
					// Sufficient workspace for a fast algorithm
					ir = 0;
					if ( lwork >= Math.max( wrkbl, lda * N ) + lda * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is LDA by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = lda;
					} else if ( lwork >= Math.max( wrkbl, lda * N ) + M * M ) {
						// WORK(IU) is LDA by N and WORK(IR) is M by M
						ldwrku = lda;
						chunk = N;
						ldwrkr = M;
					} else {
						// WORK(IU) is M by CHUNK and WORK(IR) is M by M
						ldwrku = M;
						chunk = Math.trunc( ( lwork - M * M ) / M );
						ldwrkr = M;
					}
					itau = ir + ldwrkr * M;
					iwork = itau + M;
					// Compute A=L*Q (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
					zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to U, zeroing about above it
					zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, U, su1, su2, offsetU + su2 );
					// Generate Q in A (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
					zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in U, copying result to WORK(IR) (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
					zgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					zlacpy( 'upper', M, M, U, su1, su2, offsetU, WORK, 1, ldwrkr, ir );
					// Generate right vectors bidiagonalizing L in WORK(IR) (CWorkspace: need M*M+3*M-1, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
					zungbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing L in U (CWorkspace: need M*M+3*M, prefer M*M+2*M+M*NB) (RWorkspace: 0)
					zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
					irwork = ie + M;
					// Perform bidiagonal QR iteration, computing left singular vectors of L in U, and computing right singular vectors of L in WORK(IR) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					iu = itauq;
					// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in WORK(IU) and copying to A (CWorkspace: need M*M+M, prefer M*M+M*N)) (RWorkspace: 0)
					for ( i = 0; i < N; i += chunk ) {
						blk = Math.min( N - i, chunk );
						zgemm( 'no-transpose', 'no-transpose', M, blk, M, CONE, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA + ( i * sa2 ), CZERO, WORK, 1, ldwrku, iu );
						zlacpy( 'all', M, blk, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA + ( i * sa2 ) );
					}
				} else {
					// Insufficient workspace for a fast algorithm
					itau = 0;
					iwork = itau + M;
					// Compute A=L*Q (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
					zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					// Copy L to U, zeroing out above it
					zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
					zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, U, su1, su2, offsetU + su2 );
					// Generate Q in A (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
					zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
					ie = 0;
					itauq = itau;
					itaup = itauq + M;
					iwork = itaup + M;
					// Bidiagonalize L in U (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
					zgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
					// Multiply right vectors bidiagonalizing L by Q in A (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
					zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, A, sa1, sa2, offsetA, WORK, 1, iwork );
					// Generate left vectors bidiagonalizing L in U (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
					zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
					irwork = ie + M;
					// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
					info = zbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
				}
			} else if ( wntvs ) {
				if ( wntun ) {
					// Path 4t(N much larger than M, JOBU='N', JOBVT='S') M right singular vectors to be computed in VT and no left singular vectors to be computed
					if ( lwork >= M * M + 3 * M ) {
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
						// Compute A=L*Q (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IR), zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + ldwrkr );
						// Generate Q in A (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IR) (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate right vectors bidiagonalizing L in WORK(IR) (CWorkspace: need M*M+3*M, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IR) by Q in A, storing result in VT (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA, CZERO, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy result to VT
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right vectors bidiagonalizing L by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntuo ) {
					// Path 5t(N much larger than M, JOBU='O', JOBVT='S') M right singular vectors to be computed in VT and M left singular vectors to be overwritten on A
					if ( lwork >= 2 * M * M + 3 * M ) {
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
						// Compute A=L*Q (CWorkspace: need 2*M*M+2*M, prefer 2*M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out below it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + ldwrku );
						// Generate Q in A (CWorkspace: need 2*M*M+2*M, prefer 2*M*M+M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to WORK(IR) (CWorkspace: need   2*M*M+3*M, prefer 2*M*M+2*M+2*M*NB) (RWorkspace: need   M)
						zgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate right bidiagonalizing vectors in WORK(IU) (CWorkspace: need   2*M*M+3*M-1, prefer 2*M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (CWorkspace: need 2*M*M+3*M, prefer 2*M*M+2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in WORK(IR) and computing right singular vectors of L in WORK(IU) (CWorkspace: need 2*M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IU) by Q in A, storing result in VT (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA, CZERO, VT, svt1, svt2, offsetVT );
						// Copy left singular vectors of L to A (CWorkspace: need M*M) (RWorkspace: 0)
						zlacpy( 'all', M, M, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right vectors bidiagonalizing L by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors of L in A (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in A and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntuas ) {
					// Path 6t(N much larger than M, JOBU='S' or 'A', JOBVT='S') M right singular vectors to be computed in VT and M left singular vectors to be computed in U
					if ( lwork >= M * M + 3 * M ) {
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
						// Compute A=L*Q (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + ldwrku );
						// Generate Q in A (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to U (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, U, su1, su2, offsetU );
						// Generate right bidiagonalizing vectors in WORK(IU) (CWorkspace: need   M*M+3*M-1, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (CWorkspace: need M*M+3*M, prefer M*M+2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in U and computing right singular vectors of L in WORK(IU) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrku, iu, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IU) by Q in A, storing result in VT (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrku, iu, A, sa1, sa2, offsetA, CZERO, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zunglq( M, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to U, zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, U, su1, su2, offsetU + su2 );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in U (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in U by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				}
			} else if ( wntva ) {
				if ( wntun ) {
					// Path 7t(N much larger than M, JOBU='N', JOBVT='A') N right singular vectors to be computed in VT and no left singular vectors to be computed
					if ( lwork >= M * M + Math.max( N + M, 3 * M ) ) {
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
						// Compute A=L*Q, copying result to VT (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Copy L to WORK(IR), zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrkr, ir );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrkr, ir + ldwrkr );
						// Generate Q in VT (CWorkspace: need M*M+M+N, prefer M*M+M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IR) (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, WORK, 1, ldwrkr, ir, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Generate right bidiagonalizing vectors in WORK(IR) (CWorkspace: need   M*M+3*M-1, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itaup, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of L in WORK(IR) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IR) by Q in VT, storing result in A (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrkr, ir, VT, svt1, svt2, offsetVT, CZERO, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need M+N, prefer M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in A by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, 0, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, CDUM, 1, 1, 0, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntuo ) {
					// Path 8t(N much larger than M, JOBU='O', JOBVT='A') N right singular vectors to be computed in VT and M left singular vectors to be overwritten on A
					if ( lwork >= 2 * M * M + Math.max( N + M, 3 * M ) ) {
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
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M*M+2*M, prefer 2*M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need 2*M*M+M+N, prefer 2*M*M+M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + ldwrku );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to WORK(IR) (CWorkspace: need   2*M*M+3*M, prefer 2*M*M+2*M+2*M*NB) (RWorkspace: need   M)
						zgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir );
						// Generate right bidiagonalizing vectors in WORK(IU) (CWorkspace: need   2*M*M+3*M-1, prefer 2*M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in WORK(IR) (CWorkspace: need 2*M*M+3*M, prefer 2*M*M+2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, WORK, 1, ldwrkr, ir, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in WORK(IR) and computing right singular vectors of L in WORK(IU) (CWorkspace: need 2*M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrku, iu, WORK, 1, ldwrkr, ir, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IU) by Q in VT, storing result in A (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, CZERO, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Copy left singular vectors of A from WORK(IR) to A
						zlacpy( 'all', M, M, WORK, 1, ldwrkr, ir, A, sa1, sa2, offsetA );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need M+N, prefer M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Zero out above L in A
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, A, sa1, sa2, offsetA + sa2 );
						// Bidiagonalize L in A (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in A by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in A (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in A and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				} else if ( wntuas ) {
					// Path 9t(N much larger than M, JOBU='S' or 'A', JOBVT='A') N right singular vectors to be computed in VT and M left singular vectors to be computed in U
					if ( lwork >= M * M + Math.max( N + M, 3 * M ) ) {
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
						// Compute A=L*Q, copying result to VT (CWorkspace: need M*M+2*M, prefer M*M+M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need M*M+M+N, prefer M*M+M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to WORK(IU), zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, WORK, 1, ldwrku, iu );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, WORK, 1, ldwrku, iu + ldwrku );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in WORK(IU), copying result to U (CWorkspace: need M*M+3*M, prefer M*M+2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, WORK, 1, ldwrku, iu, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						zlacpy( 'lower', M, M, WORK, 1, ldwrku, iu, U, su1, su2, offsetU );
						// Generate right bidiagonalizing vectors in WORK(IU) (CWorkspace: need M*M+3*M, prefer M*M+2*M+(M-1)*NB) (RWorkspace: 0)
						zungbr( 'apply-P', M, M, M, WORK, 1, ldwrku, iu, WORK, 1, itaup, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (CWorkspace: need M*M+3*M, prefer M*M+2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of L in U and computing right singular vectors of L in WORK(IU) (CWorkspace: need M*M) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, M, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, ldwrku, iu, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
						// Multiply right singular vectors of L in WORK(IU) by Q in VT, storing result in A (CWorkspace: need M*M) (RWorkspace: 0)
						zgemm( 'no-transpose', 'no-transpose', M, N, M, CONE, WORK, 1, ldwrku, iu, VT, svt1, svt2, offsetVT, CZERO, A, sa1, sa2, offsetA );
						// Copy right singular vectors of A from A to VT
						zlacpy( 'all', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
					} else {
						// Insufficient workspace for a fast algorithm
						itau = 0;
						iwork = itau + M;
						// Compute A=L*Q, copying result to VT (CWorkspace: need 2*M, prefer M+M*NB) (RWorkspace: 0)
						zgelqf( M, N, A, sa1, sa2, offsetA, WORK, 1, itau, WORK, 1, iwork );
						zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
						// Generate Q in VT (CWorkspace: need M+N, prefer M+N*NB) (RWorkspace: 0)
						zunglq( N, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itau, WORK, 1, iwork );
						// Copy L to U, zeroing out above it
						zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
						zlaset( 'upper', M - 1, M - 1, CZERO, CZERO, U, su1, su2, offsetU + su2 );
						ie = 0;
						itauq = itau;
						itaup = itauq + M;
						iwork = itaup + M;
						// Bidiagonalize L in U (CWorkspace: need 3*M, prefer 2*M+2*M*NB) (RWorkspace: need M)
						zgebrd( M, M, U, su1, su2, offsetU, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
						// Multiply right bidiagonalizing vectors in U by Q in VT (CWorkspace: need 2*M+N, prefer 2*M+N*NB) (RWorkspace: 0)
						zunmbr( 'apply-P', 'left', 'conjugate-transpose', M, N, M, U, su1, su2, offsetU, WORK, 1, itaup, VT, svt1, svt2, offsetVT, WORK, 1, iwork );
						// Generate left bidiagonalizing vectors in U (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
						zungbr( 'apply-Q', M, M, M, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
						irwork = ie + M;
						// Perform bidiagonal QR iteration, computing left singular vectors of A in U and computing right singular vectors of A in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
						info = zbdsqr( 'upper', M, N, M, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
					}
				}
			}
		} else {
			// N .LT. MNTHR
			// Path 10t(N greater than M, but not much larger) Reduce to bidiagonal form without LQ decomposition
			ie = 0;
			itauq = 0;
			itaup = itauq + M;
			iwork = itaup + M;
			// Bidiagonalize A (CWorkspace: need 2*M+N, prefer 2*M+(M+N)*NB) (RWorkspace: M)
			zgebrd( M, N, A, sa1, sa2, offsetA, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), WORK, 1, itauq, WORK, 1, itaup, WORK, 1, iwork );
			if ( wntuas ) {
				// If left singular vectors desired in U, copy result to U and generate left bidiagonalizing vectors in U (CWorkspace: need 3*M-1, prefer 2*M+(M-1)*NB) (RWorkspace: 0)
				zlacpy( 'lower', M, M, A, sa1, sa2, offsetA, U, su1, su2, offsetU );
				zungbr( 'apply-Q', M, M, N, U, su1, su2, offsetU, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvas ) {
				// If right singular vectors desired in VT, copy result to VT and generate right bidiagonalizing vectors in VT (CWorkspace: need 2*M+NRVT, prefer 2*M+NRVT*NB) (RWorkspace: 0)
				zlacpy( 'upper', M, N, A, sa1, sa2, offsetA, VT, svt1, svt2, offsetVT );
				if ( wntva ) {
					nrvt = N;
				}
				if ( wntvs ) {
					nrvt = M;
				}
				zungbr( 'apply-P', nrvt, N, M, VT, svt1, svt2, offsetVT, WORK, 1, itaup, WORK, 1, iwork );
			}
			if ( wntuo ) {
				// If left singular vectors desired in A, generate left bidiagonalizing vectors in A (CWorkspace: need 3*M-1, prefer 2*M+(M-1)*NB) (RWorkspace: 0)
				zungbr( 'apply-Q', M, M, N, A, sa1, sa2, offsetA, WORK, 1, itauq, WORK, 1, iwork );
			}
			if ( wntvo ) {
				// If right singular vectors desired in A, generate right bidiagonalizing vectors in A (CWorkspace: need 3*M, prefer 2*M+M*NB) (RWorkspace: 0)
				zungbr( 'apply-P', M, N, M, A, sa1, sa2, offsetA, WORK, 1, itaup, WORK, 1, iwork );
			}
			irwork = ie + M;
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
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			} else if ( ( !wntuo ) && wntvo ) {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in U and computing right singular vectors in A (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), A, sa1, sa2, offsetA, U, su1, su2, offsetU, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			} else {
				// Perform bidiagonal QR iteration, if desired, computing left singular vectors in A and computing right singular vectors in VT (CWorkspace: 0) (RWorkspace: need BDSPAC)
				info = zbdsqr( 'lower', M, ncvt, nru, 0, s, strideS, offsetS, RWORK, strideRWork, offsetRWork + ( ie * strideRWork ), VT, svt1, svt2, offsetVT, A, sa1, sa2, offsetA, CDUM, 1, 1, 0, RWORK, strideRWork, offsetRWork + ( irwork * strideRWork ) );
			}
		}
	}
	// Undo scaling if necessary
	if ( iscl === 1 ) {
		if ( anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn, 1, s, strideS, minmn * strideS, offsetS );
		}
		if ( info !== 0 && anrm > bignum ) {
			dlascl( 'general', 0, 0, bignum, anrm, minmn - 1, 1, RWORK, strideRWork, minmn * strideRWork, offsetRWork + ( ie * strideRWork ) );
		}
		if ( anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn, 1, s, strideS, minmn * strideS, offsetS );
		}
		if ( info !== 0 && anrm < smlnum ) {
			dlascl( 'general', 0, 0, smlnum, anrm, minmn - 1, 1, RWORK, strideRWork, minmn * strideRWork, offsetRWork + ( ie * strideRWork ) );
		}
	}

	return info;
}


// EXPORTS //

export default zgesvd;
export { computeMinWorkSize, computeWorkSize };
