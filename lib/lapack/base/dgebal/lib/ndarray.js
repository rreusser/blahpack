
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Balances a general real matrix A.
*
* This involves, first, permuting A by a similarity transformation to
* isolate eigenvalues in the first 1 to ILO-1 and last IHI+1 to N
* elements on the diagonal; and second, applying a diagonal similarity
* transformation to rows and columns ILO to IHI to make the rows and
* columns as close in norm as possible.
*
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} A - input matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A
* @param {integer} strideA2 - stride of the second dimension of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} SCALE - output array of length N (permutation/scaling info)
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @returns {Object} result with properties: info (0=success), ilo (1-based), ihi (1-based)
*/
function dgebal( job, N, A, strideA1, strideA2, offsetA, ilo, ihi, SCALE, strideSCALE, offsetSCALE ) { // eslint-disable-line max-len, max-params
	if ( job !== 'none' && job !== 'permute' && job !== 'scale' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid job value. Value: `%s`.', job ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, N, A, strideA1, strideA2, offsetA, ilo, ihi, SCALE, strideSCALE, offsetSCALE ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgebal;
