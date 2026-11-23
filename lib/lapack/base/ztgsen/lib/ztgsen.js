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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {integer} ijob - ijob
* @param {boolean} wantq - wantq
* @param {boolean} wantz - wantz
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Complex128Array} ALPHA - input array
* @param {integer} strideALPHA - stride length for `ALPHA`
* @param {Complex128Array} BETA - input array
* @param {integer} strideBETA - stride length for `BETA`
* @param {Complex128Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Int32Array} M - input/output (length-1 array): number of rows
* @param {Float64Array} pl - input/output (length-1 array): pl
* @param {Float64Array} pr - input/output (length-1 array): pr
* @param {Float64Array} DIF - input array
* @param {integer} strideDIF - stride length for `DIF`
* @param {(Complex128Array|null)} WORK - input array
* @param {(Int32Array|null)} IWORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument is invalid (rejected when `ijob < 0 || ijob > 5`)
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} eleventh argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} seventeenth argument is invalid (rejected when `LDQ < 1 || ( wantq && LDQ < N )`)
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDZ < 1 || ( wantz && LDZ < N )`)
* @throws {RangeError} twentieth argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function ztgsen( order, ijob, wantq, wantz, SELECT, strideSELECT, N, A, LDA, B, LDB, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, M, pl, pr, DIF, strideDIF, WORK, IWORK ) { // eslint-disable-line max-len, max-params
	let sa1, sa2, sb1, sb2, sq1, sq2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( ijob < 0 || ijob > 5 ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `ijob < 0 || ijob > 5`). Value: `%d`.', ijob ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDB ) );
	}
	if ( LDQ < 1 || ( wantq && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `LDQ < 1 || ( wantq && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < 1 || ( wantz && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDZ < 1 || ( wantz && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	const offsetIWork = 0;
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	if ( WORK === null || WORK === void 0 || IWORK === null || IWORK === void 0 ) {
		// Fortran LWMIN/LIWMIN depend on IJOB and on M, the number of selected
		// eigenvalues; base.js documents WORK >= 4*M*(N-M)+1 and
		// IWORK >= max(1, 2*M*(N-M), N+6), which covers every IJOB > 0.
		let nsel = 0;
		for ( let i = 0; i < N; i++ ) {
			if ( SELECT[ i * strideSELECT ] ) {
				nsel += 1;
			}
		}
		const mn = nsel * ( N - nsel );
		if ( WORK === null || WORK === void 0 ) {
			WORK = new Complex128Array( ( ijob === 0 ) ? 1 : ( 4 * mn ) + 1 );
		}
		if ( IWORK === null || IWORK === void 0 ) {
			IWORK = new Int32Array( ( ijob === 0 ) ? 1 : max( max( 1, 2 * mn ), N + 6 ) );
		}
	}
	return base( ijob, wantq, wantz, SELECT, strideSELECT, 0, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHA, strideALPHA, 0, BETA, strideBETA, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, M, pl, pr, DIF, strideDIF, 0, WORK, 1, 0, IWORK, 1, offsetIWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsen;
