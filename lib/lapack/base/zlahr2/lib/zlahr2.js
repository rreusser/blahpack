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
import base from './base.js';


// MAIN //

/**
* Reduces the first `nb` columns of a complex general `N`-by-`(N-K+1)` matrix `A` so that elements below the `K`-th subdiagonal are zero, returning the auxiliary matrices `T` and `Y`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - number of rows of `A`
* @param {NonNegativeInteger} K - offset for the reduction
* @param {NonNegativeInteger} nb - number of columns to reduce
* @param {Complex128Array} A - input/output matrix (`N`-by-`(N-K+1)`)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} tau - output array of scalar factors (length `nb`)
* @param {integer} strideTAU - `tau` stride length (in complex elements)
* @param {Complex128Array} T - output upper triangular matrix (`nb`-by-`nb`)
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} Y - output matrix (`N`-by-`nb`)
* @param {PositiveInteger} LDY - leading dimension of `Y`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a valid leading dimension
* @throws {RangeError} tenth argument must be a valid leading dimension
* @throws {RangeError} twelfth argument must be a valid leading dimension
* @returns {Complex128Array} `Y`
*/
function zlahr2( order, N, K, nb, A, LDA, tau, strideTAU, T, LDT, Y, LDY ) {
	let st1, st2, sy1, sy2, sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( K < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', K ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N - K + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N-K+1). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDT < max( 1, nb ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,nb). Value: `%d`.', LDT ) );
	}
	if ( order === 'column-major' && LDT < max( 1, nb ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,nb). Value: `%d`.', LDT ) );
	}
	if ( order === 'row-major' && LDY < max( 1, nb ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,nb). Value: `%d`.', LDY ) );
	}
	if ( order === 'column-major' && LDY < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDY ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		st1 = 1;
		st2 = LDT;
		sy1 = 1;
		sy2 = LDY;
	} else {
		sa1 = LDA;
		sa2 = 1;
		st1 = LDT;
		st2 = 1;
		sy1 = LDY;
		sy2 = 1;
	}
	const otau = stride2offset( nb, strideTAU );
	return base( N, K, nb, A, sa1, sa2, 0, tau, strideTAU, otau, T, st1, st2, 0, Y, sy1, sy2, 0 );
}


// EXPORTS //

export default zlahr2;
