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

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Improves the computed solution using extra-precise iterative refinement for Hermitian indefinite matrices.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {integer} precType - requested residual precision (ignored; see base.js)
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} A - original Hermitian matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - factored form of `A`
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @param {Int32Array} IPIV - pivot indices
* @param {boolean} colequ - whether column equilibration was performed on `A`
* @param {Float64Array} c - column scale factors
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} Y - initial/improved solution
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @param {Float64Array} berrOut - componentwise backward error
* @param {integer} nNorms - number of error bound components
* @param {Float64Array} errBndsNorm - normwise error bounds
* @param {PositiveInteger} ldErrBndsNorm - leading dimension of `errBndsNorm`
* @param {Float64Array} errBndsComp - componentwise error bounds
* @param {PositiveInteger} ldErrBndsComp - leading dimension of `errBndsComp`
* @param {Complex128Array} RES - workspace residual
* @param {Float64Array} AYB - real workspace
* @param {Complex128Array} DY - correction workspace
* @param {Complex128Array} yTail - double-double tail of `Y`
* @param {number} rcond - reciprocal condition number
* @param {integer} ithresh - maximum refinement iterations
* @param {number} rthresh - convergence ratio threshold
* @param {number} dzUb - componentwise update upper bound
* @param {boolean} ignoreCwise - whether to ignore componentwise convergence
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} third argument must be a valid matrix triangle
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {integer} status code (`0` on success)
*/
function zlaHerfsxExtended( order, precType, uplo, N, nrhs, A, LDA, AF, LDAF, IPIV, colequ, c, B, LDB, Y, LDY, berrOut, nNorms, errBndsNorm, ldErrBndsNorm, errBndsComp, ldErrBndsComp, RES, AYB, DY, yTail, rcond, ithresh, rthresh, dzUb, ignoreCwise ) {
	var saf1;
	var saf2;
	var sen1;
	var sen2;
	var sec1;
	var sec2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sy1;
	var sy2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		saf1 = 1;
		saf2 = LDAF;
		sb1 = 1;
		sb2 = LDB;
		sy1 = 1;
		sy2 = LDY;
		sen1 = 1;
		sen2 = ldErrBndsNorm;
		sec1 = 1;
		sec2 = ldErrBndsComp;
	} else {
		sa1 = LDA;
		sa2 = 1;
		saf1 = LDAF;
		saf2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sy1 = LDY;
		sy2 = 1;
		sen1 = ldErrBndsNorm;
		sen2 = 1;
		sec1 = ldErrBndsComp;
		sec2 = 1;
	}
	return base( precType, uplo, N, nrhs, A, sa1, sa2, 0, AF, saf1, saf2, 0, IPIV, 1, 0, colequ, c, 1, 0, B, sb1, sb2, 0, Y, sy1, sy2, 0, berrOut, 1, 0, nNorms, errBndsNorm, sen1, sen2, 0, errBndsComp, sec1, sec2, 0, RES, 1, 0, AYB, 1, 0, DY, 1, 0, yTail, 1, 0, rcond, ithresh, rthresh, dzUb, ignoreCwise );
}


// EXPORTS //

export default zlaHerfsxExtended;
