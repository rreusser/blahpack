/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
	const oINODE = stride2offset( N, strideINODE );
	const oNDIML = stride2offset( N, strideNDIML );
	const oNDIMR = stride2offset( N, strideNDIMR );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, lvl, nd, INODE, strideINODE, oINODE, NDIML, strideNDIML, oNDIML, NDIMR, strideNDIMR, oNDIMR, msub );
}


// EXPORTS //

export default dlasdt;
