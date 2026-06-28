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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztbsv from '../../../../blas/base/ztbsv/lib/base.js';


// MAIN //

/**
* Solves a triangular banded system of the form `A*X = B` or `A**H*X = B` where A is a complex triangular band matrix of order N with kd super- or sub-diagonals, and B is an N-by-NRHS matrix.
*
* A check is made to verify that A is nonsingular.
*
* @private
* @param {string} uplo - specifies whether A is upper or lower triangular (`'upper'` or `'lower'`)
* @param {string} trans - specifies the form of the system (`'no-transpose'` or `'conjugate-transpose'`)
* @param {string} diag - specifies whether A is unit triangular (`'unit'` or `'non-unit'`)
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} kd - number of super- or sub-diagonals of A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} AB - band matrix A in band storage
* @param {integer} strideAB1 - stride of the first dimension of `AB`
* @param {integer} strideAB2 - stride of the second dimension of `AB`
* @param {NonNegativeInteger} offsetAB - starting index for `AB`
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution on exit
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @returns {integer} info - 0 if successful, i if `A[i-1,i-1]` is zero (singular)
*/
function ztbtrs( uplo, trans, diag, N, kd, nrhs, AB, strideAB1, strideAB2, offsetAB, B, strideB1, strideB2, offsetB ) {
	var nounit;
	var upper;
	var ABv;
	var idx;
	var j;

	// Quick return if possible:
	if ( N === 0 ) {
		return 0;
	}

	nounit = ( diag === 'non-unit' );
	upper = ( uplo === 'upper' );

	// Check for singularity:
	if ( nounit ) {
		ABv = reinterpret( AB, 0 );
		if ( upper ) {
			// For upper triangular band storage, diagonal is at row kd (0-based), i.e. AB(KD+1, j) in Fortran
			for ( j = 0; j < N; j++ ) {
				idx = 2 * ( offsetAB + ( kd * strideAB1 ) + ( j * strideAB2 ) );
				if ( ABv[ idx ] === 0.0 && ABv[ idx + 1 ] === 0.0 ) {
					return j + 1;
				}
			}
		} else {
			// For lower triangular band storage, diagonal is at row 0 (0-based), i.e. AB(1, j) in Fortran
			for ( j = 0; j < N; j++ ) {
				idx = 2 * ( offsetAB + ( j * strideAB2 ) );
				if ( ABv[ idx ] === 0.0 && ABv[ idx + 1 ] === 0.0 ) {
					return j + 1;
				}
			}
		}
	}

	// Solve A * X = B or A^H * X = B:
	for ( j = 0; j < nrhs; j++ ) {
		ztbsv( uplo, trans, diag, N, kd, AB, strideAB1, strideAB2, offsetAB, B, strideB1, offsetB + ( j * strideB2 ) );
	}

	return 0;
}


// EXPORTS //

export default ztbtrs;
