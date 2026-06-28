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

var abs = Math.abs;
var sqrt = Math.sqrt;


// MAIN //

/**
* Computes the splitting points with threshold based on the representation.
*
* Sets any "small" off-diagonal elements to zero. Two criteria are supported:
* `spltol < 0` uses an absolute off-diagonal threshold, while `spltol > 0`
* uses a criterion that preserves relative accuracy.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements of the tridiagonal matrix, length N
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - subdiagonal elements (in/out), length N
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @param {Float64Array} E2 - squares of subdiagonal elements (in/out), length N
* @param {integer} strideE2 - stride length for `E2`
* @param {NonNegativeInteger} offsetE2 - starting index for `E2`
* @param {number} spltol - splitting threshold
* @param {number} tnrm - norm of the matrix
* @param {Int32Array} nsplit - output: number of blocks (nsplit[0])
* @param {Int32Array} ISPLIT - output: splitting points array
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @param {NonNegativeInteger} offsetISPLIT - starting index for `ISPLIT`
* @returns {integer} info - status code (0 = success)
*/
function dlarra( N, d, strideD, offsetD, e, strideE, offsetE, E2, strideE2, offsetE2, spltol, tnrm, nsplit, ISPLIT, strideISPLIT, offsetISPLIT ) {
	var eabs;
	var tmp1;
	var nsp;
	var ie;
	var id;
	var i;

	nsplit[ 0 ] = 1;

	// Quick return if possible:
	if ( N <= 0 ) {
		return 0;
	}

	nsp = 1;
	ie = offsetE;
	id = offsetD;

	if ( spltol < 0.0 ) {
		// Criterion based on absolute off-diagonal value:
		tmp1 = abs( spltol ) * tnrm;
		for ( i = 0; i < N - 1; i += 1 ) {
			eabs = abs( e[ ie ] );
			if ( eabs <= tmp1 ) {
				e[ ie ] = 0.0;
				E2[ offsetE2 + ( i * strideE2 ) ] = 0.0;
				ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = i + 1;
				nsp += 1;
			}
			ie += strideE;
		}
	} else {
		// Criterion that guarantees relative accuracy:
		for ( i = 0; i < N - 1; i += 1 ) {
			eabs = abs( e[ ie ] );
			if ( eabs <= spltol * sqrt( abs( d[ id ] ) ) * sqrt( abs( d[ id + strideD ] ) ) ) {
				e[ ie ] = 0.0;
				E2[ offsetE2 + ( i * strideE2 ) ] = 0.0;
				ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = i + 1;
				nsp += 1;
			}
			ie += strideE;
			id += strideD;
		}
	}
	ISPLIT[ offsetISPLIT + ( ( nsp - 1 ) * strideISPLIT ) ] = N;
	nsplit[ 0 ] = nsp;

	return 0;
}


// EXPORTS //

export default dlarra;
