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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a real N-by-N nonsymmetric matrix A.
*
* When `work` is `null`, this wrapper auto-allocates a workspace of size
* `max(1, 4*N)` elements. Prefer passing a caller-owned buffer for batched use.
*
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input matrix (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {Float64Array} VL - output: left eigenvectors (N x N), not referenced if jobvl=`'no-vectors'`
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - output: right eigenvectors (N x N), not referenced if jobvr=`'no-vectors'`
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {(Float64Array|null)} work - caller-provided workspace, or `null` to auto-allocate
* @param {integer} strideWork - stride for work (must be 1)
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgeev( jobvl, jobvr, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, work, strideWork ) { // eslint-disable-line max-len, max-params
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var owi;
	var owr;
	var ow;
	var sa1;
	var sa2;

	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	if ( work === null || work === void 0 ) {
		work = new Float64Array( max( 1, 4 * N ) );
		strideWork = 1;
	}
	sa1 = 1;
	sa2 = LDA;
	svl1 = 1;
	svl2 = LDVL;
	svr1 = 1;
	svr2 = LDVR;
	owr = stride2offset( N, strideWR );
	owi = stride2offset( N, strideWI );
	ow = stride2offset( work.length, strideWork );
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, WR, strideWR, owr, WI, strideWI, owi, VL, svl1, svl2, 0, VR, svr1, svr2, 0, work, strideWork, ow ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeev;
