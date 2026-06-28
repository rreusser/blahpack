/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the norm of a complex Hermitian tridiagonal matrix A.
*
* @param {string} norm - `'max'`, `'one-norm'`, `'inf-norm'`, or `'frobenius'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} d - diagonal elements (real), length N
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - starting index for d
* @param {Complex128Array} e - off-diagonal elements (complex), length N-1
* @param {integer} strideE - stride for e (in complex elements)
* @param {NonNegativeInteger} offsetE - starting index for e (in complex elements)
* @throws {TypeError} first argument must be a valid norm value
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {number} the computed norm value
*/
function zlanht( norm, N, d, strideD, offsetD, e, strideE, offsetE ) {
	if ( norm !== 'max' && norm !== 'one-norm' && norm !== 'inf-norm' && norm !== 'frobenius' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid norm value. Value: `%s`.', norm ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( norm, N, d, strideD, offsetD, e, strideE, offsetE );
}


// EXPORTS //

export default zlanht;
