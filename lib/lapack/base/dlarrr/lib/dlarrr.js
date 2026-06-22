
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Tests whether a symmetric tridiagonal matrix warrants expensive computations for high relative accuracy.
*
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - output array
* @param {integer} strideE - stride length for `e`
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function dlarrr( N, d, strideD, e, strideE ) {
	var od = stride2offset( N, strideD );
	var oe = stride2offset( N, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarrr;
