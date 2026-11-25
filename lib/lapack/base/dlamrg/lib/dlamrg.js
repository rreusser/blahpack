/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Creates a permutation list to merge the entries of two independently sorted sets into a single set sorted in ascending order.
*
* @param {NonNegativeInteger} n1 - these arguments contain the respective lengths of the two sorted lists to be merged.
* @param {NonNegativeInteger} n2 - these arguments contain the respective lengths of the two sorted lists to be merged.
* @param {Float64Array} a - the first N1 elements of A contain a list of numbers which are sorted in either ascending or descending order.
* @param {integer} strideA - stride length for `a`
* @param {integer} dtrd1 - these are the strides to be taken through the array A.
* @param {integer} dtrd2 - these are the strides to be taken through the array A.
* @param {Int32Array} INDEX - on exit this array will contain a permutation such that if B( I ) = A( INDEX( I ) ) for I=1,N1+N2, then B will be sorted in ascending order (0-based).
* @param {integer} strideINDEX - stride length for `INDEX`
* @returns {Int32Array} `INDEX`
*/
function dlamrg( n1, n2, a, strideA, dtrd1, dtrd2, INDEX, strideINDEX ) { // eslint-disable-line max-len, max-params

	const oa = stride2offset( n1 + n2, strideA );
	const oindex = stride2offset( n1 + n2, strideINDEX );
	return base( n1, n2, a, strideA, oa, dtrd1, dtrd2, INDEX, strideINDEX, oindex );
}


// EXPORTS //

export default dlamrg;
