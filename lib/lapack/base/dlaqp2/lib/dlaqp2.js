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
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} offset - offset
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} JPVT - JPVT
* @param {integer} strideJPVT - strideJPVT
* @param {Float64Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {Float64Array} VN1 - VN1
* @param {integer} strideVN1 - strideVN1
* @param {Float64Array} VN2 - VN2
* @param {integer} strideVN2 - strideVN2
* @param {Float64Array} WORK - WORK
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
*/
function dlaqp2( order, M, N, offset, A, LDA, JPVT, strideJPVT, TAU, strideTAU, VN1, strideVN1, VN2, strideVN2, WORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const ojpvt = stride2offset( N, strideJPVT );
	const otau = stride2offset( N, strideTAU );
	const ovn1 = stride2offset( N, strideVN1 );
	const ovn2 = stride2offset( N, strideVN2 );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	return base( M, N, offset, A, sa1, sa2, 0, JPVT, strideJPVT, ojpvt, TAU, strideTAU, otau, VN1, strideVN1, ovn1, VN2, strideVN2, ovn2, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqp2;
