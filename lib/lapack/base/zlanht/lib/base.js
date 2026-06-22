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
import dlassq from '../../dlassq/lib/base.js';
import zlassq from '../../zlassq/lib/base.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Computes the norm of a complex Hermitian tridiagonal matrix A.
*
* @private
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} d - diagonal elements (real), length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Complex128Array} e - off-diagonal elements (complex), length N-1
* @param {integer} strideE - stride for e (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for e (in complex elements)
* @returns {number} the computed norm value
*/
function zlanht( norm, N, d, strideD, offsetD, e, strideE, offsetE ) {
	var anorm;
	var sum;
	var out;
	var ev;
	var se;
	var oe;
	var id;
	var ie;
	var i;

	if ( N <= 0 ) {
		return 0.0;
	}

	// Get Float64 view for complex E and convert strides/offsets
	ev = reinterpret( e, 0 );
	se = strideE * 2;
	oe = offsetE * 2;

	if ( norm === 'max' ) {
		// Max absolute value: max( |d[i]|, |e[i]| )
		id = offsetD + ( ( N - 1 ) * strideD );
		anorm = Math.abs( d[ id ] );
		id = offsetD;
		ie = oe;
		for ( i = 0; i < N - 1; i++ ) {
			sum = Math.abs( d[ id ] );
			if ( anorm < sum || sum !== sum ) {
				anorm = sum;
			}
			sum = cmplx.absAt( ev, ie );
			if ( anorm < sum || sum !== sum ) {
				anorm = sum;
			}
			id += strideD;
			ie += se;
		}
	} else if ( norm === 'one-norm' || norm === 'inf-norm' ) {
		// One norm / infinity norm (equal for Hermitian matrices)
		if ( N === 1 ) {
			anorm = Math.abs( d[ offsetD ] );
		} else {
			// First column/row: |d[0]| + |e[0]|
			anorm = Math.abs( d[ offsetD ] ) + cmplx.absAt( ev, oe );

			// Last column/row: |e[N-2]| + |d[N-1]|
			sum = cmplx.absAt( ev, oe + ( ( N - 2 ) * se ) ) + Math.abs( d[ offsetD + ( ( N - 1 ) * strideD ) ] );
			if ( anorm < sum || sum !== sum ) {
				anorm = sum;
			}

			// Interior columns/rows: |e[i-1]| + |d[i]| + |e[i]|
			id = offsetD + strideD;
			ie = oe;
			for ( i = 1; i < N - 1; i++ ) {
				sum = Math.abs( d[ id ] ) + cmplx.absAt( ev, ie ) + cmplx.absAt( ev, ie + se );
				if ( anorm < sum || sum !== sum ) {
					anorm = sum;
				}
				id += strideD;
				ie += se;
			}
		}
	} else if ( norm === 'frobenius' ) {
		// Frobenius norm: sqrt( sum(d[i]^2) + 2*sum(|e[i]|^2) )
		// Use zlassq for complex off-diagonal, dlassq for real diagonal

		// Start with off-diagonal (counted twice for Hermitian)
		if ( N > 1 ) {
			out = zlassq( N - 1, e, strideE, offsetE, 0.0, 1.0 );
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

export default zlanht;
