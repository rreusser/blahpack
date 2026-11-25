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
* Equilibrates a general M-by-N band matrix A with KL sub-diagonals and KU super-diagonals using the row and column scaling factors in the vectors R and C.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows of A
* @param {NonNegativeInteger} N - number of columns of A
* @param {NonNegativeInteger} kl - number of sub-diagonals within the band of A
* @param {NonNegativeInteger} ku - number of super-diagonals within the band of A
* @param {Float64Array} AB - input/output band matrix in band storage
* @param {PositiveInteger} LDAB - leading dimension of AB
* @param {Float64Array} r - row scale factors, length M
* @param {integer} strideR - stride for r
* @param {Float64Array} c - column scale factors, length N
* @param {integer} strideC - stride for c
* @param {number} rowcnd - ratio of smallest to largest R(i)
* @param {number} colcnd - ratio of smallest to largest C(i)
* @param {number} amax - absolute value of largest matrix entry
* @param {Array} equed - specifies the form of equilibration that was done. `'none'`: No equilibration `'row'`: Row equilibration, i.e., A has been premultiplied by diag(R). `'column'`: Column equilibration, i.e., A has been postmultiplied by diag(C). `'both'`: Both row and column equilibration, i.e., A has been replaced by diag(R) * A * diag(C).
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} seventh argument must be greater than or equal to `max( 1, N )` (row-major)
* @returns {Float64Array} `AB`
*/
function dlaqgb( order, M, N, kl, ku, AB, LDAB, r, strideR, c, strideC, rowcnd, colcnd, amax, equed ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sab1 = ( order === 'column-major' ) ? 1 : LDAB;
	const sab2 = ( order === 'column-major' ) ? LDAB : 1;
	const or = stride2offset( M, strideR );
	const oc = stride2offset( N, strideC );
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDAB ) );
	}
	return base( M, N, kl, ku, AB, sab1, sab2, 0, r, strideR, or, c, strideC, oc, rowcnd, colcnd, amax, equed ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaqgb;
