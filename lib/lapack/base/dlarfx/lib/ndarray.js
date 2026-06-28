
// MODULES //

import isOperationSide from '@stdlib/blas/base/assert/is-operation-side/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Applies an elementary reflector H to a real M-by-N matrix C, from either.
* the left or the right. H is represented in the form:
*
*   H = I - tau _ v _ v^T
*
* where tau is a real scalar and v is a real vector.
*
* If tau = 0, then H is taken to be the unit matrix.
*
* This version uses inline code if H has order <= 10.
*
* @param {string} side - `'left'` or `'right'`
* @param {NonNegativeInteger} M - number of rows of C
* @param {NonNegativeInteger} N - number of columns of C
* @param {Float64Array} v - the vector v in the reflector
* @param {integer} strideV - stride for v
* @param {NonNegativeInteger} offsetV - starting index for v
* @param {number} tau - the scalar tau
* @param {Float64Array} C - the M-by-N matrix
* @param {integer} strideC1 - stride of the first dimension of C
* @param {integer} strideC2 - stride of the second dimension of C
* @param {NonNegativeInteger} offsetC - starting index for C
* @param {Float64Array} WORK - workspace (length N if side=`'left'`, length M if side=`'right'`)
* @param {integer} strideWORK - stride for WORK
* @param {NonNegativeInteger} offsetWORK - starting index for WORK
* @throws {TypeError} First argument must be a valid operation side
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {void}
*/
function dlarfx( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params
	if ( !isOperationSide( side ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	var minWork = ( side === 'left' ) ? Math.max( 1, N ) : Math.max( 1, M );
	if ( !WORK || ( WORK.length - offsetWORK ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWORK, ( WORK ) ? WORK.length : 0 ) );
	}

	return base( side, M, N, v, strideV, offsetV, tau, C, strideC1, strideC2, offsetC, WORK, strideWORK, offsetWORK ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlarfx;
