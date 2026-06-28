/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import isMatrixTriangle from '@stdlib/blas/base/assert/is-matrix-triangle/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves a complex Hermitian positive definite banded system A*X = B, with optional equilibration, condition estimation, and error bounds.
*
* @param {string} fact - 'not-factored', 'factored', or 'equilibrate'
* @param {string} uplo - 'upper' or 'lower'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super/subdiagonals
* @param {NonNegativeInteger} nrhs - number of right-hand sides
* @param {Complex128Array} AB - band matrix in band storage, dimension (LDAB, N)
* @param {PositiveInteger} LDAB - leading dimension of AB (complex elements)
* @param {Complex128Array} AFB - factored band matrix
* @param {PositiveInteger} LDAFB - leading dimension of AFB (complex elements)
* @param {Array} equed - single-element array for equilibration status
* @param {Float64Array} S - scaling factors, length N
* @param {integer} strideS - stride for S
* @param {Complex128Array} B - right-hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B (complex elements)
* @param {Complex128Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X (complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output)
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - backward error bounds (output)
* @param {integer} strideBERR - stride for BERR
* @param {Complex128Array} WORK - complex workspace array
* @param {integer} strideWork - stride for WORK (complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWork - stride for RWORK
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info
*/
function zpbsvx( fact, uplo, N, kd, nrhs, AB, LDAB, AFB, LDAFB, equed, S, strideS, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWork, RWORK, strideRWork ) {
	var orwork;
	var oberr;
	var oferr;
	var owork;
	var os;

	os = stride2offset( N, strideS );
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, 2 * N );
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	if ( RWORK === null || RWORK === void 0 ) {
		var minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
		strideRWork = 1;
	}
	owork = stride2offset( Math.max( 1, 2 * N ), strideWork );
	orwork = stride2offset( N, strideRWork );
	if ( !isMatrixTriangle( uplo ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid matrix triangle. Value: `%s`.', uplo ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	if ( LDAFB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,N). Value: `%d`.', LDAFB ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' && fact !== 'equilibrate' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	return base( fact, uplo, N, kd, nrhs, AB, 1, LDAB, 0, AFB, 1, LDAFB, 0, equed, S, strideS, os, B, 1, LDB, 0, X, 1, LDX, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWork, owork, RWORK, strideRWork, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zpbsvx;
