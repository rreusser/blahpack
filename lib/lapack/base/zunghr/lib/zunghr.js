

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {Complex128Array} WORK - WORK
* @param {integer} strideWORK - strideWORK
* @param {integer} lwork - lwork
* @returns {integer} info status code
*/
function zunghr( N, ilo, ihi, A, LDA, TAU, strideTAU, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var owork;
	var otau;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	otau = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = IHI - ILO.;
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, strideWORK, owork, lwork );
}


// EXPORTS //

export default zunghr;
