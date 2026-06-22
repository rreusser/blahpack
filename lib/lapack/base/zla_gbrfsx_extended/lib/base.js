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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zgbmv from './../../../../blas/base/zgbmv/lib/base.js';
import zgbtrs from './../../zgbtrs/lib/base.js';
import zla_gbamv from './../../zla_gbamv/lib/base.js';
import zla_lin_berr from './../../zla_lin_berr/lib/base.js';
import zla_wwaddw from './../../zla_wwaddw/lib/base.js';
import dlamch from './../../dlamch/lib/base.js';


// VARIABLES //

// State constants (match LAPACK reference).
var UNSTABLE_STATE = 0;
var WORKING_STATE = 1;
var CONV_STATE = 2;
var NOPROG_STATE = 3;

var BASE_RESIDUAL = 0;
var EXTRA_Y = 2;

// ERR_BNDS_* column index (LA_LINRX_ERR_I = 2 in 1-based Fortran -> 1 in 0-based JS).
var LA_LINRX_ERR_I = 1;

var EPS = dlamch( 'epsilon' );
var HUGEVAL = dlamch( 'overflow' ) * dlamch( 'overflow' );

var CONE = new Complex128( 1.0, 0.0 );
var CNONE = new Complex128( -1.0, 0.0 );


// FUNCTIONS //

