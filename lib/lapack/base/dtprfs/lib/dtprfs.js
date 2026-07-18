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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import isDiagonalType from '@stdlib/blas/base/assert/is-diagonal-type/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Provides error bounds and backward error estimates for the solution to a system of linear equations with a packed triangular coefficient matrix.
*
* @param {string} uplo - specifies whether the matrix is upper or lower triangular
* @param {string} trans - specifies the form of the system of equations
* @param {string} diag - specifies whether the matrix is unit triangular
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Float64Array} AP - packed triangular matrix A
* @param {Float64Array} B - right-hand side matrix B
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} X - solution matrix X
* @param {PositiveInteger} LDX - leading dimension of `X`
* @param {Float64Array} FERR - forward error bounds
* @param {integer} strideFERR - stride for `FERR`
* @param {Float64Array} BERR - backward errors
* @param {integer} strideBERR - stride for `BERR`
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for `WORK`
* @param {Int32Array} IWORK - integer workspace array
* @param {integer} strideIWork - stride for `IWORK`
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dtprfs( uplo, trans, diag, N, nrhs, AP, B, LDB, X, LDX, FERR, strideFERR, BERR, strideBERR, WORK, strideWork, IWORK, strideIWork ) { // eslint-disable-line max-len, max-params

	const oferr = stride2offset( nrhs, strideFERR );
	const oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N );
		IWORK = new Int32Array( minIwork );
		strideIWork = 1;
	}
	const owork = stride2offset( 3 * N, strideWork );
	const oiwork = stride2offset( N, strideIWork );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( !isDiagonalType( diag ) ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid diagonal type. Value: `%s`.', diag ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	// Assert caller-provided workspaces are large enough so under-sized buffers
	// are loud RangeErrors rather than silent NaNs. WORK needs 3*N and IWORK N.
	if ( N > 0 ) {
		if ( WORK.length < ( 3 * N ) ) {
			throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements. Provided length: %d.', 3 * N, WORK.length ) );
		}
		if ( IWORK.length < N ) {
			throw new RangeError( format( 'invalid argument. IWORK array must have at least %d elements. Provided length: %d.', N, IWORK.length ) );
		}
	}
	return base( uplo, trans, diag, N, nrhs, AP, 1, 0, B, 1, LDB, 0, X, 1, LDX, 0, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWork, owork, IWORK, strideIWork, oiwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtprfs;
