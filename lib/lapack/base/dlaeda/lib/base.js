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

/* eslint-disable max-len, max-params, max-statements */

// MODULES //

import dcopy from './../../../../blas/base/dcopy/lib/base.js';
import dgemv from './../../../../blas/base/dgemv/lib/base.js';
import drot from './../../../../blas/base/drot/lib/base.js';


// MAIN //

/**
* Computes the Z vector determining the rank-one modification of the diagonal matrix used by DSTEDC.
*
* DLAEDA computes the Z vector corresponding to the merge step in the
* CURLVL-th step of the merge process with TLVLS steps for the CURPBM-th
* problem.
*
* PRMPTR, PERM, GIVPTR, GIVCOL, and QPTR hold 1-based Fortran offsets
* (they are computed once and reused by the divide-and-conquer eigensolver
* in both Fortran and JS, so the convention is preserved). Internal loop
* variables are also kept 1-based to mirror the Fortran source; array
* accesses subtract 1 at the access site.
*
* @private
* @param {NonNegativeInteger} N - dimension of the symmetric tridiagonal matrix
* @param {integer} tlvls - total number of merging levels in the overall divide and conquer tree
* @param {integer} curlvl - current level in the overall merge routine (1 to tlvls)
* @param {integer} curpbm - current problem index in the current level
* @param {Int32Array} PRMPTR - 1-based offsets into PERM for each merge sub-problem
* @param {integer} stridePRMPTR - stride length for `PRMPTR`
* @param {NonNegativeInteger} offsetPRMPTR - starting index for `PRMPTR`
* @param {Int32Array} PERM - 1-based permutations of the rows for each sub-problem
* @param {integer} stridePERM - stride length for `PERM`
* @param {NonNegativeInteger} offsetPERM - starting index for `PERM`
* @param {Int32Array} GIVPTR - 1-based offsets into GIVCOL/GIVNUM for each sub-problem
* @param {integer} strideGIVPTR - stride length for `GIVPTR`
* @param {NonNegativeInteger} offsetGIVPTR - starting index for `GIVPTR`
* @param {Int32Array} GIVCOL - 1-based row indices of Givens rotations performed in the merge tree
* @param {integer} strideGIVCOL1 - stride of the first dimension of `GIVCOL`
* @param {integer} strideGIVCOL2 - stride of the second dimension of `GIVCOL`
* @param {NonNegativeInteger} offsetGIVCOL - starting index for `GIVCOL`
* @param {Float64Array} GIVNUM - cosine/sine pairs for the Givens rotations
* @param {integer} strideGIVNUM1 - stride of the first dimension of `GIVNUM`
* @param {integer} strideGIVNUM2 - stride of the second dimension of `GIVNUM`
* @param {NonNegativeInteger} offsetGIVNUM - starting index for `GIVNUM`
* @param {Float64Array} q - concatenated orthogonal sub-blocks produced at each merge step
* @param {integer} strideQ - stride length for `q`
* @param {NonNegativeInteger} offsetQ - starting index for `q`
* @param {Int32Array} QPTR - 1-based offsets into `q` for each sub-block
* @param {integer} strideQPTR - stride length for `QPTR`
* @param {NonNegativeInteger} offsetQPTR - starting index for `QPTR`
* @param {Float64Array} z - output Z vector for the current merge step
* @param {integer} strideZ - stride length for `z`
* @param {NonNegativeInteger} offsetZ - starting index for `z`
* @param {Float64Array} ZTEMP - workspace of length at least N
* @param {integer} strideZTEMP - stride length for `ZTEMP`
* @param {NonNegativeInteger} offsetZTEMP - starting index for `ZTEMP`
* @returns {integer} status code (0 = success, -1 = invalid N)
*/
function dlaeda( N, tlvls, curlvl, curpbm, PRMPTR, stridePRMPTR, offsetPRMPTR, PERM, stridePERM, offsetPERM, GIVPTR, strideGIVPTR, offsetGIVPTR, GIVCOL, strideGIVCOL1, strideGIVCOL2, offsetGIVCOL, GIVNUM, strideGIVNUM1, strideGIVNUM2, offsetGIVNUM, q, strideQ, offsetQ, QPTR, strideQPTR, offsetQPTR, z, strideZ, offsetZ, ZTEMP, strideZTEMP, offsetZTEMP ) {
	var prmCurr1;
	var givStart;
	var prmCurr;
	var permIdx;
	var givEnd;
	var qcurr1;
	var qcurr;
	var bsiz1;
	var bsiz2;
	var psiz1;
	var psiz2;
	var zPtr1;
	var curr;
	var mid;
	var ptr;
	var i;
	var k;

	// Argument check (mirrors Fortran INFO = -1 for N < 0).
	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}

	// MID = N/2 + 1 in 1-based indexing.
	mid = ( ( N / 2 ) | 0 ) + 1;

	// Initial sub-problem index at the deepest level.
	ptr = 1;
	curr = ptr + ( curpbm * ( 1 << curlvl ) ) + ( 1 << ( curlvl - 1 ) ) - 1;

	// Add 0.5 before the sqrt to guard against truncation of an exactly representable integer square root.
	qcurr = QPTR[ offsetQPTR + ( ( curr - 1 ) * strideQPTR ) ];
	qcurr1 = QPTR[ offsetQPTR + ( curr * strideQPTR ) ];
	bsiz1 = ( 0.5 + Math.sqrt( QPTR[ offsetQPTR + ( curr * strideQPTR ) ] - qcurr ) ) | 0;
	bsiz2 = ( 0.5 + Math.sqrt( QPTR[ offsetQPTR + ( ( curr + 1 ) * strideQPTR ) ] - qcurr1 ) ) | 0;
	for ( k = 1; k <= mid - bsiz1 - 1; k++ ) {
		z[ offsetZ + ( ( k - 1 ) * strideZ ) ] = 0.0;
	}

	// Copy last row of leaf block 1 into Z(MID-BSIZ1 : MID-1).
	dcopy( bsiz1, q, bsiz1 * strideQ, offsetQ + ( ( qcurr + bsiz1 - 2 ) * strideQ ), z, strideZ, offsetZ + ( ( mid - bsiz1 - 1 ) * strideZ ) );

	// Copy first row of leaf block 2 into Z(MID : MID+BSIZ2-1).
	dcopy( bsiz2, q, bsiz2 * strideQ, offsetQ + ( ( qcurr1 - 1 ) * strideQ ), z, strideZ, offsetZ + ( ( mid - 1 ) * strideZ ) );

	for ( k = mid + bsiz2; k <= N; k++ ) {
		z[ offsetZ + ( ( k - 1 ) * strideZ ) ] = 0.0;
	}

	// Walk back up the merge tree, applying the deflation transformations recorded at each level.
	ptr = ( 1 << tlvls ) + 1;
	for ( k = 1; k <= curlvl - 1; k++ ) {
		curr = ptr + ( curpbm * ( 1 << ( curlvl - k ) ) ) + ( 1 << ( curlvl - k - 1 ) ) - 1;
		prmCurr = PRMPTR[ offsetPRMPTR + ( ( curr - 1 ) * stridePRMPTR ) ];
		prmCurr1 = PRMPTR[ offsetPRMPTR + ( curr * stridePRMPTR ) ];
		psiz1 = prmCurr1 - prmCurr;
		psiz2 = PRMPTR[ offsetPRMPTR + ( ( curr + 1 ) * stridePRMPTR ) ] - prmCurr1;
		zPtr1 = mid - psiz1;

		// Apply Givens at the LEFT-half of this merge level.
		givStart = GIVPTR[ offsetGIVPTR + ( ( curr - 1 ) * strideGIVPTR ) ];
		givEnd = GIVPTR[ offsetGIVPTR + ( curr * strideGIVPTR ) ] - 1;
		for ( i = givStart; i <= givEnd; i++ ) {
			drot( 1, z, strideZ, offsetZ + ( ( zPtr1 + GIVCOL[ offsetGIVCOL + ( ( i - 1 ) * strideGIVCOL2 ) ] - 2 ) * strideZ ), z, strideZ, offsetZ + ( ( zPtr1 + GIVCOL[ offsetGIVCOL + strideGIVCOL1 + ( ( i - 1 ) * strideGIVCOL2 ) ] - 2 ) * strideZ ), GIVNUM[ offsetGIVNUM + ( ( i - 1 ) * strideGIVNUM2 ) ], GIVNUM[ offsetGIVNUM + strideGIVNUM1 + ( ( i - 1 ) * strideGIVNUM2 ) ] );
		}

		// Apply Givens at the RIGHT-half of this merge level.
		givStart = GIVPTR[ offsetGIVPTR + ( curr * strideGIVPTR ) ];
		givEnd = GIVPTR[ offsetGIVPTR + ( ( curr + 1 ) * strideGIVPTR ) ] - 1;
		for ( i = givStart; i <= givEnd; i++ ) {
			drot( 1, z, strideZ, offsetZ + ( ( mid - 1 + GIVCOL[ offsetGIVCOL + ( ( i - 1 ) * strideGIVCOL2 ) ] - 1 ) * strideZ ), z, strideZ, offsetZ + ( ( mid - 1 + GIVCOL[ offsetGIVCOL + strideGIVCOL1 + ( ( i - 1 ) * strideGIVCOL2 ) ] - 1 ) * strideZ ), GIVNUM[ offsetGIVNUM + ( ( i - 1 ) * strideGIVNUM2 ) ], GIVNUM[ offsetGIVNUM + strideGIVNUM1 + ( ( i - 1 ) * strideGIVNUM2 ) ] );
		}

		// Gather permuted entries of the rotated Z into ZTEMP.
		for ( i = 0; i < psiz1; i++ ) {
			permIdx = PERM[ offsetPERM + ( ( prmCurr + i - 1 ) * stridePERM ) ];
			ZTEMP[ offsetZTEMP + ( i * strideZTEMP ) ] = z[ offsetZ + ( ( zPtr1 + permIdx - 2 ) * strideZ ) ];
		}
		for ( i = 0; i < psiz2; i++ ) {
			permIdx = PERM[ offsetPERM + ( ( prmCurr1 + i - 1 ) * stridePERM ) ];
			ZTEMP[ offsetZTEMP + ( ( psiz1 + i ) * strideZTEMP ) ] = z[ offsetZ + ( ( mid + permIdx - 2 ) * strideZ ) ];
		}

		// Multiply by Q^T at the current merge level. BSIZ1/BSIZ2 are the
		// orthogonal-block sizes recorded at THIS level (not the leaf
		// level), so they're recomputed from QPTR.
		qcurr = QPTR[ offsetQPTR + ( ( curr - 1 ) * strideQPTR ) ];
		qcurr1 = QPTR[ offsetQPTR + ( curr * strideQPTR ) ];
		bsiz1 = ( 0.5 + Math.sqrt( qcurr1 - qcurr ) ) | 0;
		bsiz2 = ( 0.5 + Math.sqrt( QPTR[ offsetQPTR + ( ( curr + 1 ) * strideQPTR ) ] - qcurr1 ) ) | 0;
		if ( bsiz1 > 0 ) {
			dgemv( 'transpose', bsiz1, bsiz1, 1.0, q, strideQ, bsiz1 * strideQ, offsetQ + ( ( qcurr - 1 ) * strideQ ), ZTEMP, strideZTEMP, offsetZTEMP, 0.0, z, strideZ, offsetZ + ( ( zPtr1 - 1 ) * strideZ ) );
		}
		// Tail of the LEFT-half that lies outside the Q-block goes
		// Through unchanged (size PSIZ1 - BSIZ1).
		dcopy( psiz1 - bsiz1, ZTEMP, strideZTEMP, offsetZTEMP + ( bsiz1 * strideZTEMP ), z, strideZ, offsetZ + ( ( zPtr1 + bsiz1 - 1 ) * strideZ ) );

		if ( bsiz2 > 0 ) {
			dgemv( 'transpose', bsiz2, bsiz2, 1.0, q, strideQ, bsiz2 * strideQ, offsetQ + ( ( qcurr1 - 1 ) * strideQ ), ZTEMP, strideZTEMP, offsetZTEMP + ( psiz1 * strideZTEMP ), 0.0, z, strideZ, offsetZ + ( ( mid - 1 ) * strideZ ) );
		}
		dcopy( psiz2 - bsiz2, ZTEMP, strideZTEMP, offsetZTEMP + ( ( psiz1 + bsiz2 ) * strideZTEMP ), z, strideZ, offsetZ + ( ( mid + bsiz2 - 1 ) * strideZ ) );

		ptr += 1 << ( tlvls - k );
	}
	return 0;
}


// EXPORTS //

export default dlaeda;
