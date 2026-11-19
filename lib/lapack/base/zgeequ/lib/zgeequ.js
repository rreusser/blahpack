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
* Computes row and column scale factors to equilibrate a complex general matrix A.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of the matrix A
* @param {NonNegativeInteger} N - number of columns of the matrix A
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} r - output array (length `M`) receiving the row scale factors
* @param {integer} strideR - `r` stride length
* @param {Float64Array} c - output array (length `N`) receiving the column scale factors
* @param {integer} strideC - `c` stride length
* @param {Float64Array} rowcnd - output (length-1 array): if INFO = 0 or INFO > M, ROWCND contains the ratio of the smallest R(i) to the largest R(i)
* @param {Float64Array} colcnd - output (length-1 array): if INFO = 0, COLCND contains the ratio of the smallest C(i) to the largest C(i)
* @param {Float64Array} amax - output (length-1 array): absolute value of largest matrix element
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zgeequ( order, M, N, A, LDA, r, strideR, c, strideC, rowcnd, colcnd, amax ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;

	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'column-major' && ( LDA < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument violates the reference leading-dimension rule (column-major: rejected when `LDA.LT.MAX( 1, M )`). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && ( LDA < max( 1, N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument violates the reference leading-dimension rule (row-major: must also cover the N columns). Value: `%d`.', LDA ) );
	}
	const or = stride2offset( M, strideR );
	const oc = stride2offset( N, strideC );
	return base( M, N, A, sa1, sa2, 0, r, strideR, or, c, strideC, oc, rowcnd, colcnd, amax );
}


// EXPORTS //

export default zgeequ;
