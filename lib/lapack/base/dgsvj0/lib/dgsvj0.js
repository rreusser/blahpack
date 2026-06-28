
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Pre-processor for dgesvj performing Jacobi rotations.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {number} jobv - jobv
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} sva - input array
* @param {integer} strideSVA - stride length for `sva`
* @param {integer} mv - mv
* @param {Float64Array} V - output matrix
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {number} eps - eps
* @param {number} sfmin - sfmin
* @param {number} tol - tol
* @param {integer} nsweep - nsweep
* @param {Float64Array} work - input array
* @param {integer} strideWORK - stride length for `work`
* @param {integer} lwork - lwork
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dgsvj0( order, jobv, M, N, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var sa1;
	var sa2;
	var sv1;
	var sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sv1 = 1;
		sv2 = LDV;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sv1 = LDV;
		sv2 = 1;
	}
	if ( work === null || work === void 0 ) {
		var minWork = M;
		work = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( jobv, M, N, A, sa1, sa2, 0, d, strideD, 0, sva, strideSVA, 0, mv, V, sv1, sv2, 0, eps, sfmin, tol, nsweep, work, strideWORK, 0, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgsvj0;
