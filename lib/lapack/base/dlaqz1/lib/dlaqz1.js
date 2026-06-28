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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Sets `v` to a scalar multiple of the first column of the QZ shift product.
* for a 3-by-3 matrix pencil `(A,B)`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {Float64Array} A - the 3-by-3 matrix `A`
* @param {PositiveInteger} LDA - leading dimension of `A` (must be `>= 3`)
* @param {Float64Array} B - the 3-by-3 matrix `B`
* @param {PositiveInteger} LDB - leading dimension of `B` (must be `>= 3`)
* @param {number} sr1 - real part of the first shift
* @param {number} sr2 - real part of the second shift
* @param {number} si - imaginary part of the shift
* @param {number} beta1 - first beta scalar
* @param {number} beta2 - second beta scalar
* @param {Float64Array} v - output array of length `>= 3`
* @param {integer} strideV - stride length for `v`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} third argument must be `>= 3`
* @throws {RangeError} fifth argument must be `>= 3`
* @returns {Float64Array} `v`
*/
function dlaqz1( order, A, LDA, B, LDB, sr1, sr2, si, beta1, beta2, v, strideV ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var ov;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( LDA < 3 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be greater than or equal to 3. Value: `%d`.', LDA ) );
	}
	if ( LDB < 3 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to 3. Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	ov = stride2offset( 3, strideV );
	base( A, sa1, sa2, 0, B, sb1, sb2, 0, sr1, sr2, si, beta1, beta2, v, strideV, ov );
	return v;
}


// EXPORTS //

export default dlaqz1;
