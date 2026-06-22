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

/* eslint-disable max-len, max-params, max-statements, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for complex banded matrices.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} prec_type - requested extended-precision type (ignored in this build)
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - input banded matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} AFB - LU factorization of `AB`
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - pivot indices (0-based)
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - column-equilibration flag
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride length for `c`
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} Y - current solution matrix (improved on exit)
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} BERR_OUT - output backward error (length nrhs)
* @param {integer} strideBERR_OUT - stride length for `BERR_OUT`
* @param {integer} n_norms - number of error bound columns to write
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds (nrhs by 3)
* @param {PositiveInteger} LDERR_BNDS_NORM - leading dimension of `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds (nrhs by 3)
* @param {PositiveInteger} LDERR_BNDS_COMP - leading dimension of `ERR_BNDS_COMP`
* @param {Complex128Array} RES - residual workspace (length N)
* @param {integer} strideRES - stride for `RES`
* @param {Float64Array} AYB - real workspace `|A|*|Y|+|B|` (length N)
* @param {integer} strideAYB - stride for `AYB`
* @param {Complex128Array} DY - refinement update workspace (length N)
* @param {integer} strideDY - stride for `DY`
* @param {Complex128Array} Y_TAIL - extended-precision tail workspace (length N)
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {number} rcond - estimate of the reciprocal condition number
* @param {integer} ithresh - maximum number of refinement iterations
* @param {number} rthresh - progress threshold ratio
* @param {number} dz_ub - upper bound on componentwise stopping criterion
* @param {boolean} ignore_cwise - skip componentwise tracking
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} leading dimensions must be `>= max(1, N)` when `order = 'row-major'`
* @returns {integer} status code (0 = success)
*/
function zla_gbrfsx_extended( order, prec_type, trans, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, DY, strideDY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var serr_bnds_comp1;
	var serr_bnds_comp2;
	var serr_bnds_norm1;
	var serr_bnds_norm2;
	var safb1;
	var safb2;
	var sab1;
	var sab2;
	var sb1;
	var sb2;
	var sy1;
	var sy2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( order === 'row-major' && LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 19th argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 21st argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( order === 'row-major' && LDERR_BNDS_NORM < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. 26th argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDERR_BNDS_NORM ) );
	}
	if ( order === 'row-major' && LDERR_BNDS_COMP < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. 28th argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDERR_BNDS_COMP ) );
	}
	if ( order === 'column-major' ) {
		sab1 = 1;
		sab2 = LDAB;
		safb1 = 1;
		safb2 = LDAFB;
		sb1 = 1;
		sb2 = LDB;
		sy1 = 1;
		sy2 = LDY;
		serr_bnds_norm1 = 1;
		serr_bnds_norm2 = LDERR_BNDS_NORM;
		serr_bnds_comp1 = 1;
		serr_bnds_comp2 = LDERR_BNDS_COMP;
	} else {
		sab1 = LDAB;
		sab2 = 1;
		safb1 = LDAFB;
		safb2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sy1 = LDY;
		sy2 = 1;
		serr_bnds_norm1 = LDERR_BNDS_NORM;
		serr_bnds_norm2 = 1;
		serr_bnds_comp1 = LDERR_BNDS_COMP;
		serr_bnds_comp2 = 1;
	}
	return base( prec_type, trans, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, 0, B, sb1, sb2, 0, Y, sy1, sy2, 0, BERR_OUT, strideBERR_OUT, 0, n_norms, ERR_BNDS_NORM, serr_bnds_norm1, serr_bnds_norm2, 0, ERR_BNDS_COMP, serr_bnds_comp1, serr_bnds_comp2, 0, RES, strideRES, 0, AYB, strideAYB, 0, DY, strideDY, 0, Y_TAIL, strideY_TAIL, 0, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default zla_gbrfsx_extended;
