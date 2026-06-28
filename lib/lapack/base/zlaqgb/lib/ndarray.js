// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a complex general band matrix using row and column scaling factors.
*
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {NonNegativeInteger} kl - number of subdiagonals
* @param {NonNegativeInteger} ku - number of superdiagonals
* @param {Complex128Array} AB - band matrix in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB` (complex elements)
* @param {integer} strideAB2 - stride of the second dimension of `AB` (complex elements)
* @param {NonNegativeInteger} offsetAB - index offset for `AB` (complex elements)
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for `r`
* @param {NonNegativeInteger} offsetR - index offset for `r`
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - index offset for `c`
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {string} equed - equilibration type: 'none', 'row', 'column', or 'both'
*/
function zlaqgb( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ) { // eslint-disable-line max-len, max-params
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( M, N, kl, ku, AB, strideAB1, strideAB2, offsetAB, r, strideR, offsetR, c, strideC, offsetC, rowcnd, colcnd, amax ); // eslint-disable-line max-len
}


// EXPORTS //

export default zlaqgb;
