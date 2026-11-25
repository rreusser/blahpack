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
* Scales a general rectangular matrix, using row and column scaling factors computed by sgeequ.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - the number of rows of the matrix A.
* @param {NonNegativeInteger} N - the number of columns of the matrix A.
* @param {Complex128Array} A - on entry, the M by N matrix A. On exit, the equilibrated matrix.
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} r - the row scale factors for A.
* @param {integer} strideR - stride length for `r`
* @param {Float64Array} c - the column scale factors for A.
* @param {integer} strideC - stride length for `c`
* @param {number} rowcnd - ratio of the smallest R(i) to the largest R(i).
* @param {number} colcnd - ratio of the smallest C(i) to the largest C(i).
* @param {number} amax - absolute value of largest matrix entry.
* @param {Array} equed - specifies the form of equilibration that was done. `'none'`: No equilibration `'row'`: Row equilibration, i.e., A has been premultiplied by diag(R). `'column'`: Column equilibration, i.e., A has been postmultiplied by diag(C). `'both'`: Both row and column equilibration, i.e., A has been replaced by diag(R) * A * diag(C).
* @throws {TypeError} first argument must be a valid order
* @returns {Complex128Array} `A`
*/
function zlaqge( order, M, N, A, LDA, r, strideR, c, strideC, rowcnd, colcnd, amax, equed ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const or = stride2offset( M, strideR );
	const oc = stride2offset( N, strideC );
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
	return base( M, N, A, sa1, sa2, 0, r, strideR, or, c, strideC, oc, rowcnd, colcnd, amax, equed );
}


// EXPORTS //

export default zlaqge;
