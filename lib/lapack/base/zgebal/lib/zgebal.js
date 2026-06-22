
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
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} SCALE - SCALE
* @param {integer} strideSCALE - strideSCALE
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function zgebal( job, N, A, LDA, SCALE, strideSCALE ) {
	var oscale;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDA;
	oscale = stride2offset( N, strideSCALE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( job !== 'none' && job !== 'permute' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	return base( job, N, A, sa1, sa2, 0, SCALE, strideSCALE, oscale );
}


// EXPORTS //

export default zgebal;
