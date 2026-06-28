
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Counts the number of eigenvalues of a symmetric tridiagonal matrix in an interval.
*
* @param {string} jobt - specifies the matrix type: `'tridiagonal'` for matrix T, `'ldl'` for matrix `L * D * L^T`
* @param {NonNegativeInteger} N - order of the matrix
* @param {number} vl - lower bound for the eigenvalues
* @param {number} vu - upper bound for the eigenvalues
* @param {Float64Array} D - diagonal elements (length N)
* @param {integer} strideD - stride length for `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Float64Array} E - off-diagonal elements (length N-1)
* @param {integer} strideE - stride length for `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {number} pivmin - minimum pivot in the Sturm sequence
* @throws {TypeError} first argument must be a valid job type
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} object with `info`, `eigcnt`, `lcnt`, and `rcnt` properties
*/
function dlarrc( jobt, N, vl, vu, D, strideD, offsetD, E, strideE, offsetE, pivmin ) { // eslint-disable-line max-len, max-params
	if ( jobt !== 'tridiagonal' && jobt !== 'ldl' ) {
		throw new TypeError( 'invalid argument. First argument must be one of the following: "tridiagonal", "ldl". Value: `' + jobt + '`.' );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( jobt, N, vl, vu, D, strideD, offsetD, E, strideE, offsetE, pivmin );
}


// EXPORTS //

export default dlarrc;
