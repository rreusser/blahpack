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

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function, max-lines, camelcase */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zhemv from './../../../../blas/base/zhemv/lib/base.js';
import zpotrs from './../../zpotrs/lib/base.js';
import zla_heamv from './../../zla_heamv/lib/base.js';
import zla_wwaddw from './../../zla_wwaddw/lib/base.js';
import zla_lin_berr from './../../zla_lin_berr/lib/base.js';


// VARIABLES //

// LAPACK state constants.
var UNSTABLE_STATE = 0;
var WORKING_STATE = 1;
var CONV_STATE = 2;
var NOPROG_STATE = 3;

// Note: Fortran's `BASE_RESIDUAL = 0` is omitted — this port collapses all

// Residual branches onto the base precision path.
var EXTRA_RESIDUAL = 1;
var EXTRA_Y = 2;

// Error bound indices (0-based). `LA_LINRX_ERR_I = 2` in 1-based Fortran.
var LA_LINRX_ERR_I = 1;

// `EPS = dlamch('Epsilon')` (IEEE 754 double). Matches Fortran `DLAMCH('E')`.
var EPS = 1.1102230246251565e-16;

// `HUGEVAL = DLAMCH('Overflow')^2` forced to infinity in Fortran.
var HUGEVAL = Number.POSITIVE_INFINITY;

var MCONE = new Complex128( -1.0, 0.0 );
var CONE = new Complex128( 1.0, 0.0 );


// FUNCTIONS //

