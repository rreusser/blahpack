
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Equilibrates a symmetric matrix A using the scaling factors in the vector S.
*
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Complex128Array} A - input/output N-by-N symmetric matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} s - scaling factors, length N
* @param {integer} strideS - stride for s
* @param {number} scond - ratio of smallest to largest scaling factor
* @param {number} amax - absolute value of largest matrix element
* @returns {string} equed - 'none' or 'yes'
*/
function zlaqsy( uplo, N, A, LDA, s, strideS, scond, amax ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var os;

	sa1 = 1;
	sa2 = LDA;
	os = stride2offset( N, strideS );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	return base( uplo, N, A, sa1, sa2, 0, s, strideS, os, scond, amax );
}


// EXPORTS //

export default zlaqsy;
