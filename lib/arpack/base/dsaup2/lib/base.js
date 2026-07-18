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

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dswap from './../../../../blas/base/dswap/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dgetv0 from './../../dgetv0/lib/base.js';
import dsaitr from './../../dsaitr/lib/base.js';
import dseigt from './../../dseigt/lib/base.js';
import dsgets from './../../dsgets/lib/base.js';
import dsconv from './../../dsconv/lib/base.js';
import dsortr from './../../dsortr/lib/base.js';
import dsapps from './../../dsapps/lib/base.js';


// FUNCTIONS //

/**
* Returns the reverse ordering of a `which` selection code (for `dsortr`).
*
* @private
* @param {string} which - selection code
* @returns {string} opposite ordering
*/
function opposite( which ) {
	if ( which === 'LM' ) {
		return 'SM';
	}
	if ( which === 'SM' ) {
		return 'LM';
	}
	if ( which === 'LA' ) {
		return 'SA';
	}
	return 'LA'; // 'SA'
}


// MAIN //

/**
* Intermediate driver for the Implicitly Restarted Lanczos iteration, via reverse communication.
*
* ## Reverse communication
*
* The caller drives `dsaup2` in a loop, dispatching on `ido[0]`: `-1`/`1`
* compute `Y = OP*X`; `2` compute `Y = B*X`; `3` (only when `ishift = 0`)
* return the `np[0]` user shifts in the first `np[0]` locations of `workl`;
* `99` done. Persistent state lives on `state` (`{}` on first use), which also
* nests the `dgetv0` and `dsaitr` reverse-communication state.
*
* @private
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {string} which - which eigenvalues to compute (`'LM'`, `'SM'`, `'LA'`, `'SA'`, `'BE'`)
* @param {Int32Array} nev - number of eigenvalues to compute (length-1; in/out)
* @param {Int32Array} np - number of implicit shifts (length-1; in/out)
* @param {number} tol - relative accuracy for Ritz value convergence
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {integer} mode - problem mode
* @param {integer} iupd - restart strategy flag (unused; implicit update)
* @param {integer} ishift - `0`: user shifts (via reverse communication); `1`: exact shifts
* @param {Int32Array} mxiter - maximum (in) / actual (out) number of iterations (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(nev+np))
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column layout
* @param {integer} strideH1 - stride of the first (row) dimension of `H`
* @param {integer} strideH2 - stride of the second (column) dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Float64Array} ritz - Ritz values (length nev+np; out)
* @param {integer} strideRitz - stride length for `ritz`
* @param {NonNegativeInteger} offsetRitz - starting index for `ritz`
* @param {Float64Array} bounds - Ritz estimates (length nev+np; out)
* @param {integer} strideBounds - stride length for `bounds`
* @param {NonNegativeInteger} offsetBounds - starting index for `bounds`
* @param {Float64Array} Q - rotation accumulation matrix ((nev+np)-by-(nev+np))
* @param {integer} strideQ1 - stride of the first (row) dimension of `Q`
* @param {integer} strideQ2 - stride of the second (column) dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} workl - workspace array (length >= 3*(nev+np))
* @param {integer} strideWorkl - stride length for `workl`
* @param {NonNegativeInteger} offsetWorkl - starting index for `workl`
* @param {Int32Array} ipntr - operator pointers into `workd` (0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - reverse-communication workspace (length 3*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @param {integer} infoIn - nonzero on the first call to signal a user-supplied initial residual
* @returns {integer} INFO - 0 on success; 1 (max iterations), 2 (no shifts), or a negative error code
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* // dsaup2 is an internal driver of dsaupd; see the package README for a full
* // reverse-communication example.
* var ido = new Int32Array( 1 );
* var state = {};
*/
function dsaup2( state, ido, bmat, N, which, nev, np, tol, resid, strideResid, offsetResid, mode, iupd, ishift, mxiter, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, Q, strideQ1, strideQ2, offsetQ, workl, strideWorkl, offsetWorkl, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, infoIn ) {
	let nptemp, nevbef, resume, nevd2, nevm2, ierr, temp, info, mn, mx, j;

	const generalized = ( bmat === 'generalized' );
	info = 0;

	if ( ido[ 0 ] === 0 ) {
		state.eps23 = Math.pow( dlamch( 'epsilon' ), 2.0 / 3.0 );
		state.nev0 = nev[ 0 ];
		state.np0 = np[ 0 ];
		state.kplusp = nev[ 0 ] + np[ 0 ];
		state.nconv = 0;
		state.iter = 0;
		state.getv0 = true;
		state.update = false;
		state.ushift = false;
		state.cnorm = false;
		state.initv = ( infoIn !== 0 ); // nonzero `infoIn` => user provided the initial residual
		state.gv0 = {};
		state.saitr = {};
		state.rnorm = new Float64Array( 1 );
	}
	const kplusp = state.kplusp;

	// Get a (possibly random) starting vector and force it into the range of OP.
	if ( state.getv0 ) {
		info = dgetv0( state.gv0, ido, bmat, 1, state.initv, N, 1, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, state.rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd );
		if ( ido[ 0 ] !== 99 ) {
			return info;
		}
		if ( state.rnorm[ 0 ] === 0.0 ) {
			info = -9;
			ido[ 0 ] = 99;
			return info;
		}
		state.getv0 = false;
		ido[ 0 ] = 0;
	}

	// Resume dispatch.
	if ( state.update ) {
		resume = 20;
	} else if ( state.ushift ) {
		resume = 50;
	} else if ( state.cnorm ) {
		resume = 100;
	} else {
		resume = 0; // compute the first nev0 steps of the factorization
	}

	if ( resume === 0 ) {
		info = dsaitr( state.saitr, ido, bmat, N, 0, state.nev0, mode, resid, strideResid, offsetResid, state.rnorm, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd );
		if ( ido[ 0 ] !== 99 ) {
			return info;
		}
		if ( info > 0 ) {
			np[ 0 ] = info;
			mxiter[ 0 ] = state.iter;
			info = -9999;
			ido[ 0 ] = 99;
			return info;
		}
		resume = 1000;
	}

	// Main Lanczos iteration loop (each iteration implicitly restarts in place).
	for ( ; ; ) {
		if ( resume === 1000 ) {
			state.iter += 1;
			ido[ 0 ] = 0;
			resume = 20;
		}
		if ( resume === 20 ) {
			state.update = true;
			info = dsaitr( state.saitr, ido, bmat, N, nev[ 0 ], np[ 0 ], mode, resid, strideResid, offsetResid, state.rnorm, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd );
			if ( ido[ 0 ] !== 99 ) {
				return info;
			}
			if ( info > 0 ) {
				np[ 0 ] = info;
				mxiter[ 0 ] = state.iter;
				info = -9999;
				ido[ 0 ] = 99;
				return info;
			}
			state.update = false;

			// Eigenvalues and error bounds of the current tridiagonal matrix.
			ierr = dseigt( state.rnorm[ 0 ], kplusp, H, strideH1, strideH2, offsetH, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl );
			if ( ierr !== 0 ) {
				info = -8;
				ido[ 0 ] = 99;
				return info;
			}

			// Save a copy of the eigenvalues and bounds.
			dcopy( kplusp, ritz, strideRitz, offsetRitz, workl, strideWorkl, offsetWorkl + ( kplusp * strideWorkl ) );
			dcopy( kplusp, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl + ( 2 * kplusp * strideWorkl ) );

			// Select the wanted Ritz values and their bounds.
			nev[ 0 ] = state.nev0;
			np[ 0 ] = state.np0;
			dsgets( ishift, which, nev[ 0 ], np[ 0 ], ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl );

			// Convergence test on the wanted Ritz values RITZ(NP+1:NEV+NP).
			dcopy( nev[ 0 ], bounds, strideBounds, offsetBounds + ( np[ 0 ] * strideBounds ), workl, strideWorkl, offsetWorkl + ( np[ 0 ] * strideWorkl ) );
			state.nconv = dsconv( nev[ 0 ], ritz, strideRitz, offsetRitz + ( np[ 0 ] * strideRitz ), workl, strideWorkl, offsetWorkl + ( np[ 0 ] * strideWorkl ), tol );

			// Count unwanted Ritz values with zero Ritz estimate (split blocks).
			nptemp = np[ 0 ];
			for ( j = 0; j < nptemp; j++ ) {
				if ( bounds[ offsetBounds + ( j * strideBounds ) ] === 0.0 ) {
					np[ 0 ] -= 1;
					nev[ 0 ] += 1;
				}
			}

			if ( state.nconv >= state.nev0 || state.iter > mxiter[ 0 ] || np[ 0 ] === 0 ) {
				// Prepare to exit: sort the converged Ritz values into place.
				if ( which === 'BE' ) {
					dsortr( 'SA', true, kplusp, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
					nevd2 = ( state.nev0 / 2 ) | 0;
					nevm2 = state.nev0 - nevd2;
					if ( nev[ 0 ] > 1 ) {
						np[ 0 ] = kplusp - state.nev0;
						mn = Math.min( nevd2, np[ 0 ] );
						mx = Math.max( kplusp - nevd2, kplusp - np[ 0 ] );
						dswap( mn, ritz, strideRitz, offsetRitz + ( nevm2 * strideRitz ), ritz, strideRitz, offsetRitz + ( mx * strideRitz ) );
						dswap( mn, bounds, strideBounds, offsetBounds + ( nevm2 * strideBounds ), bounds, strideBounds, offsetBounds + ( mx * strideBounds ) );
					}
				} else {
					dsortr( opposite( which ), true, kplusp, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
				}

				// Scale the Ritz estimates, sort, and unscale.
				for ( j = 0; j < state.nev0; j++ ) {
					temp = Math.max( state.eps23, Math.abs( ritz[ offsetRitz + ( j * strideRitz ) ] ) );
					bounds[ offsetBounds + ( j * strideBounds ) ] /= temp;
				}
				dsortr( 'LA', true, state.nev0, bounds, strideBounds, offsetBounds, ritz, strideRitz, offsetRitz );
				for ( j = 0; j < state.nev0; j++ ) {
					temp = Math.max( state.eps23, Math.abs( ritz[ offsetRitz + ( j * strideRitz ) ] ) );
					bounds[ offsetBounds + ( j * strideBounds ) ] *= temp;
				}

				// Sort the "converged" Ritz values into their final position.
				if ( which === 'BE' ) {
					dsortr( 'LA', true, state.nconv, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
				} else {
					dsortr( which, true, state.nconv, ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds );
				}

				// Use H(1,1) to communicate rnorm to dseupd.
				H[ offsetH ] = state.rnorm[ 0 ];

				if ( state.iter > mxiter[ 0 ] && state.nconv < nev[ 0 ] ) {
					info = 1;
				}
				if ( np[ 0 ] === 0 && state.nconv < state.nev0 ) {
					info = 2;
				}
				np[ 0 ] = state.nconv;
				mxiter[ 0 ] = state.iter;
				nev[ 0 ] = state.nconv;
				ido[ 0 ] = 99;
				return info;
			}
			if ( state.nconv < nev[ 0 ] && ishift === 1 ) {
				// Adjust NEV and the shifts to prevent stagnation.
				nevbef = nev[ 0 ];
				nev[ 0 ] += Math.min( state.nconv, ( np[ 0 ] / 2 ) | 0 );
				if ( nev[ 0 ] === 1 && kplusp >= 6 ) {
					nev[ 0 ] = ( kplusp / 2 ) | 0;
				} else if ( nev[ 0 ] === 1 && kplusp > 2 ) {
					nev[ 0 ] = 2;
				}
				np[ 0 ] = kplusp - nev[ 0 ];
				if ( nevbef < nev[ 0 ] ) {
					dsgets( ishift, which, nev[ 0 ], np[ 0 ], ritz, strideRitz, offsetRitz, bounds, strideBounds, offsetBounds, workl, strideWorkl, offsetWorkl );
				}
			}

			if ( ishift === 0 ) {
				// User specified shifts: return to the caller to compute them.
				state.ushift = true;
				ido[ 0 ] = 3;
				return info;
			}
			resume = 50;
		}
		if ( resume === 50 ) {
			state.ushift = false;
			if ( ishift === 0 ) {
				dcopy( np[ 0 ], workl, strideWorkl, offsetWorkl, ritz, strideRitz, offsetRitz );
			}

			// Apply the NP implicit shifts by QR bulge chasing.
			dsapps( N, nev[ 0 ], np[ 0 ], ritz, strideRitz, offsetRitz, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, resid, strideResid, offsetResid, Q, strideQ1, strideQ2, offsetQ, workd, strideWorkd, offsetWorkd );

			// Compute the B-norm of the updated residual; keep B*resid in workd(0:N-1).
			state.cnorm = true;
			if ( generalized ) {
				dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( N * strideWorkd ) );
				ipntr[ offsetIpntr ] = N;
				ipntr[ offsetIpntr + strideIpntr ] = 0;
				ido[ 0 ] = 2;
				return info;
			}
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd );
			resume = 100;
		}
		if ( resume === 100 ) {
			if ( generalized ) {
				state.rnorm[ 0 ] = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd ) ) );
			} else {
				state.rnorm[ 0 ] = dnrm2( N, resid, strideResid, offsetResid );
			}
			state.cnorm = false;
			resume = 1000;
		}
	}
}


// EXPORTS //

export default dsaup2;
