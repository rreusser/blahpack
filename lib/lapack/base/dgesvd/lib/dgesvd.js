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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the singular value decomposition (SVD) of a real M-by-N matrix.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} jobu - `'all-columns'`: all M columns of U returned, `'economy'`: first min(M,N) columns, `'overwrite'`: overwrite A, `'none'`: no U
* @param {string} jobvt - `'all-rows'`: all N rows of V^T returned, `'economy'`: first min(M,N) rows, `'overwrite'`: overwrite A, `'none'`: no VT
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - output array of singular values (length min(M,N))
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} U - output matrix for left singular vectors
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Float64Array} VT - output matrix for right singular vectors (V^T)
* @param {PositiveInteger} LDVT - leading dimension of `VT`
* @param {(Float64Array|null)} [work=null] - caller-provided workspace, or `null` to auto-allocate
* @param {integer} [strideWork=1] - stride for `work`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid job type
* @throws {TypeError} third argument must be a valid job type
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @throws {RangeError} thirteenth argument must be greater than or equal to max(1,N) (row-major) or max(1,M) (column-major)
* @returns {integer} info status code (0 if successful, >0 if DBDSQR did not converge)
*/
function dgesvd( order, jobu, jobvt, M, N, A, LDA, s, strideS, U, LDU, VT, LDVT, work, strideWork ) {
	var minmn;
	var maxmn;
	var lwork;
	var sa1;
	var sa2;
	var su1;
	var su2;
	var sv1;
	var sv2;
	var ow;
	var os;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobu !== 'all-columns' && jobu !== 'economy' && jobu !== 'overwrite' && jobu !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobu` value. Value: `%s`.', jobu ) );
	}
	if ( jobvt !== 'all-rows' && jobvt !== 'economy' && jobvt !== 'overwrite' && jobvt !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvt` value. Value: `%s`.', jobvt ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDU < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDU ) );
	}
	if ( order === 'column-major' && LDU < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDU ) );
	}
	if ( order === 'row-major' && LDVT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' && LDVT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVT ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		su1 = 1;
		su2 = LDU;
		sv1 = 1;
		sv2 = LDVT;
	} else {
		sa1 = LDA;
		sa2 = 1;
		su1 = LDU;
		su2 = 1;
		sv1 = LDVT;
		sv2 = 1;
	}
	if ( work === null || work === void 0 ) {
		minmn = Math.min( M, N );
		maxmn = Math.max( M, N );
		lwork = Math.max( 1, 5 * minmn, ( 3 * minmn ) + maxmn, ( 2 * maxmn * maxmn ) + ( 3 * maxmn ) + maxmn );
		work = new Float64Array( lwork );
		strideWork = 1;
	}
	os = stride2offset( N, strideS );
	ow = stride2offset( work.length, strideWork );
	return base( jobu, jobvt, M, N, A, sa1, sa2, 0, s, strideS, os, U, su1, su2, 0, VT, sv1, sv2, 0, work, strideWork, ow );
}


// EXPORTS //

export default dgesvd;
