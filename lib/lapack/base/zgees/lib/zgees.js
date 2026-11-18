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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvs - jobvs
* @param {string} sort - sort
* @param {Function} select - select
* @param {NonNegativeInteger} N - N
* @param {Complex128Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} sdim - sdim
* @param {Complex128Array} W - W
* @param {integer} strideW - strideW
* @param {Complex128Array} VS - VS
* @param {PositiveInteger} LDVS - leading dimension of `VS`
* @param {Complex128Array} WORK - WORK
* @param {Float64Array} RWORK - RWORK
* @param {Uint8Array} BWORK - BWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function zgees( order, jobvs, sort, select, N, A, LDA, sdim, W, strideW, VS, LDVS, WORK, RWORK, BWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svs1 = ( order === 'column-major' ) ? 1 : LDVS;
	const svs2 = ( order === 'column-major' ) ? LDVS : 1;
	const ow = stride2offset( N, strideW );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, 2*N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	if ( BWORK === null || BWORK === void 0 ) {
		const minBwork = Math.max( 1, 2 * N);
		BWORK = new Uint8Array( minBwork );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDVS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVS ) );
	}
	if ( order === 'column-major' && LDVS < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be greater than or equal to max(1,N). Value: `%d`.', LDVS ) );
	}
	if ( jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvs` value. Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'sort' && sort !== 'none' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `sort` value. Value: `%s`.', sort ) );
	}
	return base( jobvs, sort, select, N, A, sa1, sa2, 0, sdim, W, strideW, ow, VS, svs1, svs2, 0, WORK, 1, 0, RWORK, 1, 0, BWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgees;
