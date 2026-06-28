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
* Solves one of the systems of equations A_X = B or A^T_X = B with a.
* tridiagonal matrix A using the LU factorization computed by dgttrf.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   `itrans` is an integer: 0 = no transpose, 1 or 2 = transpose.
*
* @private
* @param {integer} itrans - 0 for A*X=B, 1 or 2 for A^T*X=B
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} DL - multipliers from LU factorization (length N-1)
* @param {integer} strideDL - stride length for `DL`
* @param {NonNegativeInteger} offsetDL - starting index for `DL`
* @param {Float64Array} d - diagonal of U (length N)
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} DU - first superdiagonal of U (length N-1)
* @param {integer} strideDU - stride length for `DU`
* @param {NonNegativeInteger} offsetDU - starting index for `DU`
* @param {Float64Array} DU2 - second superdiagonal of U (length N-2)
* @param {integer} strideDU2 - stride length for `DU2`
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2`
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Float64Array} B - right hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
*/
function dgtts2( itrans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var temp;
	var idu2;
	var idl;
	var idu;
	var ip;
	var id;
	var ib;
	var i;
	var j;

	// Quick return if possible
	if ( N === 0 || nrhs === 0 ) {
		return;
	}

	if ( itrans === 0 ) {
		// Solve A*X = B using the LU factorization of A
		// For each right hand side j:
		for ( j = 0; j < nrhs; j++ ) {
			// Solve L*x = b (forward substitution with pivoting)
			idl = offsetDL;
			ip = offsetIPIV;
			for ( i = 0; i < N - 1; i++ ) {
				ib = offsetB + i * strideB1 + j * strideB2;
				if ( IPIV[ ip ] === i ) {
					// No row interchange
					B[ ib + strideB1 ] = B[ ib + strideB1 ] - DL[ idl ] * B[ ib ];
				} else {
					// Interchange rows i and i+1
					temp = B[ ib ];
					B[ ib ] = B[ ib + strideB1 ];
					B[ ib + strideB1 ] = temp - DL[ idl ] * B[ ib ];
				}
				idl += strideDL;
				ip += strideIPIV;
			}

			// Solve U*x = b (back substitution)
			ib = offsetB + ( N - 1 ) * strideB1 + j * strideB2;
			id = offsetD + ( N - 1 ) * strideD;
			B[ ib ] = B[ ib ] / d[ id ];

			if ( N > 1 ) {
				ib = offsetB + ( N - 2 ) * strideB1 + j * strideB2;
				id = offsetD + ( N - 2 ) * strideD;
				idu = offsetDU + ( N - 2 ) * strideDU;
				B[ ib ] = ( B[ ib ] - DU[ idu ] * B[ ib + strideB1 ] ) / d[ id ];
			}

			id = offsetD + ( N - 3 ) * strideD;
			idu = offsetDU + ( N - 3 ) * strideDU;
			idu2 = offsetDU2 + ( N - 3 ) * strideDU2;
			for ( i = N - 3; i >= 0; i-- ) {
				ib = offsetB + i * strideB1 + j * strideB2;
				B[ ib ] = ( B[ ib ] - DU[ idu ] * B[ ib + strideB1 ] - DU2[ idu2 ] * B[ ib + 2 * strideB1 ] ) / d[ id ];
				id -= strideD;
				idu -= strideDU;
				idu2 -= strideDU2;
			}
		}
	} else {
		// Solve A^T * X = B
		for ( j = 0; j < nrhs; j++ ) {
			// Solve U^T*x = b (forward substitution)
			ib = offsetB + j * strideB2;
			id = offsetD;
			B[ ib ] = B[ ib ] / d[ id ];

			if ( N > 1 ) {
				idu = offsetDU;
				B[ ib + strideB1 ] = ( B[ ib + strideB1 ] - DU[ idu ] * B[ ib ] ) / d[ id + strideD ];
			}

			id = offsetD + 2 * strideD;
			idu = offsetDU + strideDU;
			idu2 = offsetDU2;
			for ( i = 2; i < N; i++ ) {
				ib = offsetB + i * strideB1 + j * strideB2;
				B[ ib ] = ( B[ ib ] - DU[ idu ] * B[ ib - strideB1 ] - DU2[ idu2 ] * B[ ib - 2 * strideB1 ] ) / d[ id ];
				id += strideD;
				idu += strideDU;
				idu2 += strideDU2;
			}

			// Solve L^T*x = b (back substitution with pivoting)
			idl = offsetDL + ( N - 2 ) * strideDL;
			ip = offsetIPIV + ( N - 2 ) * strideIPIV;
			for ( i = N - 2; i >= 0; i-- ) {
				ib = offsetB + i * strideB1 + j * strideB2;
				if ( IPIV[ ip ] === i ) {
					// No row interchange
					B[ ib ] = B[ ib ] - DL[ idl ] * B[ ib + strideB1 ];
				} else {
					// Interchange rows i and i+1
					temp = B[ ib + strideB1 ];
					B[ ib + strideB1 ] = B[ ib ] - DL[ idl ] * temp;
					B[ ib ] = temp;
				}
				idl -= strideDL;
				ip -= strideIPIV;
			}
		}
	}
}


// EXPORTS //

export default dgtts2;
