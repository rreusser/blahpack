/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zgetrs from './../../zgetrs/lib/base.js';
import zla_geamv from './../../zla_geamv/lib/base.js';
import zla_lin_berr from './../../zla_lin_berr/lib/base.js';
import zla_wwaddw from './../../zla_wwaddw/lib/base.js';
var abs = Math.abs;
var max = Math.max;
var min = Math.min;


// VARIABLES //

var EPS = dlamch( 'epsilon' );

// Force HUGEVAL to Inf (matches Fortran `HUGEVAL = DLAMCH('O')*DLAMCH('O')`).
var HUGEVAL = Infinity;

// State constants for Y refinement (x- and z- norm tracking).
var UNSTABLE_STATE = 0;
var WORKING_STATE = 1;
var CONV_STATE = 2;
var NOPROG_STATE = 3;

// Y precision state (BASE_RESIDUAL = 0 is unreachable from this entry point).
var EXTRA_RESIDUAL = 1;
var EXTRA_Y = 2;

// Second-index slot in ERRS_N/ERRS_C updated by this routine (LA_LINRX_ERR_I = 2, 1-based → 1).
var LA_LINRX_ERR_I = 1;

// Complex constants.
var CNEG_ONE = new Complex128( -1.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Improves the computed solution to a complex general system of linear equations using extra-precise iterative refinement and provides error bounds and backward error estimates for the solution.
*
* ## ⚠️ Incomplete translation — NOT extra-precise
*
* The reference LAPACK routine calls `BLAS_ZGEMV_X` and `BLAS_ZGEMV2_X` from the
* XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
* 3.12.0 and has not been ported to blahpack. This port substitutes plain
* double-precision `zgemv` for both calls, so `prec_type` is accepted for API
* parity but has **no precision effect** — residuals are computed in plain
* double precision. Do not rely on this module for extra-precise residuals
* until XBLAS is ported.
*
* ## Notes
*
* -   `prec_type` is retained as a parameter for API compatibility with the Fortran routine but is not consulted — the JavaScript build has no XBLAS (extra-precision BLAS) backend, so all residuals are computed at base double precision.
* -   `trans_type` is a long-form string: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`.
* -   `Y`, `RES`, `DY`, and `Y_TAIL` are `Complex128Array` objects viewed via `reinterpret` for elementwise access.
* -   `A`, `AF`, `B` are `Complex128Array`; `C`, `AYB`, `BERR_OUT`, `ERRS_N`, `ERRS_C` are `Float64Array`; `IPIV` is `Int32Array`.
*
* @private
* @param {integer} prec_type - intermediate precision type (unused in JS build)
* @param {string} trans_type - transpose option: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - `N`-by-`N` coefficient matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} AF - LU factorization of `A` from `zgetrf`
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from `zgetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was applied to `A`
* @param {Float64Array} c - column scale factors (used only when `colequ` is `true`)
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - `N`-by-`nrhs` right-hand side matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - `N`-by-`nrhs` solution matrix (on entry: initial solution; on exit: improved solution)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - componentwise backward error (length `nrhs`)
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {integer} n_norms - which error bounds to compute (`>= 1` normwise, `>= 2` componentwise)
* @param {Float64Array} ERRS_N - normwise error information, shape `(nrhs, n_err_bnds)`
* @param {integer} strideERRS_N1 - stride of the first dimension of `ERRS_N`
* @param {integer} strideERRS_N2 - stride of the second dimension of `ERRS_N`
* @param {NonNegativeInteger} offsetERRS_N - starting index for `ERRS_N`
* @param {Float64Array} ERRS_C - componentwise error information, shape `(nrhs, n_err_bnds)`
* @param {integer} strideERRS_C1 - stride of the first dimension of `ERRS_C`
* @param {integer} strideERRS_C2 - stride of the second dimension of `ERRS_C`
* @param {NonNegativeInteger} offsetERRS_C - starting index for `ERRS_C`
* @param {Complex128Array} RES - workspace holding the intermediate residual (length `N`)
* @param {integer} strideRES - stride length for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - workspace holding `|op(A_s)|*|Y| + |B_s|` (length `N`)
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - workspace holding the current correction (length `N`)
* @param {integer} strideDY - stride length for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - workspace holding the trailing bits of the doubled `Y` (length `N`)
* @param {integer} strideY_TAIL - stride length for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - reciprocal scaled condition number of `A`
* @param {integer} ithresh - maximum number of refinement iterations
* @param {number} rthresh - progress threshold for refinement (typically `0.5`)
* @param {number} dz_ub - componentwise convergence stability threshold (typically `0.25`)
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @returns {integer} status code (0 = success)
*/
function zla_gerfsx_extended( prec_type, trans_type, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERRS_N, strideERRS_N1, strideERRS_N2, offsetERRS_N, ERRS_C, strideERRS_C1, strideERRS_C2, offsetERRS_C, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var y_prec_state;
	var incr_thresh;
	var prevnormdx;
	var final_dz_z;
	var final_dx_x;
	var incr_prec;
	var prev_dz_z;
	var dxratmax;
	var dzratmax;
	var offsetYj;
	var offsetBj;
	var x_state;
	var z_state;
	var normdx;
	var trans;
	var normx;
	var normy;
	var dxrat;
	var dzrat;
	var sB1x2;
	var iBERR;
	var done;
	var dx_x;
	var dz_z;
	var ymin;
	var iErN;
	var iErC;
	var jcol;
	var DYv;
	var YTv;
	var dyk;
	var cnt;
	var iDY;
	var Yv;
	var Bv;
	var iB;
	var yk;
	var ci;
	var iY;
	var iC;
	var i;

	// Quick return if possible.
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	// `trans_type` is the long-form string used by BLAS callees.
	trans = trans_type;

	incr_thresh = N * EPS;

	Yv = reinterpret( Y, 0 );
	DYv = reinterpret( DY, 0 );
	YTv = reinterpret( Y_TAIL, 0 );
	Bv = reinterpret( B, 0 );
	sB1x2 = strideB1 * 2;

	for ( jcol = 0; jcol < nrhs; jcol++ ) {
		offsetYj = offsetY + ( jcol * strideY2 );
		offsetBj = offsetB + ( jcol * strideB2 );

		y_prec_state = EXTRA_RESIDUAL;

		dxrat = 0.0;
		dxratmax = 0.0;
		dzrat = 0.0;
		dzratmax = 0.0;
		final_dx_x = HUGEVAL;
		final_dz_z = HUGEVAL;
		prevnormdx = HUGEVAL;
		prev_dz_z = HUGEVAL;
		dz_z = HUGEVAL;
		dx_x = HUGEVAL;

		x_state = WORKING_STATE;
		z_state = UNSTABLE_STATE;
		incr_prec = false;
		done = false;

		for ( cnt = 1; cnt <= ithresh; cnt++ ) {
			// Compute residual: RES := B(:, j) - op(A) * Y(:, j). The JS build has no XBLAS extra-precision gemv; all residuals are computed at base precision. The Fortran `BASE_RESIDUAL` branch is unreachable from this entry point because `y_prec_state` starts at `EXTRA_RESIDUAL` and only ever increments.
			zcopy( N, B, strideB1, offsetBj, RES, strideRES, offsetRES );
			if ( y_prec_state < EXTRA_Y ) {
				zgemv( trans, N, N, CNEG_ONE, A, strideA1, strideA2, offsetA, Y, strideY1, offsetYj, CONE, RES, strideRES, offsetRES );
			} else {
				// y_prec_state === EXTRA_Y: compute RES := B - A*(Y + Y_TAIL).
				// Fold Y_TAIL into DY as scratch to avoid modifying Y.
				zcopy( N, Y, strideY1, offsetYj, DY, strideDY, offsetDY );
				zaxpy( N, CONE, Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
				zgemv( trans, N, N, CNEG_ONE, A, strideA1, strideA2, offsetA, DY, strideDY, offsetDY, CONE, RES, strideRES, offsetRES );
			}

			// DY := RES; DY := op(A)^{-1} * DY.
			zcopy( N, RES, strideRES, offsetRES, DY, strideDY, offsetDY );
			zgetrs( trans, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, DY, strideDY, 1, offsetDY );

			// Compute relative changes and norms.
			normx = 0.0;
			normy = 0.0;
			normdx = 0.0;
			dz_z = 0.0;
			ymin = HUGEVAL;

			iY = offsetYj * 2;
			iDY = offsetDY * 2;
			iC = offsetC;
			for ( i = 0; i < N; i++ ) {
				yk = abs( Yv[ iY ] ) + abs( Yv[ iY + 1 ] );
				dyk = abs( DYv[ iDY ] ) + abs( DYv[ iDY + 1 ] );

				if ( yk !== 0.0 ) {
					dz_z = max( dz_z, dyk / yk );
				} else if ( dyk !== 0.0 ) {
					dz_z = HUGEVAL;
				}

				ymin = min( ymin, yk );
				normy = max( normy, yk );

				if ( colequ ) {
					ci = c[ iC ];
					normx = max( normx, yk * ci );
					normdx = max( normdx, dyk * ci );
				} else {
					normx = normy;
					normdx = max( normdx, dyk );
				}

				iY += strideY1 * 2;
				iDY += strideDY * 2;
				iC += strideC;
			}

			if ( normx !== 0.0 ) {
				dx_x = normdx / normx;
			} else if ( normdx === 0.0 ) {
				dx_x = 0.0;
			} else {
				dx_x = HUGEVAL;
			}

			dxrat = normdx / prevnormdx;
			dzrat = dz_z / prev_dz_z;

			// Check termination criteria.
			if ( !ignore_cwise && ymin * rcond < incr_thresh * normy && y_prec_state < EXTRA_Y ) {
				incr_prec = true;
			}

			if ( x_state === NOPROG_STATE && dxrat <= rthresh ) {
				x_state = WORKING_STATE;
			}
			if ( x_state === WORKING_STATE ) {
				if ( dx_x <= EPS ) {
					x_state = CONV_STATE;
				} else if ( dxrat > rthresh ) {
					if ( y_prec_state === EXTRA_Y ) {
						x_state = NOPROG_STATE;
					} else {
						incr_prec = true;
					}
				} else if ( dxrat > dxratmax ) {
					dxratmax = dxrat;
				}
				if ( x_state > WORKING_STATE ) {
					final_dx_x = dx_x;
				}
			}

			if ( z_state === UNSTABLE_STATE && dz_z <= dz_ub ) {
				z_state = WORKING_STATE;
			}
			if ( z_state === NOPROG_STATE && dzrat <= rthresh ) {
				z_state = WORKING_STATE;
			}
			if ( z_state === WORKING_STATE ) {
				if ( dz_z <= EPS ) {
					z_state = CONV_STATE;
				} else if ( dz_z > dz_ub ) {
					z_state = UNSTABLE_STATE;
					dzratmax = 0.0;
					final_dz_z = HUGEVAL;
				} else if ( dzrat > rthresh ) {
					if ( y_prec_state === EXTRA_Y ) {
						z_state = NOPROG_STATE;
					} else {
						incr_prec = true;
					}
				} else if ( dzrat > dzratmax ) {
					dzratmax = dzrat;
				}
				if ( z_state > WORKING_STATE ) {
					final_dz_z = dz_z;
				}
			}

			// Exit conditions (GO TO 666).
			if ( x_state !== WORKING_STATE ) {
				if ( ignore_cwise ) {
					done = true;
				} else if ( z_state === NOPROG_STATE || z_state === CONV_STATE ) {
					done = true;
				} else if ( z_state === UNSTABLE_STATE && cnt > 1 ) {
					done = true;
				}
			}
			if ( done ) {
				break;
			}

			if ( incr_prec ) {
				incr_prec = false;
				y_prec_state += 1;

				// Zero Y_TAIL for the freshly promoted precision state.
				for ( i = 0; i < N; i++ ) {
					YTv[ ( offsetY_TAIL + ( i * strideY_TAIL ) ) * 2 ] = 0.0;
					YTv[ ( ( offsetY_TAIL + ( i * strideY_TAIL ) ) * 2 ) + 1 ] = 0.0;
				}
			}

			prevnormdx = normdx;
			prev_dz_z = dz_z;

			// Update solution: Y := Y + DY, or doubled-single accumulate.
			if ( y_prec_state < EXTRA_Y ) {
				zaxpy( N, CONE, DY, strideDY, offsetDY, Y, strideY1, offsetYj );
			} else {
				zla_wwaddw( N, Y, strideY1, offsetYj, Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
			}
		}

		// Set final_* when the loop ran out of iterations.
		if ( x_state === WORKING_STATE ) {
			final_dx_x = dx_x;
		}
		if ( z_state === WORKING_STATE ) {
			final_dz_z = dz_z;
		}

		// Compute error bounds.
		if ( n_norms >= 1 ) {
			iErN = offsetERRS_N + ( jcol * strideERRS_N1 ) + ( LA_LINRX_ERR_I * strideERRS_N2 );
			ERRS_N[ iErN ] = final_dx_x / ( 1.0 - dxratmax );
		}
		if ( n_norms >= 2 ) {
			iErC = offsetERRS_C + ( jcol * strideERRS_C1 ) + ( LA_LINRX_ERR_I * strideERRS_C2 );
			ERRS_C[ iErC ] = final_dz_z / ( 1.0 - dzratmax );
		}

		// Recompute residual at base precision and compute componentwise backward error `max_i( |R(i)| / ( |op(A_s)|*|Y| + |B_s| )(i) )`.
		zcopy( N, B, strideB1, offsetBj, RES, strideRES, offsetRES );
		zgemv( trans, N, N, CNEG_ONE, A, strideA1, strideA2, offsetA, Y, strideY1, offsetYj, CONE, RES, strideRES, offsetRES );

		// AYB := |B_s|.
		iB = offsetBj * 2;
		for ( i = 0; i < N; i++ ) {
			AYB[ offsetAYB + ( i * strideAYB ) ] = abs( Bv[ iB ] ) + abs( Bv[ iB + 1 ] );
			iB += sB1x2;
		}

		// AYB := |op(A_s)| * |Y| + AYB.
		zla_geamv( trans, N, N, 1.0, A, strideA1, strideA2, offsetA, Y, strideY1, offsetYj, 1.0, AYB, strideAYB, offsetAYB );

		iBERR = offsetBERR_OUT + ( jcol * strideBERR_OUT );
		zla_lin_berr( N, N, 1, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, BERR_OUT, strideBERR_OUT, iBERR );
	}

	return 0;
}


// EXPORTS //

export default zla_gerfsx_extended;
