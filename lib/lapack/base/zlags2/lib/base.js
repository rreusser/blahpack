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

/* eslint-disable max-len, max-params, max-statements, max-depth */

// MODULES //

import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import real from '@stdlib/complex/float64/real/lib/index.js';
import imag from '@stdlib/complex/float64/imag/lib/index.js';
import dlasv2 from '../../dlasv2/lib/base.js';
import zlartg from '../../zlartg/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;

// Workspace arrays for zlartg calls:
var lartgF = new Complex128Array( 1 );
var lartgG = new Complex128Array( 1 );
var lartgC = new Float64Array( 1 );
var lartgS = new Complex128Array( 1 );
var lartgR = new Complex128Array( 1 );


// FUNCTIONS //

/**
* Computes `ABS1(z) = |Re(z)| + |Im(z)|` (Fortran CABS1 statement function).
*
* @private
* @param {number} zr - real part
* @param {number} zi - imaginary part
* @returns {number} 1-norm of the complex number
*/
function abs1( zr, zi ) {
	return Math.abs( zr ) + Math.abs( zi );
}

/**
* Sets a Complex128Array element from real and imaginary parts.
*
* @private
* @param {Complex128Array} arr - target array
* @param {number} re - real part
* @param {number} im - imaginary part
*/
function setComplex( arr, re, im ) {
	var v = new Float64Array( arr.buffer );
	v[ 0 ] = re;
	v[ 1 ] = im;
}

/**
* Calls zlartg and returns { csq, snqR, snqI }.
*
* @private
* @param {number} fr - real part of f
* @param {number} fi - imaginary part of f
* @param {number} gr - real part of g
* @param {number} gi - imaginary part of g
* @returns {Object} object with `csq`, `snqR`, `snqI`
*/
function callZlartg( fr, fi, gr, gi ) {
	var sv;

	setComplex( lartgF, fr, fi );
	setComplex( lartgG, gr, gi );
	zlartg( lartgF, 0, lartgG, 0, lartgC, 0, lartgS, 0, lartgR, 0 );

	sv = new Float64Array( lartgS.buffer );
	return {
		'csq': lartgC[ 0 ],
		'snqR': sv[ 0 ],
		'snqI': sv[ 1 ]
	};
}


// MAIN //

