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
* @param {Layout} order - storage layout ('row-major' or 'column-major')
* @param {('eigenvalues'|'eigenvectors'|'both')} job - specifies the operation type
* @param {('all'|'selected')} howmny - specifies the operation type
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
* @param {NonNegativeInteger} mm - the number of elements in the arrays S and DIF.
* @param {Int32Array} M - number of rows
* @param {(Float64Array|null)} WORK - input array
* @param {(Int32Array|null)} IWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "eigenvalues", "eigenvectors"
* @throws {TypeError} third argument must be one of the following: "all", "selected"
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} tenth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} twelfth argument is invalid (column-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVL < N`)
* @throws {RangeError} twelfth argument is invalid (row-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVL < max( 1, mm )`)
* @throws {RangeError} fourteenth argument is invalid (column-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVR < N`)
* @throws {RangeError} fourteenth argument is invalid (row-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVR < max( 1, mm )`)
* @throws {RangeError} leading dimensions must satisfy LDA, LDB, LDVL, LDVR >= max(1, N)
* @returns {integer} status code (0 = success)
*/
function dtgsna( order, job, howmny, SELECT, strideSELECT, N, A, LDA, B, LDB, VL, LDVL, VR, LDVR, s, strideS, DIF, strideDIF, mm, M, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, sa1, sa2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'both' && job !== 'eigenvalues' && job !== 'eigenvectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "eigenvalues", "eigenvectors". Value: `%s`.', job ) );
	}
	if ( howmny !== 'all' && howmny !== 'selected' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "all", "selected". Value: `%s`.', howmny ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( order === 'column-major' && ( ( job === 'eigenvalues' || job === 'both' ) && LDVL < N ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (column-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVL < N`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( ( job === 'eigenvalues' || job === 'both' ) && LDVL < max( 1, mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid (row-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVL < max( 1, mm )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( ( job === 'eigenvalues' || job === 'both' ) && LDVR < N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (column-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVR < N`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( ( job === 'eigenvalues' || job === 'both' ) && LDVR < max( 1, mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument is invalid (row-major: rejected when `( job === "eigenvalues" || job === "both" ) && LDVR < max( 1, mm )`). Value: `%d`.', LDVR ) );
	}
	const offsetIWork = 0;
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
		// Reference LWMIN, as ndarray.js checks it: 2*N*(N+2)+16 when DIF is
		// computed (eigenvectors/both), else N.
		let minWork = 1;
		if ( N > 0 ) {
			minWork = ( job === 'eigenvectors' || job === 'both' ) ? ( 2 * N * ( N + 2 ) ) + 16 : N;
		}
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
