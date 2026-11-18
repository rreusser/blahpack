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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* Solves overdetermined or underdetermined complex linear systems involving an M-by-N matrix `A`, or its conjugate transpose, using a QR or LQ factorization of `A`.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - `'no-transpose'` or `'conjugate-transpose'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of `B`)
* @param {Complex128Array} A - input matrix, overwritten with its factorization
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - on entry, the right-hand sides; on exit, the solution (its leading extent must be `max(M,N)`)
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {(Complex128Array|null)} WORK - caller-owned workspace, or `null` to auto-allocate
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid transpose operation
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgels( order, trans, M, N, nrhs, A, LDA, B, LDB, WORK ) {
	let minWork, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( trans !== 'no-transpose' && trans !== 'conjugate-transpose' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
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
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.MAX( 1, M )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, max( M, N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (column-major: rejected when `LDB.LT.MAX( 1, M, N )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument violates the reference leading-dimension rule (row-major: must also cover the NRHS columns). Value: `%d`.', LDB ) );
	}

	// B holds the RHS on entry and the solution on exit; the min-norm solution
	// (M<N) has N rows, so B is max(M,N)-by-nrhs, NOT M-by-nrhs.
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
	const MN = Math.min( M, N );
	if ( WORK === null || WORK === void 0 ) {
		// The wrapper is the single sanctioned allocation site (base/ndarray never
		// allocate). Size for the blocked path: MN for TAU + scratch.
		minWork = Math.max( 1, MN + ( Math.max( MN, nrhs ) * NB ) + ( ( MN > NB ) ? ( ( NB + 1 ) * NB ) : 0 ) );
		WORK = new Complex128Array( minWork );
	}
	return base( trans, M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zgels;
