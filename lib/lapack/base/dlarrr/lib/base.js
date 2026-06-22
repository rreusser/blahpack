
// MODULES //

import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';


// VARIABLES //

// RELCOND threshold for relative robustness:
var RELCOND = 0.999;

// DLAMCH('Safe minimum'):
var SAFMIN = 2.2250738585072014e-308;

// DLAMCH('Precision') = eps:
var EPS = 1.1102230246251565e-16;

// SMLNUM = SAFMIN / EPS:
var SMLNUM = SAFMIN / EPS;

// RMIN = sqrt( SMLNUM ):
var RMIN = sqrt( SMLNUM );


// MAIN //

/**
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* ## Notes
*
* -   Returns `0` if the matrix may be relatively robust (warranting expensive computations), `1` if standard methods should be used.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements
* @param {integer} strideD - stride length for `d`
* @param {NonNegativeInteger} offsetD - starting index for `d`
* @param {Float64Array} e - off-diagonal elements
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} offsetE - starting index for `e`
* @returns {integer} info - 0 if relatively robust, 1 otherwise
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
	var offdig2;
	var offdig;
	var yesrel;
	var tmp2;
	var tmp;
	var id;
	var ie;
	var i;

	if ( N <= 0 ) {
		return 0;
	}

	// Test whether the tridiagonal matrix T is relatively robust...
	yesrel = true;
	offdig = 0.0;
	id = offsetD;
	ie = offsetE;

	tmp = sqrt( abs( d[ id ] ) );
	if ( tmp < RMIN ) {
		yesrel = false;
	}
	if ( yesrel ) {
		for ( i = 1; i < N; i++ ) {
			tmp2 = sqrt( abs( d[ id + ( i * strideD ) ] ) );
			if ( tmp2 < RMIN ) {
				yesrel = false;
				break;
			}
			offdig2 = abs( e[ ie + ( ( i - 1 ) * strideE ) ] ) / ( tmp * tmp2 );
			if ( offdig + offdig2 >= RELCOND ) {
				yesrel = false;
				break;
			}
			tmp = tmp2;
			offdig = offdig2;
		}
	}
	if ( yesrel ) {
		return 0;
	}
	// The standard approach should be used...
	return 1;
}


// EXPORTS //

export default dlarrr;
