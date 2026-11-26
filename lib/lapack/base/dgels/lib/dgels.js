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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Block size of the JS dgeqrf/dgelqf/dormqr/dormlq (ILAENV stand-in)
const TSIZE = 4160; // T part of the dormqr/dormlq optimum, ( NBMAX + 1 ) * LDT


// MAIN //

/**
* Solves overdetermined or underdetermined real linear systems involving an.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-transpose'|'transpose')} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {(Float64Array|null)} work - workspace of length at least `max(1, MN + max(MN,nrhs))` (`MN = min(M,N)`); for optimal performance at least `MN + max( MN*NB, nrhs*NB + TSIZE )` (`NB = 32`, `TSIZE = 4160`); or `null` to allocate the optimal size
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-transpose", "transpose"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, M )` (column-major)
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( max( 1, M ), N )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info status code
*/
function dgels( order, trans, M, N, nrhs, A, LDA, B, LDB, work ) {
	let lwork, MN, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-transpose", "transpose". Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( max( 1, M ), N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', max( max( 1, M ), N ), LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	if ( work === null || work === void 0 ) {
		MN = Math.min( M, N );

		// The reference's optimum, MN + max(MN,nrhs)*NB, with each callee's optimum
		// as the callee states it: dgeqrf/dgelqf MN*NB, dormqr/dormlq nrhs*NB + TSIZE.
		lwork = Math.max( 1, MN + Math.max( MN * NB, ( nrhs * NB ) + TSIZE ) );
		work = new Float64Array( lwork );
	}
	return base( trans, M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, work, 1, 0 );
}


// EXPORTS //

export default dgels;
