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

// VARIABLES //

var HUGEVAL = 1.7976931348623157e+308; // Number.MAX_VALUE


// MAIN //

/**
* Computes sqrt(x^2 + y^2 + z^2) safely, avoiding unnecessary overflow.
* and underflow.
*
* @private
* @param {number} x - first value
* @param {number} y - second value
* @param {number} z - third value
* @returns {number} sqrt(x^2 + y^2 + z^2)
*/
function dlapy3( x, y, z ) {
	var xabs;
	var yabs;
	var zabs;
	var w;

	xabs = Math.abs( x );
	yabs = Math.abs( y );
	zabs = Math.abs( z );
	w = Math.max( xabs, yabs, zabs );

	if ( w === 0.0 || w > HUGEVAL ) {
		// W can be zero for max(0,nan,0)
		// Adding all three entries together will make sure
		// NaN will not disappear.
		return xabs + yabs + zabs;
	}
	return w * Math.sqrt( (( xabs / w ) * ( xabs / w )) + (( yabs / w ) * ( yabs / w )) + (( zabs / w ) * ( zabs / w )) );
}


// EXPORTS //

export default dlapy3;
