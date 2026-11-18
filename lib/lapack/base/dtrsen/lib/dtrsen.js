/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
* See LICENSE.txt in the repository root for the full license text and
* upstream attribution.
*/

// MODULES //

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - job
* @param {string} compq - compq
* @param {Uint8Array|Array} SELECT - SELECT
* @param {integer} strideSELECT - strideSELECT
* @param {NonNegativeInteger} N - N
* @param {Float64Array} T - T
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} Q - Q
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} M - M
* @param {Float64Array} s - s
* @param {Float64Array} sep - sep
* @param {Float64Array} WORK - WORK
* @param {Int32Array} IWORK - IWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dtrsen( order, job, compq, SELECT, strideSELECT, N, T, LDT, Q, LDQ, WR, strideWR, WI, strideWI, M, s, sep, WORK, IWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const st1 = ( order === 'column-major' ) ? 1 : LDT;
	const st2 = ( order === 'column-major' ) ? LDT : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	const oselect = stride2offset( N, strideSELECT );
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N);
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = 1;
		IWORK = new Int32Array( minIwork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be >= max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDQ < 1 || ( compq === 'update' && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be >= 1, and >= N when compq === `update`. Value: `%d`.', LDQ ) );
	}
	if ( job !== 'none' && job !== 'eigenvalues' && job !== 'subspace' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `job` value. Value: `%s`.', job ) );
	}
	if ( compq !== 'none' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `compq` value. Value: `%s`.', compq ) );
	}
	return base( job, compq, SELECT, strideSELECT, oselect, N, T, st1, st2, 0, Q, sq1, sq2, 0, WR, strideWR, owr, WI, strideWI, owi, M, s, sep, WORK, 1, 0, IWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrsen;
