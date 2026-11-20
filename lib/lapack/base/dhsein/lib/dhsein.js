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

import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find right and/or left eigenvectors of a real upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {string} side - specifies the operation type
* @param {string} eigsrc - specifies the operation type
* @param {string} initv - specifies the operation type
* @param {Uint8Array} SELECT - input array
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {Float64Array} WR - input array
* @param {integer} strideWR - stride length for `WR`
* @param {Float64Array} WI - input array
* @param {integer} strideWI - stride length for `WI`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {NonNegativeInteger} mm - mm
* @param {Int32Array} M - input/output (length-1 array): number of rows
* @param {(Float64Array|null)} WORK - input array
* @param {Int32Array} IFAILL - input array
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {Int32Array} IFAILR - output array
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be one of the following: "both", "left", "right"
* @throws {RangeError} seventh argument must be a nonnegative integer
* @throws {RangeError} ninth argument must be greater than or equal to `max( 1, N )`
* @throws {RangeError} fifteenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`)
* @throws {RangeError} fifteenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`)
* @throws {RangeError} seventeenth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`)
* @throws {RangeError} seventeenth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`)
* @throws {RangeError} N must be a nonnegative integer
* @throws {RangeError} M must be a nonnegative integer
* @throws {RangeError} leading dimensions must satisfy constraints
* @returns {integer} status code (0 = success)
*/
function dhsein( order, side, eigsrc, initv, SELECT, strideSELECT, N, H, LDH, WR, strideWR, WI, strideWI, VL, LDVL, VR, LDVR, mm, M, WORK, IFAILL, strideIFAILL, IFAILR, strideIFAILR ) { // eslint-disable-line max-len, max-params
	let svl1, svl2, svr1, svr2, sh1, sh2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( side !== 'both' && side !== 'left' && side !== 'right' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be one of the following: "both", "left", "right". Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDH ) );
	}
	if ( order === 'column-major' && ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (column-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < N )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'row-major' && ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument is invalid (row-major: rejected when `LDVL < 1 || ( ( side === "left" || side === "both" ) && LDVL < max( 1, mm ) )`). Value: `%d`.', LDVL ) );
	}
	if ( order === 'column-major' && ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < N ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (column-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < N )`). Value: `%d`.', LDVR ) );
	}
	if ( order === 'row-major' && ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < max( 1, mm ) ) ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument is invalid (row-major: rejected when `LDVR < 1 || ( ( side === "right" || side === "both" ) && LDVR < max( 1, mm ) )`). Value: `%d`.', LDVR ) );
	}
	const offsetIFAILL = stride2offset( mm, strideIFAILL );
	const offsetIFAILR = stride2offset( mm, strideIFAILR );
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sh1 = LDH;
		sh2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = ( N + 2 ) * N;
		WORK = new Float64Array( minWork );
	}
	return base( side, eigsrc, initv, SELECT, strideSELECT, 0, N, H, sh1, sh2, 0, WR, strideWR, 0, WI, strideWI, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ); // eslint-disable-line max-len
}


// EXPORTS //

export default dhsein;
