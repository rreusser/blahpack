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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Computes the value of a matrix norm for a complex matrix.
*
* Supports norms: `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} M - rows
* @param {NonNegativeInteger} N - columns
* @param {Complex128Array} A - complex matrix
* @param {integer} strideA1 - first dimension stride (in complex elements)
* @param {integer} strideA2 - second dimension stride (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= M for `'inf-norm'`, real)
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @returns {number} norm value
*/
function zlange( norm, M, N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	var value;
	var scale;
	var temp;
	var sum;
	var out;
	var sa1;
	var sa2;
	var Av;
	var oA;
	var ai;
	var wi;
	var i;
	var j;

	if ( M === 0 || N === 0 ) {
		return 0.0;
	}

	// Get Float64 view and convert strides/offset
	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			ai = oA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				temp = cmplx.absAt( Av, ai );
				if ( value < temp || temp !== temp ) {
					value = temp;
				}
				ai += sa1;
			}
		}
	} else if ( norm === 'one-norm' || norm === 'one-norm' ) {
		// One-norm: maximum column sum of abs values
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			ai = oA + (j * sa2);
			for ( i = 0; i < M; i++ ) {
				sum += cmplx.absAt( Av, ai );
				ai += sa1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm: maximum row sum of abs values
		for ( i = 0; i < M; i++ ) {
			wi = offsetWork + (i * strideWork);
			WORK[ wi ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			ai = oA + (j * sa2);
			wi = offsetWork;
			for ( i = 0; i < M; i++ ) {
				WORK[ wi ] += cmplx.absAt( Av, ai );
				ai += sa1;
				wi += strideWork;
			}
		}
		value = 0.0;
		for ( i = 0; i < M; i++ ) {
			wi = offsetWork + (i * strideWork);
			temp = WORK[ wi ];
			if ( value < temp || temp !== temp ) {
				value = temp;
			}
		}
	} else if ( norm === 'frobenius' || norm === 'frobenius' ) {
		// Frobenius norm: scale * sqrt(sumsq) using zlassq per column
		// Zlassq now takes Complex128Array with offset in complex elements
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			out = zlassq( M, A, strideA1, offsetA + (j * strideA2), scale, sum );
			scale = out.scl;
			sum = out.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default zlange;
