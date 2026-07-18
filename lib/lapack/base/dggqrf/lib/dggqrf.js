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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} p - p
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAUA - TAUA
* @param {integer} strideTAUA - strideTAUA
* @param {Float64Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} TAUB - TAUB
* @param {integer} strideTAUB - strideTAUB
* @param {Float64Array} WORK - WORK
* @param {integer} strideWork - strideWork
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dggqrf( N, M, p, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, WORK, strideWork ) { // eslint-disable-line max-len, max-params

	const sa1 = 1;
	const sa2 = LDA;
	const sb1 = 1;
	const sb2 = LDB;
	const otaua = stride2offset( N, strideTAUA );
	const otaub = stride2offset( N, strideTAUB );
	if ( WORK === null || WORK === void 0 ) {
		// Blocked minimum for the three sub-kernels (NB=32); see lib/ndarray.js.
		const minWork = Math.max( 1, N, M, p,
			( Math.min( N, M ) > 32 ) ? ( ( M * 32 ) + ( 32 * 32 ) ) : M,
			( Math.min( N, M ) > 32 ) ? ( ( p * 32 ) + ( 33 * 32 ) ) : p,
			( Math.min( N, p ) > 32 ) ? ( ( N * 32 ) + ( 32 * 32 ) ) : N
		);
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	const owork = stride2offset( N, strideWork );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. First argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,M). Value: `%d`.', LDB ) );
	}
	return base( N, M, p, A, sa1, sa2, 0, TAUA, strideTAUA, otaua, B, sb1, sb2, 0, TAUB, strideTAUB, otaub, WORK, strideWork, owork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggqrf;
