

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
* @param {string} compz - compz
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Complex128Array} H - H
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} w - w
* @param {integer} strideW - strideW
* @param {Complex128Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @returns {integer} info status code
*/
function zhseqr( job, compz, N, ilo, ihi, H, LDH, w, strideW, Z, LDZ, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var owork;
	var sh1;
	var sh2;
	var sz1;
	var sz2;
	var ow;

	sh1 = 1;
	sh2 = LDH;
	sz1 = 1;
	sz2 = LDZ;
	ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `compz` value. Value: `%s`.', compz ) );
	}
	return base( job, compz, N, ilo, ihi, H, sh1, sh2, 0, w, strideW, ow, Z, sz1, sz2, 0, WORK, strideWORK, owork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhseqr;
