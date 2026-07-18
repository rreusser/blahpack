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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

const DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization of a real M-by-N matrix A = Q.
*
* When `WORK` is `null`, this LAPACKE-style wrapper allocates a workspace
* of size `N*NB + NB*NB` elements (with `NB = 32`) as a convenience.
* Prefer passing a caller-owned buffer for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - input array
* @param {integer} strideTAU - `TAU` stride length
* @param {(Float64Array|null)} WORK - caller-provided workspace, or `null` to auto-allocate
* @param {integer} strideWork - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a valid leading dimension
* @returns {integer} info status code
*/
function dgeqrf( order, M, N, A, LDA, TAU, strideTAU, WORK, strideWork ) {
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
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null ) {
		lwork = max( 1, ( N * DEFAULT_NB ) + ( DEFAULT_NB * DEFAULT_NB ) );
		WORK = new Float64Array( lwork );
		strideWork = 1;
	}
	const ot = stride2offset( N, strideTAU );
	const ow = stride2offset( N, strideWork );
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, strideWork, ow );
}


// EXPORTS //

export default dgeqrf;