/**
* Returns `|Re(z)| + |Im(z)|` at the given index of a Float64 view of a Complex128Array.
*
* @private
* @param {Float64Array} v - interleaved real/imag view
* @param {integer} idx - Float64 index of the real part
* @returns {number} `|Re| + |Im|`
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian positive-definite matrices.
*
* ## ⚠️ Incomplete translation — NOT extra-precise
*
* The reference LAPACK routine calls `BLAS_ZHEMV_X` and `BLAS_ZHEMV2_X` from the
* XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
* 3.12.0 and has not been ported to blahpack. This port substitutes plain
* double-precision `zhemv` for both calls, so:
*
* -   `prec_type` is accepted for API parity but has **no precision effect**.
* -   Residuals are computed in plain double precision, not double-double.
* -   `Y_TAIL` is untouched by the extra-precision branches.
* -   Convergence state-machine branches that depend on true extended precision are never reached.
*
* Do not rely on this module for extra-precise residuals until XBLAS is ported.
*
* @private
* @param {integer} prec_type - internal refinement precision selector (accepted for API compatibility; ignored)
* @param {string} uplo - `'upper'` if the upper triangle of `A` is stored, `'lower'` otherwise
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original `N`-by-`N` Hermitian positive-definite matrix
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} AF - Cholesky factor of `A` (from `zpotrf`)
* @param {integer} strideAF1 - stride of the first dimension of `AF` (complex elements)
* @param {integer} strideAF2 - stride of the second dimension of `AF` (complex elements)
* @param {NonNegativeInteger} offsetAF - starting index for `AF` (complex elements)
* @param {boolean} colequ - `true` if column equilibration was applied to `A`
* @param {Float64Array} c - column scale factors for `A` (length `N`; only accessed when `colequ === true`)
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix `(N, nrhs)`
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Y - solution matrix `(N, nrhs)` (in: initial solution; out: improved)
* @param {integer} strideY1 - stride of the first dimension of `Y` (complex elements)
* @param {integer} strideY2 - stride of the second dimension of `Y` (complex elements)
* @param {NonNegativeInteger} offsetY - starting index for `Y` (complex elements)
* @param {Float64Array} BERR_OUT - output componentwise relative backward error (length `nrhs`)
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `BERR_OUT`
* @param {integer} n_norms - `>= 1` to return normwise error bounds, `>= 2` to also return componentwise
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds `(nrhs, N_ERR_BNDS)`
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `ERR_BNDS_NORM`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `ERR_BNDS_NORM`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds `(nrhs, N_ERR_BNDS)`
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `ERR_BNDS_COMP`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `ERR_BNDS_COMP`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `ERR_BNDS_COMP`
* @param {Complex128Array} RES - complex workspace for the intermediate residual (length `N`)
* @param {integer} strideRES - stride length for `RES` (complex elements)
* @param {NonNegativeInteger} offsetRES - starting index for `RES` (complex elements)
* @param {Float64Array} AYB - real workspace for `|A|*|Y|+|B|` (length `N`)
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - complex workspace for the refinement correction (length `N`)
* @param {integer} strideDY - stride length for `DY` (complex elements)
* @param {NonNegativeInteger} offsetDY - starting index for `DY` (complex elements)
* @param {Complex128Array} Y_TAIL - complex workspace for the trailing bits of the solution (length `N`)
* @param {integer} strideY_TAIL - stride length for `Y_TAIL` (complex elements)
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `Y_TAIL` (complex elements)
* @param {number} rcond - reciprocal scaled condition number of `A`
* @param {integer} ithresh - maximum number of refinement iterations per right-hand side
* @param {number} rthresh - refinement-progress threshold in `(0, 1]`
* @param {number} dz_ub - componentwise stability threshold in `(0, 1]`
* @param {boolean} ignore_cwise - when `true`, ignore componentwise convergence
* @returns {integer} status code (`0` on success, mirroring `INFO` from `zpotrs`)
*/
function zla_porfsx_extended( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var y_prec_state;
	var incr_thresh;
	var prevnormdx;
	var final_dx_x;
	var final_dz_z;
	var incr_prec;
	var prev_dz_z;
	var dxratmax;
	var dzratmax;
	var Y_TAILv;
	var x_state;
	var z_state;
	var normdx;
	var normy;
	var normx;
	var dxrat;
	var dzrat;
	var ymin;
	var info;
	var dx_x;
	var dz_z;
	var DYv;
	var cnt;
	var dyk;
	var sy1;
	var sy2;
	var sb1;
	var sb2;
	var ci;
	var yk;
	var Bv;
	var Yv;
	var oY;
	var oB;
	var oD;
	var oT;
	var sD;
	var sT;
	var i;
	var j;

	info = 0;
	incr_thresh = N * EPS;

	// `prec_type` is accepted for Fortran-API parity but not consumed — all

	// Residual branches compute the base-precision residual.
	if ( prec_type < 0 ) {
		return info;
	}

	// Reinterpret complex workspaces as Float64 views so we can zero them
	// element-wise and read |Y(i,j)| / |DY(i)| without allocations.
	Yv = reinterpret( Y, 0 );
	Y_TAILv = reinterpret( Y_TAIL, 0 );
	DYv = reinterpret( DY, 0 );
	Bv = reinterpret( B, 0 );
	sy1 = strideY1 * 2;
	sy2 = strideY2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oY = offsetY * 2;
	oB = offsetB * 2;
	oT = offsetY_TAIL * 2;
	sT = strideY_TAIL * 2;
	oD = offsetDY * 2;
	sD = strideDY * 2;

	for ( j = 0; j < nrhs; j++ ) {
		// The Fortran reference conditionally zeroes `Y_TAIL` here when it
		// Starts in `EXTRA_Y`, but the initial state is always
		// `EXTRA_RESIDUAL`, so this guard is omitted.
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

		for ( cnt = 1; cnt <= ithresh; cnt++ ) {
			// Compute residual RES = B(:,j) - A*Y(:,j).
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );

			// NOTE: Only BASE_RESIDUAL is supported — the XBLAS extra-precision

			// Variants `BLAS_ZHEMV_X` / `BLAS_ZHEMV2_X` are not available in

			// This port. All branches compute the standard residual.
			zhemv( uplo, N, MCONE, A, strideA1, strideA2, offsetA, Y, strideY1, offsetY + ( j * strideY2 ), CONE, RES, strideRES, offsetRES );

			// Solve the correction equation: DY = A^{-1} * RES.
			zcopy( N, RES, strideRES, offsetRES, DY, strideDY, offsetDY );
			info = zpotrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, DY, strideDY, strideDY * N, offsetDY );
			if ( info !== 0 ) {
				return info;
			}

			// Compute DX_X, DZ_Z and ratios.
			normx = 0.0;
			normy = 0.0;
			normdx = 0.0;
			dz_z = 0.0;
			ymin = HUGEVAL;

			for ( i = 0; i < N; i++ ) {
				yk = cabs1( Yv, oY + ( i * sy1 ) + ( j * sy2 ) );
				dyk = cabs1( DYv, oD + ( i * sD ) );

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
					ci = c[ offsetC + ( i * strideC ) ];
					if ( yk * ci > normx ) {
						normx = yk * ci;
					}
					if ( dyk * ci > normdx ) {
						normdx = dyk * ci;
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

			// Termination criteria.
			if ( ymin * rcond < incr_thresh * normy && y_prec_state < EXTRA_Y ) {
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

			if ( x_state !== WORKING_STATE && ( ignore_cwise || z_state !== WORKING_STATE ) ) {
				break;
			}

			if ( incr_prec ) {
				incr_prec = false;
				y_prec_state += 1;
				for ( i = 0; i < N; i++ ) {
					Y_TAILv[ oT + ( i * sT ) ] = 0.0;
					Y_TAILv[ oT + ( i * sT ) + 1 ] = 0.0;
				}
			}

			prevnormdx = normdx;
			prev_dz_z = dz_z;

			// Update solution.
			if ( y_prec_state < EXTRA_Y ) {
				zaxpy( N, CONE, DY, strideDY, offsetDY, Y, strideY1, offsetY + ( j * strideY2 ) );
			} else {
				zla_wwaddw( N, Y, strideY1, offsetY + ( j * strideY2 ), Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
			}
		}

		// When the `cnt` loop exhausts `ithresh` iterations without breaking
		// Out via the termination criteria, the tracked errors may still be
		// At their `HUGEVAL` sentinel. Mirror the Fortran post-loop finalize.
		if ( x_state === WORKING_STATE ) {
			final_dx_x = dx_x;
		}
		if ( z_state === WORKING_STATE ) {
			final_dz_z = dz_z;
		}

		// Set the (j, LA_LINRX_ERR_I) entries of ERR_BNDS_NORM / ERR_BNDS_COMP.
		if ( n_norms >= 1 ) {
			ERR_BNDS_NORM[ offsetERR_BNDS_NORM + ( j * strideERR_BNDS_NORM1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_NORM2 ) ] = final_dx_x / ( 1.0 - dxratmax );
		}
		if ( n_norms >= 2 ) {
			ERR_BNDS_COMP[ offsetERR_BNDS_COMP + ( j * strideERR_BNDS_COMP1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_COMP2 ) ] = final_dz_z / ( 1.0 - dzratmax );
		}

		// Compute componentwise relative backward error.
		// RES = B(:,j) - A*Y(:,j).
		zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );
		zhemv( uplo, N, MCONE, A, strideA1, strideA2, offsetA, Y, strideY1, offsetY + ( j * strideY2 ), CONE, RES, strideRES, offsetRES );

		// AYB(i) = |B(i,j)|.
		for ( i = 0; i < N; i++ ) {
			AYB[ offsetAYB + ( i * strideAYB ) ] = cabs1( Bv, oB + ( i * sb1 ) + ( j * sb2 ) );
		}

		// AYB = |A|*|Y(:,j)| + |B(:,j)|.
		zla_heamv( uplo, N, 1.0, A, strideA1, strideA2, offsetA, Y, strideY1, offsetY + ( j * strideY2 ), 1.0, AYB, strideAYB, offsetAYB );

		// BERR_OUT(j) = max_i ( |RES(i)| / AYB(i) ).
		zla_lin_berr( N, N, 1, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, BERR_OUT, strideBERR_OUT, offsetBERR_OUT + ( j * strideBERR_OUT ) );
	}

	return info;
}


// EXPORTS //

export default zla_porfsx_extended;
