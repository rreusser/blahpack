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
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {boolean} rightv - = `true` : compute right eigenvector; = `false`: compute left eigenvector.
* @param {boolean} noinit - = `true` : no initial vector supplied in (VR,VI). = `false`: initial vector supplied in (VR,VI).
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} H - input matrix
* @param {PositiveInteger} LDH - leading dimension of `H`
* @param {number} wr - the real and imaginary parts of the eigenvalue of H whose corresponding right or left eigenvector is to be computed.
* @param {number} wi - the real and imaginary parts of the eigenvalue of H whose corresponding right or left eigenvector is to be computed.
* @param {Float64Array} VR - input array
* @param {integer} strideVR - stride length for `VR`
* @param {Float64Array} VI - input array
* @param {integer} strideVI - stride length for `VI`
* @param {Float64Array} B - input matrix
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {(Float64Array|null)} WORK - output array
* @param {number} eps3 - a small machine-dependent value which is used to perturb close eigenvalues, and to replace zero pivots.
* @param {number} smlnum - a machine-dependent value close to the underflow threshold.
* @param {number} bignum - a machine-dependent value close to the overflow threshold.
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} fourth argument must be a nonnegative integer
* @throws {RangeError} sixth argument must be greater than or equal to max(1,N)
* @throws {RangeError} fourteenth argument must be greater than or equal to max(1,N)
* @returns {integer} status code (0 = success)
*/
function dlaein( order, rightv, noinit, N, H, LDH, wr, wi, VR, strideVR, VI, strideVI, B, LDB, WORK, eps3, smlnum, bignum ) { // eslint-disable-line max-len, max-params
	let sh1, sh2, sb1, sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDH < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be greater than or equal to max(1,N). Value: `%d`.', LDH ) );
	}
	if ( order === 'row-major' && LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sh1 = 1;
		sh2 = LDH;
		sb1 = 1;
		sb2 = LDB;
	} else {
		sh1 = LDH;
		sh2 = 1;
		sb1 = LDB;
		sb2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		const minWork = N;
		WORK = new Float64Array( minWork );
	}
	return base( rightv, noinit, N, H, sh1, sh2, 0, wr, wi, VR, strideVR, 0, VI, strideVI, 0, B, sb1, sb2, 0, WORK, 1, 0, eps3, smlnum, bignum ); // eslint-disable-line max-len
}


// EXPORTS //

export default dlaein;
