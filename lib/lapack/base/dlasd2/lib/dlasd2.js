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

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Merges the two sets of singular values together into a single sorted set, then tries to deflate.
*
* @param {string} order - storage layout (`row-major` or `column-major`)
* @param {integer} NL - row dimension of the upper block (>= 1)
* @param {integer} NR - row dimension of the lower block (>= 1)
* @param {integer} SQRE - 0 if lower block is square, 1 if rectangular
* @param {Int32Array} K - output array; `K[0]` set to dimension of non-deflated matrix
* @param {Float64Array} D - singular values (length N)
* @param {Float64Array} Z - updating row vector (length N)
* @param {number} ALPHA - diagonal element associated with the added row
* @param {number} BETA - off-diagonal element associated with the added row
* @param {Float64Array} U - left singular vectors (N x N)
* @param {PositiveInteger} LDU - leading dimension of U
* @param {Float64Array} VT - right singular vectors (M x M)
* @param {PositiveInteger} LDVT - leading dimension of VT
* @param {Float64Array} DSIGMA - output singular values (length N)
* @param {Float64Array} U2 - output left singular vectors copy (N x N)
* @param {PositiveInteger} LDU2 - leading dimension of U2
* @param {Float64Array} VT2 - output right singular vectors copy (M x M)
* @param {PositiveInteger} LDVT2 - leading dimension of VT2
* @param {Int32Array} IDXP - permutation array (length N)
* @param {Int32Array} IDX - permutation array (length N)
* @param {Int32Array} IDXC - permutation array (length N)
* @param {Int32Array} IDXQ - permutation array (length N)
* @param {Int32Array} COLTYP - column type array (length max(N,4))
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info - 0 on success
*/
function dlasd2( order, NL, NR, SQRE, K, D, Z, ALPHA, BETA, U, LDU, VT, LDVT, DSIGMA, U2, LDU2, VT2, LDVT2, IDXP, IDX, IDXC, IDXQ, COLTYP ) {
	var sv21;
	var sv22;
	var su1;
	var su2;
	var sv1;
	var sv2;
	var s21;
	var s22;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'column-major' ) {
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDVT;
		s21 = 1;
		s22 = LDU2;
		sv21 = 1;
		sv22 = LDVT2;
	} else {
		su1 = LDU;
		su2 = 1;
		sv1 = LDVT;
		sv2 = 1;
		s21 = LDU2;
		s22 = 1;
		sv21 = LDVT2;
		sv22 = 1;
	}
	return base( NL, NR, SQRE, K, D, 1, 0, Z, 1, 0, ALPHA, BETA, U, su1, su2, 0, VT, sv1, sv2, 0, DSIGMA, 1, 0, U2, s21, s22, 0, VT2, sv21, sv22, 0, IDXP, 1, 0, IDX, 1, 0, IDXC, 1, 0, IDXQ, 1, 0, COLTYP, 1, 0 );
}


// EXPORTS //

export default dlasd2;
