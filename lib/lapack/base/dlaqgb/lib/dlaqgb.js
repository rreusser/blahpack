
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C.
*
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} kl - number of sub-diagonals within the band of A
* @param {NonNegativeInteger} ku - number of super-diagonals within the band of A
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
*/
function dlaqgb( M, N, kl, ku, AB, LDAB, r, strideR, c, strideC, rowcnd, colcnd, amax ) { // eslint-disable-line max-len, max-params
	var or;
	var oc;

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
	return base( M, N, kl, ku, AB, 1, LDAB, 0, r, strideR, or, c, strideC, oc, rowcnd, colcnd, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqgb;
