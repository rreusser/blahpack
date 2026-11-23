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
import base from './base.js';


// MAIN //

/**
* Computes all eigenvalues and, optionally, eigenvectors of a complex Hermitian.
* positive definite tridiagonal matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} compz - specifies whether eigenvectors are computed
* @param {NonNegativeInteger} N - order of the matrix
* @param {Float64Array} d - diagonal elements (length N)
* @param {integer} strideD - `d` stride length
* @param {Float64Array} e - subdiagonal elements (length N-1)
* @param {integer} strideE - `e` stride length
* @param {Complex128Array} Z - unitary matrix (N-by-N)
* @param {PositiveInteger} LDZ - leading dimension of `Z` (complex elements)
* @param {(Float64Array|null)} WORK - workspace (length >= 4*N)
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "initialize", "none", "update"
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} ninth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "none" ? 0 : ( compz === "update" ? 1 : ( compz === "initialize" ? 2 : - 1 ) ) ) > 0 && LDZ < max( 1, N ) )`)
* @returns {integer} status code (0 = success)
*/
function zpteqr( order, compz, N, d, strideD, e, strideE, Z, LDZ, WORK ) {
	let sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( compz !== 'initialize' && compz !== 'none' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "initialize", "none", "update". Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDZ < 1 || ( ( compz === 'none' ? 0 : ( compz === 'update' ? 1 : ( compz === 'initialize' ? 2 : - 1 ) ) ) > 0 && LDZ < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "none" ? 0 : ( compz === "update" ? 1 : ( compz === "initialize" ? 2 : - 1 ) ) ) > 0 && LDZ < max( 1, N ) )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' ) {
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sz1 = LDZ;
		sz2 = 1;
	}
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 4 * N );
		WORK = new Float64Array( minWork );
	}
	return base( compz, N, d, strideD, od, e, strideE, oe, Z, sz1, sz2, 0, WORK, 1, 0 );
}


// EXPORTS //

export default zpteqr;
