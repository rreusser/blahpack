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
* Pre-processor for `zgesvj` applying Jacobi rotations to off-diagonal block pivots.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} jobv - one of `'compute-v'`, `'apply-v'`, or `'no-v'`
* @param {NonNegativeInteger} M - number of rows of `A`
* @param {NonNegativeInteger} N - number of columns of `A`
* @param {NonNegativeInteger} n1 - block partition (first `n1` columns rotated against the remaining `N-n1`)
* @param {Complex128Array} A - input matrix
* @param {PositiveInteger} LDA - leading dimension of `A`
* @param {Complex128Array} d - diagonal scale array
* @param {integer} strideD - stride length for `d`
* @param {Float64Array} sva - column-norm vector
* @param {integer} strideSVA - stride length for `sva`
* @param {NonNegativeInteger} mv - rows of `V` when `jobv === 'apply-v'`
* @param {Complex128Array} V - matrix used/updated when `jobv` is not `'no-v'`
* @param {PositiveInteger} LDV - leading dimension of `V`
* @param {number} eps - machine epsilon
* @param {number} sfmin - safe minimum
* @param {number} tol - convergence tolerance
* @param {NonNegativeInteger} nsweep - number of sweeps
* @param {Complex128Array} work - workspace
* @param {integer} strideWORK - stride length for `work`
* @param {NonNegativeInteger} lwork - workspace length
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid `jobv` value
* @throws {RangeError} dimensions and leading dimensions must be consistent
* @returns {integer} status code (`0` on convergence, `nsweep-1` if all sweeps used, otherwise a negative argument-error code)
*/
function zgsvj1( order, jobv, M, N, n1, A, LDA, d, strideD, sva, strideSVA, mv, V, LDV, eps, sfmin, tol, nsweep, work, strideWORK, lwork ) {
	var sa1;
	var sa2;
	var sv1;
	var sv2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( jobv !== 'compute-v' && jobv !== 'apply-v' && jobv !== 'no-v' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobv` value. Value: `%s`.', jobv ) );
	}
	if ( M < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', M ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fourth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( order === 'row-major' && LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( order === 'column-major' && LDA < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,M). Value: `%d`.', LDA ) );
	}
	if ( order === 'row-major' && LDV < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' && LDV < max( 1, M ) ) {
		throw new RangeError( format( 'invalid argument. Fourteenth argument must be greater than or equal to max(1,M). Value: `%d`.', LDV ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sv1 = 1;
		sv2 = LDV;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sv1 = LDV;
		sv2 = 1;
	}
	if ( work === null || work === void 0 ) {
		var minWork = M;
		work = new Float64Array( minWork );
		strideWORK = 1;
	}
	return base( jobv, M, N, n1, A, sa1, sa2, 0, d, strideD, 0, sva, strideSVA, 0, mv, V, sv1, sv2, 0, eps, sfmin, tol, nsweep, work, strideWORK, 0, lwork );
}


// EXPORTS //

export default zgsvj1;
