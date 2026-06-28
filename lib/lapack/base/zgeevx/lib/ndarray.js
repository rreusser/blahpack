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
* Computes eigenvalues and, optionally, eigenvectors with optional balancing and reciprocal condition numbers for a complex nonsymmetric matrix, using alternative indexing semantics.
*
* @param {string} balanc - `'none'`, `'permute'`, `'scale'`, or `'both'`
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - `'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`
* @param {NonNegativeInteger} N - order of matrix A
* @param {Complex128Array} A - input matrix
* @param {integer} strideA1 - first dim stride of A
* @param {integer} strideA2 - second dim stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Complex128Array} w - eigenvalues
* @param {integer} strideW - stride for w
* @param {NonNegativeInteger} offsetW - starting index for w
* @param {Complex128Array} VL - left eigenvectors
* @param {integer} strideVL1 - first dim stride of VL
* @param {integer} strideVL2 - second dim stride of VL
* @param {NonNegativeInteger} offsetVL - starting index for VL
* @param {Complex128Array} VR - right eigenvectors
* @param {integer} strideVR1 - first dim stride of VR
* @param {integer} strideVR2 - second dim stride of VR
* @param {NonNegativeInteger} offsetVR - starting index for VR
* @param {integer} ilo - ignored on input; returned in result
* @param {integer} ihi - ignored on input; returned in result
* @param {Float64Array} SCALE - output scaling factors
* @param {integer} strideSCALE - stride for SCALE
* @param {NonNegativeInteger} offsetSCALE - starting index for SCALE
* @param {number} abnrm - ignored on input; returned in result
* @param {Float64Array} RCONDE - reciprocal condition numbers for eigenvalues
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - starting index for RCONDE
* @param {Float64Array} RCONDV - reciprocal condition numbers for eigenvectors
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - starting index for RCONDV
* @param {Complex128Array} WORK - complex workspace
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace length
* @param {Float64Array} RWORK - real workspace
* @param {integer} strideRWork - stride for RWORK
* @param {NonNegativeInteger} offsetRWork - starting index for RWORK
* @throws {TypeError} balanc must be a valid balanc value
* @throws {TypeError} jobvl must be a valid jobvl value
* @throws {TypeError} jobvr must be a valid jobvr value
* @throws {TypeError} sense must be a valid sense value
* @throws {RangeError} N must be a nonnegative integer
* @returns {Object} result object { info, ilo, ihi, abnrm }
*/
function zgeevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork ) {
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid balanc value. Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid jobvl value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobvr value. Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid sense value. Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, w, strideW, offsetW, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, ilo, ihi, SCALE, strideSCALE, offsetSCALE, abnrm, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV, WORK, strideWork, offsetWork, lwork, RWORK, strideRWork, offsetRWork );
}


// EXPORTS //

export default zgeevx;
