/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
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
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} leading dimension arguments must be valid
* @returns {integer} status code (0 = success)
*/
function dhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK ) { // eslint-disable-line max-len, max-params
	let sh1, sh2, st1, st2, sq1, sq2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid job. Value: `%s`.', job ) );
	}
	if ( compq !== 'none' && compq !== 'initialize' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid compq. Value: `%s`.', compq ) );
	}
	if ( compz !== 'none' && compz !== 'initialize' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid compz. Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < N ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (rejected when `LDH.LT.N`). Value: `%d`.', LDH ) );
	}
	if ( LDT < N ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument violates the reference leading-dimension rule (rejected when `LDT.LT.N`). Value: `%d`.', LDT ) );
	}
	if ( LDQ < 1 || ( ( ( compq === 'none' ) ? false : ( compq === 'update' ) ? true : true ) && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument violates the reference leading-dimension rule (rejected when `LDQ.LT.1 .OR. ( ILQ .AND. LDQ.LT.N )`). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < 1 || ( ( ( compz === 'none' ) ? false : ( compz === 'update' ) ? true : true ) && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument violates the reference leading-dimension rule (rejected when `LDZ.LT.1 .OR. ( ILZ .AND. LDZ.LT.N )`). Value: `%d`.', LDZ ) );
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
		const minWork = Math.max( 1, N );
		WORK = new Float64Array( minWork );
	}
	return base( job, compq, compz, N, ilo, ihi, H, sh1, sh2, 0, T, st1, st2, 0, ALPHAR, strideALPHAR, 0, ALPHAI, strideALPHAI, 0, BETA, strideBETA, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhgeqz;
