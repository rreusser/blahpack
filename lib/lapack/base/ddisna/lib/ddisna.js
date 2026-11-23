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

import format from '@stdlib/string/format/lib/index.js';
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Compute the reciprocal condition numbers for the eigenvectors of a real symmetric or complex Hermitian matrix.
*
* @param {string} job - specifies the operation type
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Float64Array} d - input array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} SEP - output array
* @param {integer} strideSEP - stride length for `SEP`
* @throws {TypeError} first argument must be one of the following: "eigenvalues", "left-vectors", "right-vectors"
* @throws {RangeError} second argument must be a nonnegative integer
* @returns {integer} status code (0 = success)
*/
function ddisna( job, M, N, d, strideD, SEP, strideSEP ) { // eslint-disable-line max-len, max-params
	if ( job !== 'eigenvalues' && job !== 'left-vectors' && job !== 'right-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be one of the following: "eigenvalues", "left-vectors", "right-vectors". Value: `%s`.', job ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	const od = stride2offset( M, strideD );
	const oSEP = stride2offset( M, strideSEP );
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( job, M, N, d, strideD, od, SEP, strideSEP, oSEP ); // eslint-disable-line max-len
}


// EXPORTS //

export default ddisna;
