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

// MAIN //

/**
* Computes an LU factorization of a real tridiagonal matrix A using.
* elimination with partial pivoting and row interchanges.
*
* The factorization has the form A = L * U where L is a product of
* permutation and unit lower bidiagonal matrices and U is upper triangular
* with nonzeros in only the main diagonal and first two superdiagonals.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   INFO is returned: 0 = success, k > 0 means U(k,k) is exactly zero
*     (1-based index, matching Fortran convention).
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} DL - sub-diagonal elements (length N-1), overwritten with multipliers
* @param {integer} strideDL - stride length for `DL`
* @param {NonNegativeInteger} offsetDL - starting index for `DL`
* @param {Float64Array} d - diagonal elements (length N), overwritten with U diagonal
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} DU - super-diagonal elements (length N-1), overwritten with first superdiagonal of U
* @param {integer} strideDU - stride length for `DU`
* @param {NonNegativeInteger} offsetDU - starting index for `DU`
* @param {Float64Array} DU2 - second superdiagonal fill-in (length N-2), output
* @param {integer} strideDU2 - stride length for `DU2`
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2`
* @param {Int32Array} IPIV - pivot indices (length N), output, 0-based
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} info - 0 if successful, k > 0 if U(k,k) is zero (1-based)
*/
function dgttrf( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ) {
	var fact;
	var temp;
	var idu2;
	var idl;
	var idu;
	var id;
	var ip;
	var i;

	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}

	// Initialize IPIV(i) = i (0-based) and DU2(i) = 0
	ip = offsetIPIV;
	for ( i = 0; i < N; i++ ) {
		IPIV[ ip ] = i;
		ip += strideIPIV;
	}
	idu2 = offsetDU2;
	for ( i = 0; i < N - 2; i++ ) {
		DU2[ idu2 ] = 0.0;
		idu2 += strideDU2;
	}

	// Main elimination loop: i = 0 to N-3
	idl = offsetDL;
	id = offsetD;
	idu = offsetDU;
	idu2 = offsetDU2;
	ip = offsetIPIV;
	for ( i = 0; i < N - 2; i++ ) {
		if ( Math.abs( d[ id ] ) >= Math.abs( DL[ idl ] ) ) {
			// No row interchange required, eliminate DL(i)
			if ( d[ id ] !== 0.0 ) {
				fact = DL[ idl ] / d[ id ];
				DL[ idl ] = fact;
				d[ id + strideD ] = d[ id + strideD ] - ( fact * DU[ idu ] );
			}
		} else {
			// Interchange rows i and i+1, eliminate DL(i)
			fact = d[ id ] / DL[ idl ];
			d[ id ] = DL[ idl ];
			DL[ idl ] = fact;
			temp = DU[ idu ];
			DU[ idu ] = d[ id + strideD ];
			d[ id + strideD ] = temp - ( fact * d[ id + strideD ] );
			DU2[ idu2 ] = DU[ idu + strideDU ];
			DU[ idu + strideDU ] = -fact * DU[ idu + strideDU ];
			IPIV[ ip ] = i + 1; // 0-based: swap with next row
		}
		idl += strideDL;
		id += strideD;
		idu += strideDU;
		idu2 += strideDU2;
		ip += strideIPIV;
	}

	// Handle the last row pair (i = N-2) if N > 1
	if ( N > 1 ) {
		// i = N-2 (0-based), idl/id/idu/ip already point to the right elements
		if ( Math.abs( d[ id ] ) >= Math.abs( DL[ idl ] ) ) {
			if ( d[ id ] !== 0.0 ) {
				fact = DL[ idl ] / d[ id ];
				DL[ idl ] = fact;
				d[ id + strideD ] = d[ id + strideD ] - ( fact * DU[ idu ] );
			}
		} else {
			fact = d[ id ] / DL[ idl ];
			d[ id ] = DL[ idl ];
			DL[ idl ] = fact;
			temp = DU[ idu ];
			DU[ idu ] = d[ id + strideD ];
			d[ id + strideD ] = temp - ( fact * d[ id + strideD ] );
			IPIV[ ip ] = i + 1; // 0-based: swap with next row
		}
	}

	// Check for a zero on the diagonal of U
	id = offsetD;
	for ( i = 0; i < N; i++ ) {
		if ( d[ id ] === 0.0 ) {
			return i + 1; // 1-based INFO
		}
		id += strideD;
	}

	return 0;
}


// EXPORTS //

export default dgttrf;
