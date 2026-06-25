
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Multiplies a general matrix by a banded orthogonal matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - specifies the operation type
* @param {string} trans - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {integer} n1 - n1
* @param {integer} n2 - n2
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} C - input matrix
* @param {PositiveInteger} LDC - leading dimension of `C`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @param {integer} lwork - lwork
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid operation side
* @throws {TypeError} Third argument must be a valid transpose operation
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be compatible with the matrix dimensions
* @throws {RangeError} eleventh argument must be compatible with the matrix dimensions
* @returns {integer} status code (0 = success)
*/
function dorm22( order, side, trans, M, N, n1, n2, Q, LDQ, C, LDC, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var sq1;
	var sq2;
	var sc1;
	var sc2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'column-major' && LDQ < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDQ ) );
	}
	if ( order === 'row-major' && LDC < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' && LDC < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDC ) );
	}
	if ( order === 'column-major' ) {
		sq1 = 1;
		sq2 = LDQ;
		sc1 = 1;
		sc2 = LDC;
	} else {
		sq1 = LDQ;
		sq2 = 1;
		sc1 = LDC;
		sc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1,N);
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( side, trans, M, N, n1, n2, Q, sq1, sq2, 0, C, sc1, sc2, 0, WORK, strideWORK, 0, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dorm22;
