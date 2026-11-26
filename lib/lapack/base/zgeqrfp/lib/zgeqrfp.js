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
import ilaenv from '../../ilaenv/lib/base.js';


// MAIN //

/**
* Computes a QR factorization of a complex M-by-N matrix A = Q * R with non-negative diagonal elements of R, using a blocked algorithm.
*
* When `WORK` is `null`, this LAPACKE-style wrapper allocates the optimal
* workspace, `N*NB` complex elements (with `NB` from `ilaenv`), which enables the blocked path.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - `TAU` stride length
* @param {(Complex128Array|null)} WORK - workspace of length at least `max(1,N)` (for optimal performance at least `N*NB`, which enables the blocked path), or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} status code (0 = success)
*/
function zgeqrfp( order, M, N, A, LDA, TAU, strideTAU, WORK ) {
	let lwork, sa1, sa2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null ) {
		lwork = max( 1, N * ilaenv( 1, 'ZGEQRF', ' ', M, N, -1, -1 ) );
		WORK = new Complex128Array( lwork );
	}
	const ot = stride2offset( min( M, N ), strideTAU );
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, 1, 0 );
}


// EXPORTS //

export default zgeqrfp;
