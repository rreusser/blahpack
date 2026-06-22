
// MODULES //

import base from './base.js';


// MAIN //

/**
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - output array
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @returns {integer} status code (0 = success)
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var d = new Float64Array( [ 4.0, 4.0, 4.0, 4.0, 4.0 ] );
* var e = new Float64Array( [ 1.0, 1.0, 1.0, 1.0 ] );
*
* var info = dlarrr( 5, d, 1, 0, e, 1, 0 );
* // returns 0
*/
function dlarrr( N, d, strideD, offsetD, e, strideE, offsetE ) { // eslint-disable-line max-len, max-params
	return base( N, d, strideD, offsetD, e, strideE, offsetE ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrr;
