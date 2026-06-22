/* eslint-disable max-len */

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

// VARIABLES //

var LOG2 = Math.log( 2.0 );


// MAIN //

/**
* Creates a tree of subproblems for bidiagonal divide and conquer.
*
* ## Notes
*
* -   `INODE` values are 0-based indices (converted from 1-based Fortran).
*
* @private
* @param {NonNegativeInteger} N - number of diagonal elements of the bidiagonal matrix
* @param {Int32Array} lvl - single-element array; on exit, the number of levels on the computation tree
* @param {Int32Array} nd - single-element array; on exit, the number of nodes on the tree
* @param {Int32Array} INODE - output array for centers of subproblems (0-based)
* @param {integer} strideINODE - stride length for `INODE`
* @param {NonNegativeInteger} offsetINODE - starting index for `INODE`
* @param {Int32Array} NDIML - output array for row dimensions of left children
* @param {integer} strideNDIML - stride length for `NDIML`
* @param {NonNegativeInteger} offsetNDIML - starting index for `NDIML`
* @param {Int32Array} NDIMR - output array for row dimensions of right children
* @param {integer} strideNDIMR - stride length for `NDIMR`
* @param {NonNegativeInteger} offsetNDIMR - starting index for `NDIMR`
* @param {PositiveInteger} msub - maximum row dimension each subproblem at the bottom of the tree can be of
* @returns {void}
*/
function dlasdt( N, lvl, nd, INODE, strideINODE, offsetINODE, NDIML, strideNDIML, offsetNDIML, NDIMR, strideNDIMR, offsetNDIMR, msub ) { // eslint-disable-line max-len, max-params
	var ncrnt;
	var llst;
	var maxn;
	var temp;
	var nlvl;
	var il;
	var ir;
	var i;

	// Find the number of levels on the tree...
	maxn = ( N > 1 ) ? N : 1;
	temp = Math.log( maxn / ( msub + 1 ) ) / LOG2;
	lvl[ 0 ] = ( temp | 0 ) + 1;

	i = ( N / 2 ) | 0;
	INODE[ offsetINODE ] = i;
	NDIML[ offsetNDIML ] = i;
	NDIMR[ offsetNDIMR ] = N - i - 1;
	il = -1;
	ir = 0;
	llst = 1;

	for ( nlvl = 1; nlvl <= lvl[ 0 ] - 1; nlvl += 1 ) {
		// Constructing the tree at (nlvl+1)-st level. The number of
		// Nodes created on this level is llst * 2.
		for ( i = 0; i <= llst - 1; i += 1 ) {
			il += 2;
			ir += 2;
			ncrnt = llst + i - 1;

			// Left child (il):
			NDIML[ offsetNDIML + ( il * strideNDIML ) ] = ( NDIML[ offsetNDIML + ( ncrnt * strideNDIML ) ] / 2 ) | 0;
			NDIMR[ offsetNDIMR + ( il * strideNDIMR ) ] = NDIML[ offsetNDIML + ( ncrnt * strideNDIML ) ] - NDIML[ offsetNDIML + ( il * strideNDIML ) ] - 1;
			INODE[ offsetINODE + ( il * strideINODE ) ] = INODE[ offsetINODE + ( ncrnt * strideINODE ) ] - NDIMR[ offsetNDIMR + ( il * strideNDIMR ) ] - 1;

			// Right child (ir):
			NDIML[ offsetNDIML + ( ir * strideNDIML ) ] = ( NDIMR[ offsetNDIMR + ( ncrnt * strideNDIMR ) ] / 2 ) | 0;
			NDIMR[ offsetNDIMR + ( ir * strideNDIMR ) ] = NDIMR[ offsetNDIMR + ( ncrnt * strideNDIMR ) ] - NDIML[ offsetNDIML + ( ir * strideNDIML ) ] - 1;
			INODE[ offsetINODE + ( ir * strideINODE ) ] = INODE[ offsetINODE + ( ncrnt * strideINODE ) ] + NDIML[ offsetNDIML + ( ir * strideNDIML ) ] + 1;
		}
		llst *= 2;
	}
	nd[ 0 ] = ( llst * 2 ) - 1;
}


// EXPORTS //

export default dlasdt;
