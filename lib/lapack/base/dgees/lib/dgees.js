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
import base, { computeOptimalWorkSize } from './base.js';


// MAIN //

/**
* Computes the eigenvalues, the Schur form, and, optionally, the matrix of Schur vectors for general matrices.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('no-vectors'|'compute-vectors')} jobvs - `'no-vectors'`: Schur vectors are not computed; `'compute-vectors'`: Schur vectors are computed.
* @param {('none'|'sort')} sort - specifies whether or not to order the eigenvalues on the diagonal of the Schur form. `'none'`: Eigenvalues are not ordered; `'sort'`: Eigenvalues are ordered (see SELECT).
* @param {Function} select - sELECT must be declared EXTERNAL in the calling subroutine.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {Float64Array} A - on entry, the N-by-N matrix A. On exit, A has been overwritten by its real Schur form T.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Int32Array} sdim - if `sort === 'none'`, SDIM = 0.
* @param {Float64Array} WR - wR and WI contain the real and imaginary parts, respectively, of the computed eigenvalues in the same order that they appear on the diagonal of the output Schur form T.
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - wR and WI contain the real and imaginary parts, respectively, of the computed eigenvalues in the same order that they appear on the diagonal of the output Schur form T.
* @param {integer} strideWI - stride length for `WI`
* @param {Float64Array} VS - if `jobvs === 'compute-vectors'`, VS contains the orthogonal matrix Z of Schur vectors.
* @param {PositiveInteger} LDVS - leading dimension of `VS`
* @param {(Float64Array|null)} WORK - workspace of at least `max(1,3*N)` elements, or `null` to allocate the reference's optimum (MAXWRK, with the JS callees' optima: dgehrd `N*32 + 4160`, dorghr `(N-1)*32` with Schur vectors, and dhseqr's LWKOPT)
* @param {(Uint8Array|null)} BWORK - caller-provided workspace of at least `N` elements
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "none", "sort"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} fourteenth argument is invalid (rejected when `LDVS < 1 || ( jobvs === "compute-vectors" && LDVS < N )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} info status code
*/
function dgees( order, jobvs, sort, select, N, A, LDA, sdim, WR, strideWR, WI, strideWI, VS, LDVS, WORK, BWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "sort". Value: `%s`.', sort ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDVS < 1 || ( jobvs === 'compute-vectors' && LDVS < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDVS < 1 || ( jobvs === "compute-vectors" && LDVS < N )`). Value: `%d`.', LDVS ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svs1 = ( order === 'column-major' ) ? 1 : LDVS;
	const svs2 = ( order === 'column-major' ) ? LDVS : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		// The reference's optimum (MAXWRK), with the JS callees' optima:
		WORK = new Float64Array( computeOptimalWorkSize( jobvs, N ) );
	}
	if ( BWORK === null || BWORK === void 0 ) {
		const minBwork = Math.max( 1, 3 * N);
		BWORK = new Uint8Array( minBwork );
	}
	return base( jobvs, sort, select, N, A, sa1, sa2, 0, sdim, WR, strideWR, owr, WI, strideWI, owi, VS, svs1, svs2, 0, WORK, 1, 0, BWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgees;
