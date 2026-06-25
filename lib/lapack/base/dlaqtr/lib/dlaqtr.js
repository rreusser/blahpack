
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a real quasi-triangular system of equations.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} ltran - ltran
* @param {boolean} lreal - lreal
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} b - input array
* @param {integer} strideB - stride length for `b`
* @param {number} w - w
* @param {Float64Array} x - input array
* @param {integer} strideX - stride length for `x`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @returns {Object} result with properties: info (0=success), scale
*/
function dlaqtr( order, ltran, lreal, N, T, LDT, b, strideB, w, x, strideX, WORK, strideWORK ) { // eslint-disable-line max-len, max-params
	var st1;
	var st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
	} else {
		st1 = LDT;
		st2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( ltran, lreal, N, T, st1, st2, 0, b, strideB, 0, w, x, strideX, 0, WORK, strideWORK, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqtr;
