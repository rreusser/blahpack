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

import isLayout from '@stdlib/blas/base/assert/is-layout/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';


// MAIN //

/**
* Executes a single multishift QZ sweep on the matrix pencil `(A, B)`.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {boolean} ilschur - if true, update the full Schur form
* @param {boolean} ilq - if true, update the matrix `Q`
* @param {boolean} ilz - if true, update the matrix `Z`
* @param {NonNegativeInteger} N - order of the matrices
* @param {NonNegativeInteger} ilo - (0-based) first index of the active Hessenberg region
* @param {NonNegativeInteger} ihi - (0-based) last index of the active Hessenberg region
* @param {NonNegativeInteger} nshifts - desired number of shifts
* @param {PositiveInteger} nblockDesired - desired size of the computational windows
* @param {Float64Array} SR - real parts of the shifts
* @param {integer} strideSR - stride length for `SR`
* @param {Float64Array} SI - imaginary parts of the shifts
* @param {integer} strideSI - stride length for `SI`
* @param {Float64Array} SS - scales of the shifts
* @param {integer} strideSS - stride length for `SS`
* @param {Float64Array} A - matrix `A`
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Float64Array} B - matrix `B`
* @param {PositiveInteger} LDB - leading dimension of `B`
* @param {Float64Array} Q - matrix `Q`
* @param {PositiveInteger} LDQ - leading dimension of `Q`
* @param {Float64Array} Z - matrix `Z`
* @param {PositiveInteger} LDZ - leading dimension of `Z`
* @param {Float64Array} QC - workspace matrix
* @param {PositiveInteger} LDQC - leading dimension of `QC`
* @param {Float64Array} ZC - workspace matrix
* @param {PositiveInteger} LDZC - leading dimension of `ZC`
* @param {Float64Array} WORK - workspace of size at least `N * nblockDesired`
* @param {integer} strideWork - stride length for `WORK`
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} `N` must be a nonnegative integer
* @throws {RangeError} `LDA` must be a positive integer
* @throws {RangeError} `LDB` must be a positive integer
* @throws {RangeError} `LDQ` must be a positive integer
* @throws {RangeError} `LDZ` must be a positive integer
* @throws {RangeError} `LDQC` must be a positive integer
* @throws {RangeError} `LDZC` must be a positive integer
* @returns {integer} status code (`0` on success, negative on illegal argument)
*/
function dlaqz4( order, ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblockDesired, SR, strideSR, SI, strideSI, SS, strideSS, A, LDA, B, LDB, Q, LDQ, Z, LDZ, QC, LDQC, ZC, LDZC, WORK, strideWork ) {
	var sqc1;
	var sqc2;
	var szc1;
	var szc2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var sq1;
	var sq2;
	var sz1;
	var sz2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventeenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Nineteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( LDQ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 21st argument must be greater than or equal to max(1,N). Value: `%d`.', LDQ ) );
	}
	if ( LDZ < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. 23rd argument must be greater than or equal to max(1,N). Value: `%d`.', LDZ ) );
	}
	if ( LDQC < 1 ) {
		throw new RangeError( format( 'invalid argument. 25th argument must be a positive integer. Value: `%d`.', LDQC ) );
	}
	if ( LDZC < 1 ) {
		throw new RangeError( format( 'invalid argument. 27th argument must be a positive integer. Value: `%d`.', LDZC ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		sq1 = 1;
		sq2 = LDQ;
		sz1 = 1;
		sz2 = LDZ;
		sqc1 = 1;
		sqc2 = LDQC;
		szc1 = 1;
		szc2 = LDZC;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		sq1 = LDQ;
		sq2 = 1;
		sz1 = LDZ;
		sz2 = 1;
		sqc1 = LDQC;
		sqc2 = 1;
		szc1 = LDZC;
		szc2 = 1;
	}
	if ( WORK === null || WORK === void 0 ) {
		var minWork = Math.max( 1, N);
		WORK = new Float64Array( minWork );
		strideWork = 1;
	}
	return base( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblockDesired, SR, strideSR, 0, SI, strideSI, 0, SS, strideSS, 0, A, sa1, sa2, 0, B, sb1, sb2, 0, Q, sq1, sq2, 0, Z, sz1, sz2, 0, QC, sqc1, sqc2, 0, ZC, szc1, szc2, 0, WORK, strideWork, 0 );
}


// EXPORTS //

export default dlaqz4;
