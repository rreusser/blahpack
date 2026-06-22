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
* Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.
*
* @param {string} balanc - balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`)
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`)
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {integer} strideA1 - first dimension stride of A
* @param {integer} strideA2 - second dimension stride of A
* @param {NonNegativeInteger} offsetA - starting index for A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {integer} strideB1 - first dimension stride of B
* @param {integer} strideB2 - second dimension stride of B
* @param {NonNegativeInteger} offsetB - starting index for B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - offset for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - offset for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - offset for BETA
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {integer} strideVL1 - first dimension stride of VL
* @param {integer} strideVL2 - second dimension stride of VL
* @param {NonNegativeInteger} offsetVL - offset for VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {integer} strideVR1 - first dimension stride of VR
* @param {integer} strideVR2 - second dimension stride of VR
* @param {NonNegativeInteger} offsetVR - offset for VR
* @param {Float64Array} LSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {NonNegativeInteger} offsetLSCALE - offset for LSCALE
* @param {Float64Array} RSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {NonNegativeInteger} offsetRSCALE - offset for RSCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers of eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {NonNegativeInteger} offsetRCONDE - offset for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers of right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @param {NonNegativeInteger} offsetRCONDV - offset for RCONDV
* @throws {TypeError} invalid balanc value
* @throws {TypeError} invalid jobvl value
* @throws {TypeError} invalid jobvr value
* @throws {TypeError} invalid sense value
* @throws {RangeError} N must be a nonnegative integer
* @returns {Object} object with `info`, `ilo`, `ihi`, `abnrm`, and `bbnrm`
*/
function dggevx( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV ) {
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
	return base( balanc, jobvl, jobvr, sense, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, LSCALE, strideLSCALE, offsetLSCALE, RSCALE, strideRSCALE, offsetRSCALE, RCONDE, strideRCONDE, offsetRCONDE, RCONDV, strideRCONDV, offsetRCONDV );
}


// EXPORTS //

export default dggevx;
