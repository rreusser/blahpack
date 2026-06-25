
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} jobvl - jobvl
* @param {string} jobvr - jobvr
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} VL - VL
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Complex128Array} VR - VR
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @param {Float64Array} RWORK - RWORK
* @param {integer} strideRWORK - strideRWORK
* @returns {integer} info status code
*/
function zgeev( jobvl, jobvr, N, A, LDA, w, strideW, VL, LDVL, VR, LDVR, WORK, strideWORK, lwork, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var orwork;
	var owork;
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sa1;
	var sa2;
	var ow;

	sa1 = 1;
	sa2 = LDA;
	svl1 = 1;
	svl2 = LDVL;
	svr1 = 1;
	svr2 = LDVR;
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,2 * N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, 2 * N );
		RWORK = new Float64Array( minRwork );
		strideRWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	orwork = stride2offset( N, strideRWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, w, strideW, ow, VL, svl1, svl2, 0, VR, svr1, svr2, 0, WORK, strideWORK, owork, lwork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgeev;
