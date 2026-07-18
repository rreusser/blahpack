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

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import ddot from './../../../../blas/base/ddot/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dlascl from './../../../../lapack/base/dlascl/lib/base.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import dgetv0 from './../../dgetv0/lib/base.js';


// MAIN //

/**
* Extends a symmetric Lanczos factorization `OP*V_k = V_k*H_k + f_k*e_k^T` from length `k` to length `k+np`, via reverse communication.
*
* ## Reverse communication
*
* The caller drives `dsaitr` in a loop, dispatching on `ido[0]`: `1` compute
* `Y = OP*X` (X at `workd[ipntr[0]]`, Y to `workd[ipntr[1]]`); `2` compute
* `Y = B*X` (generalized problem); `99` done. On entry (`ido[0] = 0`) `resid`
* must hold the initial residual vector and `rnorm[0]` its `B`-norm. State that
* persists across calls lives on the caller-supplied `state` object (`{}` on
* first use); it also nests the `dgetv0` restart state.
*
* @private
* @param {Object} state - persistent reverse-communication state (pass `{}` on first use)
* @param {Int32Array} ido - reverse-communication flag (length-1; in/out)
* @param {string} bmat - `'standard'` or `'generalized'` eigenproblem
* @param {NonNegativeInteger} N - order of the problem
* @param {NonNegativeInteger} k - current order of the factorization (columns already built)
* @param {NonNegativeInteger} np - number of additional steps to extend the factorization
* @param {integer} mode - problem mode (from `iparam[6]`); `2` is the `B*OP = A` shortcut
* @param {Float64Array} resid - residual vector (length N; in/out)
* @param {integer} strideResid - stride length for `resid`
* @param {NonNegativeInteger} offsetResid - starting index for `resid`
* @param {Float64Array} rnorm - B-norm of the residual (length-1; in/out)
* @param {Float64Array} V - Lanczos basis (N-by-(k+np))
* @param {integer} strideV1 - stride of the first (row) dimension of `V`
* @param {integer} strideV2 - stride of the second (column) dimension of `V`
* @param {NonNegativeInteger} offsetV - starting index for `V`
* @param {Float64Array} H - tridiagonal matrix in 2-column layout (subdiagonal in column 0, diagonal in column 1)
* @param {integer} strideH1 - stride of the first (row) dimension of `H`
* @param {integer} strideH2 - stride of the second (column) dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {Int32Array} ipntr - pointers into `workd` for the operator (length >= 3; 0-based; out)
* @param {integer} strideIpntr - stride length for `ipntr`
* @param {NonNegativeInteger} offsetIpntr - starting index for `ipntr`
* @param {Float64Array} workd - reverse-communication workspace (length 3*N)
* @param {integer} strideWorkd - stride length for `workd`
* @param {NonNegativeInteger} offsetWorkd - starting index for `workd`
* @returns {integer} INFO - 0 on success, or j (the size of the converged invariant subspace) if a restart failed
*
* @example
* var Int32Array = require( '@stdlib/array/int32' );
* var Float64Array = require( '@stdlib/array/float64' );
*
* var N = 4;
* var resid = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
* var rnorm = new Float64Array( [ 2.0 ] );
* var V = new Float64Array( N * 3 );
* var H = new Float64Array( 3 * 2 );
* var workd = new Float64Array( 3 * N );
* var ipntr = new Int32Array( 3 );
* var ido = new Int32Array( 1 );
* var state = {};
* // Drive the loop applying OP (ido[0]===1) and B (ido[0]===2) until ido[0]===99.
*/
function dsaitr( state, ido, bmat, N, k, np, mode, resid, strideResid, offsetResid, rnorm, V, strideV1, strideV2, offsetV, H, strideH1, strideH2, offsetH, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd ) {
	
	let rnorm1;
	let temp1;
	let wnorm;
	let info;
	
	
	
	let pc;
	let jj;
	let oc; // 0-based column offset of the current V column
	let hj; // 0-based index of H(j, .)

	const generalized = ( bmat === 'generalized' );

	// One-time machine-parameter initialization.
	if ( !state.saitrInit ) {
		state.safmin = dlamch( 'safe-minimum' );
		state.gv0 = {};
		state.saitrInit = true;
	}

	info = 0;

	if ( ido[ 0 ] === 0 ) {
		state.step3 = false;
		state.step4 = false;
		state.rstart = false;
		state.orth1 = false;
		state.orth2 = false;
		state.j = k + 1; // 1-based factorization step
		state.ipj = 0;
		state.irj = N;
		state.ivj = 2 * N;
	}
	const ipj = state.ipj;
	const irj = state.irj;
	const ivj = state.ivj;

	// Resume dispatch: a set flag marks where we last returned to the caller; otherwise (re)start the main Arnoldi loop.
	if ( state.step3 ) {
		pc = 50;
	} else if ( state.step4 ) {
		pc = 60;
	} else if ( state.orth1 ) {
		pc = 70;
	} else if ( state.orth2 ) {
		pc = 90;
	} else if ( state.rstart ) {
		pc = 30;
	} else {
		pc = 1000;
	}

	for ( ; ; ) {
		oc = offsetV + ( ( state.j - 1 ) * strideV2 );
		hj = offsetH + ( ( state.j - 1 ) * strideH1 );

		if ( pc === 1000 ) {
			// Check for exact zero: an invariant subspace has been found.
			if ( rnorm[ 0 ] > 0.0 ) {
				pc = 40;
			} else {
				state.itry = 1;
				pc = 20;
			}
		}
		if ( pc === 20 ) {
			state.rstart = true;
			ido[ 0 ] = 0;
			pc = 30;
		}
		if ( pc === 30 ) {
			// Generate a new starting vector orthogonal to the current basis.
			// dgetv0 is itself reverse-communication; it shares `ido`.
			state.ierr = dgetv0( state.gv0, ido, bmat, state.itry, false, N, state.j, V, strideV1, strideV2, offsetV, resid, strideResid, offsetResid, rnorm, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd );
			if ( ido[ 0 ] !== 99 ) {
				return info;
			}
			if ( state.ierr < 0 ) {
				state.itry += 1;
				if ( state.itry <= 3 ) {
					pc = 20;
					continue;
				}
				// Give up after several restart attempts.
				info = state.j - 1;
				ido[ 0 ] = 99;
				return info;
			}
			pc = 40;
		}
		if ( pc === 40 ) {
			// STEP 2: v_{j} = r_{j-1}/rnorm, p_{j} = p_{j}/rnorm.
			dcopy( N, resid, strideResid, offsetResid, V, strideV1, oc );
			if ( rnorm[ 0 ] >= state.safmin ) {
				temp1 = 1.0 / rnorm[ 0 ];
				dscal( N, temp1, V, strideV1, oc );
				dscal( N, temp1, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) );
			} else {
				dlascl( 'general', 0, 0, rnorm[ 0 ], 1.0, N, 1, V, strideV1, strideV2, oc );
				dlascl( 'general', 0, 0, rnorm[ 0 ], 1.0, N, 1, workd, strideWorkd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) );
			}

			// STEP 3: r_{j} = OP*v_{j}. Exit to compute OP*v_{j}.
			state.step3 = true;
			dcopy( N, V, strideV1, oc, workd, strideWorkd, offsetWorkd + ( ivj * strideWorkd ) );
			ipntr[ offsetIpntr ] = ivj;
			ipntr[ offsetIpntr + strideIpntr ] = irj;
			ipntr[ offsetIpntr + ( 2 * strideIpntr ) ] = ipj;
			ido[ 0 ] = 1;
			return info;
		}
		if ( pc === 50 ) {
			state.step3 = false;

			// workd[irj..] := OP*v_{j}; copy into resid.
			dcopy( N, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ), resid, strideResid, offsetResid );

			// STEP 4: finish extending. If mode === 2, B*OP = A (skip B*OP).
			if ( mode === 2 ) {
				pc = 65;
			} else {
				if ( generalized ) {
					state.step4 = true;
					ipntr[ offsetIpntr ] = irj;
					ipntr[ offsetIpntr + strideIpntr ] = ipj;
					ido[ 0 ] = 2;
					return info;
				}
				dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) );
				pc = 60;
			}
		}
		if ( pc === 60 ) {
			state.step4 = false;
			pc = 65;
		}
		if ( pc === 65 ) {
			// B-norm of OP*v_{j}.
			if ( mode === 2 ) {
				wnorm = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ivj * strideWorkd ) ) ) );
			} else if ( generalized ) {
				wnorm = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) ) ) );
			} else {
				wnorm = dnrm2( N, resid, strideResid, offsetResid );
			}
			state.wnorm = wnorm;

			// Classical Gram-Schmidt: w_{j} = V_{j}^T B OP v_{j}; r_{j} = OP v_{j} - V_{j} w_{j}.
			if ( mode === 2 ) {
				dgemv( 'transpose', N, state.j, 1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( ivj * strideWorkd ), 0.0, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ) );
			} else {
				dgemv( 'transpose', N, state.j, 1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ), 0.0, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ) );
			}
			dgemv( 'no-transpose', N, state.j, -1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ), 1.0, resid, strideResid, offsetResid );

			// Extend H.
			H[ hj + strideH2 ] = workd[ offsetWorkd + ( ( irj + state.j - 1 ) * strideWorkd ) ];
			if ( state.j === 1 || state.rstart ) {
				H[ hj ] = 0.0;
			} else {
				H[ hj ] = rnorm[ 0 ];
			}

			state.orth1 = true;
			state.iter = 0;
			if ( generalized ) {
				dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ) );
				ipntr[ offsetIpntr ] = irj;
				ipntr[ offsetIpntr + strideIpntr ] = ipj;
				ido[ 0 ] = 2;
				return info;
			}
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) );
			pc = 70;
		}
		if ( pc === 70 ) {
			state.orth1 = false;

			// B-norm of r_{j}.
			if ( generalized ) {
				rnorm[ 0 ] = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) ) ) );
			} else {
				rnorm[ 0 ] = dnrm2( N, resid, strideResid, offsetResid );
			}

			// STEP 5: iterative refinement, unless already orthogonal enough.
			if ( rnorm[ 0 ] > 0.717 * state.wnorm ) {
				pc = 100;
			} else {
				pc = 80;
			}
		}
		if ( pc === 80 ) {
			// s = V_{j}^T B r_{j}; r_{j} = r_{j} - V_{j} s.
			dgemv( 'transpose', N, state.j, 1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ), 0.0, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ) );
			dgemv( 'no-transpose', N, state.j, -1.0, V, strideV1, strideV2, offsetV, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ), 1.0, resid, strideResid, offsetResid );

			if ( state.j === 1 || state.rstart ) {
				H[ hj ] = 0.0;
			}
			H[ hj + strideH2 ] += workd[ offsetWorkd + ( ( irj + state.j - 1 ) * strideWorkd ) ];

			state.orth2 = true;
			if ( generalized ) {
				dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( irj * strideWorkd ) );
				ipntr[ offsetIpntr ] = irj;
				ipntr[ offsetIpntr + strideIpntr ] = ipj;
				ido[ 0 ] = 2;
				return info;
			}
			dcopy( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) );
			pc = 90;
		}
		if ( pc === 90 ) {
			// B-norm of the corrected residual.
			if ( generalized ) {
				rnorm1 = Math.sqrt( Math.abs( ddot( N, resid, strideResid, offsetResid, workd, strideWorkd, offsetWorkd + ( ipj * strideWorkd ) ) ) );
			} else {
				rnorm1 = dnrm2( N, resid, strideResid, offsetResid );
			}

			if ( rnorm1 > 0.717 * rnorm[ 0 ] ) {
				rnorm[ 0 ] = rnorm1;
			} else {
				rnorm[ 0 ] = rnorm1;
				state.iter += 1;
				if ( state.iter <= 1 ) {
					pc = 80;
					continue;
				}
				// RESID is numerically in the span of V.
				for ( jj = 0; jj < N; jj++ ) {
					resid[ offsetResid + ( jj * strideResid ) ] = 0.0;
				}
				rnorm[ 0 ] = 0.0;
			}
			pc = 100;
		}
		if ( pc === 100 ) {
			state.rstart = false;
			state.orth2 = false;

			// Ensure the last subdiagonal is non-negative; else flip a sign.
			if ( H[ hj ] < 0.0 ) {
				H[ hj ] = -H[ hj ];
				if ( state.j < k + np ) {
					dscal( N, -1.0, V, strideV1, offsetV + ( state.j * strideV2 ) );
				} else {
					dscal( N, -1.0, resid, strideResid, offsetResid );
				}
			}

			// STEP 6: advance.
			state.j += 1;
			if ( state.j > k + np ) {
				ido[ 0 ] = 99;
				return info;
			}
			pc = 1000;
		}
	}
}


// EXPORTS //

export default dsaitr;
