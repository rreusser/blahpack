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
import base from './base.js';


// MAIN //

/**
* Computes the eigenvectors of a real symmetric tridiagonal matrix T corresponding to specified eigenvalues, using inverse iteration.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the matrix.
* @param {Float64Array} d - the n diagonal elements of the tridiagonal matrix T.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - the (n-1) subdiagonal elements of the tridiagonal matrix T, stored in elements 1 to N-1.
* @param {integer} strideE - stride length for `e`
* @param {NonNegativeInteger} M - the number of eigenvectors to be found. 0 <= M <= N.
* @param {Float64Array} w - the first M elements of W contain the eigenvalues for which eigenvectors are to be computed.
* @param {integer} strideW - stride length for `w`
* @param {Int32Array} IBLOCK - the submatrix indices associated with the corresponding eigenvalues in W (0-based).
* @param {integer} strideIBLOCK - stride length for `IBLOCK`
* @param {Int32Array} ISPLIT - the splitting points, at which T breaks up into submatrices (0-based).
* @param {integer} strideISPLIT - stride length for `ISPLIT`
* @param {Complex128Array} Z - the computed eigenvectors.
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Float64Array|null)} WORK - caller-provided workspace of at least `5 * N` elements
* @param {(Int32Array|null)} IWORK - caller-provided workspace of at least `N` elements
* @param {Int32Array} IFAIL - on normal exit, all elements of IFAIL are zero (0-based).
* @param {integer} strideIFAIL - stride length for `IFAIL`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} seventh argument is invalid (rejected when `M < 0 || M > N`)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} fifteenth argument must be greater than or equal to `max( 1, M )` (row-major)
* @returns {integer} info status code
*/
function zstein( order, N, d, strideD, e, strideE, M, w, strideW, IBLOCK, strideIBLOCK, ISPLIT, strideISPLIT, Z, LDZ, WORK, IWORK, IFAIL, strideIFAIL ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 || M > N ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `M < 0 || M > N`). Value: `%d`.', M ) );
	}
	if ( order === 'column-major' && ( LDZ < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDZ ) );
	}
	if ( order === 'row-major' && ( LDZ < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDZ ) );
	}
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	const ow = stride2offset( N, strideW );
	const oiblock = stride2offset( N, strideIBLOCK );
	const oisplit = stride2offset( N, strideISPLIT );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 5 * N );
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
	}
	const oifail = stride2offset( M, strideIFAIL );
	return base( N, d, strideD, od, e, strideE, oe, M, w, strideW, ow, IBLOCK, strideIBLOCK, oiblock, ISPLIT, strideISPLIT, oisplit, Z, sz1, sz2, 0, WORK, 1, 0, IWORK, 1, 0, IFAIL, strideIFAIL, oifail ); // eslint-disable-line max-len
}


// EXPORTS //

export default zstein;
