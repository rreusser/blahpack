
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the L_D_L^T factorization of a real symmetric positive definite tridiagonal matrix A.
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dpttrf( N, d, strideD, e, strideE ) {
	var od;
	var oe;

	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe );
}


// EXPORTS //

export default dpttrf;
