/**
 * Applies a sequence of real plane rotations to a complex general matrix.
 *
 * When SIDE = 'L', the transformation takes the form:
 * `A := P*A`
 * When SIDE = 'R', the transformation takes the form:
 * A := A*P^T
 *
 * where P is an orthogonal matrix consisting of a sequence of z plane
 * rotations, with z = M-1 when SIDE = 'L' and z = N-1 when SIDE = 'R',
 * and P^T is the transpose of P.
 *
 * C and S are real arrays with simple stride/offset.
 *
 *
 * @param {string} side - `'left'` or `'right'`
 * @param {string} pivot - `'variable'`, `'top'`, or `'bottom'`
 * @param {string} direct - `'forward'` or `'backward'`
 * @param {NonNegativeInteger} M - number of rows of A
 * @param {NonNegativeInteger} N - number of columns of A
 * @param {Float64Array} c - array of cosines (real)
 * @param {integer} strideC - stride for `c`
 * @param {NonNegativeInteger} offsetC - starting index for `c`
 * @param {Float64Array} s - array of sines (real)
 * @param {integer} strideS - stride for `s`
 * @param {NonNegativeInteger} offsetS - starting index for `s`
 * @param {Complex128Array} A - input/output matrix
 * @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
 * @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
 * @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
 * @throws {TypeError} First argument must be a valid operation side
 * @returns {Complex128Array} A
 */

/* eslint-disable max-len, max-params */

// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies a sequence of real plane rotations to a complex general matrix.
*
* @param {string} side - `'left'` or `'right'`
* @param {string} pivot - `'variable'`, `'top'`, or `'bottom'`
* @param {string} direct - `'forward'` or `'backward'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {Float64Array} c - array of cosines (real)
* @param {integer} strideC - stride for `c`
* @param {NonNegativeInteger} offsetC - starting index for `c`
* @param {Float64Array} s - array of sines (real)
* @param {integer} strideS - stride for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Complex128Array} A - input/output matrix
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @throws {TypeError} first argument must be a valid operation side
* @throws {TypeError} second argument must be a valid pivot type
* @throws {TypeError} third argument must be a valid direction
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @returns {Complex128Array} A
*/
function zlasr( side, pivot, direct, M, N, c, strideC, offsetC, s, strideS, offsetS, A, strideA1, strideA2, offsetA ) {
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( pivot !== 'variable' && pivot !== 'top' && pivot !== 'bottom' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid pivot type. Value: `%s`.', pivot ) );
	}
	if ( direct !== 'forward' && direct !== 'backward' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid direction. Value: `%s`.', direct ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M === 0 || N === 0 ) {
		return 0;
	}
	return base( side, pivot, direct, M, N, c, strideC, offsetC, s, strideS, offsetS, A, strideA1, strideA2, offsetA );
}


// EXPORTS //

export default zlasr;
