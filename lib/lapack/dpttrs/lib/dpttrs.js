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
* Solves a tridiagonal system of the form A·X = B using the L·D·Lᵀ factorization of A computed by DPTTRF.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - the order of the tridiagonal matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Float64Array} d - the n diagonal elements of the diagonal matrix D from the L*D*L**T factorization of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} e - the (n-1) subdiagonal elements of the unit bidiagonal factor L from the L*D*L**T factorization of A.
* @param {integer} strideE - stride length for `e`
* @param {Float64Array} B - on entry, the right hand side vectors B for the system of linear equations. On exit, the solution vectors, X.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )` (column-major)
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, nrhs )` (row-major)
* @returns {integer} info status code
*/
function dpttrs( order, N, nrhs, d, strideD, e, strideE, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'column-major' && ( LDB < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'row-major' && ( LDB < max( 1, nrhs ) ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', nrhs, LDB ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	return base( N, nrhs, d, strideD, od, e, strideE, oe, B, sb1, sb2, 0 );
}


// EXPORTS //

export default dpttrs;
