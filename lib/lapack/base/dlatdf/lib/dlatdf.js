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
* @param {integer} ijob - ijob
* @param {NonNegativeInteger} N - N
* @param {Float64Array} Z - Z
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} RHS - RHS
* @param {integer} strideRHS - strideRHS
* @param {Float64Array} rdsum - input/output (length-1 array): rdsum
* @param {Float64Array} rdscal - input/output (length-1 array): rdscal
* @param {Int32Array} IPIV - IPIV
* @param {integer} strideIPIV - strideIPIV
* @param {Int32Array} JPIV - JPIV
* @param {integer} strideJPIV - strideJPIV
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} if a numerical argument does not satisfy constraints
* @returns {Float64Array} `RHS`
*/
function dlatdf( order, ijob, N, Z, LDZ, RHS, strideRHS, rdsum, rdscal, IPIV, strideIPIV, JPIV, strideJPIV ) { // eslint-disable-line max-len, max-params

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	const sz1 = ( order === 'column-major' ) ? 1 : LDZ;
	const sz2 = ( order === 'column-major' ) ? LDZ : 1;
	const orhs = stride2offset( N, strideRHS );
	const oipiv = stride2offset( N, strideIPIV );
	const ojpiv = stride2offset( N, strideJPIV );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( order === 'column-major' && LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	return base( ijob, N, Z, sz1, sz2, 0, RHS, strideRHS, orhs, rdsum, rdscal, IPIV, strideIPIV, oipiv, JPIV, strideJPIV, ojpiv ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlatdf;
