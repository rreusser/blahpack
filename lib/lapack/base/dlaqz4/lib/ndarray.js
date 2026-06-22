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
* Executes a single multishift QZ sweep on the matrix pencil `(A, B)`.
*
* @param {boolean} ilschur - if true, update the full Schur form
* @param {boolean} ilq - if true, update the matrix `Q`
* @param {boolean} ilz - if true, update the matrix `Z`
* @param {NonNegativeInteger} N - order of the matrices
* @param {NonNegativeInteger} ilo - (0-based) first index of the active Hessenberg region
* @param {NonNegativeInteger} ihi - (0-based) last index of the active Hessenberg region
* @param {NonNegativeInteger} nshifts - desired number of shifts
* @param {PositiveInteger} nblockDesired - desired size of the computational windows
* @param {Float64Array} SR - real parts of the shifts
* @param {integer} strideSR - stride for `SR`
* @param {NonNegativeInteger} offsetSR - starting index for `SR`
* @param {Float64Array} SI - imaginary parts of the shifts
* @param {integer} strideSI - stride for `SI`
* @param {NonNegativeInteger} offsetSI - starting index for `SI`
* @param {Float64Array} SS - scales of the shifts
* @param {integer} strideSS - stride for `SS`
* @param {NonNegativeInteger} offsetSS - starting index for `SS`
* @param {Float64Array} A - matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} QC - workspace matrix
* @param {integer} strideQC1 - stride of the first dimension of `QC`
* @param {integer} strideQC2 - stride of the second dimension of `QC`
* @param {NonNegativeInteger} offsetQC - starting index for `QC`
* @param {Float64Array} ZC - workspace matrix
* @param {integer} strideZC1 - stride of the first dimension of `ZC`
* @param {integer} strideZC2 - stride of the second dimension of `ZC`
* @param {NonNegativeInteger} offsetZC - starting index for `ZC`
* @param {Float64Array} WORK - workspace of size at least `N * nblockDesired`
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `ilo` must be a nonnegative integer
* @throws {RangeError} `ihi` must be a nonnegative integer
* @throws {RangeError} `nshifts` must be a nonnegative integer
* @throws {RangeError} `nblockDesired` must be a positive integer
* @returns {integer} status code (`0` on success, negative on illegal argument)
*/
function dlaqz4( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblockDesired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork ) {
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( ilo < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', ilo ) );
	}
	if ( ihi < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', ihi ) );
	}
	if ( nshifts < 0 ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be a nonnegative integer. Value: `%d`.', nshifts ) );
	}
	if ( nblockDesired < 1 ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be a positive integer. Value: `%d`.', nblockDesired ) );
	}
	return base( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblockDesired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork );
}


// EXPORTS //

export default dlaqz4;
