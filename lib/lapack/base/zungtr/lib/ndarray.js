

// MODULES //

import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Generates a complex unitary matrix Q which is defined as the product of N-1.
* elementary reflectors of order N, as returned by ZHETRD.
*
* ## Notes
*
* -   If UPLO = 'U', Q is defined as a product of reflectors:
* `Q = H(n-1)*...*H(2) * H(1)`
*
* -   If UPLO = 'L', Q is defined as a product of reflectors:
* `Q = H(1)*H(2)*... * H(n-1)`
*
* @param {string} uplo - specifies whether the upper or lower triangle was used in ZHETRD (`'upper'` or `'lower'`)
* @param {NonNegativeInteger} N - order of the matrix Q
* @param {Complex128Array} A - on entry, contains the reflectors from ZHETRD; on exit, the unitary matrix Q
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} TAU - scalar factors of the reflectors from ZHETRD (length N-1)
* @param {integer} strideTAU - stride length for `TAU` (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for `TAU` (complex elements)
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK` (complex elements)
* @param {NonNegativeInteger} offsetWork - starting index for `WORK` (complex elements)
* @throws {TypeError} First argument must be a valid matrix triangle
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zungtr( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len, max-params
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( uplo, N, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWork, offsetWork, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zungtr;
