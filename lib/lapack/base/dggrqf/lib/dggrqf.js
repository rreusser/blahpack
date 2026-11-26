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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes a generalized RQ factorization of an M-by-N matrix A and a.
* P-by-N matrix B.
*
* When `work` is `null`, this wrapper allocates the optimal workspace,
* `max( max(M,P,N)*NB, P*NB + TSIZE )` (`NB = 32` from `ilaenv`, `TSIZE = 4160`): the reference's `max(M,P,N)*NB` with the dormrq optimum's T part, which enables the blocked paths, as a convenience.
* Prefer passing a caller-owned buffer for batched use.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} p - number of rows of B
* @param {NonNegativeInteger} N - number of columns of A and B
* @param {Float64Array} A - M-by-N matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} TAUA - scalar factors of reflectors for Q
* @param {integer} strideTAUA - stride for TAUA
* @param {Float64Array} B - P-by-N matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} TAUB - scalar factors of reflectors for Z
* @param {integer} strideTAUB - stride for TAUB
* @param {(Float64Array|null)} work - workspace of length at least `max(1,M,P,N)`; for optimal performance at least `max( max(M,P,N)*NB, P*NB + TSIZE )` (`NB = 32` from `ilaenv`, `TSIZE = 4160`): the reference's `max(M,P,N)*NB` with the dormrq optimum's T part, which enables the blocked paths; or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} sixth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, p )` (column-major)
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {integer} info - 0 on success
*/
function dggrqf( order, M, p, N, A, LDA, TAUA, strideTAUA, B, LDB, TAUB, strideTAUB, work ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( p < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', p ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, p ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', p, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const otaua = stride2offset( Math.min( M, N ), strideTAUA );
	const otaub = stride2offset( Math.min( p, N ), strideTAUB );
	if ( work === null ) {
		work = new Float64Array( computeOptimalWorkSize( M, p, N ) );
	}
	return base( M, p, N, A, sa1, sa2, 0, TAUA, strideTAUA, otaua, B, sb1, sb2, 0, TAUB, strideTAUB, otaub, work, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dggrqf;
