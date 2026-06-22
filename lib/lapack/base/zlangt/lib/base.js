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

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Computes the norm of a complex general tridiagonal matrix A.
*
* The matrix A has sub-diagonal DL, diagonal D, and super-diagonal DU.
*
* @private
* @param {string} norm - 'max', 'one-norm', 'inf-norm', or 'frobenius'
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (in complex elements)
* @param {Complex128Array} d - diagonal elements (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (in complex elements)
* @returns {number} the computed norm
*/
function zlangt( norm, N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU ) {
	var anorm;
	var temp;
	var sdl;
	var sdu;
	var DLv;
	var DUv;
	var res;
	var odl;
	var odu;
	var dv;
	var sd;
	var od;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	// Get Float64 views and convert strides/offsets from complex elements to doubles
	DLv = reinterpret( DL, 0 );
	dv = reinterpret( d, 0 );
	DUv = reinterpret( DU, 0 );
	sdl = strideDL * 2;
	sd = strideD * 2;
	sdu = strideDU * 2;
	odl = offsetDL * 2;
	od = offsetD * 2;
	odu = offsetDU * 2;

	if ( norm === 'max' ) {
		// Max absolute value
		anorm = cmplx.absAt( dv, od + ( ( N - 1 ) * sd ) );
		for ( i = 0; i < N - 1; i++ ) {
			temp = cmplx.absAt( DLv, odl + ( i * sdl ) );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			temp = cmplx.absAt( dv, od + ( i * sd ) );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			temp = cmplx.absAt( DUv, odu + ( i * sdu ) );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
		}
	} else if ( norm === 'one-norm' ) {
		// Maximum column sum
		if ( N === 1 ) {
			anorm = cmplx.absAt( dv, od );
		} else {
			// First column: d[0] + dl[0]
			anorm = cmplx.absAt( dv, od ) + cmplx.absAt( DLv, odl );

			// Last column: d[N-1] + du[N-2]
			temp = cmplx.absAt( dv, od + ( ( N - 1 ) * sd ) ) + cmplx.absAt( DUv, odu + ( ( N - 2 ) * sdu ) );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			// Middle columns: dl[i] + d[i] + du[i-1]
			for ( i = 1; i < N - 1; i++ ) {
				temp = cmplx.absAt( dv, od + ( i * sd ) ) + cmplx.absAt( DLv, odl + ( i * sdl ) ) + cmplx.absAt( DUv, odu + ( ( i - 1 ) * sdu ) );
				if ( anorm < temp || temp !== temp ) {
					anorm = temp;
				}
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Maximum row sum
		if ( N === 1 ) {
			anorm = cmplx.absAt( dv, od );
		} else {
			// First row: d[0] + du[0]
			anorm = cmplx.absAt( dv, od ) + cmplx.absAt( DUv, odu );

			// Last row: d[N-1] + dl[N-2]
			temp = cmplx.absAt( dv, od + ( ( N - 1 ) * sd ) ) + cmplx.absAt( DLv, odl + ( ( N - 2 ) * sdl ) );
			if ( anorm < temp || temp !== temp ) {
				anorm = temp;
			}
			// Middle rows: dl[i-1] + d[i] + du[i]
			for ( i = 1; i < N - 1; i++ ) {
				temp = cmplx.absAt( dv, od + ( i * sd ) ) + cmplx.absAt( DUv, odu + ( i * sdu ) ) + cmplx.absAt( DLv, odl + ( ( i - 1 ) * sdl ) );
				if ( anorm < temp || temp !== temp ) {
					anorm = temp;
				}
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: sqrt( sum of squares )
		res = zlassq( N, d, strideD, offsetD, 0.0, 1.0 );
		if ( N > 1 ) {
			res = zlassq( N - 1, DL, strideDL, offsetDL, res.scl, res.sumsq );
			res = zlassq( N - 1, DU, strideDU, offsetDU, res.scl, res.sumsq );
		}
		anorm = res.scl * Math.sqrt( res.sumsq );
	} else {
		anorm = 0.0;
	}

	return anorm;
}


// EXPORTS //

export default zlangt;
