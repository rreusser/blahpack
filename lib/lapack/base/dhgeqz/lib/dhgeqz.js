
/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the eigenvalues of a real matrix pair (H,T) where H is upper Hessenberg and T is upper triangular, using the QZ method.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - specifies the operation type
* @param {string} compq - specifies the operation type
* @param {string} compz - specifies the operation type
* @param {NonNegativeInteger} N - number of columns
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} ALPHAR - input array
* @param {integer} strideALPHAR - stride length for `ALPHAR`
* @param {Float64Array} ALPHAI - input array
* @param {integer} strideALPHAI - stride length for `ALPHAI`
* @param {Float64Array} BETA - input array
* @param {integer} strideBETA - stride length for `BETA`
* @param {Float64Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} WORK - output array
* @param {integer} strideWORK - stride length for `WORK`
* @param {integer} lwork - lwork
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} leading dimension arguments must be valid
* @returns {integer} status code (0 = success)
*/
function dhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK, strideWORK, lwork ) { // eslint-disable-line max-len, max-params
	var sh1;
	var sh2;
	var st1;
	var st2;
	var sq1;
	var sq2;
	var sz1;
	var sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 21th argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		st1 = 1;
		st2 = LDT;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sh1 = LDH;
		sh2 = 1;
		st1 = LDT;
		st2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( job, compq, compz, N, ilo, ihi, H, sh1, sh2, 0, T, st1, st2, 0, ALPHAR, strideALPHAR, 0, ALPHAI, strideALPHAI, 0, BETA, strideBETA, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, WORK, strideWORK, 0, lwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhgeqz;
