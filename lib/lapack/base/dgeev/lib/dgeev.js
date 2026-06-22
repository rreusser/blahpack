

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
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} VL - VL
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - VR
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @returns {integer} info status code
*/
function dgeev( jobvl, jobvr, N, A, LDA, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR ) { // eslint-disable-line max-len, max-params
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var owi;
	var owr;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	svl1 = 1;
	svl2 = LDVL;
	svr1 = 1;
	svr2 = LDVR;
	owr = stride2offset( N, strideWR );
	owi = stride2offset( N, strideWI );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDVL < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDVL ) );
	}
	if ( LDVR < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVR ) );
	}
	if ( jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	return base( jobvl, jobvr, N, A, sa1, sa2, 0, WR, strideWR, owr, WI, strideWI, owi, VL, svl1, svl2, 0, VR, svr1, svr2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeev;
