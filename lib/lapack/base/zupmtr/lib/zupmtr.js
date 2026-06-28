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

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
var isMatrixTranspose = isTransposeOperation;
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Overwrites a general complex M-by-N matrix C with Q_C, C_Q, QH_C, or C_QH, where Q is a complex unitary matrix from ZHPTRD (packed storage).
*
* @param {string} side - 'left' or 'right'
* @param {string} uplo - 'upper' or 'lower'
* @param {string} trans - 'no-transpose' or 'conjugate-transpose'
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Complex128Array} AP - packed reflector storage from zhptrd
* @param {Complex128Array} TAU - scalar factors from zhptrd
* @param {Complex128Array} C - input/output M-by-N matrix (column-major)
* @param {PositiveInteger} LDC - leading dimension of C
* @param {Complex128Array} WORK - workspace array
* @throws {TypeError} First argument must be a valid operation side
* @throws {TypeError} Second argument must be a valid matrix triangle
* @throws {TypeError} Third argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zupmtr( side, uplo, trans, M, N, AP, TAU, C, LDC, WORK ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Float64Array( 1 ); // TODO: set correct size
	}
	return base( side, uplo, trans, M, N, AP, 1, 0, TAU, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zupmtr;
