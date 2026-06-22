

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} job - job
* @param {string} compq - compq
* @param {Uint8Array} SELECT - SELECT
* @param {integer} strideSELECT - strideSELECT
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} W - W
* @param {integer} strideW - strideW
* @param {Float64Array} M - M
* @param {Float64Array} s - s
* @param {Float64Array} sep - sep
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @returns {integer} info status code
*/
function ztrsen( job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, W, strideW, M, s, sep, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var oselect;
	var owork;
	var sq1;
	var sq2;
	var st1;
	var st2;
	var ow;

	st1 = 1;
	st2 = LDT;
	sq1 = 1;
	sq2 = LDQ;
	oselect = stride2offset( N, strideSELECT );
	ow = stride2offset( N, strideW );
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDT < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDT ) );
	}
	if ( LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
	}
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'subspace' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	return base( job, compq, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, Q, sq1, sq2, 0, W, strideW, ow, M, s, sep, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztrsen;
