/**
* @license Apache-2.0
*
* Copyright (c) 2026 The Stdlib Authors.
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

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real N-by-N nonsymmetric matrix A, plus optionally a balancing transformation, reciprocal condition numbers of eigenvalues, and reciprocal condition numbers of right eigenvectors.
*
* When `work` is `null`, this wrapper auto-allocates a workspace of size `max(1, N*(N+7))`. When `iwork` is `null`, this wrapper auto-allocates an integer workspace of size `max(1, 2*(N-1))`. Prefer passing caller-owned buffers for batched use.
*
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix (column-major, LDA x N)
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {Float64Array} VL - output: left eigenvectors
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Float64Array} SCALE - output: balancing/scaling details (length N)
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues (length N)
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors (length N)
* @param {(Float64Array|null)} [work=null] - caller-provided workspace (size >= max(1, N*(N+7))), or `null` to auto-allocate
* @param {integer} [strideWork=1] - stride for work
* @param {(Int32Array|null)} [iwork=null] - caller-provided integer workspace (size >= max(1, 2*(N-1))), or `null` to auto-allocate
* @param {integer} [strideIwork=1] - stride for iwork
* @throws {TypeError} must supply valid `balanc`, `jobvl`, `jobvr`, `sense`
* @throws {RangeError} `N` must be nonnegative; leading dimensions must be at least `max(1,N)`
* @returns {Object} result object: `{ info, ilo, ihi, abnrm }`
*/
function dgeevx( balanc, jobvl, jobvr, sense, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, SCALE, RCONDE, RCONDV, work, strideWork, iwork, strideIwork ) {
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `balanc` value. Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `sense` value. Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVL < 1 || ( jobvl === 'compute-vectors' && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( jobvr === 'compute-vectors' && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( work === null || work === void 0 ) {
		work = new Float64Array( max( 1, N * ( N + 7 ) ) );
		strideWork = 1;
	}
	if ( iwork === null || iwork === void 0 ) {
		iwork = new Int32Array( max( 1, 2 * ( N - 1 ) ) );
		strideIwork = 1;
	}
	return base( balanc, jobvl, jobvr, sense, N, A, 1, LDA, 0, WR, strideWR, 0, WI, strideWI, 0, VL, 1, LDVL, 0, VR, 1, LDVR, 0, SCALE, 1, 0, RCONDE, 1, 0, RCONDV, 1, 0, work, strideWork, 0, iwork, strideIwork, 0 );
}


// EXPORTS //

export default dgeevx;
