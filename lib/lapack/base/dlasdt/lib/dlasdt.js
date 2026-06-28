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
import base from './base.js';


// MAIN //

/**
* Creates a tree of subproblems for bidiagonal divide and conquer.
*
* @param {NonNegativeInteger} N - number of diagonal elements of the bidiagonal matrix
* @param {Int32Array} lvl - single-element array; on exit, the number of levels on the computation tree
* @param {Int32Array} nd - single-element array; on exit, the number of nodes on the tree
* @param {Int32Array} INODE - output array for centers of subproblems (0-based)
* @param {integer} strideINODE - stride length for `INODE`
* @param {Int32Array} NDIML - output array for row dimensions of left children
* @param {integer} strideNDIML - stride length for `NDIML`
* @param {Int32Array} NDIMR - output array for row dimensions of right children
* @param {integer} strideNDIMR - stride length for `NDIMR`
* @param {PositiveInteger} msub - maximum row dimension each subproblem at the bottom of the tree can be of
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlasdt( N, lvl, nd, INODE, strideINODE, NDIML, strideNDIML, NDIMR, strideNDIMR, msub ) {
	var oINODE = stride2offset( N, strideINODE );
	var oNDIML = stride2offset( N, strideNDIML );
	var oNDIMR = stride2offset( N, strideNDIMR );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, lvl, nd, INODE, strideINODE, oINODE, NDIML, strideNDIML, oNDIML, NDIMR, strideNDIMR, oNDIMR, msub );
}


// EXPORTS //

export default dlasdt;
