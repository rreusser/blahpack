

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} V - V
* @param {integer} strideV - strideV
* @param {Complex128Array} X - X
* @param {integer} strideX - strideX
* @param {Float64Array} EST - EST
* @param {Int32Array} KASE - KASE
* @param {Int32Array} ISAVE - ISAVE
* @param {integer} strideISAVE - strideISAVE
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function zlacn2( N, V, strideV, X, strideX, EST, KASE, ISAVE, strideISAVE ) { // eslint-disable-line max-len, max-params
	var oisave;
	var ov;
	var ox;

	ov = stride2offset( N, strideV );
	ox = stride2offset( N, strideX );
	oisave = stride2offset( N, strideISAVE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( N, V, strideV, ov, X, strideX, ox, EST, KASE, ISAVE, strideISAVE, oisave );
}


// EXPORTS //

export default zlacn2;
