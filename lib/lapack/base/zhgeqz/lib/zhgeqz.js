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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import ndarray from './ndarray.js';


// MAIN //

/**
* Compute the eigenvalues of a complex matrix pair (H, T), where H is.
*
* @param {Layout} order - storage layout ('row-major' 0 'column-major')
* @param {('eigenvalues'|'schur')} job - `'eigenvalues'` 0 `'schur'`
* @param {('none'|'initialize'|'update')} compq - `'none'`, `'initialize'`, 0 `'update'`
* @param {('none'|'initialize'|'update')} compz - `'none'`, `'initialize'`, 0 `'update'`
* @param {NonNegativeInteger} N - order of matrices H, T, Q, Z
* @param {integer} ilo - start of active block (1-based)
* @param {integer} ihi - end of active block (1-based)
* @param {Complex128Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Complex128Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Complex128Array} ALPHA - input array
* @param {integer} strideALPHA - `ALPHA` stride length
* @param {Complex128Array} BETA - input array
* @param {integer} strideBETA - `BETA` stride length
* @param {Complex128Array} Q - input matrix
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Complex128Array} Z - input matrix
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {(Complex128Array|null)} WORK - input array
* @param {(Float64Array|null)} RWORK - input array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "eigenvalues", "schur"
* @throws {TypeError} third argument must be one of the following: "initialize", "none", "update"
* @throws {TypeError} fourth argument must be one of the following: "initialize", "none", "update"
* @throws {RangeError} fifth argument must be a nonnegative integer
* @throws {RangeError} sixth argument is invalid (rejected when `ilo < 1`)
* @throws {RangeError} seventh argument is invalid (rejected when `ihi > N || ihi < ilo - 1`)
* @throws {RangeError} ninth argument must be greater than or equal to `N`
* @throws {RangeError} eleventh argument must be greater than or equal to `N`
* @throws {RangeError} seventeenth argument is invalid (rejected when `LDQ < 1 || ( ( compq === "initialize" || compq === "update" ) && LDQ < N )`)
* @throws {RangeError} nineteenth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "initialize" || compz === "update" ) && LDZ < N )`)
* @returns {integer} INFO: 0=success, 1..N=QZ did not converge, N+1..2N=shift failed
*/
function zhgeqz( order, job, compq, compz, N, ilo, ihi, H, LDH, T, LDT, ALPHA, strideALPHA, BETA, strideBETA, Q, LDQ, Z, LDZ, WORK, RWORK ) {
	let sh1, sh2, st1, st2, sq1, sq2, sz1, sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( job !== 'eigenvalues' && job !== 'schur' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "eigenvalues", "schur". Value: `%s`.', job ) );
	}
	if ( compq !== 'initialize' && compq !== 'none' && compq !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be one of the following: "initialize", "none", "update". Value: `%s`.', compq ) );
	}
	if ( compz !== 'initialize' && compz !== 'none' && compz !== 'update' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be one of the following: "initialize", "none", "update". Value: `%s`.', compz ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 1 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument is invalid (rejected when `ilo < 1`). Value: `%d`.', ilo ) );
	}
	if ( ihi > N || ihi < ilo - 1 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument is invalid (rejected when `ihi > N || ihi < ilo - 1`). Value: `%d`.', ihi ) );
	}
	if ( LDH < N ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to %d. Value: `%d`.', N, LDH ) );
	}
	if ( LDT < N ) {
		throw new RangeError( format( 'invalid argument. Eleventh argument must be greater than or equal to %d. Value: `%d`.', N, LDT ) );
	}
	if ( LDQ < 1 || ( ( compq === 'initialize' || compq === 'update' ) && LDQ < N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (rejected when `LDQ < 1 || ( ( compq === "initialize" || compq === "update" ) && LDQ < N )`). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < 1 || ( ( compz === 'initialize' || compz === 'update' ) && LDZ < N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument is invalid (rejected when `LDZ < 1 || ( ( compz === "initialize" || compz === "update" ) && LDZ < N )`). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		st1 = 1;
		st2 = LDT;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
	} else {
		sh1 = LDH;
		sh2 = 1;
		st1 = LDT;
		st2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
	}
	const oa = stride2offset( N, strideALPHA );
	const ob = stride2offset( N, strideBETA );
	if ( WORK === null || WORK === void 0 ) {
		WORK = new Complex128Array( max( 1, N ) );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return ndarray( job, compq, compz, N, ilo, ihi, H, sh1, sh2, 0, T, st1, st2, 0, ALPHA, strideALPHA, oa, BETA, strideBETA, ob, Q, sq1, sq2, 0, Z, sz1, sz2, 0, WORK, 1, 0, RWORK, 1, 0 );
}


// EXPORTS //

export default zhgeqz;
