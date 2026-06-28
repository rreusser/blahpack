/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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

import abs from '@stdlib/math/base/special/abs/lib/index.js';
import FLOAT64_EPS from '@stdlib/constants/float64/eps/lib/index.js';
import FLOAT64_MAX from '@stdlib/constants/float64/max/lib/index.js';
import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import daxpy from './../../../../blas/base/daxpy/lib/base.js';
import dgbmv from './../../../../blas/base/dgbmv/lib/base.js';
import dgbtrs from '../../dgbtrs/lib/base.js';
import dla_gbamv from '../../dla_gbamv/lib/base.js';
import dla_lin_berr from '../../dla_lin_berr/lib/base.js';
import dla_wwaddw from '../../dla_wwaddw/lib/base.js';


// VARIABLES //

// State constants for iterative refinement tracking.
var UNSTABLE_STATE = 0;
var WORKING_STATE = 1;
var CONV_STATE = 2;
var NOPROG_STATE = 3;

// Y precision state constants. (The Fortran reference also defines `BASE_RESIDUAL = 0`; that path is only reachable with XBLAS promotion and is omitted here.)
var EXTRA_RESIDUAL = 1;
var EXTRA_Y = 2;

// Error bound index (1 = LA_LINRX_ERR_I in Fortran).
var LA_LINRX_ERR_I = 1;

var EPS = FLOAT64_EPS;

// HUGEVAL matches DLAMCH('Overflow')*DLAMCH('Overflow') in Fortran. We cap at Float64 max since the squared product overflows.
var HUGEVAL = FLOAT64_MAX;


// MAIN //

