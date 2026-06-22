/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
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

import isTransposeOperation from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isMatrixTranspose from '@stdlib/blas/base/assert/is-transpose-operation/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses the LU factorization to compute the solution to a complex system of.
* linear equations A_X = B, A^T_X = B, or A^H_X = B, where A is a
* tridiagonal matrix of order N and X and B are N-by-NRHS matrices.
*
* Error bounds on the solution and a condition estimate are also provided.
*
* @param {string} fact - 'not-factored' or 'factored'
* @param {string} trans - 'no-transpose', 'transpose', or 'conjugate-transpose'
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {Complex128Array} DLF - factored sub-diagonal (length N-1)
* @param {integer} strideDLF - stride for DLF (in complex elements)
* @param {Complex128Array} DF - factored diagonal (length N)
* @param {integer} strideDF - stride for DF (in complex elements)
* @param {Complex128Array} DUF - factored super-diagonal (length N-1)
* @param {integer} strideDUF - stride for DUF (in complex elements)
* @param {Complex128Array} DU2 - second superdiagonal fill-in (length N-2)
* @param {integer} strideDU2 - stride for DU2 (in complex elements)
* @param {Int32Array} IPIV - pivot indices (length N)
* @param {integer} strideIPIV - stride for IPIV
* @param {Complex128Array} B - right hand side matrix
* @param {PositiveInteger} LDB - leading dimension of B (in complex elements)
* @param {Complex128Array} X - solution matrix (output)
* @param {PositiveInteger} LDX - leading dimension of X (in complex elements)
* @param {Float64Array} rcond - single-element array for reciprocal condition number
* @param {Float64Array} FERR - forward error bounds (output)
* @param {integer} strideFERR - stride for FERR
* @param {Float64Array} BERR - backward error bounds (output)
* @param {integer} strideBERR - stride for BERR
* @param {Complex128Array} WORK - workspace array
* @param {integer} strideWORK - stride for WORK (in complex elements)
* @param {Float64Array} RWORK - real workspace array
* @param {integer} strideRWORK - stride for RWORK
* @throws {TypeError} Second argument must be a valid transpose operation
* @returns {integer} info
*/
function zgtsvx( fact, trans, N, nrhs, DL, strideDL, d, strideD, DU, strideDU, DLF, strideDLF, DF, strideDF, DUF, strideDUF, DU2, strideDU2, IPIV, strideIPIV, B, LDB, X, LDX, rcond, FERR, strideFERR, BERR, strideBERR, WORK, strideWORK, RWORK, strideRWORK ) { // eslint-disable-line max-len, max-params
	var orwork;
	var oberr;
	var oferr;
	var oipiv;
	var owork;
	var odlf;
	var odu2;
	var oduf;
	var odf;
	var odl;
	var odu;
	var od;

	if ( !isTransposeOperation( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	odl = stride2offset( N, strideDL );
	od = stride2offset( N, strideD );
	odu = stride2offset( N, strideDU );
	odlf = stride2offset( N, strideDLF );
	odf = stride2offset( N, strideDF );
	oduf = stride2offset( N, strideDUF );
	odu2 = stride2offset( N, strideDU2 );
	oipiv = stride2offset( N, strideIPIV );
	oferr = stride2offset( nrhs, strideFERR );
	oberr = stride2offset( nrhs, strideBERR );
	owork = stride2offset( Math.max( 1, 2 * N ), strideWORK );
	orwork = stride2offset( Math.max( 1, N ), strideRWORK );
	if ( !isMatrixTranspose( trans ) ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid transpose operation. Value: `%s`.', trans ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( nrhs < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', nrhs ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDX < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twenty-fourth argument must be greater than or equal to max(1,N). Value: `%d`.', LDX ) );
	}
	if ( fact !== 'not-factored' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `fact` value. Value: `%s`.', fact ) );
	}
	return base( fact, trans, N, nrhs, DL, strideDL, odl, d, strideD, od, DU, strideDU, odu, DLF, strideDLF, odlf, DF, strideDF, odf, DUF, strideDUF, oduf, DU2, strideDU2, odu2, IPIV, strideIPIV, oipiv, B, 1, LDB, 0, X, 1, LDX, 0, rcond, FERR, strideFERR, oferr, BERR, strideBERR, oberr, WORK, strideWORK, owork, RWORK, strideRWORK, orwork ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgtsvx;
