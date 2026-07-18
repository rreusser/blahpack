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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dger from './../../../../blas/base/dger/lib/base.js';
import dgeqr2 from './../../../../lapack/base/dgeqr2/lib/base.js';
import dlacpy from './../../../../lapack/base/dlacpy/lib/base.js';
import dorm2r from './../../../../lapack/base/dorm2r/lib/base.js';
import dsteqr from './../../../../lapack/base/dsteqr/lib/base.js';
import dsesrt from './../../dsesrt/lib/base.js';
import dsgets from './../../dsgets/lib/base.js';
import dsortr from './../../dsortr/lib/base.js';


// MAIN //

/**
* Returns the converged Ritz values and (optionally) Ritz vectors for a symmetric eigenproblem from an ARPACK Lanczos factorization.
*
* ## Notes
*
* -   This routine is the symmetric eigenvector-extraction / post-processing step. It must be called after the `dsaupd` iteration converges and consumes the internal state (`v`, `workl`, `iparam`, `ipntr`) that `dsaupd` produced.
* -   The pointers `ipntr` and layout of `workl` follow ARPACK's 1-based convention exactly; they are converted to 0-based array offsets internally.
* -   On exit, `d` holds the `iparam[4]` (=`nconv`) converged Ritz values in ascending order. If `rvec` is `true` and `howmny` is `'all'`, the first `nconv` columns of `z` hold the corresponding B-orthonormal Ritz vectors. `v` and `workl` are overwritten.
*
* @private
* @param {boolean} rvec - if `true`, compute Ritz vectors; if `false`, compute Ritz values only
* @param {string} howmny - `'all'` to compute all `nev` Ritz vectors; `'select'` (not implemented) for selected vectors; `'partial'` also accepted
* @param {(Array|Uint8Array)} select - logical work array of length `ncv` (input only when howmny is `'select'`)
* @param {integer} strideSelect - stride length for `select`
* @param {NonNegativeInteger} offsetSelect - starting index for `select`
* @param {Float64Array} d - output array for the Ritz values (length `nev`)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} z - output matrix of Ritz vectors (N-by-nev when howmny is `'all'`)
* @param {integer} strideZ1 - stride of the first (row) dimension of `z`
* @param {integer} strideZ2 - stride of the second (column) dimension of `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {number} sigma - shift used when `iparam[6]` (mode) is 3, 4, or 5
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - dimension of the eigenproblem
* @param {string} which - eigenvalue selection: `'LM'`, `'SM'`, `'LA'`, `'SA'`, or `'BE'`
* @param {NonNegativeInteger} nev - number of eigenvalues requested
* @param {number} tol - relative accuracy tolerance used by `dsaupd`
* @param {Float64Array} resid - final residual vector (length N)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {NonNegativeInteger} ncv - number of Lanczos basis vectors
* @param {Float64Array} v - Lanczos basis matrix (N-by-ncv); overwritten on exit
* @param {integer} strideV1 - stride of the first (row) dimension of `v`
* @param {integer} strideV2 - stride of the second (column) dimension of `v`
* @param {NonNegativeInteger} offsetV - starting index for `v`
* @param {(Array|Int32Array)} iparam - ARPACK parameter array (`iparam[4]`=nconv, `iparam[6]`=mode)
* @param {integer} strideIparam - stride length for `iparam`
* @param {NonNegativeInteger} offsetIparam - starting index for `iparam`
* @param {(Array|Int32Array)} ipntr - ARPACK pointer array into `workl`
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - work array of length `2*N`
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Float64Array} workl - private work array set by `dsaupd` (length `lworkl`); modified on exit
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @param {NonNegativeInteger} lworkl - length of `workl`
* @returns {integer} info - 0 on success; a negative error code otherwise
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* // Post-convergence state for a tiny standard problem (see the test suite for realistic inputs generated by the ARPACK Fortran reference).
* var ncv = 4;
* var lworkl = ( ncv * ncv ) + ( 8 * ncv );
* var workl = new Float64Array( lworkl );
* var v = new Float64Array( 2 * ncv );
* var z = new Float64Array( 2 * ncv );
* var d = new Float64Array( 2 );
* var resid = new Float64Array( 2 );
* var workd = new Float64Array( 4 );
* var select = new Array( ncv );
* var iparam = [ 0, 0, 0, 0, 0, 0, 1 ];
* var ipntr = [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1 ];
*
* // nconv = 0 triggers an immediate normal return:
* var info = dseupd( true, 'all', select, 1, 0, d, 1, 0, z, 1, 2, 0, 0.0, 'standard', 2, 'LM', 2, 0.0, resid, 1, 0, ncv, v, 1, 2, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl );
* // returns 0
*/
function dseupd( rvec, howmny, select, strideSelect, offsetSelect, d, strideD, offsetD, z, strideZ1, strideZ2, offsetZ, sigma, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, v, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl ) {
	let leftptr, rghtptr, numcnv, bnorm2, ishift, reord, type, work1, eps23;
	let temp1, ierr, np, jj, oq, j, k;

	const mode = iparam[ offsetIparam + ( 6 * strideIparam ) ];
	const nconv = iparam[ offsetIparam + ( 4 * strideIparam ) ];
	const info = 0;

	// Quick return.
	if ( nconv === 0 ) {
		return info;
	}
	ierr = 0;

	if ( nconv <= 0 ) {
		ierr = -14;
	}
	if ( N <= 0 ) {
		ierr = -1;
	}
	if ( nev <= 0 ) {
		ierr = -2;
	}
	if ( ncv <= nev || ncv > N ) {
		ierr = -3;
	}
	if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
		ierr = -5;
	}
	if ( bmat !== 'standard' && bmat !== 'generalized' ) {
		ierr = -6;
	}
	if ( ( howmny !== 'all' && howmny !== 'partial' && howmny !== 'select' ) && rvec ) {
		ierr = -15;
	}
	if ( rvec && howmny === 'select' ) {
		ierr = -16;
	}
	if ( rvec && lworkl < ( ncv * ncv ) + ( 8 * ncv ) ) {
		ierr = -7;
	}
	if ( mode === 1 || mode === 2 ) {
		type = 'REGULR';
	} else if ( mode === 3 ) {
		type = 'SHIFTI';
	} else if ( mode === 4 ) {
		type = 'BUCKLE';
	} else if ( mode === 5 ) {
		type = 'CAYLEY';
	} else {
		ierr = -10;
	}
	if ( mode === 1 && bmat === 'generalized' ) {
		ierr = -11;
	}
	if ( nev === 1 && which === 'BE' ) {
		ierr = -12;
	}

	// Error exit.
	if ( ierr !== 0 ) {
		return ierr;
	}

	// Pointers into workl (1-based, following ARPACK exactly).
	const ih = ipntr[ offsetIpntr + ( 4 * strideIpntr ) ];
	const bounds = ipntr[ offsetIpntr + ( 6 * strideIpntr ) ];
	const ldh = ncv;
	const ldq = ncv;
	const ihd = bounds + ldh;
	const ihb = ihd + ldh;
	const iq = ihb + ldh;
	const iw = iq + ( ldh * ncv );

	ipntr[ offsetIpntr + ( 3 * strideIpntr ) ] = iw + ( 2 * ncv );
	ipntr[ offsetIpntr + ( 7 * strideIpntr ) ] = ihd;
	ipntr[ offsetIpntr + ( 8 * strideIpntr ) ] = ihb;
	ipntr[ offsetIpntr + ( 9 * strideIpntr ) ] = iq;

	// irz points to the Ritz values and ibd to the Ritz estimates computed by dseigt before dsaup2 exited.
	const irz = ipntr[ offsetIpntr + ( 10 * strideIpntr ) ] + ncv;
	const ibd = irz + ncv;

	// Machine-dependent constant.
	eps23 = dlamch( 'epsilon' );
	eps23 = Math.pow( eps23, 2.0 / 3.0 );

	// RNORM is the B-norm of RESID(1:N); BNORM2 is the 2-norm of B*RESID(1:N).
	const rnorm = workl[ offsetWorkl + ( ( ih - 1 ) * strideWorkl ) ];
	if ( bmat === 'standard' ) {
		bnorm2 = rnorm;
	} else {
		bnorm2 = dnrm2( N, workd, strideWorkd, offsetWorkd );
	}

	if ( rvec ) {
		reord = false;

		// Use the temporary bounds array to store indices; these mark the select array later.
		for ( j = 1; j <= ncv; j++ ) {
			workl[ offsetWorkl + ( ( bounds + j - 2 ) * strideWorkl ) ] = j;
			select[ offsetSelect + ( ( j - 1 ) * strideSelect ) ] = false;
		}

		// Select the wanted Ritz values, sorting them to the tail of workl(irz) and moving the corresponding error estimates in workl(bounds).
		np = ncv - nev;
		ishift = 0;
		dsgets( ishift, which, nev, np, workl, strideWorkl, offsetWorkl + ( ( irz - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( bounds - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl );

		// Record indices of the converged wanted Ritz values and mark the select array for possible reordering.
		numcnv = 0;
		for ( j = 1; j <= ncv; j++ ) {
			temp1 = Math.max( eps23, Math.abs( workl[ offsetWorkl + ( ( irz + ncv - j - 1 ) * strideWorkl ) ] ) );
			jj = workl[ offsetWorkl + ( ( bounds + ncv - j - 1 ) * strideWorkl ) ];
			if ( numcnv < nconv && workl[ offsetWorkl + ( ( ibd + jj - 2 ) * strideWorkl ) ] <= tol * temp1 ) {
				select[ offsetSelect + ( ( jj - 1 ) * strideSelect ) ] = true;
				numcnv += 1;
				if ( jj > nconv ) {
					reord = true;
				}
			}
		}

		// Check the count of converged Ritz values against the number reported by dsaupd.
		if ( numcnv !== nconv ) {
			return -17;
		}

		// Compute the eigenvalues and eigenvectors of the final symmetric tridiagonal matrix H, initializing Q to the identity.
		dcopy( ncv - 1, workl, strideWorkl, offsetWorkl + ( ih * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
		dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( ih + ldh - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ) );

		oq = offsetWorkl + ( ( iq - 1 ) * strideWorkl );
		ierr = dsteqr( 'initialize', ncv, workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ), workl, strideWorkl, strideWorkl * ldq, oq, workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ) );
		if ( ierr !== 0 ) {
			return -8;
		}

		if ( reord ) {
			// Reorder the eigenvalues/eigenvectors so the converged ones occupy the first nconv positions of workl(ihd) and columns of workl(iq).
			leftptr = 1;
			rghtptr = ncv;
			if ( ncv !== 1 ) {
				do {
					if ( select[ offsetSelect + ( ( leftptr - 1 ) * strideSelect ) ] ) {
						leftptr += 1;
					} else if ( select[ offsetSelect + ( ( rghtptr - 1 ) * strideSelect ) ] === false ) {
						rghtptr -= 1;
					} else {
						temp1 = workl[ offsetWorkl + ( ( ihd + leftptr - 2 ) * strideWorkl ) ];
						workl[ offsetWorkl + ( ( ihd + leftptr - 2 ) * strideWorkl ) ] = workl[ offsetWorkl + ( ( ihd + rghtptr - 2 ) * strideWorkl ) ];
						workl[ offsetWorkl + ( ( ihd + rghtptr - 2 ) * strideWorkl ) ] = temp1;
						dcopy( ncv, workl, strideWorkl, oq + ( ncv * ( leftptr - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ) );
						dcopy( ncv, workl, strideWorkl, oq + ( ncv * ( rghtptr - 1 ) * strideWorkl ), workl, strideWorkl, oq + ( ncv * ( leftptr - 1 ) * strideWorkl ) );
						dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ), workl, strideWorkl, oq + ( ncv * ( rghtptr - 1 ) * strideWorkl ) );
						leftptr += 1;
						rghtptr -= 1;
					}
				} while ( leftptr < rghtptr );
			}
		}

		// Load the converged Ritz values into D.
		dcopy( nconv, workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ), d, strideD, offsetD );
	} else {
		// Ritz vectors not required. Load Ritz values into D.
		dcopy( nconv, workl, strideWorkl, offsetWorkl + ( ( ipntr[ offsetIpntr + ( 5 * strideIpntr ) ] - 1 ) * strideWorkl ), d, strideD, offsetD );
		dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( ipntr[ offsetIpntr + ( 5 * strideIpntr ) ] - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ) );
	}

	// Transform the Ritz values (and possibly vectors) of OP back to those of A*x = lambda*B*x, returned in ascending order.
	if ( type === 'REGULR' ) {
		if ( rvec ) {
			dsesrt( 'LA', rvec, nconv, d, strideD, offsetD, ncv, workl, strideWorkl, strideWorkl * ldq, offsetWorkl + ( ( iq - 1 ) * strideWorkl ) );
		} else {
			dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( bounds - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
		}
	} else {
		// Make a copy of all the Ritz values, then transform them back to the original system.
		dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ) );
		if ( type === 'SHIFTI' ) {
			for ( k = 1; k <= ncv; k++ ) {
				workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] = ( 1.0 / workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] ) + sigma;
			}
		} else if ( type === 'BUCKLE' ) {
			for ( k = 1; k <= ncv; k++ ) {
				workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] = ( sigma * workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] ) / ( workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] - 1.0 );
			}
		} else if ( type === 'CAYLEY' ) {
			for ( k = 1; k <= ncv; k++ ) {
				workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] = ( sigma * ( workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] + 1.0 ) ) / ( workl[ offsetWorkl + ( ( ihd + k - 2 ) * strideWorkl ) ] - 1.0 );
			}
		}

		// Store the wanted nconv lambda values into D, sort them ascending, and apply the sort to the theta values (needed for the Ritz estimates).
		dcopy( nconv, workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ), d, strideD, offsetD );
		dsortr( 'LA', true, nconv, workl, strideWorkl, offsetWorkl + ( ( ihd - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ) );
		if ( rvec ) {
			dsesrt( 'LA', rvec, nconv, d, strideD, offsetD, ncv, workl, strideWorkl, strideWorkl * ldq, offsetWorkl + ( ( iq - 1 ) * strideWorkl ) );
		} else {
			dcopy( ncv, workl, strideWorkl, offsetWorkl + ( ( bounds - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
			dscal( ncv, bnorm2 / rnorm, workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
			dsortr( 'LA', true, nconv, d, strideD, offsetD, workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
		}
	}

	// Compute the Ritz vectors by transforming the wanted eigenvectors of H by the Lanczos basis matrix V.
	if ( rvec && howmny === 'all' ) {
		// QR factorization of the wanted invariant subspace in the first nconv columns of workl(iq).
		dgeqr2( ncv, nconv, workl, strideWorkl, strideWorkl * ldq, offsetWorkl + ( ( iq - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw + ncv - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );

		// Postmultiply V by Q and copy the first nconv columns of VQ into Z.
		dorm2r( 'right', 'no-transpose', N, ncv, nconv, workl, strideWorkl, strideWorkl * ldq, offsetWorkl + ( ( iq - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw + ncv - 1 ) * strideWorkl ), v, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( N * strideWorkd ) );
		dlacpy( 'all', N, nconv, v, strideV1, strideV2, offsetV, z, strideZ1, strideZ2, offsetZ );

		// Form the last row of the (factored) eigenvector matrix, needed for the Ritz estimates.
		for ( j = 1; j <= ncv - 1; j++ ) {
			workl[ offsetWorkl + ( ( ihb + j - 2 ) * strideWorkl ) ] = 0.0;
		}
		workl[ offsetWorkl + ( ( ihb + ncv - 2 ) * strideWorkl ) ] = 1.0;

		work1 = new Float64Array( 1 );
		dorm2r( 'left', 'transpose', ncv, 1, nconv, workl, strideWorkl, strideWorkl * ldq, offsetWorkl + ( ( iq - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( iw + ncv - 1 ) * strideWorkl ), workl, strideWorkl, strideWorkl * ncv, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ), work1, 1, 0 );

		// Copy the last row into workl(iw+ncv:iw+2*ncv) for the purification step below.
		for ( j = 1; j <= nconv; j++ ) {
			workl[ offsetWorkl + ( ( iw + ncv + j - 2 ) * strideWorkl ) ] = workl[ offsetWorkl + ( ( ihb + j - 2 ) * strideWorkl ) ];
		}
	}

	if ( type === 'REGULR' && rvec ) {
		for ( j = 1; j <= ncv; j++ ) {
			workl[ offsetWorkl + ( ( ihb + j - 2 ) * strideWorkl ) ] = rnorm * Math.abs( workl[ offsetWorkl + ( ( ihb + j - 2 ) * strideWorkl ) ] );
		}
	} else if ( type !== 'REGULR' && rvec ) {
		// Determine the Ritz estimates of the theta and of the lambda.
		dscal( ncv, bnorm2, workl, strideWorkl, offsetWorkl + ( ( ihb - 1 ) * strideWorkl ) );
		if ( type === 'SHIFTI' ) {
			for ( k = 1; k <= ncv; k++ ) {
				workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] = Math.abs( workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] ) / ( workl[ offsetWorkl + ( ( iw + k - 2 ) * strideWorkl ) ] * workl[ offsetWorkl + ( ( iw + k - 2 ) * strideWorkl ) ] );
			}
		} else if ( type === 'BUCKLE' ) {
			for ( k = 1; k <= ncv; k++ ) {
				temp1 = workl[ offsetWorkl + ( ( iw + k - 2 ) * strideWorkl ) ] - 1.0;
				workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] = ( sigma * Math.abs( workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] ) ) / ( temp1 * temp1 );
			}
		} else if ( type === 'CAYLEY' ) {
			for ( k = 1; k <= ncv; k++ ) {
				workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] = Math.abs( ( workl[ offsetWorkl + ( ( ihb + k - 2 ) * strideWorkl ) ] / workl[ offsetWorkl + ( ( iw + k - 2 ) * strideWorkl ) ] ) * ( workl[ offsetWorkl + ( ( iw + k - 2 ) * strideWorkl ) ] - 1.0 ) );
			}
		}
	}

	// Ritz vector purification step (one step of inverse subspace iteration), only for MODE = 3, 4, 5.
	if ( rvec && ( type === 'SHIFTI' || type === 'CAYLEY' ) ) {
		for ( k = 0; k <= nconv - 1; k++ ) {
			workl[ offsetWorkl + ( ( iw + k - 1 ) * strideWorkl ) ] = workl[ offsetWorkl + ( ( iw + ncv + k - 1 ) * strideWorkl ) ] / workl[ offsetWorkl + ( ( iw + k - 1 ) * strideWorkl ) ];
		}
	} else if ( rvec && type === 'BUCKLE' ) {
		for ( k = 0; k <= nconv - 1; k++ ) {
			workl[ offsetWorkl + ( ( iw + k - 1 ) * strideWorkl ) ] = workl[ offsetWorkl + ( ( iw + ncv + k - 1 ) * strideWorkl ) ] / ( workl[ offsetWorkl + ( ( iw + k - 1 ) * strideWorkl ) ] - 1.0 );
		}
	}

	if ( rvec && type !== 'REGULR' ) {
		dger( N, nconv, 1.0, resid, strideResid, offsetResid, workl, strideWorkl, offsetWorkl + ( ( iw - 1 ) * strideWorkl ), z, strideZ1, strideZ2, offsetZ );
	}

	return info;
}


// EXPORTS //

export default dseupd;
