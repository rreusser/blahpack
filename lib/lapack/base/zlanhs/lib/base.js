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
* Returns the value of the one norm, Frobenius norm, infinity norm, or.
* max absolute value of an upper Hessenberg complex matrix.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - upper Hessenberg matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Float64Array} WORK - workspace (length >= N, used for inf-norm only, real)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @returns {number} matrix norm value
*/
function zlanhs( norm, N, A, strideA1, strideA2, offsetA, WORK, strideWORK, offsetWORK ) {
	var result;
	var value;
	var scale;
	var sum;
	var sa1;
	var sa2;
	var lim;
	var aij;
	var Av;
	var oA;
	var wi;
	var i;
	var j;

	Av = reinterpret( A, 0 );
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	oA = offsetA * 2;

	if ( norm === 'max' ) {
		// Max absolute value
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 ); // upper Hessenberg: rows 0..min(N-1, j+1)
			aij = oA + (j * sa2);
			for ( i = 0; i < lim; i++ ) {
				sum = cmplx.absAt( Av, aij );
				if ( value < sum || sum !== sum ) {
					value = sum;
				}
				aij += sa1;
			}
		}
	} else if ( norm === 'one-norm' ) {
		// One-norm (max column sum of absolute values)
		value = 0.0;
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			lim = Math.min( N, j + 2 );
			aij = oA + (j * sa2);
			for ( i = 0; i < lim; i++ ) {
				sum += cmplx.absAt( Av, aij );
				aij += sa1;
			}
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'inf-norm' ) {
		// Infinity-norm (max row sum of absolute values)
		for ( i = 0; i < N; i++ ) {
			WORK[ offsetWORK + (i * strideWORK) ] = 0.0;
		}
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			aij = oA + (j * sa2);
			wi = offsetWORK;
			for ( i = 0; i < lim; i++ ) {
				WORK[ wi ] += cmplx.absAt( Av, aij );
				aij += sa1;
				wi += strideWORK;
			}
		}
		value = 0.0;
		for ( i = 0; i < N; i++ ) {
			sum = WORK[ offsetWORK + (i * strideWORK) ];
			if ( value < sum || sum !== sum ) {
				value = sum;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm
		// Zlassq now takes Complex128Array with offset in complex elements
		scale = 0.0;
		sum = 1.0;
		for ( j = 0; j < N; j++ ) {
			lim = Math.min( N, j + 2 );
			result = zlassq( lim, A, strideA1, offsetA + (j * strideA2), scale, sum );
			scale = result.scl;
			sum = result.sumsq;
		}
		value = scale * Math.sqrt( sum );
	} else {
		value = 0.0;
	}

	return value;
}


// EXPORTS //

export default zlanhs;
