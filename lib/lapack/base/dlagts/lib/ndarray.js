
// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the system (T - lambda_I)_x = y or (T - lambda_I)__T_x = y using.
* the LU factorization computed by dlagtf.
*
* @param {integer} job - 1: solve (T-lambda*I)x=y, no perturbation;
* @param {NonNegativeInteger} N - order of the matrix T
* @param {Float64Array} a - diagonal of U from dlagtf, length N
* @param {integer} strideA - stride for a
* @param {NonNegativeInteger} offsetA - offset for a
* @param {Float64Array} b - first super-diagonal of U from dlagtf, length N-1
* @param {integer} strideB - stride for b
* @param {NonNegativeInteger} offsetB - offset for b
* @param {Float64Array} c - sub-diagonal of L from dlagtf, length N-1
* @param {integer} strideC - stride for c
* @param {NonNegativeInteger} offsetC - offset for c
* @param {Float64Array} d - second super-diagonal of U from dlagtf, length N-2
* @param {integer} strideD - stride for d
* @param {NonNegativeInteger} offsetD - offset for d
* @param {Int32Array} IN - pivot info from dlagtf, length N
* @param {integer} strideIN - stride for IN
* @param {NonNegativeInteger} offsetIN - offset for IN
* @param {Float64Array} y - right-hand side (overwritten with solution), length N
* @param {integer} strideY - stride for y
* @param {NonNegativeInteger} offsetY - offset for y
* @param {number} tol - perturbation tolerance (used when job < 0)
* @returns {integer} info: 0 = success, >0 = overflow at element k
*/
function dlagts( job, N, a, strideA, offsetA, b, strideB, offsetB, c, strideC, offsetC, d, strideD, offsetD, IN, strideIN, offsetIN, y, strideY, offsetY, tol ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, N, a, strideA, offsetA, b, strideB, offsetB, c, strideC, offsetC, d, strideD, offsetD, IN, strideIN, offsetIN, y, strideY, offsetY, tol ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagts;
