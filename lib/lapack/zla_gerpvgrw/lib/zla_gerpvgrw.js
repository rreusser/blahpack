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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Computes the reciprocal pivot growth factor `norm(A)/norm(U)` for a complex general matrix.
*
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} N - number of rows
* @param {NonNegativeInteger} ncols - number of columns to process
* @param {Complex128Array} A - input matrix A (column-major, dimension N x ncols)
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} AF - factored matrix AF (column-major, dimension N x ncols)
* @param {PositiveInteger} LDAF - leading dimension of `AF`
* @throws {TypeError} first argument must be a valid order
* @returns {number} reciprocal pivot growth factor
*/
function zla_gerpvgrw( order, N, ncols, A, LDA, AF, LDAF ) {
	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const saf1 = ( order === 'column-major' ) ? 1 : LDAF;
	const saf2 = ( order === 'column-major' ) ? LDAF : 1;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	if ( order === 'column-major' && LDAF < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAF ) );
	}
	return base( N, ncols, A, sa1, sa2, 0, AF, saf1, saf2, 0 );
}


// EXPORTS //

export default zla_gerpvgrw;
