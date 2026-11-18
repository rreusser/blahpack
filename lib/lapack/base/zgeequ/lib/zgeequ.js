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
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Object} result object with `info`, `rowcnd`, `colcnd`, and `amax`
*/
function zgeequ( order, M, N, A, LDA, r, strideR, c, strideC ) {
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
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	const or = stride2offset( M, strideR );
	const oc = stride2offset( N, strideC );
	return base( M, N, A, sa1, sa2, 0, r, strideR, or, c, strideC, oc );
}


// EXPORTS //

export default zgeequ;
