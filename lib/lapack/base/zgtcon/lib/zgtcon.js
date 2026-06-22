
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} norm - norm
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} DL - DL
* @param {integer} strideDL - strideDL
* @param {Complex128Array} d - d
* @param {integer} strideD - strideD
* @param {Complex128Array} DU - DU
* @param {integer} strideDU - strideDU
* @param {Complex128Array} DU2 - DU2
* @param {integer} strideDU2 - strideDU2
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @returns {integer} info status code
*/
function zgtcon( norm, N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var oipiv;
	var owork;
	var odu2;
	var odl;
	var odu;
	var od;

	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	odu2 = stride2offset( N, strideDU2 );
	oipiv = stride2offset( N, strideIPIV );
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, strideWORK, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtcon;
