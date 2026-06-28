
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} DL - DL
* @param {integer} strideDL - strideDL
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} DU - DU
* @param {integer} strideDU - strideDU
* @param {Float64Array} DU2 - DU2
* @param {integer} strideDU2 - strideDU2
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgttrf( N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var odu2;
	var odl;
	var odu;
	var od;

	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	odu2 = stride2offset( N, strideDU2 );
	oipiv = stride2offset( N, strideIPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgttrf;
