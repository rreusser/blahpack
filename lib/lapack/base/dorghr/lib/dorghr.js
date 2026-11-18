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


// VARIABLES //

const NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - N
* @param {integer} ilo - ilo
* @param {integer} ihi - ihi
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - TAU
* @param {integer} strideTAU - strideTAU
* @param {(Float64Array|null)} WORK - caller-owned workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dorghr( order, N, ilo, ihi, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let minWork;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( N, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// The wrapper is the single sanctioned allocation site (base/ndarray never
		// allocate). dorgqr needs nh*NB scratch.
		minWork = Math.max( 1, ihi - ilo ) * NB;
		WORK = new Float64Array( minWork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	return base( N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default dorghr;
