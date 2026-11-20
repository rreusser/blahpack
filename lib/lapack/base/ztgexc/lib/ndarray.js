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
* Reorders the generalized Schur decomposition of a complex matrix pair.
*
* @param {boolean} wantq - wantq
* @param {boolean} wantz - wantz
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Complex128Array} B - input matrix
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Complex128Array} Q - input matrix
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Complex128Array} Z - output matrix
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {integer} ifst - ifst
* @param {Int32Array} ilst - input/output (length-1 array): ilst
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} twentieth argument is invalid (rejected when `( ifst + 1 ) < 1 || ( ifst + 1 ) > N`)
* @throws {RangeError} twenty-first argument is invalid (rejected when `( ilst[ 0 ] + 1 ) < 1 || ( ilst[ 0 ] + 1 ) > N`)
* @returns {integer} status code (0 = success)
*/
function ztgexc( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst ) { // eslint-disable-line max-len, max-params
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ( ifst + 1 ) < 1 || ( ifst + 1 ) > N ) {
		throw new RangeError( format( 'invalid argument. Twentieth argument is invalid (rejected when `( ifst + 1 ) < 1 || ( ifst + 1 ) > N`). Value: `%d`.', ifst ) );
	}
	if ( ( ilst[ 0 ] + 1 ) < 1 || ( ilst[ 0 ] + 1 ) > N ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument is invalid (rejected when `( ilst[ 0 ] + 1 ) < 1 || ( ilst[ 0 ] + 1 ) > N`). Value: `%d`.', ilst[ 0 ] ) );
	}
	return base( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, ifst, ilst ); // eslint-disable-line max-len
}


// EXPORTS //

export default ztgexc;
