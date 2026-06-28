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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlaset from '../../dlaset/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';


// VARIABLES //

var OUT = new Float64Array( 3 );


// MAIN //

/**
* Reduces a pair of real matrices (A, B) to generalized upper Hessenberg.
* form using orthogonal transformations, where `Q**T * A * Z = H` (upper
* Hessenberg) and `Q**T * B * Z = T` (upper triangular).
*
* @private
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {integer} ilo - ilo (1-based)
* @param {integer} ihi - ihi (1-based)
* @param {Float64Array} A - input/output matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - input/output matrix Q
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - input/output matrix Z
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @returns {integer} status code (0 = success)
*/
function dgghrd( compq, compz, N, ilo, ihi, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ ) {
	var icompq;
	var icompz;
	var jcol;
	var jrow;
	var temp;
	var ilq;
	var ilz;
	var c;
	var s;

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

	// Initialize Q to identity if requested
	if ( icompq === 3 ) {
		dlaset( 'full', N, N, 0.0, 1.0, Q, strideQ1, strideQ2, offsetQ );
	}

	// Initialize Z to identity if requested
	if ( icompz === 3 ) {
		dlaset( 'full', N, N, 0.0, 1.0, Z, strideZ1, strideZ2, offsetZ );
	}

	// Quick return if N <= 1
	if ( N <= 1 ) {
		return 0;
	}

	// Zero out the lower triangle of B
	for ( jcol = 0; jcol < N - 1; jcol += 1 ) {
		for ( jrow = jcol + 1; jrow < N; jrow += 1 ) {
			B[ offsetB + (jrow * strideB1) + (jcol * strideB2) ] = 0.0;
		}
	}

	// Main reduction loop
	// Fortran: DO JCOL = ILO, IHI-2 (1-based)
	// JS: jcol from ilo-1 to ihi-3 (0-based)
	for ( jcol = ilo - 1; jcol <= ihi - 3; jcol += 1 ) {
		// Fortran: DO JROW = IHI, JCOL+2, -1 (1-based)
		// JS: jrow from ihi-1 down to jcol+2 (0-based)
		for ( jrow = ihi - 1; jrow >= jcol + 2; jrow -= 1 ) {
			// Step 1: Eliminate A(jrow, jcol) using a rotation from the left
			// Fortran: TEMP = A(JROW-1, JCOL)
			temp = A[ offsetA + ((jrow - 1) * strideA1) + (jcol * strideA2) ];

			// dlartg(f, g, out) => out[0]=c, out[1]=s, out[2]=r
			dlartg( temp, A[ offsetA + (jrow * strideA1) + (jcol * strideA2) ], OUT );
			c = OUT[ 0 ];
			s = OUT[ 1 ];

			// A(JROW-1, JCOL) = R
			A[ offsetA + ((jrow - 1) * strideA1) + (jcol * strideA2) ] = OUT[ 2 ];

			// A(JROW, JCOL) = 0
			A[ offsetA + (jrow * strideA1) + (jcol * strideA2) ] = 0.0;

			// Apply left rotation to remaining columns of A:

			// Fortran: CALL DROT(N-JCOL, A(JROW-1,JCOL+1), LDA, A(JROW,JCOL+1), LDA, C, S)
			// Iterate over columns => stride = strideA2
			drot( N - (jcol + 1), A, strideA2, offsetA + ((jrow - 1) * strideA1) + ((jcol + 1) * strideA2), A, strideA2, offsetA + (jrow * strideA1) + ((jcol + 1) * strideA2), c, s );

			// Apply left rotation to B:

			// Fortran: CALL DROT(N+2-JROW, B(JROW-1,JROW-1), LDB, B(JROW,JROW-1), LDB, C, S)

			// N+2-JROW (1-based) = N+1-jrow (0-based)
			drot( N + 1 - jrow, B, strideB2, offsetB + ((jrow - 1) * strideB1) + ((jrow - 1) * strideB2), B, strideB2, offsetB + (jrow * strideB1) + ((jrow - 1) * strideB2), c, s );

			// Apply left rotation to Q if needed:

			// Fortran: CALL DROT(N, Q(1,JROW-1), 1, Q(1,JROW), 1, C, S)
			// Iterate over rows => stride = strideQ1
			if ( ilq ) {
				drot( N, Q, strideQ1, offsetQ + ((jrow - 1) * strideQ2), Q, strideQ1, offsetQ + (jrow * strideQ2), c, s );
			}

			// Step 2: Eliminate B(jrow, jrow-1) using a rotation from the right
			// Fortran: TEMP = B(JROW, JROW)
			temp = B[ offsetB + (jrow * strideB1) + (jrow * strideB2) ];

			dlartg( temp, B[ offsetB + (jrow * strideB1) + ((jrow - 1) * strideB2) ], OUT );
			c = OUT[ 0 ];
			s = OUT[ 1 ];

			// B(JROW, JROW) = R
			B[ offsetB + (jrow * strideB1) + (jrow * strideB2) ] = OUT[ 2 ];

			// B(JROW, JROW-1) = 0
			B[ offsetB + (jrow * strideB1) + ((jrow - 1) * strideB2) ] = 0.0;

			// Apply right rotation to A:

			// Fortran: CALL DROT(IHI, A(1,JROW), 1, A(1,JROW-1), 1, C, S)
			// Iterate over rows => stride = strideA1
			drot( ihi, A, strideA1, offsetA + (jrow * strideA2), A, strideA1, offsetA + ((jrow - 1) * strideA2), c, s );

			// Apply right rotation to B:

			// Fortran: CALL DROT(JROW-1, B(1,JROW), 1, B(1,JROW-1), 1, C, S)

			// JROW-1 (1-based) = jrow (0-based)
			drot( jrow, B, strideB1, offsetB + (jrow * strideB2), B, strideB1, offsetB + ((jrow - 1) * strideB2), c, s );

			// Apply right rotation to Z if needed:

			// Fortran: CALL DROT(N, Z(1,JROW), 1, Z(1,JROW-1), 1, C, S)
			// Iterate over rows => stride = strideZ1
			if ( ilz ) {
				drot( N, Z, strideZ1, offsetZ + (jrow * strideZ2), Z, strideZ1, offsetZ + ((jrow - 1) * strideZ2), c, s );
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dgghrd;
