
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @returns {integer} info status code
*/
function dptcon( N, d, strideD, e, strideE, anorm, rcond, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var owork;
	var od;
	var oe;

	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe, anorm, rcond, WORK, strideWORK, owork );
}


// EXPORTS //

export default dptcon;
