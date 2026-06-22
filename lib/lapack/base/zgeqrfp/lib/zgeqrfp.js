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
import stride2offset from '@stdlib/strided/base/stride2offset/lib/index.js';
import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import base from './base.js';


// VARIABLES //

var DEFAULT_NB = 32;


// MAIN //

/**
* Computes a QR factorization of a complex M-by-N matrix A = Q * R with non-negative diagonal elements of R, using a blocked algorithm.
*
* When `WORK` is `null`, this LAPACKE-style wrapper allocates a workspace
* of size `N*NB + NB*NB` complex elements (with `NB = 32`) as a
* convenience. Prefer passing a caller-owned buffer for batched use.
*
* @param {string} order - storage layout ('row-major' or 'column-major')
* @param {NonNegativeInteger} M - number of rows
* @param {NonNegativeInteger} N - number of columns
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} TAU - output array of scalar factors
* @param {integer} strideTAU - `TAU` stride length
* @param {(Complex128Array|null)} WORK - caller-provided workspace, or `null` to auto-allocate
* @param {integer} strideWORK - `WORK` stride length
* @throws {TypeError} first argument must be a valid order
* @throws {RangeError} second argument must be a nonnegative integer
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} fifth argument must be greater than or equal to max(1,N) for row-major
* @throws {RangeError} fifth argument must be greater than or equal to max(1,M) for column-major
* @returns {integer} status code (0 = success)
*/
function zgeqrfp( order, M, N, A, LDA, TAU, strideTAU, WORK, strideWORK ) {
	var lwork;
	var sa1;
	var sa2;
	var ow;
	var ot;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Second argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
	} else {
		sa1 = LDA;
		sa2 = 1;
	}
	if ( WORK === null ) {
		lwork = max( 1, ( N * DEFAULT_NB ) + ( DEFAULT_NB * DEFAULT_NB ) );
		WORK = new Complex128Array( lwork );
		strideWORK = 1;
	}
	ot = stride2offset( N, strideTAU );
	ow = stride2offset( N, strideWORK );
	return base( M, N, A, sa1, sa2, 0, TAU, strideTAU, ot, WORK, strideWORK, ow );
}


// EXPORTS //

export default zgeqrfp;
