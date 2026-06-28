

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Back-transforms eigenvectors after balancing by zgebal.
*
* @param {string} job - job
* @param {string} side - side
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} SCALE - SCALE
* @param {integer} strideSCALE - strideSCALE
* @param {NonNegativeInteger} M - M
* @param {Complex128Array} V - V
* @param {PositiveInteger} LDV - leading dimension of `V`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgebak( job, side, N, ilo, ihi, SCALE, strideSCALE, M, V, LDV ) { // eslint-disable-line max-len, max-params
	var oscale;
	var sv1;
	var sv2;

	sv1 = 1;
	sv2 = LDV;
	oscale = stride2offset( N, strideSCALE );
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( job !== 'none' && job !== 'scale' && job !== 'both' && job !== 'permute' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	return base( job, side, N, ilo, ihi, SCALE, strideSCALE, oscale, M, V, sv1, sv2, 0 );
}


// EXPORTS //

export default zgebak;
