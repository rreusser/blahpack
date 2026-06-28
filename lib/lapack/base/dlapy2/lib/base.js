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

// MAIN //

/**
* Returns sqrt(x**2 + y**2), taking care not to cause unnecessary.
* overflow and unnecessary underflow.
*
* @private
* @param {number} x - first value
* @param {number} y - second value
* @returns {number} sqrt(x**2 + y**2)
*/
function dlapy2( x, y ) {
	var xabs;
	var yabs;
	var w;
	var z;

	// Handle NaN
	if ( x !== x ) {
		return x;
	}
	if ( y !== y ) {
		return y;
	}

	xabs = Math.abs( x );
	yabs = Math.abs( y );
	w = Math.max( xabs, yabs );
	z = Math.min( xabs, yabs );

	if ( z === 0.0 || w > 1.7976931348623157e+308 ) {
		return w;
	}
	return w * Math.sqrt( 1.0 + (( z / w ) * ( z / w )) );
}


// EXPORTS //

export default dlapy2;
