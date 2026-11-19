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
* @license Apache-2.0
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} jobvs - jobvs
* @param {string} sort - sort
* @param {Function} select - select
* @param {NonNegativeInteger} N - N
* @param {Float64Array} A - A
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} sdim - sdim
* @param {Float64Array} WR - WR
* @param {integer} strideWR - strideWR
* @param {Float64Array} WI - WI
* @param {integer} strideWI - strideWI
* @param {Float64Array} VS - VS
* @param {PositiveInteger} LDVS - leading dimension of `VS`
* @param {Float64Array} WORK - WORK
* @param {Uint8Array} BWORK - BWORK
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} if a string argument is not a valid option
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} info status code
*/
function dgees( order, jobvs, sort, select, N, A, LDA, sdim, WR, strideWR, WI, strideWI, VS, LDVS, WORK, BWORK ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobvs !== 'no-vectors' && jobvs !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "no-vectors", "compute-vectors". Value: `%s`.', jobvs ) );
	}
	if ( sort !== 'none' && sort !== 'sort' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "none", "sort". Value: `%s`.', sort ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDVS < 1 || ( jobvs === 'compute-vectors' && LDVS < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (rejected when `LDVS < 1 || ( jobvs === "compute-vectors" && LDVS < N )`). Value: `%d`.', LDVS ) );
	}
	const sa1 = ( order === 'column-major' ) ? 1 : LDA;
	const sa2 = ( order === 'column-major' ) ? LDA : 1;
	const svs1 = ( order === 'column-major' ) ? 1 : LDVS;
	const svs2 = ( order === 'column-major' ) ? LDVS : 1;
	const owr = stride2offset( N, strideWR );
	const owi = stride2offset( N, strideWI );
	if ( WORK === null || WORK === void 0 ) {
		const minWork = ( N === 0 ) ? 1 : Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	if ( BWORK === null || BWORK === void 0 ) {
		const minBwork = Math.max( 1, 3 * N);
		BWORK = new Uint8Array( minBwork );
	}
	return base( jobvs, sort, select, N, A, sa1, sa2, 0, sdim, WR, strideWR, owr, WI, strideWI, owi, VS, svs1, svs2, 0, WORK, 1, 0, BWORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgees;
