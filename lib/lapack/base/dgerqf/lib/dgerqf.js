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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Hardcoded block size (must match base.js)


// MAIN //

/**
* Computes an RQ factorization of a real M-by-N matrix A = R * Q.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows in A
* @param {NonNegativeInteger} N - number of columns in A
* @param {Float64Array} A - input/output matrix (column-major)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAU - output array of scalar factors
* @param {integer} strideTAU - stride for `TAU`
* @param {(Float64Array|null)} WORK - caller-provided workspace, or `null` to have an optimally-sized workspace allocated internally. Size must be at least `(ldwork * nb) + (ldt * nb)` elements, where `nb = min(32, min(M, N))`, `ldwork = max(1, M)`, and `ldt = nb`.
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} fifth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info status code
*/
function dgerqf( order, M, N, A, LDA, TAU, strideTAU, WORK ) { // eslint-disable-line max-len, max-params
	let ldwork, ldt, nb, K;

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
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const otau = stride2offset( N, strideTAU );

	// Allocate WORK if the caller passed null; size matches the base-layer partition (main scratch + block-reflector T).
	if ( WORK === null ) {
		K = min( M, N );
		nb = min( NB, K );
		if ( nb < 1 ) {
			nb = 1;
		}
		ldt = nb;
		ldwork = max( 1, M );
		WORK = new Float64Array( max( 1, ( ldwork * nb ) + ( ldt * nb ) ) );
	}
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, otau, WORK, 1, 0 );
}


// EXPORTS //

export default dgerqf;
