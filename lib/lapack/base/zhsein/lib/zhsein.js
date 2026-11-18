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
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Uses inverse iteration to find right and/or left eigenvectors of a complex upper Hessenberg matrix.
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
* @param {Float64Array} w - input array
* @param {integer} strideW - stride length for `w`
* @param {Float64Array} VL - input matrix
* @param {PositiveInteger} LDVL - leading dimension of `VL`
* @param {Float64Array} VR - input matrix
* @param {PositiveInteger} LDVR - leading dimension of `VR`
* @param {integer} mm - mm
* @param {NonNegativeInteger} M - number of rows
* @param {Float64Array} WORK - input array
* @param {Float64Array} RWORK - input array
* @param {Int32Array} IFAILL - input array
* @param {integer} strideIFAILL - stride length for `IFAILL`
* @param {Int32Array} IFAILR - output array
* @param {integer} strideIFAILR - stride length for `IFAILR`
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} Second argument must be a valid operation side
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {integer} status code (0 = success)
*/
function zhsein( order, side, eigsrc, initv, SELECT, strideSELECT, N, H, LDH, w, strideW, VL, LDVL, VR, LDVR, mm, M, WORK, RWORK, IFAILL, strideIFAILL, IFAILR, strideIFAILR ) { // eslint-disable-line max-len, max-params
	let sh1, sh2, svl1, svl2, svr1, svr2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const offsetIFAILL = stride2offset( mm, strideIFAILL );
	const offsetIFAILR = stride2offset( mm, strideIFAILR );
	if ( side !== 'left' && side !== 'right' && side !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid operation side. Value: `%s`.', side ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Ninth argument must be >= max(1,N). Value: `%d`.', LDH ) );
	}
	if ( LDVL < 1 || ( ( side === 'left' || side === 'both' ) && LDVL < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Thirteenth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing these vectors. Value: `%d`.', LDVL ) );
	}
	if ( LDVR < 1 || ( ( side === 'right' || side === 'both' ) && LDVR < ( ( order === 'column-major' ) ? N : mm ) ) ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be >= 1, and >= N (column-major) or mm (row-major) when computing these vectors. Value: `%d`.', LDVR ) );
	}
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
		const minWork = Math.max( 1, N * N );
		WORK = new Complex128Array( minWork );
	}
	if ( RWORK === null || RWORK === void 0 ) {
		const minRwork = Math.max( 1, N );
		RWORK = new Float64Array( minRwork );
	}
	return base( side, eigsrc, initv, SELECT, strideSELECT, 0, N, H, sh1, sh2, 0, w, strideW, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, mm, M, WORK, 1, 0, RWORK, 1, 0, IFAILL, strideIFAILL, offsetIFAILL, IFAILR, strideIFAILR, offsetIFAILR ); // eslint-disable-line max-len
}


// EXPORTS //

export default zhsein;
