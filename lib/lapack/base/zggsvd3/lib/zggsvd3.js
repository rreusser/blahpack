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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the generalized singular value decomposition (GSVD) of an M-by-N complex matrix A and a P-by-N complex matrix B.
*
* @param {string} jobu - `'compute-U'` or `'none'`
* @param {string} jobv - `'compute-V'` or `'none'`
* @param {string} jobq - `'compute-Q'` or `'none'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {NonNegativeInteger} p - number of rows of B
* @param {Int32Array} K - output array; K[0] receives first subblock dimension
* @param {Int32Array} l - output array; l[0] receives second subblock dimension
* @param {Complex128Array} A - M-by-N matrix A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - P-by-N matrix B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} ALPHA - output array for alpha values
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Float64Array} BETA - output array for beta values
* @param {integer} strideBETA - stride length for `BETA`
* @param {Complex128Array} U - M-by-M unitary matrix
* @param {PositiveInteger} LDU - leading dimension of `U`
* @param {Complex128Array} V - P-by-P unitary matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Complex128Array} Q - N-by-N unitary matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride length for `WORK`
* @param {integer} lwork - workspace size; -1 for workspace query
* @param {Float64Array} RWORK - real workspace (length at least 2*N)
* @param {integer} strideRWork - stride length for `RWORK`
* @param {Int32Array} IWORK - integer workspace (length N)
* @param {integer} strideIWork - stride length for `IWORK`
* @throws {TypeError} first argument must be a valid jobu value
* @throws {TypeError} second argument must be a valid jobv value
* @throws {TypeError} third argument must be a valid jobq value
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} tenth argument must be at least max(1,M)
* @throws {RangeError} twelfth argument must be at least max(1,P)
* @returns {integer} info - 0 for success, 1 if Jacobi procedure failed
*/
function zggsvd3( jobu, jobv, jobq, M, N, p, K, l, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, U, LDU, V, LDV, Q, LDQ, WORK, strideWork, lwork, RWORK, strideRWork, IWORK, strideIWork ) {
	var oalpha;
	var oiwork;
	var orwork;
	var obeta;
	var owork;

	if ( jobu !== 'none' && jobu !== 'compute-U' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobu value. Value: `%s`.', jobu ) );
	}
	if ( jobv !== 'none' && jobv !== 'compute-V' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobv value. Value: `%s`.', jobv ) );
	}
	if ( jobq !== 'none' && jobq !== 'compute-Q' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobq value. Value: `%s`.', jobq ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, p ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,P). Value: `%d`.', LDB ) );
	}
	oalpha = stride2offset( N, strideALPHA );
	obeta = stride2offset( N, strideBETA );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, Math.max( 1, LWORK) );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		var minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	owork = stride2offset( max( 1, lwork ), strideWork );
	orwork = stride2offset( 2 * N, strideRWork );
	oiwork = stride2offset( N, strideIWork );
	return base( jobu, jobv, jobq, M, N, p, K, l, A, 1, LDA, 0, B, 1, LDB, 0, ALPHA, strideALPHA, oalpha, BETA, strideBETA, obeta, U, 1, LDU, 0, V, 1, LDV, 0, Q, 1, LDQ, 0, WORK, strideWork, owork, lwork, RWORK, strideRWork, orwork, IWORK, strideIWork, oiwork );
}


// EXPORTS //

export default zggsvd3;
