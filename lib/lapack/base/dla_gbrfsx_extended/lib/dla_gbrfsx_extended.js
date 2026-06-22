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

/* eslint-disable max-len, max-params, camelcase */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution `Y` to a banded system of linear equations using extra-precise iterative refinement and computes backward/forward error bounds.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} prec_type - extended-precision type code (ignored — XBLAS fallback)
* @param {string} trans_type - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} kl - number of sub-diagonals
* @param {NonNegativeInteger} ku - number of super-diagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AB - original banded matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} AFB - `LU`-factored banded matrix
* @param {PositiveInteger} LDAFB - leading dimension of `AFB`
* @param {Int32Array} IPIV - 0-based pivot indices
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {boolean} colequ - whether column equilibration was applied
* @param {Float64Array} c - column scaling vector
* @param {integer} strideC - stride for `c`
* @param {Float64Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} Y - initial solution
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} BERR_OUT - output backward error per RHS
* @param {integer} strideBERR_OUT - stride for `BERR_OUT`
* @param {NonNegativeInteger} n_norms - number of error bounds to compute
* @param {Float64Array} ERR_BNDS_NORM - normwise error bounds matrix
* @param {PositiveInteger} LDERR_BNDS_NORM - leading dimension of `ERR_BNDS_NORM`
* @param {Float64Array} ERR_BNDS_COMP - componentwise error bounds matrix
* @param {PositiveInteger} LDERR_BNDS_COMP - leading dimension of `ERR_BNDS_COMP`
* @param {Float64Array} RES - workspace of length `N`
* @param {integer} strideRES - stride for `RES`
* @param {Float64Array} AYB - workspace of length `N`
* @param {integer} strideAYB - stride for `AYB`
* @param {Float64Array} DY - workspace of length `N`
* @param {integer} strideDY - stride for `DY`
* @param {Float64Array} Y_TAIL - workspace of length `N`
* @param {integer} strideY_TAIL - stride for `Y_TAIL`
* @param {number} rcond - reciprocal condition estimate
* @param {NonNegativeInteger} ithresh - maximum number of refinement iterations
* @param {number} rthresh - ratio threshold for stagnation detection
* @param {number} dz_ub - componentwise update ratio upper bound
* @param {boolean} ignore_cwise - whether to ignore componentwise convergence
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} `trans_type` must be `'no-transpose'` or `'transpose'`
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `nrhs` must be a nonnegative integer
* @returns {integer} `0` on success
*/
function dla_gbrfsx_extended( order, prec_type, trans_type, N, kl, ku, nrhs, AB, LDAB, AFB, LDAFB, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, B, LDB, Y, LDY, BERR_OUT, strideBERR_OUT, n_norms, ERR_BNDS_NORM, LDERR_BNDS_NORM, ERR_BNDS_COMP, LDERR_BNDS_COMP, RES, strideRES, AYB, strideAYB, DY, strideDY, Y_TAIL, strideY_TAIL, rcond, ithresh, rthresh, dz_ub, ignore_cwise ) {
	var serr_bnds_norm1;
	var serr_bnds_norm2;
	var serr_bnds_comp1;
	var serr_bnds_comp2;
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
	if ( trans_type !== 'no-transpose' && trans_type !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be `no-transpose` or `transpose`. Value: `%s`.', trans_type ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, kl + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,kl+ku+1). Value: `%d`.', LDAB ) );
	}
	if ( LDAFB < max( 1, ( 2 * kl ) + ku + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,2*kl+ku+1). Value: `%d`.', LDAFB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 19th argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 21st argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( LDERR_BNDS_NORM < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. 26th argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDERR_BNDS_NORM ) );
	}
	if ( LDERR_BNDS_COMP < max( 1, nrhs ) ) {
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
	return base( prec_type, trans_type, N, kl, ku, nrhs, AB, sab1, sab2, 0, AFB, safb1, safb2, 0, IPIV, strideIPIV, offsetIPIV, colequ, c, strideC, 0, B, sb1, sb2, 0, Y, sy1, sy2, 0, BERR_OUT, strideBERR_OUT, 0, n_norms, ERR_BNDS_NORM, serr_bnds_norm1, serr_bnds_norm2, 0, ERR_BNDS_COMP, serr_bnds_comp1, serr_bnds_comp2, 0, RES, strideRES, 0, AYB, strideAYB, 0, DY, strideDY, 0, Y_TAIL, strideY_TAIL, 0, rcond, ithresh, rthresh, dz_ub, ignore_cwise );
}


// EXPORTS //

export default dla_gbrfsx_extended;
