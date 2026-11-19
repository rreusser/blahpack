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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import min from '@stdlib/math/base/special/fast/min/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes selected eigenvalues and, optionally, eigenvectors of a complex generalized Hermitian-definite banded eigenproblem A\*x = lambda\*B\*x.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobz - `'no-vectors'` or `'compute-vectors'`
* @param {string} range - `'all'`, `'value'`, or `'index'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {NonNegativeInteger} ka - number of super- (or sub-) diagonals of A
* @param {NonNegativeInteger} kb - number of super- (or sub-) diagonals of B
* @param {Complex128Array} AB - band matrix A in band storage (complex elements)
* @param {PositiveInteger} LDAB - leading dimension of `AB`
* @param {Complex128Array} BB - band matrix B in band storage (complex elements)
* @param {PositiveInteger} LDBB - leading dimension of `BB`
* @param {Complex128Array} Q - output transformation matrix (N-by-N) (complex elements)
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {number} vl - lower bound of eigenvalue interval
* @param {number} vu - upper bound of eigenvalue interval
* @param {integer} il - index of smallest eigenvalue (1-based)
* @param {integer} iu - index of largest eigenvalue (1-based)
* @param {number} abstol - absolute tolerance
* @param {Int32Array} m - output (length-1 array): the total number of eigenvalues found
* @param {Float64Array} w - output eigenvalues
* @param {integer} strideW - stride for `w`
* @param {Complex128Array} Z - output eigenvectors (complex elements)
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Complex128Array|null)} WORK - complex workspace
* @param {(Float64Array|null)} RWORK - real workspace
* @param {(Int32Array|null)} IWORK - integer workspace
* @param {Int32Array} IFAIL - output failure indices
* @param {integer} strideIFAIL - stride for `IFAIL`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "no-vectors", "compute-vectors"
* @throws {TypeError} third argument must be one of the following: "all", "index", "value"
* @throws {TypeError} fourth argument must be a valid matrix triangle
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `kb < 0 || kb > ka`)
* @throws {RangeError} ninth argument must be greater than or equal to `ka + 1` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `kb + 1` (column-major)
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @throws {RangeError} thirteenth argument is invalid (rejected when `LDQ < 1 || ( jobz === "compute-vectors" && LDQ < N )`)
* @throws {RangeError} fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`)
* @throws {RangeError} sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`)
* @throws {RangeError} seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`)
* @throws {RangeError} twenty-third argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`)
* @throws {RangeError} twenty-third argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`)
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function zhbgvx( order, jobz, range, uplo, N, ka, kb, AB, LDAB, BB, LDBB, Q, LDQ, vl, vu, il, iu, abstol, m, w, strideW, Z, LDZ, WORK, RWORK, IWORK, IFAIL, strideIFAIL ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobz !== 'no-vectors' && jobz !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobz ) );
	}
	if ( range !== 'all' && range !== 'index' && range !== 'value' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "index", "value". Value: `%s`.', range ) );
	}
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ka < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ka ) );
	}
	if ( kb < 0 || kb > ka ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `kb < 0 || kb > ka`). Value: `%d`.', kb ) );
	}
	if ( order === 'column-major' && ( LDAB < ka + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', ka + 1, LDAB ) );
	}
	if ( order === 'row-major' && ( LDAB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && ( LDBB < kb + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to %d. Value: `%d`.', kb + 1, LDBB ) );
	}
	if ( order === 'row-major' && ( LDBB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDBB ) );
	}
	if ( LDQ < 1 || ( jobz === 'compute-vectors' && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument is invalid (rejected when `LDQ < 1 || ( jobz === "compute-vectors" && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	if ( range === 'value' && ( N > 0 && vu <= vl ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (rejected when `range === "value" && ( N > 0 && vu <= vl )`). Value: `%s`.', vu ) );
	}
	if ( range !== 'value' && range === 'index' && ( il < 1 || il > max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument is invalid (rejected when `range !== "value" && range === "index" && ( il < 1 || il > max( 1, N ) )`). Value: `%d`.', il ) );
	}
	if ( range !== 'value' && range === 'index' && ( iu < min( N, il ) || iu > N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `range !== "value" && range === "index" && ( iu < min( N, il ) || iu > N )`). Value: `%d`.', iu ) );
	}
	if ( order === 'column-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument is invalid (column-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < 1 || ( jobz === 'compute-vectors' && LDZ < max( 1, range === 'index' ? iu - il + 1 : N ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-third argument is invalid (row-major: rejected when `LDZ < 1 || ( jobz === "compute-vectors" && LDZ < max( 1, range === "index" ? iu - il + 1 : N ) )`). Value: `%d`.', LDZ ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const sbb1 = ( order === 'column-major' ) ? 1 : LDBB;
	const sbb2 = ( order === 'column-major' ) ? LDBB : 1;
	const sq1 = ( order === 'column-major' ) ? 1 : LDQ;
	const sq2 = ( order === 'column-major' ) ? LDQ : 1;
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, 7 * N );
		RWORK = new Float64Array( minRwork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, 5 * N );
		IWORK = new Int32Array( minIwork );
	}
	const oifail = stride2offset( N, strideIFAIL );
	return base( jobz, range, uplo, N, ka, kb, AB, sab1, sab2, 0, BB, sbb1, sbb2, 0, Q, sq1, sq2, 0, vl, vu, il, iu, abstol, m, w, strideW, ow, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhbgvx;
