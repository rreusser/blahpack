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
* @private
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
function dlamrg( n1, n2, a, strideA, offsetA, dtrd1, dtrd2, INDEX, strideINDEX, offsetINDEX ) {
	var n1sv;
	var n2sv;
	var ind1;
	var ind2;
	var i;

	n1sv = n1;
	n2sv = n2;

	// Set starting indices (1-based, as in Fortran)
	if ( dtrd1 > 0 ) {
		ind1 = 1;
	} else {
		ind1 = n1;
	}
	if ( dtrd2 > 0 ) {
		ind2 = 1 + n1;
	} else {
		ind2 = n1 + n2;
	}

	i = 0;

	// Merge phase: compare elements from both sublists
	while ( n1sv > 0 && n2sv > 0 ) {
		// Convert 1-based ind1/ind2 to 0-based array index
		if ( a[ offsetA + ( ind1 - 1 ) * strideA ] <= a[ offsetA + ( ind2 - 1 ) * strideA ] ) {
			INDEX[ offsetINDEX + ( i * strideINDEX ) ] = ind1;
			i += 1;
			ind1 += dtrd1;
			n1sv -= 1;
		} else {
			INDEX[ offsetINDEX + ( i * strideINDEX ) ] = ind2;
			i += 1;
			ind2 += dtrd2;
			n2sv -= 1;
		}
	}

	// Copy remaining elements from whichever list is not exhausted
	if ( n1sv === 0 ) {
		while ( n2sv > 0 ) {
			INDEX[ offsetINDEX + ( i * strideINDEX ) ] = ind2;
			i += 1;
			ind2 += dtrd2;
			n2sv -= 1;
		}
	} else {
		while ( n1sv > 0 ) {
			INDEX[ offsetINDEX + ( i * strideINDEX ) ] = ind1;
			i += 1;
			ind1 += dtrd1;
			n1sv -= 1;
		}
	}
}


// EXPORTS //

export default dlamrg;