/**
* Improves the computed solution `Y` to a banded system of linear equations using extra-precise iterative refinement and computes backward/forward error bounds.
*
* ## ⚠️ Incomplete translation — NOT extra-precise
*
* The reference LAPACK routine calls `BLAS_DGBMV_X` and `BLAS_DGBMV2_X` from the
* XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
* 3.12.0 and has not been ported to blahpack. This port substitutes plain
* double-precision `dgbmv` for both calls, so `prec_type` is accepted for API
* parity but has **no precision effect** — residuals are computed in plain
* double precision and convergence state-machine branches that depend on true
* extended precision are never reached. Do not rely on this module for
* extra-precise residuals until XBLAS is ported.
*
* ## Notes
*
* -   This routine is the banded analogue of `dla_gerfsx_extended`. It is the internal workhorse of `dgbrfsx`.
* -   Band storage follows `dgbmv`: entry `A(i,j)` of the full matrix lives at band-storage row `ku + i - j`, column `j`.
* -   `IPIV` must contain 0-based pivot indices (as produced by our `dgbtrf`).
* -   `trans_type` is the descriptive string `'no-transpose'` or `'transpose'` (in contrast to the Fortran integer code).
*
* @private
* @param {integer} prec_type - extended-precision type code (accepted for API compatibility; ignored — see notes)
* @param {string} trans_type - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - original banded matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Float64Array} AFB - `LU`-factored banded matrix from `dgbtrf`
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - 0-based pivot indices from `dgbtrf`
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was applied (`true` uses `C` to scale `Y` when measuring normwise progress)
* @param {Float64Array} c - column scaling vector
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} B - right-hand side matrix (`N`-by-`nrhs`)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Y - initial solution (updated on exit)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error per RHS
* @param {integer} strideBERR_OUT - stride for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {NonNegativeInteger} n_norms - how many error bounds to compute (0, 1, or 2)
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds matrix (`nrhs`-by-3)
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `ERR_BNDS_NORM`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `ERR_BNDS_NORM`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds matrix (`nrhs`-by-3)
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `ERR_BNDS_COMP`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `ERR_BNDS_COMP`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
* @param {Float64Array} RES - workspace of length `N` (residual)
* @param {integer} strideRES - stride for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - workspace of length `N`
* @param {integer} strideAYB - stride for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Float64Array} DY - workspace of length `N` (update direction)
* @param {integer} strideDY - stride for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Float64Array} Y_TAIL - workspace of length `N` (tail of doubled-single accumulator)
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - reciprocal condition estimate
* @param {NonNegativeInteger} ithresh - maximum number of refinement iterations
* @param {number} rthresh - ratio threshold for stagnation detection
* @param {number} dz_ub - componentwise update ratio upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence criteria
* @returns {integer} `0` on success (error state accumulates in `ERR_BNDS_*`)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
* var Int32Array = require( '@stdlib/array/int32' );
*
* var AB = new Float64Array( [ 0.0, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, -1.0, 0.5, 4.0, 0.0 ] );
* var AFB = new Float64Array( 24 );
* // populate AFB via dgbtrf, fill B, Y with LU-solved guess ...
* var B = new Float64Array( [ 1.0, 2.0, 3.0, 4.0 ] );
* var Y = new Float64Array( [ 0.19, 0.46, 0.72, 1.18 ] );
* var IPIV = new Int32Array( [ 0, 1, 2, 3 ] );
* var C = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
* var BERR_OUT = new Float64Array( 1 );
* var EBN = new Float64Array( 3 );
* var EBC = new Float64Array( 3 );
* var RES = new Float64Array( 4 );
* var AYB = new Float64Array( 4 );
* var DY = new Float64Array( 4 );
* var YT = new Float64Array( 4 );
*
* dla_gbrfsx_extended( 2, 'no-transpose', 4, 1, 1, 1, AB, 1, 3, 0, AFB, 1, 4, 0, IPIV, 1, 0, false, C, 1, 0, B, 1, 4, 0, Y, 1, 4, 0, BERR_OUT, 1, 0, 2, EBN, 1, 1, 0, EBC, 1, 1, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, YT, 1, 0, 1e-2, 10, 0.5, 0.25, false );
*/
function dla_gbrfsx_extended( prec_type, trans_type, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var y_prec_state;
	var incr_thresh;
	var prevnormdx;
	var final_dx_x;
	var final_dz_z;
	var prev_dz_z;
	var incr_prec;
	var dxratmax;
	var dzratmax;
	var x_state;
	var z_state;
	var normdx;
	var offBj;
	var offYj;
	var normx;
	var normy;
	var dxrat;
	var dzrat;
	var ymin;
	var dx_x;
	var dz_z;
	var done;
	var dyk;
	var cnt;
	var yk;
	var i;
	var j;

	// prec_type is intentionally unused in the no-XBLAS fallback (see module docs).
	incr_thresh = N * EPS;

	for ( j = 0; j < nrhs; j++ ) {
		y_prec_state = EXTRA_RESIDUAL;
		offBj = offsetB + ( j * strideB2 );
		offYj = offsetY + ( j * strideY2 );

		// NOTE: the reference Fortran initializes Y_TAIL to zero when the state is already EXTRA_Y on entry. We always start at EXTRA_RESIDUAL, so the clearing is deferred to the `incr_prec` promotion path below.

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
			// Compute residual RES = B(:,j) - op(A) * Y(:,j).
			dcopy( N, B, strideB1, offBj, RES, strideRES, offsetRES );

			// All three precision branches collapse to plain dgbmv in the

			// no-XBLAS fallback: y = -A*Y + RES.
			dgbmv( trans_type, N, N, kl, ku, -1.0, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offYj, 1.0, RES, strideRES, offsetRES );
			if ( y_prec_state === EXTRA_Y ) {
				// Additional correction from Y_TAIL would be applied here via BLAS_DGBMV2_X. Without XBLAS this is a no-op (Y_TAIL is kept at zero in the fallback path but we still account for it structurally).
				dgbmv( trans_type, N, N, kl, ku, -1.0, AB, strideAB1, strideAB2, offsetAB, Y_TAIL, strideY_TAIL, offsetY_TAIL, 1.0, RES, strideRES, offsetRES );
			}

			// Copy residual into DY and solve op(A) * DY = RES.
			dcopy( N, RES, strideRES, offsetRES, DY, strideDY, offsetDY );

			// DY is a single vector treated as an N-by-1 matrix; the second stride is irrelevant when nrhs=1.
			dgbtrs( trans_type, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, DY, strideDY, N * strideDY, offsetDY );

			// Compute norms on the update and the iterate.
			normx = 0.0;
			normy = 0.0;
			normdx = 0.0;
			dz_z = 0.0;
			ymin = HUGEVAL;

			for ( i = 0; i < N; i++ ) {
				yk = abs( Y[ offYj + ( i * strideY1 ) ] );
				dyk = abs( DY[ offsetDY + ( i * strideDY ) ] );

				if ( yk !== 0.0 ) {
					if ( ( dyk / yk ) > dz_z ) {
						dz_z = dyk / yk;
					}
				} else if ( dyk !== 0.0 ) {
					dz_z = HUGEVAL;
				}

				if ( yk < ymin ) {
					ymin = yk;
				}
				if ( yk > normy ) {
					normy = yk;
				}

				if ( colequ ) {
					if ( ( yk * c[ offsetC + ( i * strideC ) ] ) > normx ) {
						normx = yk * c[ offsetC + ( i * strideC ) ];
					}
					if ( ( dyk * c[ offsetC + ( i * strideC ) ] ) > normdx ) {
						normdx = dyk * c[ offsetC + ( i * strideC ) ];
					}
				} else {
					normx = normy;
					if ( dyk > normdx ) {
						normdx = dyk;
					}
				}
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

			// Promote precision if the componentwise update cannot be trusted.
			if ( !ignore_cwise && ( ymin * rcond ) < ( incr_thresh * normy ) && y_prec_state < EXTRA_Y ) {
				incr_prec = true;
			}

			// Normwise state machine.
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

			// Componentwise state machine.
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

			// Stop the refinement loop when the normwise state has left working and no further gains are expected.
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
				for ( i = 0; i < N; i++ ) {
					Y_TAIL[ offsetY_TAIL + ( i * strideY_TAIL ) ] = 0.0;
				}
			}

			prevnormdx = normdx;
			prev_dz_z = dz_z;

			// Update Y (with extra precision if applicable).
			if ( y_prec_state < EXTRA_Y ) {
				daxpy( N, 1.0, DY, strideDY, offsetDY, Y, strideY1, offYj );
			} else {
				dla_wwaddw( N, Y, strideY1, offYj, Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
			}
		}

		if ( x_state === WORKING_STATE ) {
			final_dx_x = dx_x;
		}
		if ( z_state === WORKING_STATE ) {
			final_dz_z = dz_z;
		}

		if ( n_norms >= 1 ) {
			ERR_BNDS_NORM[ offsetERR_BNDS_NORM + ( j * strideERR_BNDS_NORM1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_NORM2 ) ] = final_dx_x / ( 1.0 - dxratmax );
		}
		if ( n_norms >= 2 ) {
			ERR_BNDS_COMP[ offsetERR_BNDS_COMP + ( j * strideERR_BNDS_COMP1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_COMP2 ) ] = final_dz_z / ( 1.0 - dzratmax );
		}

		// Compute the final backward error for this RHS.
		dcopy( N, B, strideB1, offBj, RES, strideRES, offsetRES );
		dgbmv( trans_type, N, N, kl, ku, -1.0, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offYj, 1.0, RES, strideRES, offsetRES );

		for ( i = 0; i < N; i++ ) {
			AYB[ offsetAYB + ( i * strideAYB ) ] = abs( B[ offBj + ( i * strideB1 ) ] );
		}

		dla_gbamv( trans_type, N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offYj, 1.0, AYB, strideAYB, offsetAYB );

		// dla_lin_berr signature uses 2D strides for RES/AYB; we pass a degenerate matrix shape with second stride 0 since we only have one column's worth of data.
		dla_lin_berr( N, N, 1, RES, strideRES, 0, offsetRES, AYB, strideAYB, 0, offsetAYB, BERR_OUT, strideBERR_OUT, offsetBERR_OUT + ( j * strideBERR_OUT ) );
	}

	return 0;
}


// EXPORTS //

export default dla_gbrfsx_extended;
