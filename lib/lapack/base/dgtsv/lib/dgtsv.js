
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a general real tridiagonal system of linear equations A * X = B.
*
* @param {NonNegativeInteger} N - N
* @param {integer} nrhs - nrhs
* @param {Float64Array} DL - DL
* @param {integer} strideDL - strideDL
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Float64Array} DU - DU
* @param {integer} strideDU - strideDU
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @returns {integer} status code (0 = success)
*/
function dgtsv( N, nrhs, DL, strideDL, d, strideD, DU, strideDU, B, LDB ) { // eslint-disable-line max-len, max-params
	var odl;
	var odu;
	var sb1;
	var sb2;
	var od;

	sb1 = 1;
	sb2 = LDB;
	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, B, sb1, sb2, 0 );
}


// EXPORTS //

export default dgtsv;
