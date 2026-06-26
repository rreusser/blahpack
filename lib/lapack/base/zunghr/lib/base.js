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

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungqr from '../../zungqr/lib/base.js';


// MAIN //

/**
* Generates the complex unitary matrix Q which is defined as the product.
* of IHI-ILO elementary reflectors of order N, as returned by ZGEHRD:
*
* Q = H(ilo) H(ilo+1) ... H(ihi-1)
*
* ## Notes
*
* -   ILO and IHI are 1-based, matching the Fortran convention.
* -   On entry, A must contain the reflector vectors as returned by ZGEHRD.
* -   On exit, A contains the N-by-N unitary matrix Q.
* -   Q is the identity matrix except in the submatrix
*     Q(ilo:ihi-1, ilo:ihi-1) (0-based).
* -   WORK is allocated internally. The WORK/strideWORK/offsetWORK/lwork
*     parameters are kept for API compatibility.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix Q (N >= 0)
* @param {integer} ilo - lower bound from ZGEHRD (1-based)
* @param {integer} ihi - upper bound from ZGEHRD (1-based)
* @param {Complex128Array} A - input/output matrix (N x N)
* @param {integer} strideA1 - stride of the first dimension of A (complex elements)
* @param {integer} strideA2 - stride of the second dimension of A (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for A (complex elements)
* @param {Complex128Array} TAU - scalar factors of reflectors from ZGEHRD (length N-1)
* @param {integer} strideTAU - stride for TAU (complex elements)
* @param {NonNegativeInteger} offsetTAU - starting index for TAU (complex elements)
* @param {Complex128Array} WORK - workspace (ignored, allocated internally)
* @param {integer} strideWORK - stride for WORK (ignored)
* @param {NonNegativeInteger} offsetWORK - starting index for WORK (ignored)
* @param {integer} lwork - workspace size (ignored)
* @returns {integer} status code (0 = success)
*/
function zunghr( N, ilo, ihi, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, WORK, strideWORK, offsetWORK, lwork ) { // eslint-disable-line no-unused-vars
	var work;
	var nh;
	var sa1;
	var sa2;
	var oA;
	var Av;
	var ip;
	var jp;
	var i;
	var j;

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	sa1 = strideA1 * 2; // Convert complex-element strides to Float64 strides
	sa2 = strideA2 * 2;
	oA = offsetA * 2;   // Convert complex-element offset to Float64 offset
	nh = ihi - ilo;     // Number of reflectors (IHI and ILO are 1-based)

	// Get Float64 view of the Complex128Array
	Av = reinterpret( A, 0 );

	// Shift the vectors which define the elementary reflectors one

	// Column to the right, and set the first ILO and the last N-IHI

	// Rows and columns to those of the unit matrix.

	// Fortran (1-based): DO 40 J = IHI, ILO+1, -1

	// In 0-based: j goes from ihi-1 down to ilo
	for ( j = ihi - 1; j >= ilo; j-- ) {
		// Zero rows 0..j-1 of column j (complex zeros: re=0, im=0)
		for ( i = 0; i < j; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			Av[ ip ] = 0.0;
			Av[ ip + 1 ] = 0.0;
		}
		// Copy reflector from column j-1 to column j for rows j+1..ihi-1
		for ( i = j + 1; i < ihi; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			jp = oA + ( i * sa1 ) + ( ( j - 1 ) * sa2 );
			Av[ ip ] = Av[ jp ];
			Av[ ip + 1 ] = Av[ jp + 1 ];
		}
		// Zero rows ihi..N-1 of column j
		for ( i = ihi; i < N; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			Av[ ip ] = 0.0;
			Av[ ip + 1 ] = 0.0;
		}
	}

	// Set columns 0..ilo-1 to identity columns
	for ( j = 0; j < ilo; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			Av[ ip ] = 0.0;
			Av[ ip + 1 ] = 0.0;
		}
		// Diagonal: 1+0i
		ip = oA + ( j * sa1 ) + ( j * sa2 );
		Av[ ip ] = 1.0;
		Av[ ip + 1 ] = 0.0;
	}

	// Set columns ihi..N-1 to identity columns
	for ( j = ihi; j < N; j++ ) {
		for ( i = 0; i < N; i++ ) {
			ip = oA + ( i * sa1 ) + ( j * sa2 );
			Av[ ip ] = 0.0;
			Av[ ip + 1 ] = 0.0;
		}
		// Diagonal: 1+0i
		ip = oA + ( j * sa1 ) + ( j * sa2 );
		Av[ ip ] = 1.0;
		Av[ ip + 1 ] = 0.0;
	}

	if ( nh > 0 ) {
		// Generate Q(ilo+1:ihi, ilo+1:ihi) (Fortran 1-based)
		// In 0-based: submatrix at (ilo, ilo) of size nh x nh
		// TAU starts at TAU[ilo-1] (0-based: the ilo-th element, which is
		// TAU(ILO) in Fortran)
		work = new Complex128Array( Math.max( 1, nh ) * 32 );
		zungqr(
			nh, nh, nh,
			A, strideA1, strideA2, offsetA + ( ilo * strideA1 ) + ( ilo * strideA2 ),
			TAU, strideTAU, offsetTAU + ( ( ilo - 1 ) * strideTAU ),
			work, 1, 0
		);
	}

	return 0;
}


// EXPORTS //

export default zunghr;
