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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// VARIABLES //

const NB = 32; // Hardcoded block size (replaces ILAENV queries)


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} trans - trans
* @param {NonNegativeInteger} M - M
* @param {NonNegativeInteger} N - N
* @param {NonNegativeInteger} nrhs - nrhs
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {(Complex128Array|null)} WORK - caller-owned workspace, or `null` to auto-allocate
* @param {integer} strideWork - strideWork
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgels( trans, M, N, nrhs, A, LDA, B, LDB, WORK, strideWork ) { // eslint-disable-line max-len, max-params
	let minWork, owork;

	const sa1 = 1;
	const sa2 = LDA;
	const sb1 = 1;
	const sb2 = LDB;
	const MN = Math.min( M, N );
	if ( WORK === null || WORK === void 0 ) {
		// The wrapper is the single sanctioned allocation site (base/ndarray never
		// allocate). Size for the blocked path: MN for TAU + scratch.
		minWork = Math.max( 1, MN + ( Math.max( MN, nrhs ) * NB ) + ( ( MN > NB ) ? ( ( NB + 1 ) * NB ) : 0 ) );
		WORK = new Complex128Array( minWork );
		strideWork = 1;
		owork = 0;
	} else {
		owork = stride2offset( N, strideWork );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, max( M, N ) ) ) {
		// B holds the RHS on entry and the solution on exit; the min-norm solution
		// (M<N) has N rows, so B's leading extent is max(M,N), NOT M.
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,max(M,N)). Value: `%d`.', LDB ) );
	}
	return base( trans, M, N, nrhs, A, sa1, sa2, 0, B, sb1, sb2, 0, WORK, strideWork, owork );
}


// EXPORTS //

export default zgels;
