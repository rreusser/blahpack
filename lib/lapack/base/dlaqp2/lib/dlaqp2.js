
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} offset - offset
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - JPVT
* @param {integer} strideJPVT - strideJPVT
* @param {Float64Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {Float64Array} VN1 - VN1
* @param {integer} strideVN1 - strideVN1
* @param {Float64Array} VN2 - VN2
* @param {integer} strideVN2 - strideVN2
* @param {Float64Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
*/
function dlaqp2( M, N, offset, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var ojpvt;
	var owork;
	var otau;
	var ovn1;
	var ovn2;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	ojpvt = stride2offset( N, strideJPVT );
	otau = stride2offset( N, strideTAU );
	ovn1 = stride2offset( N, strideVN1 );
	ovn2 = stride2offset( N, strideVN2 );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = N;
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return base( M, N, offset, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, VN1, strideVN1, ovn1, VN2, strideVN2, ovn2, WORK, strideWORK, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqp2;
