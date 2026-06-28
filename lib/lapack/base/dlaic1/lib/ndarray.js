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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// VARIABLES //

var JOBS = [ 'largest-singular-value', 'smallest-singular-value' ];


// MAIN //

/**
* Applies one step of incremental condition estimation.
*
* @param {string} job - specifies whether to estimate the largest or smallest singular value (`'largest-singular-value'` or `'smallest-singular-value'`)
* @param {NonNegativeInteger} J - length of `x` and `w`
* @param {Float64Array} x - input vector of length `J`
* @param {integer} strideX - stride length for `x`
* @param {NonNegativeInteger} offsetX - starting index for `x`
* @param {number} sest - estimated singular value of the `j`-by-`j` matrix
* @param {Float64Array} w - input vector of length `J`
* @param {integer} strideW - stride length for `w`
* @param {NonNegativeInteger} offsetW - starting index for `w`
* @param {number} gamma - diagonal element
* @param {Float64Array} out - output array; on exit, `out[0]` is `sestpr`, `out[1]` is `s`, `out[2]` is `c`
* @throws {TypeError} first argument must be a valid job string
* @returns {Float64Array} `out`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var x = new Float64Array( [ 0.6, 0.8, 0.0 ] );
* var w = new Float64Array( [ 1.0, 2.0, 3.0 ] );
* var out = new Float64Array( 3 );
*
* dlaic1( 'largest-singular-value', 3, x, 1, 0, 5.0, w, 1, 0, 2.0, out );
* // out => <Float64Array>[ ~5.529, ~-0.987, ~-0.163 ]
*/
function dlaic1( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, out ) { // eslint-disable-line max-len, max-params
	if ( JOBS.indexOf( job ) === -1 ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: %s. Value: `%s`.', JOBS.join( ', ' ), job ) ); // eslint-disable-line max-len
	}
	return base( job, J, x, strideX, offsetX, sest, w, strideW, offsetW, gamma, out ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaic1;
