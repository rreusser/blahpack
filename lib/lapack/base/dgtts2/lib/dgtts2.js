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
* Solves a system of linear equations with a tridiagonal matrix using the LU factorization computed by sgttrf.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} itrans - specifies the form of the system of equations. = 0: A * X = B (No transpose) = 1: A**T* X = B (Transpose) = 2: A**T* X = B (Conjugate transpose = Transpose)
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrix B.
* @param {Float64Array} DL - the (n-1) multipliers that define the matrix L from the LU factorization of A.
* @param {integer} strideDL - stride length for `DL`
* @param {Float64Array} d - the n diagonal elements of the upper triangular matrix U from the LU factorization of A.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} DU - the (n-1) elements of the first super-diagonal of U.
* @param {integer} strideDU - stride length for `DU`
* @param {Float64Array} DU2 - the (n-2) elements of the second super-diagonal of U.
* @param {integer} strideDU2 - stride length for `DU2`
* @param {Int32Array} IPIV - the pivot indices; for 1 <= i <= n, row i of the matrix was interchanged with row IPIV(i) (0-based).
* @param {integer} strideIPIV - stride length for `IPIV`
* @param {Float64Array} B - on entry, the matrix of right hand side vectors B. On exit, B is overwritten by the solution vectors X.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @returns {Float64Array} `B`
*/
function dgtts2( order, itrans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DU2, strideDU2, IPIV, strideIPIV, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	const odu2 = stride2offset( N - 2, strideDU2 );
	const oipiv = stride2offset( N, strideIPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( itrans, N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, B, sb1, sb2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgtts2;
