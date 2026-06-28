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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the eigenvalues of a complex matrix pair (H, T), where H is.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of matrices H, T, Q, Z
* @param {integer} ilo - start of active block (1-based)
* @param {integer} ihi - end of active block (1-based)
* @param {Complex128Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} ALPHA - input array
* @param {integer} strideALPHA - `ALPHA` stride length
* @param {Complex128Array} BETA - input array
* @param {integer} strideBETA - `BETA` stride length
* @param {Complex128Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Complex128Array} WORK - input array
* @param {integer} strideWORK - `WORK` stride length
* @param {integer} lwork - workspace size (in complex elements); -1 for query
* @param {Float64Array} RWORK - input array
* @param {integer} strideRWORK - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} INFO: 0=success, 1..N=QZ did not converge, N+1..2N=shift failed
*/
function zhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK, strideWORK, lwork, RWORK, strideRWORK ) {
	var sh1;
	var sh2;
	var st1;
	var st2;
	var sq1;
	var sq2;
	var sz1;
	var sz2;
	var oa;
	var ob;
	var ow;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compq !== 'update' && compq !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	if ( compz !== 'update' && compz !== 'initialize' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		st1 = 1;
		st2 = LDT;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sh1 = LDH;
		sh2 = 1;
		st1 = LDT;
		st2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	oa = stride2offset( N, strideALPHA );
	ob = stride2offset( N, strideBETA );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	ow = stride2offset( N, strideWORK );
	or = stride2offset( N, strideRWORK );
	return base( job, compq, compz, N, ilo, ihi, H, sh1, sh2, 0, T, st1, st2, 0, ALPHA, strideALPHA, oa, BETA, strideBETA, ob, Q, sq1, sq2, 0, Z, sz1, sz2, 0, WORK, strideWORK, ow, lwork, RWORK, strideRWORK, or );
}


// EXPORTS //

export default zhgeqz;
