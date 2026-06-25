
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a real symmetric.
*
* @param {string} jobz - jobz
* @param {NonNegativeInteger} N - N
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} e - e
* @param {integer} strideE - strideE
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @returns {integer} info status code
*/
function dstev( jobz, N, d, strideD, e, strideE, Z, LDZ, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var owork;
	var sz1;
	var sz2;
	var od;
	var oe;

	sz1 = 1;
	sz2 = LDZ;
	od = stride2offset( N, strideD );
	oe = stride2offset( N, strideE );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, Math.max( 1,2 * N - 2) );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `jobz` value. Value: `%s`.', jobz ) );
	}
	return base( jobz, N, d, strideD, od, e, strideE, oe, Z, sz1, sz2, 0, WORK, strideWORK, owork );
}


// EXPORTS //

export default dstev;
