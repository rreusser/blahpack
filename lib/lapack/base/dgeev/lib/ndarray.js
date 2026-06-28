/**
* @license Apache-2.0
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).
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
* Computes the eigenvalues and, optionally, the left and/or right eigenvectors.
* of a real N-by-N nonsymmetric matrix A.
*
* The right eigenvector v(j) of A satisfies A _ v(j) = lambda(j) _ v(j).
* The left eigenvector u(j) of A satisfies u(j)**H _ A = lambda(j) _ u(j)**H.
*
* The computed eigenvectors are normalized to have Euclidean norm equal to 1
* and largest component real.
*
* Minimum workspace size requirements (consistent with Fortran LAPACK):
* - eigenvalues only (jobvl='no-vectors', jobvr='no-vectors'): max(1, 3*N)
* - with eigenvectors (either jobvl or jobvr is 'compute-vectors'): max(1, 4*N)
*
* For good performance (blocked dgehrd), WORK should be larger; see base.js.
*
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Float64Array} A - input matrix (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} WR - output: real parts of eigenvalues (length N)
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - offset for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues (length N)
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - offset for WI
* @param {Float64Array} VL - output: left eigenvectors (N x N), not referenced if jobvl=`'no-vectors'`
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N), not referenced if jobvr=`'no-vectors'`
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} work - caller-provided workspace (minimum size: max(1,3*N) or max(1,4*N) with eigenvectors)
* @param {integer} strideWork - stride for work (must be 1)
* @param {NonNegativeInteger} offsetWork - starting index for work
* @throws {TypeError} first argument must be a valid jobvl value
* @throws {TypeError} second argument must be a valid jobvr value
* @throws {RangeError} third argument must be a nonnegative integer
* @throws {RangeError} WORK array must be large enough
* @returns {integer} info - 0 on success, >0 if QR failed (eigenvalues info+1:N have converged)
*/
function dgeev( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, work, strideWork, offsetWork ) {
	var minWork;
	var wantvl;
	var wantvr;

	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid jobvl value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobvr value. Value: `%s`.', jobvr ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Third argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	// Minimum workspace: max(1, 3*N) for eigenvalues only; max(1, 4*N) with eigenvectors
	wantvl = ( jobvl === 'compute-vectors' );
	wantvr = ( jobvr === 'compute-vectors' );
	minWork = ( wantvl || wantvr ) ? Math.max( 1, 4 * N ) : Math.max( 1, 3 * N );
	if ( !work || ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. WORK array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, ( work ) ? work.length : 0 ) );
	}
	return base( jobvl, jobvr, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, work, strideWork, offsetWork ); // eslint-disable-line max-len
}


// EXPORTS //

export default dgeev;
