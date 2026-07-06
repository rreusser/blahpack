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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dsaup2 from './../../dsaup2/lib/base.js';


// MAIN //

/**
* Reverse communication interface for the Implicitly Restarted Lanczos iteration.
*
* ## Notes
*
* -   This is the top-level reverse-communication driver for the symmetric eigenproblem. It checks arguments, lays out the workspace partitioning of `workl`, and repeatedly invokes `dsaup2` (the IRLM engine) until convergence. On the first call (`ido[0] = 0`) it reads `iparam` and partitions `workl`; on every call it forwards to `dsaup2`.
* -   `ipntr` uses a mixed convention consistent with the rest of the closure: the workd pointers `ipntr(1:3)` (array indices 0..2) are 0-based offsets into `workd`, whereas the workl pointers `ipntr(4:7,11)` (array indices 3..6, 10) are ARPACK's 1-based offsets into `workl` (which is what `dseupd` expects).
* -   The persistent reverse-communication state lives on `state` (pass `{}` on first use); it nests `dsaup2`'s state at `state.saup2`.
*
* @private
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} N - order of the problem
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {integer} nev - number of eigenvalues to compute
* @param {number} tol - relative accuracy for Ritz value convergence (`<= 0` uses machine epsilon)
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {integer} ncv - number of Lanczos vectors (columns of `V`)
* @param {Float64Array} V - Lanczos basis (N-by-ncv, column-major; out)
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Int32Array} iparam - input/output parameters (length 11; in/out)
* @param {integer} strideIparam - stride length for `iparam`
* @param {NonNegativeInteger} offsetIparam - starting index for `iparam`
* @param {Int32Array} ipntr - workspace pointers (length 11; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - reverse-communication workspace (length >= 3*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Float64Array} workl - private workspace (length >= ncv^2 + 8*ncv)
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @param {integer} lworkl - length of `workl`
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @returns {integer} INFO - 0 on success; 1 (max iterations), 3 (no shifts applied), or a negative error code
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* // dsaupd is the reverse-communication driver; see the package README for a
* // full example that applies OP and calls dseupd afterward.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaupd( state, ido, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, infoIn ) {
	var ishift;
	var bounds;
	var ierr;
	var mode;
	var ritz;
	var ldh;
	var next;
	var info;
	var iq;
	var iw;
	var ih;
	var np;
	var j;

	info = 0;
	if ( ido[ 0 ] === 0 ) {
		// Read the input parameters from iparam:
		ishift = iparam[ offsetIparam ];
		state.mxiter = new Int32Array( [ iparam[ offsetIparam + ( 2 * strideIparam ) ] ] );
		mode = iparam[ offsetIparam + ( 6 * strideIparam ) ];

		// Argument checking (arg-check errors return a negative info; xerbla is not translated):
		ierr = 0;
		if ( N <= 0 ) {
			ierr = -1;
		} else if ( nev <= 0 ) {
			ierr = -2;
		} else if ( ncv <= nev || ncv > N ) {
			ierr = -3;
		}
		if ( state.mxiter[ 0 ] <= 0 ) {
			ierr = -4;
		}
		if ( which !== 'LM' && which !== 'SM' && which !== 'LA' && which !== 'SA' && which !== 'BE' ) {
			ierr = -5;
		}
		if ( bmat !== 'standard' && bmat !== 'generalized' ) {
			ierr = -6;
		}
		if ( lworkl < ( ncv * ncv ) + ( 8 * ncv ) ) {
			ierr = -7;
		}
		if ( mode < 1 || mode > 5 ) {
			ierr = -10;
		} else if ( mode === 1 && bmat === 'generalized' ) {
			ierr = -11;
		} else if ( ishift < 0 || ishift > 1 ) {
			ierr = -12;
		} else if ( nev === 1 && which === 'BE' ) {
			ierr = -13;
		}
		if ( ierr !== 0 ) {
			ido[ 0 ] = 99;
			return ierr;
		}

		// Set the default convergence tolerance:
		if ( tol <= 0.0 ) {
			tol = dlamch( 'epsilon' );
		}

		// NP is the number of additional steps used to extend the length-NEV factorization; NEV0 designates the size of the invariant subspace desired:
		np = ncv - nev;
		state.nev0 = new Int32Array( [ nev ] );
		state.np = new Int32Array( [ np ] );
		state.tol = tol;
		state.mode = mode;
		state.ishift = ishift;
		state.bmat = bmat;

		// Zero out the internal workspace:
		for ( j = 0; j < ( ncv * ncv ) + ( 8 * ncv ); j++ ) {
			workl[ offsetWorkl + ( j * strideWorkl ) ] = 0.0;
		}

		// Partition workl (1-based ARPACK offsets): H (ncv-by-2), Ritz values, error bounds, rotation matrix Q (ncv-by-ncv), and the remaining workspace:
		ldh = ncv;
		ih = 1;
		ritz = ih + ( 2 * ldh );
		bounds = ritz + ncv;
		iq = bounds + ncv;
		iw = iq + ( ncv * ncv );
		next = iw + ( 3 * ncv );

		state.ldh = ldh;
		state.ih = ih;
		state.ritz = ritz;
		state.bounds = bounds;
		state.iq = iq;
		state.iw = iw;

		ipntr[ offsetIpntr + ( 3 * strideIpntr ) ] = next;
		ipntr[ offsetIpntr + ( 4 * strideIpntr ) ] = ih;
		ipntr[ offsetIpntr + ( 5 * strideIpntr ) ] = ritz;
		ipntr[ offsetIpntr + ( 6 * strideIpntr ) ] = bounds;
		ipntr[ offsetIpntr + ( 10 * strideIpntr ) ] = iw;

		state.saup2 = {};
	}

	// Carry out the Implicitly Restarted Lanczos iteration. H, Ritz values, bounds, Q, and the shift workspace are slices of workl (H and Q have leading dimension ldh = ncv):
	info = dsaup2( state.saup2, ido, state.bmat, N, which, state.nev0, state.np, state.tol, resid, strideResid, offsetResid, state.mode, 1, state.ishift, state.mxiter, V, strideV1, strideV2, offsetV, workl, strideWorkl, state.ldh * strideWorkl, offsetWorkl + ( ( state.ih - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( state.ritz - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( state.bounds - 1 ) * strideWorkl ), workl, strideWorkl, state.ldh * strideWorkl, offsetWorkl + ( ( state.iq - 1 ) * strideWorkl ), workl, strideWorkl, offsetWorkl + ( ( state.iw - 1 ) * strideWorkl ), ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, infoIn );

	// ido != 99 implies reverse communication to apply OP / B or to supply shifts:
	if ( ido[ 0 ] === 3 ) {
		iparam[ offsetIparam + ( 7 * strideIparam ) ] = state.np[ 0 ];
	}
	if ( ido[ 0 ] !== 99 ) {
		return info;
	}

	iparam[ offsetIparam + ( 2 * strideIparam ) ] = state.mxiter[ 0 ];
	iparam[ offsetIparam + ( 4 * strideIparam ) ] = state.np[ 0 ];

	// Statistics counters (NUMOP / NUMOPB / NUMREO) are not tracked in this translation:
	iparam[ offsetIparam + ( 8 * strideIparam ) ] = 0;
	iparam[ offsetIparam + ( 9 * strideIparam ) ] = 0;
	iparam[ offsetIparam + ( 10 * strideIparam ) ] = 0;

	if ( info < 0 ) {
		return info;
	}
	if ( info === 2 ) {
		info = 3;
	}
	return info;
}


// EXPORTS //

export default dsaupd;
