/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dgbmv from './../../../../blas/base/dgbmv/lib/base.js';
import dgbtrf from './../../../../lapack/base/dgbtrf/lib/base.js';
import dgbtrs from './../../../../lapack/base/dgbtrs/lib/base.js';
import dlacpy from './../../../../lapack/base/dlacpy/lib/base.js';
import dsaupd from './../../dsaupd/lib/base.js';
import dseupd from './../../dseupd/lib/base.js';


// MAIN //

/**
* Computes converged approximations to eigenvalues of `A*z = lambda*B*z` for banded symmetric `A` and `B`, and optionally the corresponding eigenvectors.
*
* ## Notes
*
* -   `dsband` is a self-contained driver: it runs the full `dsaupd`/`dseupd` reverse-communication loop internally, applying the banded operators via `dgbtrf`/`dgbtrs`/`dgbmv`. It is NOT reverse-communication to its caller; it returns once the iteration converges.
* -   The mode is selected by `iparam[6]` and combined with `bmat` to yield an internal problem `type` (1 regular standard, 2 shift-invert standard, 3 regular generalized, 4 shift-invert generalized, 5 buckling, 6 Cayley).
* -   `AB`, `MB`, and `RFAC` use LAPACK band storage: `AB(kl+ku+1+i-j, j) = A(i,j)`, with `kl` extra leading rows reserved for the LU fill-in used by `dgbtrf`.
*
* @private
* @param {boolean} rvec - whether to compute Ritz vectors
* @param {string} howmny - `'all'` or `'select'` (only `'all'` is implemented)
* @param {Int32Array} select - selection array (length ncv)
* @param {Float64Array} d - Ritz values (length nev; out)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} Z - Ritz vectors (N-by-nev, column-major; out)
* @param {integer} strideZ1 - stride of the first (row) dimension of `Z`
* @param {integer} strideZ2 - stride of the second (column) dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {number} sigma - the shift (modes 3, 4, 5)
* @param {integer} N - order of the problem
* @param {Float64Array} AB - matrix A in band storage
* @param {integer} strideAB1 - stride of the first (row) dimension of `AB`
* @param {integer} strideAB2 - stride of the second (column) dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} MB - matrix M in band storage
* @param {integer} strideMB1 - stride of the first (row) dimension of `MB`
* @param {integer} strideMB2 - stride of the second (column) dimension of `MB`
* @param {NonNegativeInteger} offsetMB - starting index for `MB`
* @param {Float64Array} RFAC - band LU workspace/output
* @param {integer} strideRFAC1 - stride of the first (row) dimension of `RFAC`
* @param {integer} strideRFAC2 - stride of the second (column) dimension of `RFAC`
* @param {NonNegativeInteger} offsetRFAC - starting index for `RFAC`
* @param {integer} kl - number of subdiagonals
* @param {integer} ku - number of superdiagonals
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {integer} ncv - number of Lanczos vectors
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {integer} strideIparam - stride length for `iparam`
* @param {NonNegativeInteger} offsetIparam - starting index for `iparam`
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Float64Array} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @param {integer} lworkl - length of `workl`
* @param {Int32Array} iwork - integer pivot workspace (length >= N)
* @param {integer} strideIwork - stride length for `iwork`
* @param {NonNegativeInteger} offsetIwork - starting index for `iwork`
* @param {integer} infoIn - nonzero on entry to signal a user-supplied initial residual
* @returns {integer} INFO
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* // dsband runs the full Lanczos iteration internally; see the package README
* // for a complete banded example.
* var resid = new Float64Array( 4 );
* var d = new Float64Array( 2 );
*/
function dsband( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, Z, strideZ1, strideZ2, offsetZ, sigma, N, AB, strideAB1, strideAB2, offsetAB, MB, strideMB1, strideMB2, offsetMB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, kl, ku, which, bmat, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, iwork, strideIwork, offsetIwork, infoIn ) {
	let info, type, ierr, ox, oy, ob, i, j;

	// Set the internal problem type from mode (iparam[6]) and bmat:
	const mode = iparam[ offsetIparam + ( 6 * strideIparam ) ];
	if ( mode === 1 ) {
		type = 1;
	} else if ( mode === 3 && bmat === 'standard' ) {
		type = 2;
	} else if ( mode === 2 ) {
		type = 3;
	} else if ( mode === 3 && bmat === 'generalized' ) {
		type = 4;
	} else if ( mode === 4 ) {
		type = 5;
	} else if ( mode === 5 ) {
		type = 6;
	} else {
		// BMAT is inconsistent with iparam[6]:
		return infoIn;
	}

	const ido = new Int32Array( 1 );
	const ipntr = new Int32Array( 14 );
	const saupd = {};
	info = infoIn;

	// Use exact shifts:
	iparam[ offsetIparam ] = 1;

	// Both A and M are stored between rows itop and ibot (1-based); imid holds the diagonal:
	const itop = kl + 1;
	const imid = kl + ku + 1;
	const ibot = ( 2 * kl ) + ku + 1;

	// Band-matrix view offsets used by dgbmv (band storage starts at row itop):
	const abBand = offsetAB + ( ( itop - 1 ) * strideAB1 );
	const mbBand = offsetMB + ( ( itop - 1 ) * strideMB1 );

	if ( type === 2 || ( type === 6 && bmat === 'standard' ) ) {
		// Standard shift-invert / Cayley: factor (A - sigma*I):
		dlacpy( 'all', ibot, N, AB, strideAB1, strideAB2, offsetAB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC );
		for ( j = 0; j < N; j++ ) {
			RFAC[ offsetRFAC + ( ( imid - 1 ) * strideRFAC1 ) + ( j * strideRFAC2 ) ] = AB[ offsetAB + ( ( imid - 1 ) * strideAB1 ) + ( j * strideAB2 ) ] - sigma;
		}
		ierr = dgbtrf( N, N, kl, ku, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork );
		if ( ierr !== 0 ) {
			return info;
		}
	} else if ( type === 3 ) {
		// Generalized regular: factor M:
		dlacpy( 'all', ibot, N, MB, strideMB1, strideMB2, offsetMB, RFAC, strideRFAC1, strideRFAC2, offsetRFAC );
		ierr = dgbtrf( N, N, kl, ku, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork );
		if ( ierr !== 0 ) {
			return info;
		}
	} else if ( type === 4 || type === 5 || ( type === 6 && bmat === 'generalized' ) ) {
		// Generalized shift-invert / buckling / Cayley: construct and factor (A - sigma*M):
		for ( j = 0; j < N; j++ ) {
			for ( i = itop - 1; i < ibot; i++ ) {
				RFAC[ offsetRFAC + ( i * strideRFAC1 ) + ( j * strideRFAC2 ) ] = AB[ offsetAB + ( i * strideAB1 ) + ( j * strideAB2 ) ] - ( sigma * MB[ offsetMB + ( i * strideMB1 ) + ( j * strideMB2 ) ] );
			}
		}
		ierr = dgbtrf( N, N, kl, ku, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork );
		if ( ierr !== 0 ) {
			return info;
		}
	}

	// Main reverse-communication loop:
	for ( ; ; ) {
		info = dsaupd( saupd, ido, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, 1, 0, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, infoIn );

		ox = offsetWorkd + ( ipntr[ 0 ] * strideWorkd );
		oy = offsetWorkd + ( ipntr[ 1 ] * strideWorkd );
		ob = offsetWorkd + ( ipntr[ 2 ] * strideWorkd );

		if ( ido[ 0 ] === -1 ) {
			if ( type === 1 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
			} else if ( type === 2 ) {
				dcopy( N, workd, strideWorkd, ox, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 3 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
				dcopy( N, workd, strideWorkd, oy, workd, strideWorkd, ox );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 4 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, MB, strideMB1, strideMB2, mbBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 5 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 6 ) {
				if ( bmat === 'generalized' ) {
					dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
					dgbmv( 'no-transpose', N, N, kl, ku, sigma, MB, strideMB1, strideMB2, mbBand, workd, strideWorkd, ox, 1.0, workd, strideWorkd, oy );
				} else {
					dcopy( N, workd, strideWorkd, ox, workd, strideWorkd, oy );
					dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, sigma, workd, strideWorkd, oy );
				}
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			}
		} else if ( ido[ 0 ] === 1 ) {
			if ( type === 1 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
			} else if ( type === 2 ) {
				dcopy( N, workd, strideWorkd, ox, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 3 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
				dcopy( N, workd, strideWorkd, oy, workd, strideWorkd, ox );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 4 ) {
				// M*x is already available in workd(ipntr(3)):
				dcopy( N, workd, strideWorkd, ob, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 5 ) {
				// A*x is already available in workd(ipntr(3)):
				dcopy( N, workd, strideWorkd, ob, workd, strideWorkd, oy );
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			} else if ( type === 6 ) {
				if ( bmat === 'generalized' ) {
					dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
					daxpy( N, sigma, workd, strideWorkd, ob, workd, strideWorkd, oy );
				} else {
					dcopy( N, workd, strideWorkd, ox, workd, strideWorkd, oy );
					dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, sigma, workd, strideWorkd, oy );
				}
				dgbtrs( 'no-transpose', N, kl, ku, 1, RFAC, strideRFAC1, strideRFAC2, offsetRFAC, iwork, strideIwork, offsetIwork, workd, strideWorkd, N * strideWorkd, oy );
			}
		} else if ( ido[ 0 ] === 2 ) {
			// y <- B*x (B = A in buckling mode, otherwise B = M):
			if ( type === 5 ) {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, abBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
			} else {
				dgbmv( 'no-transpose', N, N, kl, ku, 1.0, MB, strideMB1, strideMB2, mbBand, workd, strideWorkd, ox, 0.0, workd, strideWorkd, oy );
			}
		} else {
			// Convergence or error:
			if ( info < 0 ) {
				return info;
			}
			if ( iparam[ offsetIparam + ( 4 * strideIparam ) ] > 0 ) {
				// Use the effective tolerance defaulted inside dsaupd (Fortran mutates the shared `tol` in place; here dsaupd exposes it on its state):
				ierr = dseupd( rvec, 'all', select, strideSelect, offsetSelect, d, strideD, offsetD, Z, strideZ1, strideZ2, offsetZ, sigma, bmat, N, which, nev, saupd.tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, 1, 0, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl );
				if ( ierr !== 0 ) {
					return ierr;
				}
			}
			return info;
		}
	}
}


// EXPORTS //

export default dsband;
