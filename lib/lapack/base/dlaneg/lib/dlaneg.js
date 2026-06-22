/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the Sturm count of a symmetric tridiagonal matrix with a shift.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal of `D` in the factorization `T = L*D*L^T`
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} LLD - `(N-1)` elements `L(i)*L(i)*D(i)`
* @param {integer} strideLLD - stride length for `LLD`
* @param {number} sigma - shift amount in `T - sigma*I = L*D*L^T`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @param {integer} r - twist index for the twisted factorization (1-based)
* @throws {RangeError} first argument must be a nonnegative integer
* @returns {integer} Sturm count (number of negative pivots)
*/
function dlaneg( N, d, strideD, LLD, strideLLD, sigma, pivmin, r ) {
	var oLLD;
	var od;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	od = stride2offset( N, strideD );
	oLLD = stride2offset( N, strideLLD );
	return base( N, d, strideD, od, LLD, strideLLD, oLLD, sigma, pivmin, r );
}


// EXPORTS //

export default dlaneg;
