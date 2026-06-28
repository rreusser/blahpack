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
* Compute the generalized eigenvalues and optionally the left and/or.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {*} jobvl - jobvl
* @param {*} jobvr - jobvr
* @param {*} N - N
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} ALPHA - input array
* @param {integer} strideALPHA - `ALPHA` stride length
* @param {Complex128Array} BETA - input array
* @param {integer} strideBETA - `BETA` stride length
* @param {Complex128Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zggev( order, jobvl, jobvr, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, VL, LDVL, VR, LDVR ) {
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var oa;
	var ob;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'compute' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'compute' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	oa = stride2offset( N, strideALPHA );
	ob = stride2offset( N, strideBETA );
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, oa, BETA, strideBETA, ob, VL, svl1, svl2, 0, VR, svr1, svr2, 0 );
}


// EXPORTS //

export default zggev;