/**
* Computes `CABS1(z) = |re(z)| + |im(z)|` on an interleaved Float64 view.
*
* @private
* @param {Float64Array} v - interleaved complex view
* @param {integer} idx - index of the real part
* @returns {number} cabs1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a complex banded linear system using.
* iterative refinement and computes error bounds and backward error estimates.
*
* This is the blahpack translation of LAPACK's ZLA_GBRFSX_EXTENDED. Extended-
* precision residual/update paths (`BLAS_ZGBMV_X`, `BLAS_ZGBMV2_X`) are not
* available in this environment; this implementation always uses the
* `BASE_RESIDUAL` code path regardless of the `prec_type` / initial
* `Y_PREC_STATE`. `Y_TAIL` is written only when the EXTRA_Y branch is reached
* (which it never is), but is still touched on entry.
*
* IPIV must contain 0-based pivot indices (as produced by `zgbtrf`).
*
* @private
* @param {integer} prec_type - requested extended-precision type (ignored in this build)
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix _A_
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - original band matrix (KL+KU+1 by N)
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} AFB - LU factorization of `AB` from `zgbtrf`
* @param {integer} strideAFB1 - stride of the first dimension of `AFB`
* @param {integer} strideAFB2 - stride of the second dimension of `AFB`
* @param {NonNegativeInteger} offsetAFB - starting index for `AFB`
* @param {Int32Array} IPIV - 0-based pivot indices
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether columns were equilibrated
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix (N by NRHS)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - solution matrix (improved on exit)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - output backward error (length nrhs)
* @param {integer} strideBERR_OUT - stride for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {integer} n_norms - number of error bound columns to write
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds (nrhs by 3)
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds (nrhs by 3)
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index
* @param {Complex128Array} RES - residual workspace (length N)
* @param {integer} strideRES - stride for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace `|A|*|Y|+|B|` (length N)
* @param {integer} strideAYB - stride for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - refinement update workspace (length N)
* @param {integer} strideDY - stride for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - extended-precision tail (length N)
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL`
* @param {number} rcond - estimate of the reciprocal condition number
* @param {integer} ithresh - maximum number of refinement iterations
* @param {number} rthresh - progress threshold ratio
* @param {number} dz_ub - upper bound on componentwise stopping criterion
* @param {boolean} ignore_cwise - skip componentwise tracking
* @returns {integer} status code (0 = success)
*/
function zla_gbrfsx_extended( prec_type, trans, N, kl, ku, nrhs, AB, strideAB1, strideAB2, offsetAB, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
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
	var Y_TAILv;
	var normdx;
	var normx;
	var normy;
	var dxrat;
	var dzrat;
	var iBerr;
	var dx_x;
	var dz_z;
	var ymin;
	var done;
	var dyk;
	var DYv;
	var iYj;
	var iDY;
	var iYT;
	var iBj;
	var iEN;
	var iEC;
	var cnt;
	var yk;
	var Yv;
	var Bv;
	var iY;
	var iC;
	var i;
	var j;
	var m;

	// Unused in base-residual path — silence linter.
	prec_type |= 0;

	// Reinterpret complex arrays as Float64 views.
	Yv = reinterpret( Y, 0 );
	DYv = reinterpret( DY, 0 );
	Y_TAILv = reinterpret( Y_TAIL, 0 );

	m = kl + ku + 1;
	incr_thresh = N * EPS;

	for ( j = 0; j < nrhs; j++ ) {
		// NOTE: reference LAPACK sets Y_PREC_STATE = EXTRA_RESIDUAL here and
		// Would then dispatch to BLAS_ZGBMV_X for the residual. Since that
		// extended-precision BLAS is not available, we fold EXTRA_RESIDUAL
		// Into BASE_RESIDUAL (which calls ZGBMV). Starting at BASE_RESIDUAL
		// Matches the modified Fortran fixture generator and keeps the state
		// machine's EXTRA_Y transitions reachable only via precision
		// Escalation (disabled in the fixture, but still exercised).
		y_prec_state = BASE_RESIDUAL;

		// Extra-precision tail would only be zeroed when entering EXTRA_Y.
		if ( y_prec_state === EXTRA_Y ) {
			iYT = offsetY_TAIL * 2;
			for ( i = 0; i < N; i++ ) {
				Y_TAILv[ iYT ] = 0.0;
				Y_TAILv[ iYT + 1 ] = 0.0;
				iYT += strideY_TAIL * 2;
			}
		}

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

		for ( cnt = 1; cnt <= ithresh && !done; cnt++ ) {
			// RES = B(:,j)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );

			// Extended-precision ZGBMV variants are not available; always use

			// The standard base residual: RES := RES - op(A) * Y(:,j).

			// Note: the reference uses M = KL+KU+1 (rows of AB) for the BASE

			// Branch and N for the extended-precision branches; since we fold

			// EXTRA_RESIDUAL into BASE_RESIDUAL, we match that (M rows).
			zgbmv( trans, m, N, kl, ku, CNONE, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offsetY + ( j * strideY2 ), CONE, RES, strideRES, offsetRES );

			// DY = RES; solve op(A) * DY = RES using the LU factorization.
			zcopy( N, RES, strideRES, offsetRES, DY, strideDY, offsetDY );
			zgbtrs( trans, N, kl, ku, 1, AFB, strideAFB1, strideAFB2, offsetAFB, IPIV, strideIPIV, offsetIPIV, DY, strideDY, 1, offsetDY );

			// Calculate relative changes DX_X, DZ_Z and ratios DXRAT, DZRAT.
			normx = 0.0;
			normy = 0.0;
			normdx = 0.0;
			dz_z = 0.0;
			ymin = HUGEVAL;

			iYj = ( offsetY + ( j * strideY2 ) ) * 2;
			iDY = offsetDY * 2;
			iC = offsetC;
			for ( i = 0; i < N; i++ ) {
				yk = cabs1( Yv, iYj );
				dyk = cabs1( DYv, iDY );

				if ( yk !== 0.0 ) {
					if ( dyk / yk > dz_z ) {
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
					if ( yk * c[ iC ] > normx ) {
						normx = yk * c[ iC ];
					}
					if ( dyk * c[ iC ] > normdx ) {
						normdx = dyk * c[ iC ];
					}
				} else {
					normx = normy;
					if ( dyk > normdx ) {
						normdx = dyk;
					}
				}

				iYj += strideY1 * 2;
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

			// Exit (Fortran: GOTO 666) if progress check fails.
			if ( x_state !== WORKING_STATE ) {
				if ( ignore_cwise ) {
					done = true;
				} else if ( z_state === NOPROG_STATE || z_state === CONV_STATE ) {
					done = true;
				} else if ( z_state === UNSTABLE_STATE && cnt > 1 ) {
					done = true;
				}
			}

			if ( !done ) {
				if ( incr_prec ) {
					incr_prec = false;
					y_prec_state += 1;
					iYT = offsetY_TAIL * 2;
					for ( i = 0; i < N; i++ ) {
						Y_TAILv[ iYT ] = 0.0;
						Y_TAILv[ iYT + 1 ] = 0.0;
						iYT += strideY_TAIL * 2;
					}
				}

				prevnormdx = normdx;
				prev_dz_z = dz_z;

				// Y(:,j) := Y(:,j) + DY  (or WWADDW when EXTRA_Y).
				if ( y_prec_state < EXTRA_Y ) {
					zaxpy( N, CONE, DY, strideDY, offsetDY, Y, strideY1, offsetY + ( j * strideY2 ) );
				} else {
					zla_wwaddw( N, Y, strideY1, offsetY + ( j * strideY2 ), Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
				}
			}
		}
		// End-of-loop label `666`.

		if ( x_state === WORKING_STATE ) {
			final_dx_x = dx_x;
		}
		if ( z_state === WORKING_STATE ) {
			final_dz_z = dz_z;
		}

		if ( n_norms >= 1 ) {
			iEN = offsetERR_BNDS_NORM + ( j * strideERR_BNDS_NORM1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_NORM2 );
			ERR_BNDS_NORM[ iEN ] = final_dx_x / ( 1.0 - dxratmax );
		}
		if ( n_norms >= 2 ) {
			iEC = offsetERR_BNDS_COMP + ( j * strideERR_BNDS_COMP1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_COMP2 );
			ERR_BNDS_COMP[ iEC ] = final_dz_z / ( 1.0 - dzratmax );
		}

		// Compute componentwise relative backward error BERR_OUT(j):
		// RES = B(:,j);  RES := RES - op(A)*Y(:,j);
		// AYB = |B(:,j)|;  AYB := |A| * |Y(:,j)| + AYB;
		// BERR_OUT(j) = zla_lin_berr( N, 1, RES, AYB ).
		zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );
		zgbmv( trans, N, N, kl, ku, CNONE, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offsetY + ( j * strideY2 ), CONE, RES, strideRES, offsetRES );

		Bv = reinterpret( B, 0 );
		iBj = ( offsetB + ( j * strideB2 ) ) * 2;
		iY = offsetAYB;
		for ( i = 0; i < N; i++ ) {
			AYB[ iY ] = cabs1( Bv, iBj );
			iBj += strideB1 * 2;
			iY += strideAYB;
		}

		zla_gbamv( trans, N, N, kl, ku, 1.0, AB, strideAB1, strideAB2, offsetAB, Y, strideY1, offsetY + ( j * strideY2 ), 1.0, AYB, strideAYB, offsetAYB );

		iBerr = offsetBERR_OUT + ( j * strideBERR_OUT );
		zla_lin_berr( N, N, 1, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, BERR_OUT, 1, iBerr );
	}
	return 0;
}


// EXPORTS //

export default zla_gbrfsx_extended;
