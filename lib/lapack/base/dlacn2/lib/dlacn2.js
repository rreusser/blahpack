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
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square matrix using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} v - input array
* @param {integer} strideV - `v` stride length
* @param {Float64Array} x - input array
* @param {integer} strideX - `x` stride length
* @param {Int32Array} ISGN - input array
* @param {integer} strideISGN - `ISGN` stride length
* @param {Float64Array} EST - in/out: EST[0] is the estimated norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @param {Int32Array} ISAVE - input array
* @param {integer} strideISAVE - `ISAVE` stride length
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlacn2( N, v, strideV, x, strideX, ISGN, strideISGN, EST, KASE, ISAVE, strideISAVE ) {
	var ov = stride2offset( N, strideV );
	var ox = stride2offset( N, strideX );
	var oi = stride2offset( N, strideISGN );
	var ois = stride2offset( N, strideISAVE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, v, strideV, ov, x, strideX, ox, ISGN, strideISGN, oi, EST, KASE, ISAVE, strideISAVE, ois );
}


// EXPORTS //

export default dlacn2;
