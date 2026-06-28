
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes row and column scalings to equilibrate a complex general band matrix.
*
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Float64Array} r - row scale factors
* @param {integer} strideR - stride for `r`
* @param {Float64Array} c - column scale factors
* @param {integer} strideC - stride for `c`
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result
*/
function zgbequ( M, N, kl, ku, AB, LDAB, r, strideR, c, strideC ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var or;
	var oc;

	sa1 = 1;
	sa2 = LDAB;
	or = stride2offset( M, strideR );
	oc = stride2offset( N, strideC );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDAB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDAB ) );
	}
	return base( M, N, kl, ku, AB, sa1, sa2, 0, r, strideR, or, c, strideC, oc ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgbequ;
