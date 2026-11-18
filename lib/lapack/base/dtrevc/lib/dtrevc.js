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
* Computes some or all of the right and/or left eigenvectors of a real upper quasi-triangular matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - specifies the operation type
* @param {string} howmny - specifies the operation type
* @param {(Uint8Array|Array)} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} T - input matrix
* @param {PositiveInteger} LDT - leading dimension of `T`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - output array
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid operation side
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} fourteenth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to max(1,N)
* @throws {RangeError} tenth argument must be greater than or equal to max(1,N)
* @throws {RangeError} twelfth argument must be greater than or equal to max(1,N)
* @returns {integer} status code (0 = success)
*/
function dtrevc( order, side, howmny, SELECT, strideSELECT, N, T, LDT, VL, LDVL, VR, LDVR, mm, M, WORK ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, st1, st2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDT < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be >= max(1,N). Value: `%d`.', LDT ) );
	}
	if ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing these vectors. Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing these vectors. Value: `%d`.', LDVR ) );
	}
	if ( order === 'column-major' ) {
		st1 = 1;
		st2 = LDT;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		st1 = LDT;
		st2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = Math.max( 1, 3 * N );
		WORK = new Float64Array( minWork );
	}
	return base( side, howmny, SELECT, strideSELECT, 0, N, T, st1, st2, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0 ); // eslint-disable-line max-len
}


// EXPORTS //

export default dtrevc;
