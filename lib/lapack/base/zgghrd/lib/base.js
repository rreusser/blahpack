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
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlartg from '../../zlartg/lib/base.js';
import zlaset from '../../zlaset/lib/base.js';
import zrot from '../../zrot/lib/base.js';


// MAIN //

/**
* Reduce a pair of complex matrices (A, B) to generalized upper Hessenberg.
* form using unitary `transformations: Q^H*A*Z = H`, `Q^H*B*Z = T`,
* where H is upper Hessenberg, T is upper triangular, and Q and Z are
* unitary.
*
* A, B, Q, Z are Complex128Arrays. Strides and offsets are in complex elements.
*
* @private
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ilo - ilo (1-based)
* @param {integer} ihi - ihi (1-based)
* @param {Complex128Array} A - input/output matrix A
* @param {integer} strideA1 - stride of the first dimension of `A` (complex elements)
* @param {integer} strideA2 - stride of the second dimension of `A` (complex elements)
* @param {NonNegativeInteger} offsetA - starting index for `A` (complex elements)
* @param {Complex128Array} B - input/output matrix B
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @param {Complex128Array} Q - input/output matrix Q
* @param {integer} strideQ1 - stride of the first dimension of `Q` (complex elements)
* @param {integer} strideQ2 - stride of the second dimension of `Q` (complex elements)
* @param {NonNegativeInteger} offsetQ - starting index for `Q` (complex elements)
* @param {Complex128Array} Z - input/output matrix Z
* @param {integer} strideZ1 - stride of the first dimension of `Z` (complex elements)
* @param {integer} strideZ2 - stride of the second dimension of `Z` (complex elements)
* @param {NonNegativeInteger} offsetZ - starting index for `Z` (complex elements)
* @returns {integer} status code (0 = success)
*/
function zgghrd( compq, compz, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ ) {
	var icompq;
	var icompz;
	var alpha;
	var beta;
	var jcol;
	var jrow;
	var cArr;
	var sArr;
	var rArr;
	var ilq;
	var ilz;
	var sa1;
	var sa2;
	var sb1;
	var sb2;
	var idx;
	var Av;
	var Bv;
	var oA;
	var oB;
	var fv;
	var gv;
	var sv;
	var rv;
	var sr;
	var si;
	var c;
	var s;
	var f;
	var g;

	// Decode COMPQ
	if ( compq === 'none' ) {
		ilq = false;
		icompq = 1;
	} else if ( compq === 'update' ) {
		ilq = true;
		icompq = 2;
	} else if ( compq === 'initialize' ) {
		ilq = true;
		icompq = 3;
	} else {
		icompq = 0;
	}

	// Decode COMPZ
	if ( compz === 'none' ) {
		ilz = false;
		icompz = 1;
	} else if ( compz === 'update' ) {
		ilz = true;
		icompz = 2;
	} else if ( compz === 'initialize' ) {
		ilz = true;
		icompz = 3;
	} else {
		icompz = 0;
	}

	// Parameter validation
	if ( icompq <= 0 ) {
		return -1;
	}
	if ( icompz <= 0 ) {
		return -2;
	}
	if ( N < 0 ) {
		return -3;
	}

	// Get Float64Array views for direct element access
	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );

	// Convert strides/offsets to Float64 units for element access
	sa1 = strideA1 * 2;
	sa2 = strideA2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oA = offsetA * 2;
	oB = offsetB * 2;

	// Initialize Q to identity if requested
	alpha = new Complex128( 0.0, 0.0 );
	beta = new Complex128( 1.0, 0.0 );
	if ( icompq === 3 ) {
		zlaset( 'Full', N, N, alpha, beta, Q, strideQ1, strideQ2, offsetQ );
	}
	// Initialize Z to identity if requested
	if ( icompz === 3 ) {
		zlaset( 'Full', N, N, alpha, beta, Z, strideZ1, strideZ2, offsetZ );
	}

	// Quick return if N <= 1
	if ( N <= 1 ) {
		return 0;
	}

	// Zero out the lower triangle of B
	// Fortran: DO JCOL = 1, N-1; DO JROW = JCOL+1, N; B(JROW,JCOL)=0
	for ( jcol = 0; jcol < N - 1; jcol++ ) {
		for ( jrow = jcol + 1; jrow < N; jrow++ ) {
			idx = oB + (jrow * sb1) + (jcol * sb2);
			Bv[ idx ] = 0.0;
			Bv[ idx + 1 ] = 0.0;
		}
	}

	// Working arrays for zlartg
	f = new Complex128Array( 1 );
	fv = reinterpret( f, 0 );
	g = new Complex128Array( 1 );
	gv = reinterpret( g, 0 );
	cArr = new Float64Array( 1 );
	sArr = new Complex128Array( 1 );
	sv = reinterpret( sArr, 0 );
	rArr = new Complex128Array( 1 );
	rv = reinterpret( rArr, 0 );
	s = new Float64Array( 2 );   // complex s for zrot

	// Main reduction loop

	// Fortran: DO JCOL = ILO, IHI-2 (1-based)

	// JS: jcol from ilo-1 to ihi-3 (0-based)
	for ( jcol = ilo - 1; jcol <= ihi - 3; jcol++ ) {
		// Fortran: DO JROW = IHI, JCOL+2, -1 (1-based)
		// JS: jrow from ihi-1 down to jcol+2 (0-based: JCOL+2 in 1-based = jcol+2 in 0-based)
		for ( jrow = ihi - 1; jrow >= jcol + 2; jrow-- ) {
			// -------------------------------------------------------
			// Step 1: Eliminate A(jrow, jcol) using a rotation applied
			// From the left.
			// Fortran: CTEMP = A(JROW-1, JCOL)
			// JS 0-based: A(jrow-1, jcol)
			// -------------------------------------------------------
			idx = oA + (( jrow - 1 ) * sa1) + (jcol * sa2);
			fv[ 0 ] = Av[ idx ];
			fv[ 1 ] = Av[ idx + 1 ];

			idx = oA + (jrow * sa1) + (jcol * sa2);
			gv[ 0 ] = Av[ idx ];
			gv[ 1 ] = Av[ idx + 1 ];

			zlartg( f, 0, g, 0, cArr, 0, sArr, 0, rArr, 0 );
			c = cArr[ 0 ];
			sr = sv[ 0 ];
			si = sv[ 1 ];

			// A(JROW-1, JCOL) = R (the result from zlartg)
			idx = oA + (( jrow - 1 ) * sa1) + (jcol * sa2);
			Av[ idx ] = rv[ 0 ];
			Av[ idx + 1 ] = rv[ 1 ];

			// A(JROW, JCOL) = 0
			idx = oA + (jrow * sa1) + (jcol * sa2);
			Av[ idx ] = 0.0;
			Av[ idx + 1 ] = 0.0;

			// Apply rotation to remaining columns of A:

			// Fortran: CALL ZROT(N-JCOL, A(JROW-1,JCOL+1), LDA, A(JROW,JCOL+1), LDA, C, S)

			// Iterates over columns (stride=strideA2 complex elements), N-JCOL elements (1-based)
			s[ 0 ] = sr;
			s[ 1 ] = si;
			zrot(N - ( jcol + 1 ), A, strideA2, offsetA + (( jrow - 1 ) * strideA1) + (( jcol + 1 ) * strideA2), A, strideA2, offsetA + (jrow * strideA1) + (( jcol + 1 ) * strideA2), c, s);

			// Apply rotation to B:

			// Fortran: CALL ZROT(N+2-JROW, B(JROW-1,JROW-1), LDB, B(JROW,JROW-1), LDB, C, S)

			// Iterates over columns (stride=strideB2 complex elements)
			zrot(N + 1 - jrow, B, strideB2, offsetB + (( jrow - 1 ) * strideB1) + (( jrow - 1 ) * strideB2), B, strideB2, offsetB + (jrow * strideB1) + (( jrow - 1 ) * strideB2), c, s);

			// Apply conjugate rotation to Q if needed:

			// Fortran: CALL ZROT(N, Q(1,JROW-1), 1, Q(1,JROW), 1, C, DCONJG(S))

			// Iterates over rows (stride=strideQ1 complex elements)
			if ( ilq ) {
				s[ 0 ] = sr;
				s[ 1 ] = -si; // conjugate
				zrot(N, Q, strideQ1, offsetQ + (( jrow - 1 ) * strideQ2), Q, strideQ1, offsetQ + (jrow * strideQ2), c, s);
			}

			// -------------------------------------------------------
			// Step 2: Eliminate B(jrow, jrow-1) using a rotation
			// Applied from the right.
			// Fortran: CTEMP = B(JROW, JROW)
			// -------------------------------------------------------
			idx = oB + (jrow * sb1) + (jrow * sb2);
			fv[ 0 ] = Bv[ idx ];
			fv[ 1 ] = Bv[ idx + 1 ];

			idx = oB + (jrow * sb1) + (( jrow - 1 ) * sb2);
			gv[ 0 ] = Bv[ idx ];
			gv[ 1 ] = Bv[ idx + 1 ];

			zlartg( f, 0, g, 0, cArr, 0, sArr, 0, rArr, 0 );
			c = cArr[ 0 ];
			sr = sv[ 0 ];
			si = sv[ 1 ];

			// B(JROW, JROW) = R
			idx = oB + (jrow * sb1) + (jrow * sb2);
			Bv[ idx ] = rv[ 0 ];
			Bv[ idx + 1 ] = rv[ 1 ];

			// B(JROW, JROW-1) = 0
			idx = oB + (jrow * sb1) + (( jrow - 1 ) * sb2);
			Bv[ idx ] = 0.0;
			Bv[ idx + 1 ] = 0.0;

			// Apply rotation to A from the right:

			// Fortran: CALL ZROT(IHI, A(1,JROW), 1, A(1,JROW-1), 1, C, S)

			// Iterates over rows (stride=strideA1 complex elements)
			s[ 0 ] = sr;
			s[ 1 ] = si;
			zrot(ihi, A, strideA1, offsetA + (jrow * strideA2), A, strideA1, offsetA + (( jrow - 1 ) * strideA2), c, s);

			// Apply rotation to B from the right:

			// Fortran: CALL ZROT(JROW-1, B(1,JROW), 1, B(1,JROW-1), 1, C, S)

			// Iterates over rows (stride=strideB1 complex elements)
			zrot(jrow, B, strideB1, offsetB + (jrow * strideB2), B, strideB1, offsetB + (( jrow - 1 ) * strideB2), c, s);

			// Apply rotation to Z if needed:

			// Fortran: CALL ZROT(N, Z(1,JROW), 1, Z(1,JROW-1), 1, C, S)

			// Iterates over rows (stride=strideZ1 complex elements)
			if ( ilz ) {
				zrot(N, Z, strideZ1, offsetZ + (jrow * strideZ2), Z, strideZ1, offsetZ + (( jrow - 1 ) * strideZ2), c, s);
			}
		}
	}

	return 0;
}


// EXPORTS //

export default zgghrd;
