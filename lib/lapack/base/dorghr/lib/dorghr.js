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
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* Generates a real orthogonal matrix Q which is defined as the product of IHI-ILO elementary reflectors of order N, as returned by DGEHRD: Q = H(ilo) H(ilo+1).
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the matrix Q.
* @param {integer} ilo - iLO and IHI must have the same values as in the previous call of DGEHRD.
* @param {integer} ihi - iLO and IHI must have the same values as in the previous call of DGEHRD.
* @param {Float64Array} A - on entry, the vectors which define the elementary reflectors, as returned by DGEHRD. On exit, the N-by-N orthogonal matrix Q.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - tAU(i) must contain the scalar factor of the elementary reflector H(i), as returned by DGEHRD.
* @param {integer} strideTAU - stride length for `TAU`
* @param {(Float64Array|null)} WORK - caller-owned workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} fourth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} info status code
*/
function dorghr( order, N, ilo, ihi, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let minWork;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 || ilo > max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`). Value: `%d`.', ilo ) );
	}
	if ( ihi < min( ilo, N ) || ihi > N ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`). Value: `%d`.', ihi ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( N - 1, strideTAU );
	if ( WORK === null || WORK === void 0 ) {
		// The wrapper is the single sanctioned allocation site (base/ndarray never
		// allocate). dorgqr needs nh*NB scratch.
		minWork = Math.max( 1, ihi - ilo ) * NB;
		WORK = new Float64Array( minWork );
	}
	return base( N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default dorghr;