/**
* Computes 2-by-2 unitary matrices U, V, and Q, such that if UPPER is true:.
*
* ```text
*   U**H * A * Q = U**H * ( A1 A2 ) * Q = ( x  0  )
*                         ( 0  A3 )       ( x  x  )
* ```
*
* and
*
* ```text
*   V**H * B * Q = V**H * ( B1 B2 ) * Q = ( x  0  )
*                         ( 0  B3 )       ( x  x  )
* ```
*
* or if UPPER is false:
*
* ```text
*   U**H * A * Q = U**H * ( A1 0  ) * Q = ( x  x  )
*                         ( A2 A3 )       ( 0  x  )
* ```
*
* and
*
* ```text
*   V**H * B * Q = V**H * ( B1 0  ) * Q = ( x  x  )
*                         ( B2 B3 )       ( 0  x  )
* ```
*
* where A1, A3, B1, B3 are real and A2, B2 are complex.
*
* @private
* @param {boolean} upper - whether the input matrices are upper triangular
* @param {number} a1 - (1,1) element of A (real)
* @param {Complex128} a2 - off-diagonal element of A (complex)
* @param {number} a3 - (2,2) element of A (real)
* @param {number} b1 - (1,1) element of B (real)
* @param {Complex128} b2 - off-diagonal element of B (complex)
* @param {number} b3 - (2,2) element of B (real)
* @returns {Object} object with properties `csu`, `snuR`, `snuI`, `csv`, `snvR`, `snvI`, `csq`, `snqR`, `snqI`
*/
function zlags2( upper, a1, a2, a3, b1, b2, b3 ) {
	var ua11R2;
	var ua22R2;
	var vb11R2;
	var vb22R2;
	var ua22R;
	var ua11R;
	var vb22R;
	var vb11R;
	var aua11;
	var aua12;
	var aua21;
	var aua22;
	var avb11;
	var avb12;
	var avb21;
	var avb22;
	var ua11I;
	var ua12R;
	var ua12I;
	var ua21R;
	var ua21I;
	var ua22I;
	var vb11I;
	var vb12R;
	var vb12I;
	var vb21R;
	var vb21I;
	var vb22I;
	var snuR;
	var snuI;
	var snvR;
	var snvI;
	var snqR;
	var snqI;
	var d1R;
	var d1I;
	var a2R;
	var a2I;
	var b2R;
	var b2I;
	var csu;
	var csv;
	var csq;
	var csl;
	var csr;
	var snl;
	var snr;
	var svd;
	var out;
	var bR;
	var bI;
	var cR;
	var cI;
	var fb;
	var fc;
	var a;
	var d;

	a2R = real( a2 );
	a2I = imag( a2 );
	b2R = real( b2 );
	b2I = imag( b2 );

	if ( upper ) {
		// Input matrices A and B are upper triangular matrices.
		// Form matrix C = A*adj(B) = ( a b )
		//                             ( 0 d )
		a = a1 * b3;
		d = a3 * b1;

		// B = A2*B1 - A1*B2 (complex: real*complex - real*complex)
		bR = ( a2R * b1 ) - ( a1 * b2R );
		bI = ( a2I * b1 ) - ( a1 * b2I );
		fb = Math.sqrt( ( bR * bR ) + ( bI * bI ) );

		// Transform complex 2-by-2 matrix C to real matrix by unitary

		// Diagonal matrix diag(1, D1).
		d1R = ONE;
		d1I = ZERO;
		if ( fb !== ZERO ) {
			// D1 = B / |B| (complex / real, safe to inline)
			d1R = bR / fb;
			d1I = bI / fb;
		}

		// The SVD of real 2 by 2 triangular C
		svd = dlasv2( a, fb, d );
		snr = svd.snr;
		csr = svd.csr;
		snl = svd.snl;
		csl = svd.csl;

		if ( Math.abs( csl ) >= Math.abs( snl ) || Math.abs( csr ) >= Math.abs( snr ) ) {
			// Compute the (1,1) and (1,2) elements of U**H *A and V**H *B,
			// And (1,2) element of |U|**H *|A| and |V|**H *|B|.
			ua11R = csl * a1;

			// UA12 = CSL*A2 + D1*SNL*A3 (complex: real*complex + complex*real*real)
			ua12R = ( csl * a2R ) + ( ( d1R * snl ) * a3 );
			ua12I = ( csl * a2I ) + ( ( d1I * snl ) * a3 );

			vb11R = csr * b1;

			// VB12 = CSR*B2 + D1*SNR*B3 (complex: real*complex + complex*real*real)
			vb12R = ( csr * b2R ) + ( ( d1R * snr ) * b3 );
			vb12I = ( csr * b2I ) + ( ( d1I * snr ) * b3 );

			aua12 = ( Math.abs( csl ) * abs1( a2R, a2I ) ) + ( Math.abs( snl ) * Math.abs( a3 ) );
			avb12 = ( Math.abs( csr ) * abs1( b2R, b2I ) ) + ( Math.abs( snr ) * Math.abs( b3 ) );

			// Zero (1,2) elements of U**H *A and V**H *B
			if ( ( Math.abs( ua11R ) + abs1( ua12R, ua12I ) ) === ZERO ) {
				// ZLARTG( -DCMPLX(VB11R), DCONJG(VB12), CSQ, SNQ, R )
				out = callZlartg( -vb11R, ZERO, vb12R, -vb12I );
			} else if ( ( Math.abs( vb11R ) + abs1( vb12R, vb12I ) ) === ZERO ) {
				// ZLARTG( -DCMPLX(UA11R), DCONJG(UA12), CSQ, SNQ, R )
				out = callZlartg( -ua11R, ZERO, ua12R, -ua12I );
			} else if ( aua12 / ( Math.abs( ua11R ) + abs1( ua12R, ua12I ) ) <= avb12 / ( Math.abs( vb11R ) + abs1( vb12R, vb12I ) ) ) {
				out = callZlartg( -ua11R, ZERO, ua12R, -ua12I );
			} else {
				out = callZlartg( -vb11R, ZERO, vb12R, -vb12I );
			}
			csq = out.csq;
			snqR = out.snqR;
			snqI = out.snqI;

			csu = csl;

			// SNU = -D1*SNL (complex * real)
			snuR = -d1R * snl;
			snuI = -d1I * snl;
			csv = csr;

			// SNV = -D1*SNR (complex * real)
			snvR = -d1R * snr;
			snvI = -d1I * snr;
		} else {
			// Compute the (2,1) and (2,2) elements of U**H *A and V**H *B,
			// And (2,2) element of |U|**H *|A| and |V|**H *|B|.

			// UA21 = -DCONJG(D1)*SNL*A1 (complex: -conj(D1)*real*real)
			ua21R = -d1R * snl * a1;
			ua21I = d1I * snl * a1;

			// UA22 = -DCONJG(D1)*SNL*A2 + CSL*A3

			// = (-conj(D1)*SNL) * A2 + CSL*A3

			// conj(D1) = (d1R, -d1I), so -conj(D1) = (-d1R, d1I)

			// (-conj(D1)*SNL) * A2 = (-d1R*snl + i*d1I*snl) * (a2R + i*a2I)
			ua22R2 = ( ( -d1R * snl ) * a2R ) - ( ( d1I * snl ) * a2I ) + ( csl * a3 );
			ua22I = ( ( -d1R * snl ) * a2I ) + ( ( d1I * snl ) * a2R );

			// VB21 = -DCONJG(D1)*SNR*B1
			vb21R = -d1R * snr * b1;
			vb21I = d1I * snr * b1;

			// VB22 = -DCONJG(D1)*SNR*B2 + CSR*B3
			vb22R2 = ( ( -d1R * snr ) * b2R ) - ( ( d1I * snr ) * b2I ) + ( csr * b3 );
			vb22I = ( ( -d1R * snr ) * b2I ) + ( ( d1I * snr ) * b2R );

			aua22 = ( Math.abs( snl ) * abs1( a2R, a2I ) ) + ( Math.abs( csl ) * Math.abs( a3 ) );
			avb22 = ( Math.abs( snr ) * abs1( b2R, b2I ) ) + ( Math.abs( csr ) * Math.abs( b3 ) );

			// Zero (2,2) elements of U**H *A and V**H *B, and then swap.
			if ( ( abs1( ua21R, ua21I ) + abs1( ua22R2, ua22I ) ) === ZERO ) {
				// ZLARTG( -DCONJG(VB21), DCONJG(VB22), CSQ, SNQ, R )
				out = callZlartg( -vb21R, vb21I, vb22R2, -vb22I );
			} else if ( ( abs1( vb21R, vb21I ) + abs1( vb22R2, vb22I ) ) === ZERO ) {
				out = callZlartg( -ua21R, ua21I, ua22R2, -ua22I );
			} else if ( aua22 / ( abs1( ua21R, ua21I ) + abs1( ua22R2, ua22I ) ) <= avb22 / ( abs1( vb21R, vb21I ) + abs1( vb22R2, vb22I ) ) ) {
				out = callZlartg( -ua21R, ua21I, ua22R2, -ua22I );
			} else {
				out = callZlartg( -vb21R, vb21I, vb22R2, -vb22I );
			}
			csq = out.csq;
			snqR = out.snqR;
			snqI = out.snqI;

			csu = snl;

			// SNU = D1*CSL (complex * real)
			snuR = d1R * csl;
			snuI = d1I * csl;
			csv = snr;

			// SNV = D1*CSR (complex * real)
			snvR = d1R * csr;
			snvI = d1I * csr;
		}
	} else {
		// Input matrices A and B are lower triangular matrices.
		// Form matrix C = A*adj(B) = ( a 0 )
		//                             ( c d )
		a = a1 * b3;
		d = a3 * b1;

		// C = A2*B3 - A3*B2 (complex: complex*real - real*complex)
		cR = ( a2R * b3 ) - ( a3 * b2R );
		cI = ( a2I * b3 ) - ( a3 * b2I );
		fc = Math.sqrt( ( cR * cR ) + ( cI * cI ) );

		// Transform complex 2-by-2 matrix C to real matrix by unitary

		// Diagonal matrix diag(D1, 1).
		d1R = ONE;
		d1I = ZERO;
		if ( fc !== ZERO ) {
			// D1 = C / |C| (complex / real, safe to inline)
			d1R = cR / fc;
			d1I = cI / fc;
		}

		// The SVD of real 2 by 2 triangular C
		svd = dlasv2( a, fc, d );
		snr = svd.snr;
		csr = svd.csr;
		snl = svd.snl;
		csl = svd.csl;

		if ( Math.abs( csr ) >= Math.abs( snr ) || Math.abs( csl ) >= Math.abs( snl ) ) {
			// Compute the (2,1) and (2,2) elements of U**H *A and V**H *B,
			// And (2,1) element of |U|**H *|A| and |V|**H *|B|.

			// UA21 = -D1*SNR*A1 + CSR*A2 (complex: -complex*real*real + real*complex)
			ua21R = ( -d1R * snr * a1 ) + ( csr * a2R );
			ua21I = ( -d1I * snr * a1 ) + ( csr * a2I );
			ua22R = csr * a3;

			// VB21 = -D1*SNL*B1 + CSL*B2
			vb21R = ( -d1R * snl * b1 ) + ( csl * b2R );
			vb21I = ( -d1I * snl * b1 ) + ( csl * b2I );
			vb22R = csl * b3;

			aua21 = ( Math.abs( snr ) * Math.abs( a1 ) ) + ( Math.abs( csr ) * abs1( a2R, a2I ) );
			avb21 = ( Math.abs( snl ) * Math.abs( b1 ) ) + ( Math.abs( csl ) * abs1( b2R, b2I ) );

			// Zero (2,1) elements of U**H *A and V**H *B.
			if ( ( abs1( ua21R, ua21I ) + Math.abs( ua22R ) ) === ZERO ) {
				// ZLARTG( DCMPLX(VB22R), VB21, CSQ, SNQ, R )
				out = callZlartg( vb22R, ZERO, vb21R, vb21I );
			} else if ( ( abs1( vb21R, vb21I ) + Math.abs( vb22R ) ) === ZERO ) {
				out = callZlartg( ua22R, ZERO, ua21R, ua21I );
			} else if ( aua21 / ( abs1( ua21R, ua21I ) + Math.abs( ua22R ) ) <= avb21 / ( abs1( vb21R, vb21I ) + Math.abs( vb22R ) ) ) {
				out = callZlartg( ua22R, ZERO, ua21R, ua21I );
			} else {
				out = callZlartg( vb22R, ZERO, vb21R, vb21I );
			}
			csq = out.csq;
			snqR = out.snqR;
			snqI = out.snqI;

			csu = csr;

			// SNU = -DCONJG(D1)*SNR (complex: -conj(complex)*real)

			// -conj(D1) = (-d1R, d1I)
			snuR = -d1R * snr;
			snuI = d1I * snr;
			csv = csl;

			// SNV = -DCONJG(D1)*SNL
			snvR = -d1R * snl;
			snvI = d1I * snl;
		} else {
			// Compute the (1,1) and (1,2) elements of U**H *A and V**H *B,
			// And (1,1) element of |U|**H *|A| and |V|**H *|B|.

			// UA11 = CSR*A1 + DCONJG(D1)*SNR*A2 (complex: real*real + conj(complex)*real*complex)
			// conj(D1) = (d1R, -d1I)
			// conj(D1)*SNR = (d1R*snr, -d1I*snr)
			// (d1R*snr - i*d1I*snr) * (a2R + i*a2I)
			ua11R2 = ( csr * a1 ) + ( ( d1R * snr ) * a2R ) + ( ( d1I * snr ) * a2I );
			ua11I = ( ( d1R * snr ) * a2I ) - ( ( d1I * snr ) * a2R );

			// UA12 = DCONJG(D1)*SNR*A3 (complex * real * real)
			ua12R = ( d1R * snr ) * a3;
			ua12I = ( -d1I * snr ) * a3;

			// VB11 = CSL*B1 + DCONJG(D1)*SNL*B2
			vb11R2 = ( csl * b1 ) + ( ( d1R * snl ) * b2R ) + ( ( d1I * snl ) * b2I );
			vb11I = ( ( d1R * snl ) * b2I ) - ( ( d1I * snl ) * b2R );

			// VB12 = DCONJG(D1)*SNL*B3
			vb12R = ( d1R * snl ) * b3;
			vb12I = ( -d1I * snl ) * b3;

			aua11 = ( Math.abs( csr ) * Math.abs( a1 ) ) + ( Math.abs( snr ) * abs1( a2R, a2I ) );
			avb11 = ( Math.abs( csl ) * Math.abs( b1 ) ) + ( Math.abs( snl ) * abs1( b2R, b2I ) );

			// Zero (1,1) elements of U**H *A and V**H *B, and then swap.
			if ( ( abs1( ua11R2, ua11I ) + abs1( ua12R, ua12I ) ) === ZERO ) {
				out = callZlartg( vb12R, vb12I, vb11R2, vb11I );
			} else if ( ( abs1( vb11R2, vb11I ) + abs1( vb12R, vb12I ) ) === ZERO ) {
				out = callZlartg( ua12R, ua12I, ua11R2, ua11I );
			} else if ( aua11 / ( abs1( ua11R2, ua11I ) + abs1( ua12R, ua12I ) ) <= avb11 / ( abs1( vb11R2, vb11I ) + abs1( vb12R, vb12I ) ) ) {
				out = callZlartg( ua12R, ua12I, ua11R2, ua11I );
			} else {
				out = callZlartg( vb12R, vb12I, vb11R2, vb11I );
			}
			csq = out.csq;
			snqR = out.snqR;
			snqI = out.snqI;

			csu = snr;

			// SNU = DCONJG(D1)*CSR (complex: conj(complex)*real)

			// conj(D1) = (d1R, -d1I)
			snuR = d1R * csr;
			snuI = -d1I * csr;
			csv = snl;

			// SNV = DCONJG(D1)*CSL
			snvR = d1R * csl;
			snvI = -d1I * csl;
		}
	}

	return {
		'csu': csu,
		'snuR': snuR,
		'snuI': snuI,
		'csv': csv,
		'snvR': snvR,
		'snvI': snvI,
		'csq': csq,
		'snqR': snqR,
		'snqI': snqI
	};
}


// EXPORTS //

export default zlags2;
