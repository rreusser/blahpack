// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the norm of a complex general tridiagonal matrix A.
*
* @param {string} norm - norm
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} DL - DL
* @param {integer} strideDL - strideDL
* @param {Complex128Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} DU - DU
* @param {integer} strideDU - strideDU
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} result
*/
function zlangt( norm, N, DL, strideDL, d, strideD, DU, strideDU ) { // eslint-disable-line max-len, max-params
	var odl;
	var odu;
	var od;

	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlangt;
