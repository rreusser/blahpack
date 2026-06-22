
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Forms the triangular factor T of a block reflector.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} direct - specifies the operation type
* @param {string} storev - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} K - number of superdiagonals
* @param {Float64Array} V - input matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - stride length for `TAU`
* @param {Float64Array} T - output matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {void}
*/
function dlarzt( order, direct, storev, N, K, V, LDV, TAU, strideTAU, T, LDT ) { // eslint-disable-line max-len, max-params
	var sv1;
	var sv2;
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( order === 'row-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDV < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,K). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDT < max( 1, K ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,K). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		sv1 = 1;
		sv2 = LDV;
		st1 = 1;
		st2 = LDT;
	} else {
		sv1 = LDV;
		sv2 = 1;
		st1 = LDT;
		st2 = 1;
	}
	return base( direct, storev, N, K, V, sv1, sv2, 0, TAU, strideTAU, 0, T, st1, st2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarzt;
