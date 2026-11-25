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
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Performs a matrix-matrix product of the form C = αAB+βC.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} trans - specifies the operation applied to A. `'no-transpose'`: No transpose, B := alpha * A * X + beta * B `'transpose'`: Transpose, B := alpha * A'* X + beta * B `'conjugate-transpose'`: Conjugate transpose = Transpose.
* @param {NonNegativeInteger} N - the order of the matrix A.
* @param {NonNegativeInteger} nrhs - the number of right hand sides, i.e., the number of columns of the matrices X and B.
* @param {number} alpha - the scalar alpha.
* @param {Float64Array} DL - the (n-1) sub-diagonal elements of T.
* @param {integer} strideDL - stride length for `DL`
* @param {Float64Array} d - the diagonal elements of T.
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} DU - the (n-1) super-diagonal elements of T.
* @param {integer} strideDU - stride length for `DU`
* @param {Float64Array} X - the N by NRHS matrix X.
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {number} beta - the scalar beta.
* @param {Float64Array} B - on entry, the N by NRHS matrix B. On exit, B is overwritten by the matrix expression B := alpha * A * X + beta * B.
* @param {PositiveInteger} LDB - leading dimension of `B`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @returns {Float64Array} `B`
*/
function dlagtm( order, trans, N, nrhs, alpha, DL, strideDL, d, strideD, DU, strideDU, X, LDX, beta, B, LDB ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sx1 = ( order === 'column-major' ) ? 1 : LDX;
	const sx2 = ( order === 'column-major' ) ? LDX : 1;
	const sb1 = ( order === 'column-major' ) ? 1 : LDB;
	const sb2 = ( order === 'column-major' ) ? LDB : 1;
	const odl = stride2offset( N - 1, strideDL );
	const od = stride2offset( N, strideD );
	const odu = stride2offset( N - 1, strideDU );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( order === 'row-major' && LDX < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDX ) );
	}
	if ( order === 'column-major' && LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( order === 'row-major' && LDB < max( 1, nrhs ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,nrhs). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	return base( trans, N, nrhs, alpha, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, X, sx1, sx2, 0, beta, B, sb1, sb2, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlagtm;
