/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params, max-statements, max-depth, max-lines-per-function */

// MODULES //

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlamch from './../../../../lapack/base/dlamch/lib/base.js';
import zcopy from './../../../../blas/base/zcopy/lib/base.js';
import zaxpy from './../../../../blas/base/zaxpy/lib/base.js';
import zhemv from './../../../../blas/base/zhemv/lib/base.js';
import zhetrs from './../../../../lapack/base/zhetrs/lib/base.js';
import zlaWwaddw from './../../../../lapack/base/zla_wwaddw/lib/base.js';
import zlaHeamv from './../../../../lapack/base/zla_heamv/lib/base.js';
import zlaLinBerr from './../../../../lapack/base/zla_lin_berr/lib/base.js';


// VARIABLES //

// Iterative refinement state machine encodings (match LAPACK reference).
const UNSTABLE_STATE = 0;
const WORKING_STATE = 1;
const CONV_STATE = 2;
const NOPROG_STATE = 3;

// BASE_RESIDUAL = 0 (unused: Fortran reference path that calls plain zhemv

// Without extended precision; we take the EXTRA_RESIDUAL path instead).
const EXTRA_RESIDUAL = 1;
const EXTRA_Y = 2;

// Error bound component indices (1-based in Fortran; here we use 0-based).
const LA_LINRX_ERR_I = 1; // second column (index 1) of ERR_BNDS_*

const NEG_ONE = new Complex128( -1.0, 0.0 );
const POS_ONE = new Complex128( 1.0, 0.0 );


// FUNCTIONS //

