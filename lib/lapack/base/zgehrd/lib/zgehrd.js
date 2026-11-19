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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

const DEFAULT_NB = 32; // block size used by `base.js`
const LDT = 65; // leading dimension of the T panel used by `base.js` (NBMAX + 1)


// MAIN //

/**
* Reduces a complex general matrix to upper Hessenberg form using a blocked algorithm.
*
* When `WORK` is `null`, this wrapper allocates a workspace of `N*NB + LDT*NB` (with `NB = 32`, `LDT = 65`)
* complex elements as a convenience. Prefer passing a caller-owned buffer for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - order of the matrix `A`
* @param {integer} ilo - lower index of the balanced matrix (1-based)
* @param {integer} ihi - upper index of the balanced matrix (1-based)
* @param {Complex128Array} A - input/output matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - output array of scalar factors (length `N-1`)
* @param {integer} strideTAU - `TAU` stride length (in complex elements)
* @param {(Complex128Array|null)} WORK - caller-provided workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument is invalid (rejected when `ilo < 1 || ilo > max( 1, N )`)
* @throws {RangeError} fourth argument is invalid (rejected when `ihi < min( ilo, N ) || ihi > N`)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )`
* @returns {integer} status code (0 = success)
*
* @example
* import Complex128Array from '@stdlib/array/complex128/lib/index.js';
*
* const A = new Complex128Array( [ 1.0, 0.0, 2.0, 1.0, 3.0, -1.0, 4.0, 0.0 ] );
* const TAU = new Complex128Array( 1 );
*
* const info = zgehrd( 'column-major', 2, 1, 2, A, 2, TAU, 1, null );
* // returns 0
*/
function zgehrd( order, N, ilo, ihi, A, LDA, TAU, strideTAU, WORK ) {
	let sa1, sa2;

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
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null ) {
		WORK = new Complex128Array( max( 1, ( N * DEFAULT_NB ) + ( LDT * DEFAULT_NB ) ) );
	}
	const ot = stride2offset( max( 1, N - 1 ), strideTAU );
	return base( N, ilo, ihi, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, 1, 0 );
}


// EXPORTS //

export default zgehrd;
