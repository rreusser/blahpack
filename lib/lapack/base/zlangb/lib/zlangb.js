
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Returns the norm of a complex general band matrix.
*
* @param {string} norm - norm type
* @param {NonNegativeInteger} N - order of the matrix
* @param {NonNegativeInteger} KL - number of sub-diagonals
* @param {NonNegativeInteger} KU - number of super-diagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK - stride for WORK
* @returns {number} norm value
*/
function zlangb( norm, N, KL, KU, AB, LDAB, WORK, strideWORK ) { // eslint-disable-line max-params
	var owork;
	var sa1;
	var sa2;

	sa1 = 1;
	sa2 = LDAB;
	owork = stride2offset( N, strideWORK );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm. Value: `%s`.', norm ) );
	}
	return base( norm, N, KL, KU, AB, sa1, sa2, 0, WORK, strideWORK, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlangb;
