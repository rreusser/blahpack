/**
* @license Apache-2.0
*
* Copyright (c) 2025 The Stdlib Authors.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

/* eslint-disable max-len, max-params */

// MODULES //

import format from '@stdlib/string/format/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Chases a 2-by-2 shift bulge in a matrix pencil `(A,B)` down a single position.
*
* @param {boolean} ilq - determines whether or not to update the matrix `Q`
* @param {boolean} ilz - determines whether or not to update the matrix `Z`
* @param {NonNegativeInteger} k - (0-based) position of the bulge
* @param {NonNegativeInteger} istartm - (0-based) starting column/row of the active window in `(A,B)`
* @param {NonNegativeInteger} istopm - (0-based) last column of the active window in `(A,B)`
* @param {NonNegativeInteger} ihi - (0-based) index of the last row of the active Hessenberg region
* @param {Float64Array} A - matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {NonNegativeInteger} nq - order of the matrix `Q`
* @param {NonNegativeInteger} qstart - (0-based) start column index of the matrix `Q`
* @param {Float64Array} Q - matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {NonNegativeInteger} nz - order of the matrix `Z`
* @param {NonNegativeInteger} zstart - (0-based) start column index of the matrix `Z`
* @param {Float64Array} Z - matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @throws {RangeError} `k` must be a nonnegative integer
* @throws {RangeError} `istartm` must be a nonnegative integer
* @throws {RangeError} `istopm` must be a nonnegative integer
* @throws {RangeError} `ihi` must be a nonnegative integer
* @throws {RangeError} `nq` must be a nonnegative integer
* @throws {RangeError} `nz` must be a nonnegative integer
* @throws {RangeError} `qstart` must be a nonnegative integer
* @throws {RangeError} `zstart` must be a nonnegative integer
* @throws {RangeError} `istartm` must be `<= k+1`
* @throws {RangeError} `istopm` must be `>= k+2`
* @returns {Float64Array} `A`
*/
function dlaqz2( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ ) {
	if ( k < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', k ) );
	}
	if ( istartm < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', istartm ) );
	}
	if ( istopm < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', istopm ) );
	}
	if ( ihi < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ihi ) );
	}
	if ( istartm > k + 1 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be less than or equal to `k+1`. Value: `%d`.', istartm ) );
	}
	if ( istopm < k + 2 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to `k+2`. Value: `%d`.', istopm ) );
	}
	if ( nq < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifteenth argument must be a nonnegative integer. Value: `%d`.', nq ) );
	}
	if ( qstart < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixteenth argument must be a nonnegative integer. Value: `%d`.', qstart ) );
	}
	if ( nz < 0 ) {
		throw new RangeError( format( 'invalid argument. Twenty-first argument must be a nonnegative integer. Value: `%d`.', nz ) );
	}
	if ( zstart < 0 ) {
		throw new RangeError( format( 'invalid argument. Twenty-second argument must be a nonnegative integer. Value: `%d`.', zstart ) );
	}
	base( ilq, ilz, k, istartm, istopm, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, nq, qstart, Q, strideQ1, strideQ2, offsetQ, nz, zstart, Z, strideZ1, strideZ2, offsetZ );
	return A;
}


// EXPORTS //

export default dlaqz2;
