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
* Balances a general complex matrix A.
*
* This involves, first, permuting A by a similarity transformation to
* isolate eigenvalues in the first 1 to ILO-1 and last IHI+1 to N
* elements on the diagonal; and second, applying a diagonal similarity
* transformation to rows and columns ILO to IHI to make the rows and
* columns as close in norm as possible.
*
* @param {string} job - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} A - input matrix (modified in-place)
* @param {integer} strideA1 - stride of the first dimension of A (in complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (in complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (in complex elements)
* @param {Int32Array} ilo - output (length-1 array): `ilo`
* @param {Int32Array} ihi - output (length-1 array): iLO and IHI are set to integers such that on exit A(i,j) = 0 if i > j and j = 1,...,ILO-1 or I = IHI+1,...,N
* @param {Float64Array} SCALE - output array of length N (permutation/scaling info)
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @throws {TypeError} first argument must be one of the following: "both", "none", "permute", "scale"
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {TypeError} if a string argument is not a valid option
* @returns {integer} status code (0 = success)
*/
function zgebal( job, N, A, strideA1, strideA2, offsetA, ilo, ihi, SCALE, strideSCALE, offsetSCALE ) { // eslint-disable-line max-len, max-params
	if ( job !== 'both' && job !== 'none' && job !== 'permute' && job !== 'scale' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "both", "none", "permute", "scale". Value: `%s`.', job ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, N, A, strideA1, strideA2, offsetA, ilo, ihi, SCALE, strideSCALE, offsetSCALE ); // eslint-disable-line max-len
}


// EXPORTS //

export default zgebal;
