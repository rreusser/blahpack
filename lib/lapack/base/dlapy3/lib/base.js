/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
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
