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

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlasv2 from '../../dlasv2/lib/base.js';
import dlag2 from '../../dlag2/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';


// VARIABLES //

var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' );
var lartgOut = new Float64Array( 3 );


// MAIN //

/**
* Computes the Generalized Schur factorization of a real 2-by-2 matrix pencil (A,B) where B is upper triangular.
*
* ## Notes
*
* This routine computes orthogonal (rotation) matrices given by CSL, SNL
* and CSR, SNR such that:
*
* 1.  if the pencil (A,B) has two real eigenvalues, then
*
*     ```text
*     [ a11 a12 ] := [  CSL  SNL ] [ a11 a12 ] [  CSR -SNR ]
*     [  0  a22 ]    [ -SNL  CSL ] [ a21 a22 ] [  SNR  CSR ]
*
*     [ b11 b12 ] := [  CSL  SNL ] [ b11 b12 ] [  CSR -SNR ]
*     [  0  b22 ]    [ -SNL  CSL ] [  0  b22 ] [  SNR  CSR ]
*     ```
*
* 2.  if the pencil (A,B) has a pair of complex conjugate eigenvalues, then
*
*     ```text
*     [ a11 a12 ] := [  CSL  SNL ] [ a11 a12 ] [  CSR -SNR ]
*     [ a21 a22 ]    [ -SNL  CSL ] [ a21 a22 ] [  SNR  CSR ]
*
*     [ b11  0  ] := [  CSL  SNL ] [ b11 b12 ] [  CSR -SNR ]
*     [  0  b22 ]    [ -SNL  CSL ] [  0  b22 ] [  SNR  CSR ]
*     ```
*
*     where `b11 >= b22 > 0`.
*
* @private
* @param {Float64Array} A - input/output 2-by-2 matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input/output 2-by-2 upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} alphar - output array for real parts of eigenvalue numerators
* @param {integer} strideALPHAR - stride length for `alphar`
* @param {NonNegativeInteger} offsetALPHAR - starting index for `alphar`
* @param {Float64Array} alphai - output array for imaginary parts of eigenvalue numerators
* @param {integer} strideALPHAI - stride length for `alphai`
* @param {NonNegativeInteger} offsetALPHAI - starting index for `alphai`
* @param {Float64Array} beta - output array for eigenvalue denominators
* @param {integer} strideBETA - stride length for `beta`
* @param {NonNegativeInteger} offsetBETA - starting index for `beta`
* @returns {Object} object with fields: `CSL`, `SNL`, `CSR`, `SNR`
*
* @example
* var Float64Array = require( '@stdlib/array/float64' );
*
* var A = new Float64Array( [ 4.0, 2.0, 1.0, 3.0 ] );
* var B = new Float64Array( [ 2.0, 0.0, 1.0, 1.0 ] );
* var alphar = new Float64Array( 2 );
* var alphai = new Float64Array( 2 );
* var beta = new Float64Array( 2 );
*
* var result = dlagv2( A, 1, 2, 0, B, 1, 2, 0, alphar, 1, 0, alphai, 1, 0, beta, 1, 0 );
* // returns { 'CSL': ~0.973, 'SNL': ~0.23, 'CSR': ~0.851, 'SNR': ~0.526 }
*/
function dlagv2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, alphar, strideALPHAR, offsetALPHAR, alphai, strideALPHAI, offsetALPHAI, beta, strideBETA, offsetBETA ) { // eslint-disable-line max-len
	var ascale;
	var bscale;
	var scale1;
	var anorm;
	var bnorm;
	var eig;
	var svd;
	var csl;
	var snl;
	var csr;
	var snr;
	var wi;
	var h1;
	var h2;
	var h3;
	var qq;
	var rr;

	// Offsets for A: A(i,j) => A[ offsetA + (i-1)*strideA1 + (j-1)*strideA2 ]

	// A(1,1) = oA, A(2,1) = oA + sA1, A(1,2) = oA + sA2, A(2,2) = oA + sA1 + sA2

	// Offsets for B: similar

	// Scale A:
	anorm = Math.max(Math.abs( A[ offsetA ] ) + Math.abs( A[ offsetA + strideA1 ] ), Math.abs( A[ offsetA + strideA2 ] ) + Math.abs( A[ offsetA + strideA1 + strideA2 ] ), SAFMIN);
	ascale = 1.0 / anorm;
	A[ offsetA ] *= ascale;
	A[ offsetA + strideA2 ] *= ascale;
	A[ offsetA + strideA1 ] *= ascale;
	A[ offsetA + strideA1 + strideA2 ] *= ascale;

	// Scale B:
	bnorm = Math.max(Math.abs( B[ offsetB ] ), Math.abs( B[ offsetB + strideB2 ] ) + Math.abs( B[ offsetB + strideB1 + strideB2 ] ), SAFMIN);
	bscale = 1.0 / bnorm;
	B[ offsetB ] *= bscale;
	B[ offsetB + strideB2 ] *= bscale;
	B[ offsetB + strideB1 + strideB2 ] *= bscale;

	// Check if A(2,1) is negligible:
	if ( Math.abs( A[ offsetA + strideA1 ] ) <= ULP ) {
		csl = 1.0;
		snl = 0.0;
		csr = 1.0;
		snr = 0.0;
		A[ offsetA + strideA1 ] = 0.0;
		B[ offsetB + strideB1 ] = 0.0;
		wi = 0.0;
	} else if ( Math.abs( B[ offsetB ] ) <= ULP ) {
		// B(1,1) is negligible: zero it out using a rotation on A's first column
		dlartg( A[ offsetA ], A[ offsetA + strideA1 ], lartgOut );
		csl = lartgOut[ 0 ];
		snl = lartgOut[ 1 ];
		csr = 1.0;
		snr = 0.0;

		// Apply left rotation to A: rows 1 and 2, stepping across columns (stride = strideA2)
		drot( 2, A, strideA2, offsetA, A, strideA2, offsetA + strideA1, csl, snl );

		// Apply left rotation to B: rows 1 and 2, stepping across columns (stride = strideB2)
		drot( 2, B, strideB2, offsetB, B, strideB2, offsetB + strideB1, csl, snl );

		A[ offsetA + strideA1 ] = 0.0;
		B[ offsetB ] = 0.0;
		B[ offsetB + strideB1 ] = 0.0;
		wi = 0.0;
	} else if ( Math.abs( B[ offsetB + strideB1 + strideB2 ] ) <= ULP ) {
		// B(2,2) is negligible: zero it out using a rotation on A's second row
		dlartg( A[ offsetA + strideA1 + strideA2 ], A[ offsetA + strideA1 ], lartgOut );
		csr = lartgOut[ 0 ];
		snr = -lartgOut[ 1 ];

		// Apply right rotation to A: cols 1 and 2, stepping down rows (stride = strideA1)
		drot( 2, A, strideA1, offsetA, A, strideA1, offsetA + strideA2, csr, snr );

		// Apply right rotation to B: cols 1 and 2, stepping down rows (stride = strideB1)
		drot( 2, B, strideB1, offsetB, B, strideB1, offsetB + strideB2, csr, snr );

		csl = 1.0;
		snl = 0.0;
		A[ offsetA + strideA1 ] = 0.0;
		B[ offsetB + strideB1 ] = 0.0;
		B[ offsetB + strideB1 + strideB2 ] = 0.0;
		wi = 0.0;
	} else {
		// General case: use dlag2 to compute eigenvalues
		eig = dlag2( A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, SAFMIN );
		scale1 = eig.scale1;
		wi = eig.wi;

		if ( wi === 0.0 ) {
			// Real eigenvalues: compute right rotation
			h1 = ( scale1 * A[ offsetA ] ) - ( eig.wr1 * B[ offsetB ] );
			h2 = ( scale1 * A[ offsetA + strideA2 ] ) - ( eig.wr1 * B[ offsetB + strideB2 ] );
			h3 = ( scale1 * A[ offsetA + strideA1 + strideA2 ] ) - ( eig.wr1 * B[ offsetB + strideB1 + strideB2 ] );

			rr = dlapy2( h1, h2 );
			qq = dlapy2( scale1 * A[ offsetA + strideA1 ], h3 );

			if ( rr > qq ) {
				// Compute right rotation from (h2, h1)
				dlartg( h2, h1, lartgOut );
			} else {
				// Compute right rotation from (h3, scale1*A(2,1))
				dlartg( h3, scale1 * A[ offsetA + strideA1 ], lartgOut );
			}
			csr = lartgOut[ 0 ];
			snr = -lartgOut[ 1 ];

			// Apply right rotation to A: cols 1 and 2
			drot( 2, A, strideA1, offsetA, A, strideA1, offsetA + strideA2, csr, snr );

			// Apply right rotation to B: cols 1 and 2
			drot( 2, B, strideB1, offsetB, B, strideB1, offsetB + strideB2, csr, snr );

			// Compute left rotation
			h1 = Math.max(Math.abs( A[ offsetA ] ) + Math.abs( A[ offsetA + strideA2 ] ), Math.abs( A[ offsetA + strideA1 ] ) + Math.abs( A[ offsetA + strideA1 + strideA2 ] ));
			h2 = Math.max(Math.abs( B[ offsetB ] ) + Math.abs( B[ offsetB + strideB2 ] ), Math.abs( B[ offsetB + strideB1 ] ) + Math.abs( B[ offsetB + strideB1 + strideB2 ] ));

			if ( ( scale1 * h1 ) >= Math.abs( eig.wr1 ) * h2 ) {
				// Use B's first column
				dlartg( B[ offsetB ], B[ offsetB + strideB1 ], lartgOut );
			} else {
				// Use A's first column
				dlartg( A[ offsetA ], A[ offsetA + strideA1 ], lartgOut );
			}
			csl = lartgOut[ 0 ];
			snl = lartgOut[ 1 ];

			// Apply left rotation to A: rows 1 and 2
			drot( 2, A, strideA2, offsetA, A, strideA2, offsetA + strideA1, csl, snl );

			// Apply left rotation to B: rows 1 and 2
			drot( 2, B, strideB2, offsetB, B, strideB2, offsetB + strideB1, csl, snl );

			A[ offsetA + strideA1 ] = 0.0;
			B[ offsetB + strideB1 ] = 0.0;
		} else {
			// Complex eigenvalues: use SVD of B to make it diagonal
			svd = dlasv2( B[ offsetB ], B[ offsetB + strideB2 ], B[ offsetB + strideB1 + strideB2 ] );
			csr = svd.csr;
			snr = svd.snr;
			csl = svd.csl;
			snl = svd.snl;

			// Apply left rotation to A and B: rows 1 and 2
			drot( 2, A, strideA2, offsetA, A, strideA2, offsetA + strideA1, csl, snl );
			drot( 2, B, strideB2, offsetB, B, strideB2, offsetB + strideB1, csl, snl );

			// Apply right rotation to A and B: cols 1 and 2
			drot( 2, A, strideA1, offsetA, A, strideA1, offsetA + strideA2, csr, snr );
			drot( 2, B, strideB1, offsetB, B, strideB1, offsetB + strideB2, csr, snr );

			B[ offsetB + strideB1 ] = 0.0;
			B[ offsetB + strideB2 ] = 0.0;
		}
	}

	// Unscale A and B:
	A[ offsetA ] *= anorm;
	A[ offsetA + strideA1 ] *= anorm;
	A[ offsetA + strideA2 ] *= anorm;
	A[ offsetA + strideA1 + strideA2 ] *= anorm;
	B[ offsetB ] *= bnorm;
	B[ offsetB + strideB1 ] *= bnorm;
	B[ offsetB + strideB2 ] *= bnorm;
	B[ offsetB + strideB1 + strideB2 ] *= bnorm;

	// Compute eigenvalue outputs:
	if ( wi === 0.0 ) {
		alphar[ offsetALPHAR ] = A[ offsetA ];
		alphar[ offsetALPHAR + strideALPHAR ] = A[ offsetA + strideA1 + strideA2 ];
		alphai[ offsetALPHAI ] = 0.0;
		alphai[ offsetALPHAI + strideALPHAI ] = 0.0;
		beta[ offsetBETA ] = B[ offsetB ];
		beta[ offsetBETA + strideBETA ] = B[ offsetB + strideB1 + strideB2 ];
	} else {
		alphar[ offsetALPHAR ] = anorm * eig.wr1 / scale1 / bnorm;
		alphai[ offsetALPHAI ] = anorm * wi / scale1 / bnorm;
		alphar[ offsetALPHAR + strideALPHAR ] = alphar[ offsetALPHAR ];
		alphai[ offsetALPHAI + strideALPHAI ] = -alphai[ offsetALPHAI ];
		beta[ offsetBETA ] = 1.0;
		beta[ offsetBETA + strideBETA ] = 1.0;
	}

	return {
		'CSL': csl,
		'SNL': snl,
		'CSR': csr,
		'SNR': snr
	};
}


// EXPORTS //

export default dlagv2;
