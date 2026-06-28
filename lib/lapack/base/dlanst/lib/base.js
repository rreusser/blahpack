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

// MODULES //

import dlassq from './../../dlassq/lib/base.js';


// MAIN //

/**
* Computes the value of the one norm, or the Frobenius norm, or the infinity.
* norm, or the element of largest absolute value of a real symmetric
* tridiagonal matrix A.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} d - diagonal elements, length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} e - off-diagonal elements, length N-1
* @param {integer} strideE - stride for e
* @param {NonNegativeInteger} offsetE - starting index for e
* @returns {number} the computed norm value
*/
function dlanst( norm, N, d, strideD, offsetD, e, strideE, offsetE ) {
	var anorm;
	var sum;
	var out;
	var id;
	var ie;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max norm: find the element of largest absolute value
		id = offsetD + (( N - 1 ) * strideD);
		anorm = Math.abs( d[ id ] );
		id = offsetD;
		ie = offsetE;
		for ( i = 0; i < N - 1; i++ ) {
			sum = Math.abs( d[ id ] );
			if ( anorm < sum || sum !== sum ) { // sum !== sum handles NaN
				anorm = sum;
			}
			sum = Math.abs( e[ ie ] );
			if ( anorm < sum || sum !== sum ) {
				anorm = sum;
			}
			id += strideD;
			ie += strideE;
		}
	} else if ( norm === 'one-norm' || norm === 'one-norm' || norm === 'inf-norm' ) {
		// One-norm / infinity-norm (same for symmetric tridiagonal)
		if ( N === 1 ) {
			anorm = Math.abs( d[ offsetD ] );
		} else {
			// First row: |d[0]| + |e[0]|
			anorm = Math.abs( d[ offsetD ] ) + Math.abs( e[ offsetE ] );

			// Last row: |e[N-2]| + |d[N-1]|
			sum = Math.abs( e[ offsetE + (( N - 2 ) * strideE) ] ) + Math.abs( d[ offsetD + (( N - 1 ) * strideD) ] );
			if ( anorm < sum || sum !== sum ) {
				anorm = sum;
			}

			// Interior rows: |e[i-1]| + |d[i]| + |e[i]|
			id = offsetD + strideD;
			ie = offsetE;
			for ( i = 1; i < N - 1; i++ ) {
				sum = Math.abs( d[ id ] ) + Math.abs( e[ ie ] ) + Math.abs( e[ ie + strideE ] );
				if ( anorm < sum || sum !== sum ) {
					anorm = sum;
				}
				id += strideD;
				ie += strideE;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: sqrt( sum of squares of all elements )
		// For symmetric tridiagonal: sqrt( sum(d[i]^2) + 2*sum(e[i]^2) )
		// Use dlassq for numerical stability

		// Start with off-diagonal elements (counted twice for symmetric)
		if ( N > 1 ) {
			out = dlassq( N - 1, e, strideE, offsetE, 0.0, 1.0 );
			sum = 2.0 * out.sumsq;
		} else {
			sum = 1.0;
		}

		// Add diagonal elements
		if ( N > 1 ) {
			out = dlassq( N, d, strideD, offsetD, out.scl, sum );
		} else {
			out = dlassq( N, d, strideD, offsetD, 0.0, 1.0 );
		}
		anorm = out.scl * Math.sqrt( out.sumsq );
	}

	return anorm;
}


// EXPORTS //

export default dlanst;
