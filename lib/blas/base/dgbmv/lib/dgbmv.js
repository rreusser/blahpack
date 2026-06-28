
// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} trans - trans
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} kl - kl
* @param {NonNegativeInteger} ku - ku
* @param {number} alpha - alpha
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} x - x
* @param {integer} strideX - strideX
* @param {number} beta - beta
* @param {Float64Array} y - y
* @param {integer} strideY - strideY
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} output array
*/
function dgbmv( order, trans, M, N, kl, ku, alpha, A, LDA, x, strideX, beta, y, strideY ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var ox;
	var oy;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}

	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	ox = stride2offset( N, strideX );
	oy = stride2offset( N, strideY );
	return base( trans, M, N, kl, ku, alpha, A, sa1, sa2, 0, x, strideX, ox, beta, y, strideY, oy );
}


// EXPORTS //

export default dgbmv;
