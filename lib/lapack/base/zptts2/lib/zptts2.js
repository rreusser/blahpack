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
* Solves a tridiagonal system of the form AX=B using the L D LH factorization computed by spttrf.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} iuplo - specifies the form of the factorization and whether the vector E is the superdiagonal of the upper bidiagonal factor U or the subdiagonal of the lower bidiagonal factor L. = 1: A = U**H *D*U, E is the superdiagonal of U = 0: A = L*D*L**H, E is the subdiagonal of L.
* @param {NonNegativeInteger} N - the order of the tridiagonal matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Float64Array} d - the n diagonal elements of the diagonal matrix D from the factorization A = U**H *D*U or A = L*D*L**H.
* @param {integer} strideD - stride length for `d`
* @param {Complex128Array} e - if IUPLO = 1, the (n-1) superdiagonal elements of the unit bidiagonal factor U from the factorization A = U**H*D*U.
* @param {integer} strideE - stride length for `e`
* @param {Complex128Array} B - on entry, the right hand side vectors B for the system of linear equations. On exit, the solution vectors, X.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @returns {Complex128Array} output array
*/
function zptts2( order, iuplo, N, nrhs, d, strideD, e, strideE, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const od = stride2offset( N, strideD );
	const oe = stride2offset( N - 1, strideE );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( iuplo, N, nrhs, d, strideD, od, e, strideE, oe, B, sb1, sb2, 0 );
}


// EXPORTS //

export default zptts2;
