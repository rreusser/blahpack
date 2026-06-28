
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Float64Array} a - a
* @param {integer} strideA - strideA
* @param {number} lambda - lambda
* @param {Float64Array} b - b
* @param {integer} strideB - strideB
* @param {Float64Array} c - c
* @param {integer} strideC - strideC
* @param {number} tol - tol
* @param {Float64Array} d - d
* @param {integer} strideD - strideD
* @param {Int32Array} IN - IN
* @param {integer} strideIN - strideIN
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dlagtf( N, a, strideA, lambda, b, strideB, c, strideC, tol, d, strideD, IN, strideIN ) { // eslint-disable-line max-len, max-params
	var oin;
	var oa;
	var ob;
	var oc;
	var od;

	oa = stride2offset( N, strideA );
	ob = stride2offset( N, strideB );
	oc = stride2offset( N, strideC );
	od = stride2offset( N, strideD );
	oin = stride2offset( N, strideIN );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, a, strideA, oa, lambda, b, strideB, ob, c, strideC, oc, tol, d, strideD, od, IN, strideIN, oin ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagtf;
