

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
* @param {Complex128Array} e - e
* @param {integer} strideE - strideE
* @param {number} anorm - anorm
* @param {Float64Array} rcond - rcond
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWork - strideRWork
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zptcon( N, d, strideD, e, strideE, anorm, rcond, RWORK, strideRWork ) { // eslint-disable-line max-len, max-params
	var orwork;
	var od;
	var oe;

	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	orwork = stride2offset( N, strideRWork );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, d, strideD, od, e, strideE, oe, anorm, rcond, RWORK, strideRWork, orwork );
}


// EXPORTS //

export default zptcon;
