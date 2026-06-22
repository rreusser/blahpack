
// MODULES //

import base from './base.js';


// MAIN //

/**
* Merges two sorted integer sublists into a single sorted list.
*
* Given two sorted sublists (from the array A), this routine creates
* a single sorted list in INDEX. The sublists are A(0:N1-1) and
* A(N1:N1+N2-1) in 0-based indexing (Fortran: A(1:N1) and A(N1+1:N1+N2)).
*
* The parameter DTRD1/DTRD2 controls whether each sublist is traversed
* forward (+1) or backward (-1).
*
* NOTE: INDEX values are 1-based (Fortran convention) as they are used
* internally by the divide-and-conquer eigensolver.
*
* @param {integer} n1 - length of first sorted sublist
* @param {integer} n2 - length of second sorted sublist
* @param {Float64Array} a - array containing two sorted sublists
* @param {integer} strideA - stride for a
* @param {NonNegativeInteger} offsetA - starting index for a
* @param {integer} dtrd1 - direction for first sublist (+1 forward, -1 backward)
* @param {integer} dtrd2 - direction for second sublist (+1 forward, -1 backward)
* @param {Int32Array} INDEX - output merged index list (1-based values)
* @param {integer} strideINDEX - stride for INDEX
* @param {NonNegativeInteger} offsetINDEX - starting index for INDEX
*/
function dlamrg( n1, n2, a, strideA, offsetA, dtrd1, dtrd2, INDEX, strideINDEX, offsetINDEX ) { // eslint-disable-line max-len, max-params
	return base( n1, n2, a, strideA, offsetA, dtrd1, dtrd2, INDEX, strideINDEX, offsetINDEX ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlamrg;
