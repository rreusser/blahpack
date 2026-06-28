
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes an LU factorization of the matrix (T - lambda_I), where T is an.
_ n-by-n tridiagonal matrix and lambda is a scalar, as T - lambda_I = PLU.
*
* P is a permutation matrix, L is a unit lower tridiagonal matrix with at most
* one non-zero sub-diagonal element per column, and U is an upper triangular
* matrix with at most two non-zero super-diagonal elements per column.
*
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} a - diagonal elements (overwritten with U diagonal), length N
* @param {integer} strideA - stride for a
* @param {NonNegativeInteger} offsetA - offset for a
* @param {number} lambda - scalar lambda
* @param {Float64Array} b - super-diagonal elements (overwritten with U super-diagonal), length N-1
* @param {integer} strideB - stride for b
* @param {NonNegativeInteger} offsetB - offset for b
* @param {Float64Array} c - sub-diagonal elements (overwritten with L sub-diagonal), length N-1
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - offset for c
* @param {number} tol - relative tolerance for near-singularity detection
* @param {Float64Array} d - second super-diagonal of U, length N-2
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Int32Array} IN - pivot/info array, length N
* @param {integer} strideIN - stride for IN
* @param {NonNegativeInteger} offsetIN - offset for IN
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info: 0 = success, <0 = illegal argument
*/
function dlagtf( N, a, strideA, offsetA, lambda, b, strideB, offsetB, c, strideC, offsetC, tol, d, strideD, offsetD, IN, strideIN, offsetIN ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, a, strideA, offsetA, lambda, b, strideB, offsetB, c, strideC, offsetC, tol, d, strideD, offsetD, IN, strideIN, offsetIN ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagtf;
