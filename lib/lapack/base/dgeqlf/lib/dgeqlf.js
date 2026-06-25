
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QL factorization of a real general matrix.
*
* If `WORK` is `null`, a workspace of length `max(1, N*NB + NB*NB)` (with
* `NB = 32`) is allocated internally as a convenience; for batched usage,
* prefer passing a reusable caller-provided buffer.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - caller-provided workspace (length `>= max(1, N*NB + NB*NB)` with `NB = 32`); `null` requests internal allocation
* @param {integer} strideWORK - stride length for `WORK`
* @param {integer} lwork - unused; retained for ABI compatibility
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a valid leading dimension
* @returns {integer} status code (0 = success)
*/
function dgeqlf( order, M, N, A, LDA, TAU, strideTAU, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var work;
	var sa1;
	var sa2;
	var sw;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK ) {
		work = WORK;
		sw = strideWORK;
	} else {
		work = new Float64Array( max( 1, ( N * DEFAULT_NB ) + ( DEFAULT_NB * DEFAULT_NB ) ) );
		sw = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var K = Math.min( M, N );
		var NB = 32;
		var minWork = ( K > NB ) ? ( ( N * NB ) + ( NB * NB ) ) : Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, 0, work, sw, 0, lwork );
}


// EXPORTS //

export default dgeqlf;
