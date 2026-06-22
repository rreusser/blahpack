/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes one eigenvalue of a symmetric tridiagonal matrix to suitable accuracy.
*
* @param {NonNegativeInteger} N - number of columns
* @param {integer} iw - iw
* @param {number} gl - gl
* @param {number} gu - gu
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} E2 - output array
* @param {integer} strideE2 - stride length for `E2`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {number} reltol - relative tolerance for convergence
* @param {Float64Array} w - output array for the computed eigenvalue
* @param {Float64Array} werr - output array for the error bound
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlarrk( N, iw, gl, gu, d, strideD, E2, strideE2, pivmin, reltol, w, werr ) { // eslint-disable-line max-len, max-params
	var oE2 = stride2offset( N, strideE2 );
	var od = stride2offset( N, strideD );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, iw, gl, gu, d, strideD, od, E2, strideE2, oE2, pivmin, reltol, w, werr ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrk;