/**
* Computes CABS1 of a complex element stored at Float64 index `idx`.
*
* @private
* @param {Float64Array} v - interleaved real/imag view
* @param {integer} idx - index of the real part
* @returns {number} |re| + |im|
*/
function cabs1At( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Improves the computed solution to a system of linear equations by performing extra-precise iterative refinement and provides error bounds and backward error estimates for the solution of a Hermitian indefinite system `A*X = B`.
*
* ## ⚠️ Incomplete translation — NOT extra-precise
*
* The reference LAPACK routine calls `BLAS_ZHEMV_X` and `BLAS_ZHEMV2_X` from the
* XBLAS extended-precision BLAS library. XBLAS is **not** distributed with LAPACK
* 3.12.0 and has not been ported to blahpack. This port substitutes plain
* double-precision `zhemv` for both calls, so:
*
* -   `precType` is accepted for API parity but has **no precision effect**.
* -   Residuals are computed in plain double precision, not double-double.
* -   Convergence state-machine branches that depend on true extended precision are never reached.
* -   Tests validate mathematical invariants (`A*Y ≈ B`) rather than matching a Fortran reference, because the reference program cannot be linked without XBLAS.
*
* Do not rely on this module for extra-precise residuals until XBLAS is ported.
*
* ## Notes
*
* -   `IPIV` is the pivot array from `zhetrf` with the LAPACK 0-based/encoded convention used by `zhetrs`.
*
* @private
* @param {integer} prec_type - requested residual precision (accepted but ignored; see notes)
* @param {MatrixTriangle} uplo - specifies whether the upper (`'upper'`) or lower (`'lower'`) triangular part of `A` is referenced
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original Hermitian matrix (`N`-by-`N`)
* @param {integer} strideA1 - stride of the first dimension of `A` (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (in complex elements)
* @param {Complex128Array} AF - factored form of `A` from `zhetrf`
* @param {integer} strideAF1 - stride of the first dimension of `AF`
* @param {integer} strideAF2 - stride of the second dimension of `AF`
* @param {NonNegativeInteger} offsetAF - starting index for `AF`
* @param {Int32Array} IPIV - pivot indices from `zhetrf`
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was performed on `A`
* @param {Float64Array} c - column scale factors for `A`
* @param {integer} strideC - stride length for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Complex128Array} B - right-hand side matrix (`N`-by-`nrhs`)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Y - on entry, initial solution; on exit, improved solution (`N`-by-`nrhs`)
* @param {integer} strideY1 - stride of the first dimension of `Y`
* @param {integer} strideY2 - stride of the second dimension of `Y`
* @param {NonNegativeInteger} offsetY - starting index for `Y`
* @param {Float64Array} BERR_OUT - componentwise backward error per right-hand side (length `nrhs`)
* @param {integer} strideBERR_OUT - stride length for `berrOut`
* @param {NonNegativeInteger} offsetBERR_OUT - starting index for `berrOut`
* @param {integer} n_norms - number of error bound components to compute (`0`, `1`, or `2`)
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds (`nrhs`-by-`*`)
* @param {integer} strideERR_BNDS_NORM1 - stride of the first dimension of `errBndsNorm`
* @param {integer} strideERR_BNDS_NORM2 - stride of the second dimension of `errBndsNorm`
* @param {NonNegativeInteger} offsetERR_BNDS_NORM - starting index for `errBndsNorm`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds (`nrhs`-by-`*`)
* @param {integer} strideERR_BNDS_COMP1 - stride of the first dimension of `errBndsComp`
* @param {integer} strideERR_BNDS_COMP2 - stride of the second dimension of `errBndsComp`
* @param {NonNegativeInteger} offsetERR_BNDS_COMP - starting index for `errBndsComp`
* @param {Complex128Array} RES - workspace residual vector (length `N`)
* @param {integer} strideRES - stride length for `RES`
* @param {NonNegativeInteger} offsetRES - starting index for `RES`
* @param {Float64Array} AYB - real workspace (length `N`)
* @param {integer} strideAYB - stride length for `AYB`
* @param {NonNegativeInteger} offsetAYB - starting index for `AYB`
* @param {Complex128Array} DY - complex workspace for the correction vector (length `N`)
* @param {integer} strideDY - stride length for `DY`
* @param {NonNegativeInteger} offsetDY - starting index for `DY`
* @param {Complex128Array} Y_TAIL - double-double tail of `Y` (length `N`)
* @param {integer} strideY_TAIL - stride length for `yTail`
* @param {NonNegativeInteger} offsetY_TAIL - starting index for `yTail`
* @param {number} rcond - reciprocal condition number estimate for `A`
* @param {integer} ithresh - maximum number of refinement iterations
* @param {number} rthresh - convergence ratio threshold (typically `0.5`)
* @param {number} dz_ub - componentwise update upper bound (typically `0.25`)
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @returns {integer} status code (`0` on success)
*/
function zlaHerfsxExtended( prec_type, uplo, N, nrhs, A, strideA1, strideA2, offsetA, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, offsetC, B, strideB1, strideB2, offsetB, Y, strideY1, strideY2, offsetY, BERR_OUT, strideBERR_OUT, offsetBERR_OUT, n_norms, ERR_BNDS_NORM, strideERR_BNDS_NORM1, strideERR_BNDS_NORM2, offsetERR_BNDS_NORM, ERR_BNDS_COMP, strideERR_BNDS_COMP1, strideERR_BNDS_COMP2, offsetERR_BNDS_COMP, RES, strideRES, offsetRES, AYB, strideAYB, offsetAYB, DY, strideDY, offsetDY, Y_TAIL, strideY_TAIL, offsetY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) { // eslint-disable-line max-len, max-params
	let yPrecState, prevNormdx, finalDxX, finalDzZ, incrPrec, dxratMax;
	let dzratMax, yColOffC, yColOffR, prevDzZ, HUGEVAL, xState, zState, normdx;
	let ytBase, ebnOff, ebcOff, dxrat, dzrat, normx, normy, yBase, ymin, stop;
	let dzZ, dxX, cnt, dyk, yk, bv, j, i;

	// `precType` is accepted for API parity with LAPACK but currently unused:

	// See the module JSDoc for details.
	if ( prec_type < 0 ) {
		return -1;
	}

	// Quick return if possible.
	if ( N === 0 || nrhs === 0 ) {
		return 0;
	}

	const EPS = dlamch( 'epsilon' );
	HUGEVAL = dlamch( 'overflow' );
	HUGEVAL *= HUGEVAL;
	const INCR_THRESH = N * EPS;

	// Reinterpret complex arrays for direct component access inside hot loops.
	const yv = reinterpret( Y, 0 );
	const dyv = reinterpret( DY, 0 );
	const ytV = reinterpret( Y_TAIL, 0 );
	const cv = c;
	const bndsNormV = ERR_BNDS_NORM;
	const bndsCompV = ERR_BNDS_COMP;

	// Iterate over right-hand sides.
	for ( j = 0; j < nrhs; j++ ) {
		// Initial precision state: EXTRA_RESIDUAL. The Fortran reference
		// Also zeroes yTail when Y_PREC_STATE is initialized to EXTRA_Y,
		// But that branch is unreachable here since we always start from
		// EXTRA_RESIDUAL. yTail is zeroed later on each `incrPrec` tick.
		yPrecState = EXTRA_RESIDUAL;

		dxrat = 0.0;
		dxratMax = 0.0;
		dzrat = 0.0;
		dzratMax = 0.0;
		finalDxX = HUGEVAL;
		finalDzZ = HUGEVAL;
		prevNormdx = HUGEVAL;
		prevDzZ = HUGEVAL;
		dzZ = HUGEVAL;
		dxX = HUGEVAL;

		xState = WORKING_STATE;
		zState = UNSTABLE_STATE;
		incrPrec = false;

		// Column-j offsets into Y (complex elements, and Float64).
		yColOffC = offsetY + ( j * strideY2 );
		yColOffR = yColOffC * 2;

		stop = false;
		for ( cnt = 1; cnt <= ithresh && !stop; cnt++ ) {
			// Compute residual: RES = B(:,j) - A * Y(:,j).
			// Step 1: RES := B(:,j)
			zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );

			// Step 2: RES := RES - A * Y(:,j) using plain zhemv (regardless of

			// yPrecState — extended-precision BLAS is not available).
			zhemv( uplo, N, NEG_ONE, A, strideA1, strideA2, offsetA, Y, strideY1, yColOffC, POS_ONE, RES, strideRES, offsetRES );

			// DY := RES, then solve A * DY = RES.
			zcopy( N, RES, strideRES, offsetRES, DY, strideDY, offsetDY );
			zhetrs( uplo, N, 1, AF, strideAF1, strideAF2, offsetAF, IPIV, strideIPIV, offsetIPIV, DY, strideDY, strideDY, offsetDY );

			// Compute norms and ratios.
			normx = 0.0;
			normy = 0.0;
			normdx = 0.0;
			dzZ = 0.0;
			ymin = HUGEVAL;

			for ( i = 0; i < N; i++ ) {
				yk = cabs1At( yv, yColOffR + ( i * strideY1 * 2 ) );
				dyk = cabs1At( dyv, ( offsetDY * 2 ) + ( i * strideDY * 2 ) );

				if ( yk !== 0.0 ) {
					if ( dyk / yk > dzZ ) {
						dzZ = dyk / yk;
					}
				} else if ( dyk !== 0.0 ) {
					dzZ = HUGEVAL;
				}

				if ( yk < ymin ) {
					ymin = yk;
				}
				if ( yk > normy ) {
					normy = yk;
				}

				if ( colequ ) {
					if ( yk * cv[ offsetC + ( i * strideC ) ] > normx ) {
						normx = yk * cv[ offsetC + ( i * strideC ) ];
					}
					if ( dyk * cv[ offsetC + ( i * strideC ) ] > normdx ) {
						normdx = dyk * cv[ offsetC + ( i * strideC ) ];
					}
				} else {
					normx = normy;
					if ( dyk > normdx ) {
						normdx = dyk;
					}
				}
			}

			if ( normx !== 0.0 ) {
				dxX = normdx / normx;
			} else if ( normdx === 0.0 ) {
				dxX = 0.0;
			} else {
				dxX = HUGEVAL;
			}

			dxrat = normdx / prevNormdx;
			dzrat = dzZ / prevDzZ;

			// Check termination criteria.
			if ( ( ymin * rcond ) < ( INCR_THRESH * normy ) && yPrecState < EXTRA_Y ) {
				incrPrec = true;
			}

			if ( xState === NOPROG_STATE && dxrat <= rthresh ) {
				xState = WORKING_STATE;
			}
			if ( xState === WORKING_STATE ) {
				if ( dxX <= EPS ) {
					xState = CONV_STATE;
				} else if ( dxrat > rthresh ) {
					if ( yPrecState === EXTRA_Y ) {
						xState = NOPROG_STATE;
					} else {
						incrPrec = true;
					}
				} else if ( dxrat > dxratMax ) {
					dxratMax = dxrat;
				}
				if ( xState > WORKING_STATE ) {
					finalDxX = dxX;
				}
			}

			if ( zState === UNSTABLE_STATE && dzZ <= dz_ub ) {
				zState = WORKING_STATE;
			}
			if ( zState === NOPROG_STATE && dzrat <= rthresh ) {
				zState = WORKING_STATE;
			}
			if ( zState === WORKING_STATE ) {
				if ( dzZ <= EPS ) {
					zState = CONV_STATE;
				} else if ( dzZ > dz_ub ) {
					zState = UNSTABLE_STATE;
					dzratMax = 0.0;
					finalDzZ = HUGEVAL;
				} else if ( dzrat > rthresh ) {
					if ( yPrecState === EXTRA_Y ) {
						zState = NOPROG_STATE;
					} else {
						incrPrec = true;
					}
				} else if ( dzrat > dzratMax ) {
					dzratMax = dzrat;
				}
				if ( zState > WORKING_STATE ) {
					finalDzZ = dzZ;
				}
			}

			if ( xState !== WORKING_STATE && ( ignore_cwise || zState !== WORKING_STATE ) ) {
				stop = true;
			} else {
				if ( incrPrec ) {
					incrPrec = false;
					yPrecState += 1;
					ytBase = offsetY_TAIL * 2;
					for ( i = 0; i < N; i++ ) {
						ytV[ ytBase + ( i * strideY_TAIL * 2 ) ] = 0.0;
						ytV[ ytBase + ( i * strideY_TAIL * 2 ) + 1 ] = 0.0;
					}
				}
				prevNormdx = normdx;
				prevDzZ = dzZ;

				// Update solution: Y(:,j) += DY, or compensated when in EXTRA_Y.
				if ( yPrecState < EXTRA_Y ) {
					zaxpy( N, POS_ONE, DY, strideDY, offsetDY, Y, strideY1, yColOffC );
				} else {
					yBase = yColOffC;
					zlaWwaddw( N, Y, strideY1, yBase, Y_TAIL, strideY_TAIL, offsetY_TAIL, DY, strideDY, offsetDY );
				}
			}
		}

		// Set final values when loop completed without converging.
		if ( xState === WORKING_STATE ) {
			finalDxX = dxX;
		}
		if ( zState === WORKING_STATE ) {
			finalDzZ = dzZ;
		}

		// Store normwise and componentwise error bounds.
		if ( n_norms >= 1 ) {
			ebnOff = offsetERR_BNDS_NORM + ( j * strideERR_BNDS_NORM1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_NORM2 );
			bndsNormV[ ebnOff ] = finalDxX / ( 1.0 - dxratMax );
		}
		if ( n_norms >= 2 ) {
			ebcOff = offsetERR_BNDS_COMP + ( j * strideERR_BNDS_COMP1 ) + ( LA_LINRX_ERR_I * strideERR_BNDS_COMP2 );
			bndsCompV[ ebcOff ] = finalDzZ / ( 1.0 - dzratMax );
		}

		// Compute componentwise backward error:
		//     max_i ( |R_i| / ( |A| * |Y| + |B| )_i )

		// RES := B(:,j) - A * Y(:,j).
		zcopy( N, B, strideB1, offsetB + ( j * strideB2 ), RES, strideRES, offsetRES );
		zhemv( uplo, N, NEG_ONE, A, strideA1, strideA2, offsetA, Y, strideY1, yColOffC, POS_ONE, RES, strideRES, offsetRES );

		// AYB := |B(:,j)| (componentwise modulus, 1-norm variant = cabs1).
		bv = reinterpret( B, 0 );
		for ( i = 0; i < N; i++ ) {
			AYB[ offsetAYB + ( i * strideAYB ) ] = cabs1At( bv, ( ( offsetB + ( j * strideB2 ) ) * 2 ) + ( i * strideB1 * 2 ) );
		}

		// AYB := |A| * |Y(:,j)| + |B(:,j)|.
		zlaHeamv( uplo, N, 1.0, A, strideA1, strideA2, offsetA, Y, strideY1, yColOffC, 1.0, AYB, strideAYB, offsetAYB );

		// Compute backward error.
		zlaLinBerr( N, N, 1, RES, strideRES, strideRES, offsetRES, AYB, strideAYB, strideAYB, offsetAYB, BERR_OUT, strideBERR_OUT, offsetBERR_OUT + j );
	}

	return 0;
}


// EXPORTS //

export default zlaHerfsxExtended;
