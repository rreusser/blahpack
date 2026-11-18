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
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Estimates reciprocal condition numbers for eigenvalues and eigenvectors of a generalized Schur form.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} job - specifies the operation type
* @param {string} howmny - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {Float64Array} s - input array
* @param {integer} strideS - stride length for `s`
* @param {Float64Array} DIF - input array
* @param {integer} strideDIF - stride length for `DIF`
* @param {integer} mm - mm
* @param {Int32Array} M - number of rows
* @param {Float64Array} WORK - input array
* @param {Int32Array} IWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} sixth argument (`N`) must be a nonnegative integer
* @throws {RangeError} leading dimensions must satisfy LDA, LDB, LDVL, LDVR >= max(1, N)
* @returns {integer} status code (0 = success)
*/
function dtgsna( order, job, howmny, SELECT, strideSELECT, N, A, LDA, B, LDB, VL, LDVL, VR, LDVR, s, strideS, DIF, strideDIF, mm, M, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'eigenvalues' && job !== 'eigenvectors' && job !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of "eigenvalues", "eigenvectors", or "both". Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of "all" or "selected". Value: `%s`.', howmny ) );
	}
	const offsetIWork = 0;
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument violates the reference leading-dimension rule (rejected when `LDA.LT.MAX( 1, N )`). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument violates the reference leading-dimension rule (rejected when `LDB.LT.MAX( 1, N )`). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' && ( ( ( job === 'eigenvalues' ) || ( job === 'both' ) ) && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (column-major: rejected when `WANTS .AND. LDVL.LT.N`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( ( ( job === 'eigenvalues' ) || ( job === 'both' ) ) && LDVL < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument violates the reference leading-dimension rule (row-major: must also cover the M columns). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( ( ( job === 'eigenvalues' ) || ( job === 'both' ) ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (column-major: rejected when `WANTS .AND. LDVR.LT.N`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( ( ( job === 'eigenvalues' ) || ( job === 'both' ) ) && LDVR < max( 1, M ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument violates the reference leading-dimension rule (row-major: must also cover the M columns). Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, N);
		WORK = new Float64Array( minWork );
	}
	if ( IWORK === null || IWORK === void 0 ) {
		const minIwork = Math.max( 1, N + 6 );
		IWORK = new Int32Array( minIwork );
	}
	return base( job, howmny, SELECT, strideSELECT, 0, N, A, sa1, sa2, 0, B, sb1, sb2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, s, strideS, 0, DIF, strideDIF, 0, mm, M, WORK, 1, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtgsna;
