
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
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {Int32Array} IWORK - IWORK
* @param {integer} strideIWORK - strideIWORK
* @returns {integer} info status code
*/
function dgtcon( norm, N, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV, anorm, rcond, WORK, strideWORK, IWORK, strideIWORK ) { // eslint-disable-line max-len, max-params
	var oiwork;
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
	oiwork = stride2offset( N, strideIWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( norm !== 'one-norm' && norm !== 'inf-norm' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	return base( norm, N, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, anorm, rcond, WORK, strideWORK, owork, IWORK, strideIWORK, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgtcon;
