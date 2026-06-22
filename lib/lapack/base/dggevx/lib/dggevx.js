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
* Computes for a pair of N-by-N real nonsymmetric matrices (A,B) the generalized eigenvalues, and optionally, the left and/or right generalized eigenvectors.
*
* @param {string} order - storage layout (`'row-major'` or `'column-major'`)
* @param {string} balanc - balancing option (`'none'`, `'permute'`, `'scale'`, or `'both'`)
* @param {string} jobvl - `'compute-vectors'` or `'no-vectors'`
* @param {string} jobvr - `'compute-vectors'` or `'no-vectors'`
* @param {string} sense - reciprocal condition numbers to compute (`'none'`, `'eigenvalues'`, `'right-vectors'`, or `'both'`)
* @param {NonNegativeInteger} N - order of matrices A and B
* @param {Float64Array} A - input matrix A (N x N), overwritten on exit
* @param {PositiveInteger} LDA - leading dimension of A
* @param {Float64Array} B - input matrix B (N x N), overwritten on exit
* @param {PositiveInteger} LDB - leading dimension of B
* @param {Float64Array} ALPHAR - output: real parts of alpha (length N)
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {Float64Array} ALPHAI - output: imaginary parts of alpha (length N)
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {Float64Array} BETA - output: beta values (length N)
* @param {integer} strideBETA - stride for BETA
* @param {Float64Array} VL - output: left eigenvectors (N x N)
* @param {PositiveInteger} LDVL - leading dimension of VL
* @param {Float64Array} VR - output: right eigenvectors (N x N)
* @param {PositiveInteger} LDVR - leading dimension of VR
* @param {Float64Array} LSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideLSCALE - stride for LSCALE
* @param {Float64Array} RSCALE - output: permutation/scaling factors (length N)
* @param {integer} strideRSCALE - stride for RSCALE
* @param {Float64Array} RCONDE - output: reciprocal condition numbers of eigenvalues (length N)
* @param {integer} strideRCONDE - stride for RCONDE
* @param {Float64Array} RCONDV - output: reciprocal condition numbers of right eigenvectors (length N)
* @param {integer} strideRCONDV - stride for RCONDV
* @throws {TypeError} first argument must be a valid order
* @throws {TypeError} second argument must be a valid balanc value
* @throws {TypeError} third argument must be a valid jobvl value
* @throws {TypeError} fourth argument must be a valid jobvr value
* @throws {TypeError} fifth argument must be a valid sense value
* @throws {RangeError} sixth argument must be a nonnegative integer
* @throws {RangeError} eighth argument must be greater than or equal to max(1,N)
* @throws {RangeError} tenth argument must be greater than or equal to max(1,N)
* @returns {Object} object with `info`, `ilo`, `ihi`, `abnrm`, and `bbnrm`
*/
function dggevx( order, balanc, jobvl, jobvr, sense, N, A, LDA, B, LDB, ALPHAR, strideALPHAR, ALPHAI, strideALPHAI, BETA, strideBETA, VL, LDVL, VR, LDVR, LSCALE, strideLSCALE, RSCALE, strideRSCALE, RCONDE, strideRCONDE, RCONDV, strideRCONDV ) {
	var svl1;
	var svl2;
	var svr1;
	var svr2;
	var sa1;
	var sa2;
	var sb1;
	var sb2;

	if ( !isLayout( order ) ) {
		throw new TypeError( format( 'invalid argument. First argument must be a valid order. Value: `%s`.', order ) );
	}
	if ( balanc !== 'none' && balanc !== 'permute' && balanc !== 'scale' && balanc !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Second argument must be a valid balanc value. Value: `%s`.', balanc ) );
	}
	if ( jobvl !== 'no-vectors' && jobvl !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Third argument must be a valid jobvl value. Value: `%s`.', jobvl ) );
	}
	if ( jobvr !== 'no-vectors' && jobvr !== 'compute-vectors' ) {
		throw new TypeError( format( 'invalid argument. Fourth argument must be a valid jobvr value. Value: `%s`.', jobvr ) );
	}
	if ( sense !== 'none' && sense !== 'eigenvalues' && sense !== 'right-vectors' && sense !== 'both' ) {
		throw new TypeError( format( 'invalid argument. Fifth argument must be a valid sense value. Value: `%s`.', sense ) );
	}
	if ( N < 0 ) {
		throw new RangeError( format( 'invalid argument. Sixth argument must be a nonnegative integer. Value: `%d`.', N ) );
	}
	if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Eighth argument must be greater than or equal to max(1,N). Value: `%d`.', LDA ) );
	}
	if ( LDB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Tenth argument must be greater than or equal to max(1,N). Value: `%d`.', LDB ) );
	}
	if ( order === 'column-major' ) {
		sa1 = 1;
		sa2 = LDA;
		sb1 = 1;
		sb2 = LDB;
		svl1 = 1;
		svl2 = LDVL;
		svr1 = 1;
		svr2 = LDVR;
	} else {
		sa1 = LDA;
		sa2 = 1;
		sb1 = LDB;
		sb2 = 1;
		svl1 = LDVL;
		svl2 = 1;
		svr1 = LDVR;
		svr2 = 1;
	}
	return base( balanc, jobvl, jobvr, sense, N, A, sa1, sa2, 0, B, sb1, sb2, 0, ALPHAR, strideALPHAR, 0, ALPHAI, strideALPHAI, 0, BETA, strideBETA, 0, VL, svl1, svl2, 0, VR, svr1, svr2, 0, LSCALE, strideLSCALE, 0, RSCALE, strideRSCALE, 0, RCONDE, strideRCONDE, 0, RCONDV, strideRCONDV, 0 );
}


// EXPORTS //

export default dggevx;
