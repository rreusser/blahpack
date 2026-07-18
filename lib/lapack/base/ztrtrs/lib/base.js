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

import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsm from '../../../../blas/base/ztrsm/lib/base.js';


// VARIABLES //

const CONE = new Complex128( 1.0, 0.0 );


// MAIN //

/**
* Solves a complex triangular system of the form:.
* `A*X = B`,  `A^T*X = B`,  or  `A^H * X = B`
* where A is a triangular matrix of order N, and B is an N-by-NRHS matrix.
* A check is made to verify that A is nonsingular.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} trans - `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {NonNegativeInteger} nrhs - number of right-hand side columns
* @param {Complex128Array} A - triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - index offset for A (in complex elements)
* @param {Complex128Array} B - right-hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - index offset for B (in complex elements)
* @returns {integer} info - 0 if successful, k if A(k-1,k-1) is zero (1-based)
*/
function ztrtrs( uplo, trans, diag, N, nrhs, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB ) {
	let ia, i;

	const nounit = ( diag === 'non-unit' );

	if ( N === 0 ) {
		return 0;
	}

	// Reinterpret as Float64Array for element access
	const Av = reinterpret( A, 0 );
	const sa1 = strideA1 * 2;
	const sa2 = strideA2 * 2;

	// Check for singularity: scan diagonal for zero elements.
	if ( nounit ) {
		for ( i = 0; i < N; i++ ) {
			ia = ( offsetA * 2 ) + ( i * sa1 ) + ( i * sa2 );

			// A(i,i) == CZERO iff both real and imaginary parts are zero
			if ( Av[ ia ] === 0.0 && Av[ ia + 1 ] === 0.0 ) {
				return i + 1; // 1-based INFO
			}
		}
	}

	// Solve A * X = B, A^T * X = B, or A^H * X = B via ztrsm.
	// Ztrsm expects complex-element strides (it does *2 internally).
	ztrsm( 'left', uplo, trans, diag, N, nrhs, CONE,
		A, strideA1, strideA2, offsetA,
		B, strideB1, strideB2, offsetB
	);

	return 0;
}


// EXPORTS //

export default ztrtrs;
