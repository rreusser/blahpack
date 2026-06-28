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
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute some or all of the right and/or left eigenvectors of a pair of.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {*} side - side
* @param {*} howmny - howmny
* @param {*} strideSELECT - strideSELECT
* @param {*} offsetSELECT - offsetSELECT
* @param {*} N - N
* @param {Complex128Array} S - input matrix
* @param {PositiveInteger} LDS - leading dimension of `S`
* @param {Complex128Array} P - input matrix
* @param {PositiveInteger} LDP - leading dimension of `P`
* @param {Complex128Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {*} mm - mm
* @param {*} M - M
* @param {Complex128Array} WORK - input array
* @param {integer} strideWork - `WORK` stride length
* @param {Float64Array} RWORK - input array
* @param {integer} strideRWork - `RWORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function ztgevc( order, side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, LDS, P, LDP, VL, LDVL, VR, LDVR, mm, M, WORK, strideWork, RWORK, strideRWork ) {
	var ss1;
	var ss2;
	var sp1;
	var sp2;
	var sv1;
	var sv2;
	var sv1;
	var sv2;
	var ow;
	var or;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( order === 'row-major' && LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' && LDVR < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && LDVL < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && LDP < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDP ) );
	}
	if ( order === 'column-major' && LDP < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDP ) );
	}
	if ( order === 'row-major' && LDS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDS ) );
	}
	if ( order === 'column-major' && LDS < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDS ) );
	}
	if ( howmny !== 'backtransform' && howmny !== 'all' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `howmny` value. Value: `%s`.', howmny ) );
	}
	if ( order === 'column-major' ) {
		ss1 = 1;
		ss2 = LDS;
		sp1 = 1;
		sp2 = LDP;
		sv1 = 1;
		sv2 = LDVL;
		sv1 = 1;
		sv2 = LDVR;
	} else {
		ss1 = LDS;
		ss2 = 1;
		sp1 = LDP;
		sp2 = 1;
		sv1 = LDVL;
		sv2 = 1;
		sv1 = LDVR;
		sv2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	ow = stride2offset( N, strideWork );
	or = stride2offset( N, strideRWork );
	return base( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, ss1, ss2, 0, P, sp1, sp2, 0, VL, sv1, sv2, 0, VR, sv1, sv2, 0, mm, M, WORK, strideWork, ow, RWORK, strideRWork, or );
}


// EXPORTS //

export default ztgevc;
