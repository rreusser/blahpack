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

import dlassq from '../../dlassq/lib/base.js';


// MAIN //

/**
* Computes the norm of a real general tridiagonal matrix A.
*
* The matrix A has sub-diagonal DL, diagonal D, and super-diagonal DU.
*
* @private
* @param {string} norm - 'max', 'one-norm', 'inf-norm', or 'frobenius'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride for DL
* @param {NonNegativeInteger} offsetDL - starting index for DL
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Float64Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride for DU
* @param {NonNegativeInteger} offsetDU - starting index for DU
* @returns {number} the computed norm
*/
function dlangt( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ) {
	var anorm;
	var temp;
	var pdl;
	var pdu;
	var res;
	var pd;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	if ( norm === 'max' ) {
		// Max absolute value
		pd = offsetD + ( ( N - 1 ) * strideD );
		anorm = Math.abs( d[ pd ] );
		pdl = offsetDL;
		pd = offsetD;
		pdu = offsetDU;
		for ( i = 0; i < N - 1; i++ ) {
			temp = Math.abs( DL[ pdl ] );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			temp = Math.abs( d[ pd ] );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			temp = Math.abs( DU[ pdu ] );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			pdl += strideDL;
			pd += strideD;
			pdu += strideDU;
		}
	} else if ( norm === 'one-norm' ) {
		// Maximum column sum
		if ( N === 1 ) {
			anorm = Math.abs( d[ offsetD ] );
		} else {
			// First column: d[0] + dl[0]
			anorm = Math.abs( d[ offsetD ] ) + Math.abs( DL[ offsetDL ] );

			// Last column: d[N-1] + du[N-2]
			temp = Math.abs( d[ offsetD + ( ( N - 1 ) * strideD ) ] ) + Math.abs( DU[ offsetDU + ( ( N - 2 ) * strideDU ) ] );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			// Middle columns: dl[i] + d[i] + du[i-1]
			for ( i = 1; i < N - 1; i++ ) {
				temp = Math.abs( d[ offsetD + ( i * strideD ) ] ) + Math.abs( DL[ offsetDL + ( i * strideDL ) ] ) + Math.abs( DU[ offsetDU + ( ( i - 1 ) * strideDU ) ] );
				if ( anorm < temp || temp !== temp ) {
					anorm = temp;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Maximum row sum
		if ( N === 1 ) {
			anorm = Math.abs( d[ offsetD ] );
		} else {
			// First row: d[0] + du[0]
			anorm = Math.abs( d[ offsetD ] ) + Math.abs( DU[ offsetDU ] );

			// Last row: d[N-1] + dl[N-2]
			temp = Math.abs( d[ offsetD + ( ( N - 1 ) * strideD ) ] ) + Math.abs( DL[ offsetDL + ( ( N - 2 ) * strideDL ) ] );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			// Middle rows: dl[i-1] + d[i] + du[i]
			for ( i = 1; i < N - 1; i++ ) {
				temp = Math.abs( d[ offsetD + ( i * strideD ) ] ) + Math.abs( DU[ offsetDU + ( i * strideDU ) ] ) + Math.abs( DL[ offsetDL + ( ( i - 1 ) * strideDL ) ] );
				if ( anorm < temp || temp !== temp ) {
					anorm = temp;
				}
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: sqrt( sum of squares )
		res = dlassq( N, d, strideD, offsetD, 0.0, 1.0 );
		if ( N > 1 ) {
			res = dlassq( N - 1, DL, strideDL, offsetDL, res.scl, res.sumsq );
			res = dlassq( N - 1, DU, strideDU, offsetDU, res.scl, res.sumsq );
		}
		anorm = res.scl * Math.sqrt( res.sumsq );
	} else {
		anorm = 0.0;
	}

	return anorm;
}


// EXPORTS //

export default dlangt;
