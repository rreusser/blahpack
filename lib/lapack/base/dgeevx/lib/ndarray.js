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
* Computes eigenvalues and, optionally, the left and/or right eigenvectors of a real N-by-N nonsymmetric matrix A, plus optionally a balancing transformation, reciprocal condition numbers of eigenvalues, and reciprocal condition numbers of right eigenvectors.
*
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of the matrix A
* @param {Float64Array} A - input matrix
* @param {integer} strideA1 - first-dimension stride of A
* @param {integer} strideA2 - second-dimension stride of A
* @param {NonNegativeInteger} offsetA - offset for A
* @param {Float64Array} WR - output: real parts of eigenvalues
* @param {integer} strideWR - stride for WR
* @param {NonNegativeInteger} offsetWR - offset for WR
* @param {Float64Array} WI - output: imaginary parts of eigenvalues
* @param {integer} strideWI - stride for WI
* @param {NonNegativeInteger} offsetWI - offset for WI
* @param {Float64Array} VL - output: left eigenvectors
* @param {integer} strideVL1 - first-dimension stride of VL
* @param {integer} strideVL2 - second-dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors
* @param {integer} strideVR1 - first-dimension stride of VR
* @param {integer} strideVR2 - second-dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} SCALE - output: balancing/scaling details
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - offset for SCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers for right eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @param {Float64Array} work - workspace array (size >= max(1, N*(N+7)))
* @param {integer} strideWork - stride for work
* @param {NonNegativeInteger} offsetWork - offset for work
* @param {Int32Array} iwork - integer workspace array (size >= max(1, 2*(N-1))); only referenced when sense != 'none'
* @param {integer} strideIwork - stride for iwork
* @param {NonNegativeInteger} offsetIwork - offset for iwork
* @throws {TypeError} must supply valid `balanc`, `jobvl`, `jobvr`, `sense`
* @throws {RangeError} `N` must be nonnegative
* @throws {RangeError} `work` must have at least `max(1, N*(N+7))` elements from offset
* @throws {RangeError} `iwork` must have at least `max(1, 2*(N-1))` elements from offset
* @returns {Object} result object: `{ info, ilo, ihi, abnrm }`
*/
function dgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, SCALE, strideSCALE, offsetSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork ) {
	var minWork;
	var minIwork;

	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid `balanc` value. Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid `jobvl` value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid `jobvr` value. Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid `sense` value. Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	minWork = Math.max( 1, N * ( N + 7 ) );
	if ( ( work.length - offsetWork ) < minWork ) {
		throw new RangeError( format( 'invalid argument. `work` array must have at least %d elements from offset %d. Provided length: %d.', minWork, offsetWork, work.length ) );
	}
	minIwork = Math.max( 1, 2 * ( N - 1 ) );
	if ( ( iwork.length - offsetIwork ) < minIwork ) {
		throw new RangeError( format( 'invalid argument. `iwork` array must have at least %d elements from offset %d. Provided length: %d.', minIwork, offsetIwork, iwork.length ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, WR, strideWR, offsetWR, WI, strideWI, offsetWI, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, SCALE, strideSCALE, offsetSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, work, strideWork, offsetWork, iwork, strideIwork, offsetIwork );
}


// EXPORTS //

export default dgeevx;
