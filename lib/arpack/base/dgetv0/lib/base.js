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

/* eslint-disable max-len, max-params */

// MODULES //

import Int32Array from '@stdlib/array/int32/lib/index.js';
import dlarnv from './../../../../lapack/base/dlarnv/lib/base.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';


// TYPES //

/**
* Persistent reverse-communication state of `dgetv0` (the caller passes `{}` on first use; every property is set on the first call, `ido = 0`, before it is read).
*
* @private
* @typedef {Object} Dgetv0State
* @property {boolean} first - saved `first`
* @property {boolean} inited - saved `inited`
* @property {Int32Array} iseed - saved `iseed`
* @property {number} iter - saved `iter`
* @property {boolean} orth - saved `orth`
* @property {number} rnorm0 - saved `rnorm0`
*/


// MAIN //

/**
* Generates the initial residual vector for the symmetric Lanczos/Arnoldi iteration, forced to be orthogonal to the current `V` basis, via reverse communication.
*
* ## Reverse communication
*
* `dgetv0` returns control to the caller to apply the operators `OP` and `B`.
* The caller drives it in a loop, dispatching on `ido`: `0` on the first call;
* `-1` (or `1`) compute `Y = OP*X` (X at `workd[ipntr[0]]`, Y to
* `workd[ipntr[1]]`); `2` compute `Y = B*X` (generalized problem); `99` done,
* with `resid` the starting vector and `rnorm[0]` its `B`-norm.
*
* State that must persist across calls (the Fortran `SAVE` variables) lives on
* the caller-supplied `state` object. Create `const state = {}` once per
* invocation sequence and pass it to every call; `dgetv0` resets the per-run
* fields on each `ido = 0` start (the random seed persists across sequences,
* matching the reference).
*
* @private
* @param {Dgetv0State} state - persistent reverse-communication state (opaque; pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {('standard'|'generalized')} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {integer} itry - restart attempt counter (>= 1)
* @param {boolean} initv - if `true`, `resid` already holds an initial vector; if `false`, it is randomized
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} j - index of the residual vector to be generated (orthogonalize against the first `j-1` columns of `V`)
* @param {Float64Array} V - Lanczos/Arnoldi basis (N-by-j)
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {Float64Array} rnorm - B-norm of the generated residual (length-1; out)
* @param {Int32Array} ipntr - pointers into `workd` for the operator (length >= 2; 0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - reverse-communication workspace (length 2*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {Int32Array} ierr - output (length-1 array): `ierr`
* @returns {Int32Array} `ipntr`
*
* @example
* import Int32Array from '@stdlib/array/int32/lib/index.js';
* import Float64Array from '@stdlib/array/float64/lib/index.js';
* import dgetv0 from '@rreusser/blahpack/arpack/base/dgetv0';
*
* var N = 4;
* var A = new Float64Array( [ 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0, -1.0, 0.0, 0.0, -1.0, 2.0 ] );
* var resid = new Float64Array( N );
* var workd = new Float64Array( 2*N );
* var V = new Float64Array( N ); // one column (j=1)
* var ipntr = new Int32Array( 3 );
* var ido = new Int32Array( 1 );
* var rnorm = new Float64Array( 1 );
* var state = {};
*
* var ierr = 0;
* do {
*     ierr = dgetv0.ndarray( state, ido, 'standard', 1, false, N, 1, V, 1, N, 0, resid, 1, 0, rnorm, ipntr, 1, 0, workd, 1, 0 );
*     if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
*         // workd[ ipntr[1].. ] = A * workd[ ipntr[0].. ]
*         for ( var r = 0; r < N; r++ ) {
*             var acc = 0.0;
*             for ( var c = 0; c < N; c++ ) {
*                 acc += A[ r + (c*N) ] * workd[ ipntr[0] + c ];
*             }
*             workd[ ipntr[1] + r ] = acc;
*         }
*     }
* } while ( ido[ 0 ] !== 99 );
* // rnorm[ 0 ] now holds the norm of the starting vector.
*/
function dgetv0( state, ido, bmat, itry, initv, N, j, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, ierr ) {
	let entry = NaN, ierrLocal = NaN, jj;

	ierrLocal = 0;
	const w0 = offsetWorkd;
	const wn = offsetWorkd + ( N * strideWorkd );
	const ip0 = offsetIpntr;
	const ip1 = offsetIpntr + strideIpntr;

	// One-time initialization of the (persistent) random seed.
	if ( !state.inited ) {
		state.iseed = new Int32Array( [ 1, 3, 5, 7 ] );
		state.first = false;
		state.orth = false;
		state.iter = 0;
		state.rnorm0 = 0.0;
		state.inited = true;
	}

	// Resume dispatch: `first`/`orth` mark the two points at which the routine
	// previously returned to the caller for an operator apply.
	if ( ido[ 0 ] === 0 ) {
		entry = 0; // fresh start
	} else if ( state.first ) {
		entry = 20;
	} else if ( state.orth ) {
		entry = 40;
	} else {
		entry = 1; // resumed after OP*x
	}

	if ( entry === 0 ) {
		ierrLocal = 0;
		state.iter = 0;
		state.first = false;
		state.orth = false;
		if ( !initv ) {
			dlarnv( 2, state.iseed, 1, 0, N, resid, strideResid, offsetResid );
		}
		if ( itry === 1 ) {
			ipntr[ ip0 ] = 0;
			ipntr[ ip1 ] = N;
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, w0 );
			ido[ 0 ] = -1;
			ierr[ 0 ] = ierrLocal;
			return ipntr;
		}
		if ( itry > 1 && bmat === 'generalized' ) {
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, wn );
		}
		entry = 1;
	}

	if ( entry === 1 ) {
		state.first = true;
		if ( itry === 1 ) {
			dcopy( N, workd, strideWorkd, wn, resid, strideResid, offsetResid );
		}
		if ( bmat === 'generalized' ) {
			ipntr[ ip0 ] = N;
			ipntr[ ip1 ] = 0;
			ido[ 0 ] = 2;
			ierr[ 0 ] = ierrLocal;
			return ipntr;
		}
		// bmat === 'standard'
		dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, w0 );
		entry = 20;
	}

	if ( entry === 20 ) {
		state.first = false;
		if ( bmat === 'generalized' ) {
			state.rnorm0 = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, w0 ) ) );
		} else {
			state.rnorm0 = dnrm2( N, resid, strideResid, offsetResid );
		}
		rnorm[ 0 ] = state.rnorm0;
		if ( j === 1 ) {
			ido[ 0 ] = 99;
			ierr[ 0 ] = ierrLocal;
			return ipntr;
		}
		state.orth = true;
		entry = 30;
	}

	// Iterative refinement loop (Fortran labels 30 <-> 40).
	for ( ; ; ) {
		if ( entry === 30 ) {
			// workd[n..] = V(:,1:j-1)^T * workd[0..n-1]
			dgemv( 'transpose', N, j - 1, 1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, w0, 0.0, workd, strideWorkd, wn );

			// resid = resid - V(:,1:j-1) * workd[n..]
			dgemv( 'no-transpose', N, j - 1, -1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, wn, 1.0, resid, strideResid, offsetResid );
			if ( bmat === 'generalized' ) {
				dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, wn );
				ipntr[ ip0 ] = N;
				ipntr[ ip1 ] = 0;
				ido[ 0 ] = 2;
				ierr[ 0 ] = ierrLocal;
				return ipntr;
			}
			// bmat === 'standard'
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, w0 );
			entry = 40;
		}
		if ( entry === 40 ) {
			if ( bmat === 'generalized' ) {
				rnorm[ 0 ] = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, w0 ) ) );
			} else {
				rnorm[ 0 ] = dnrm2( N, resid, strideResid, offsetResid );
			}
			// Accept the vector once it stops shrinking (Kahan/Parlett test).
			if ( rnorm[ 0 ] > 0.717 * state.rnorm0 ) {
				ido[ 0 ] = 99;
				ierr[ 0 ] = ierrLocal;
				return ipntr;
			}
			state.iter += 1;
			if ( state.iter <= 5 ) {
				state.rnorm0 = rnorm[ 0 ];
				entry = 30;
				continue;
			}
			// Failed to produce an orthogonal vector.
			for ( jj = 0; jj < N; jj++ ) {
				resid[ offsetResid + ( jj * strideResid ) ] = 0.0;
			}
			rnorm[ 0 ] = 0.0;
			ierrLocal = -1;
			ido[ 0 ] = 99;
			ierr[ 0 ] = ierrLocal;
			return ipntr;
		}
	}
}


// EXPORTS //

export default dgetv0;
