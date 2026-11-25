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

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Solves the generalized Sylvester matrix equation for small subsystems.
*
* @param {string} trans - specifies the operation type
* @param {integer} ijob - specifies what kind of functionality to be performed. =0: solve (1) only. =1: A contribution from this subsystem to a Frobenius norm-based estimate of the separation between two matrix pairs is computed.
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} C - input matrix
* @param {integer} strideC1 - stride of the first dimension of `C`
* @param {integer} strideC2 - stride of the second dimension of `C`
* @param {NonNegativeInteger} offsetC - starting index for `C`
* @param {Complex128Array} D - input matrix
* @param {integer} strideD1 - stride of the first dimension of `D`
* @param {integer} strideD2 - stride of the second dimension of `D`
* @param {NonNegativeInteger} offsetD - starting index for `D`
* @param {Complex128Array} E - input matrix
* @param {integer} strideE1 - stride of the first dimension of `E`
* @param {integer} strideE2 - stride of the second dimension of `E`
* @param {NonNegativeInteger} offsetE - starting index for `E`
* @param {Complex128Array} F - output matrix
* @param {integer} strideF1 - stride of the first dimension of `F`
* @param {integer} strideF2 - stride of the second dimension of `F`
* @param {NonNegativeInteger} offsetF - starting index for `F`
* @param {Float64Array} scale - on exit, 0 <= SCALE <= 1.
* @param {Float64Array} rdsum - on entry, the sum of squares of computed contributions to the Dif-estimate under computation by ZTGSYL, where the scaling factor RDSCAL (see below) has been factored out. On exit, the corresponding sum of squares updated with the contributions from the current sub-system.
* @param {Float64Array} rdscal - on entry, scaling factor used to prevent overflow in RDSUM. On exit, RDSCAL is updated w.r.t. the current contributions in RDSUM.
* @throws {TypeError} first argument must be one of the following: "conjugate-transpose", "no-transpose"
* @throws {RangeError} second argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 2 )`)
* @throws {RangeError} third argument is invalid (rejected when `M <= 0`)
* @throws {RangeError} fourth argument is invalid (rejected when `N <= 0`)
* @returns {integer} status code (0 = success)
*/
function ztgsy2( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal ) { // eslint-disable-line max-len, max-params
	if ( trans !== 'conjugate-transpose' && trans !== 'no-transpose' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "conjugate-transpose", "no-transpose". Value: `%s`.', trans ) );
	}
	if ( trans === 'no-transpose' && ( ijob < 0 || ijob > 2 ) ) {
		throw new RangeError( format( 'invalid argument. Second argument is invalid (rejected when `trans === "no-transpose" && ( ijob < 0 || ijob > 2 )`). Value: `%d`.', ijob ) );
	}
	if ( M <= 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument is invalid (rejected when `M <= 0`). Value: `%d`.', M ) );
	}
	if ( N <= 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument is invalid (rejected when `N <= 0`). Value: `%d`.', N ) );
	}
	return base( trans, ijob, M, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, C, strideC1, strideC2, offsetC, D, strideD1, strideD2, offsetD, E, strideE1, strideE2, offsetE, F, strideF1, strideF2, offsetF, scale, rdsum, rdscal ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgsy2;
