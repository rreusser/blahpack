
// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates the 1-norm of a square complex matrix A using reverse communication.
*
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} V - workspace vector of length N
* @param {integer} strideV - stride for V (in complex elements)
* @param {Complex128Array} X - input/output vector of length N
* @param {integer} strideX - stride for X (in complex elements)
* @param {Float64Array} EST - in/out: EST[0] is the estimated 1-norm
* @param {Int32Array} KASE - in/out: KASE[0] is the operation to perform
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function zlacon( N, V, strideV, X, strideX, EST, KASE ) { // eslint-disable-line max-len, max-params
	var ov;
	var ox;

	ov = stride2offset( N, strideV );
	ox = stride2offset( N, strideX );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, V, strideV, ov, X, strideX, ox, EST, KASE );
}


// EXPORTS //

export default zlacon;
