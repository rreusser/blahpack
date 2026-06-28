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

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// FUNCTIONS //

/**
* CABS1: |re(z)| + |im(z)|.
*
* @private
* @param {Float64Array} v - Float64 view
* @param {integer} idx - index of real part
* @returns {number} CABS1 value
*/
function cabs1( v, idx ) {
	return Math.abs( v[ idx ] ) + Math.abs( v[ idx + 1 ] );
}


// MAIN //

/**
* Computes an LU factorization of a complex tridiagonal matrix A using.
* elimination with partial pivoting and row interchanges.
*
* The factorization has the form A = L * U where L is a product of
* permutation and unit lower bidiagonal matrices and U is upper triangular
* with nonzeros in only the main diagonal and first two superdiagonals.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   INFO is returned: 0 = success, k > 0 means U(k,k) is exactly zero (1-based).
* -   All complex array parameters use complex-element strides/offsets.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix
* @param {Complex128Array} DL - sub-diagonal elements (length N-1), overwritten with multipliers
* @param {integer} strideDL - stride for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal elements (length N), overwritten with U diagonal
* @param {integer} strideD - stride for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1), overwritten
* @param {integer} strideDU - stride for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal fill-in (length N-2), output
* @param {integer} strideDU2 - stride for `DU2` (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2` (complex elements)
* @param {Int32Array} IPIV - pivot indices (length N), output, 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @returns {integer} info - 0 if successful, k > 0 if U(k,k) is zero (1-based)
*/
function zgttrf( N, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV ) {
	var sdu2;
	var du2v;
	var idu2;
	var sdl;
	var sdu;
	var dlv;
	var duv;
	var idl;
	var idu;
	var d1r;
	var d1i;
	var den;
	var dv;
	var sd;
	var ip;
	var id;
	var fr;
	var fi;
	var tr;
	var ti;
	var ar;
	var ai;
	var br;
	var bi;
	var i;

	if ( N < 0 ) {
		return -1;
	}
	if ( N === 0 ) {
		return 0;
	}

	// Reinterpret complex arrays as Float64
	dlv = reinterpret( DL, 0 );
	dv = reinterpret( d, 0 );
	duv = reinterpret( DU, 0 );
	du2v = reinterpret( DU2, 0 );

	sdl = strideDL * 2;
	sd = strideD * 2;
	sdu = strideDU * 2;
	sdu2 = strideDU2 * 2;

	// Initialize IPIV(i) = i (0-based) and DU2(i) = 0
	ip = offsetIPIV;
	for ( i = 0; i < N; i++ ) {
		IPIV[ ip ] = i;
		ip += strideIPIV;
	}
	idu2 = offsetDU2 * 2;
	for ( i = 0; i < N - 2; i++ ) {
		du2v[ idu2 ] = 0.0;
		du2v[ idu2 + 1 ] = 0.0;
		idu2 += sdu2;
	}

	// Main elimination loop: i = 0 to N-3
	idl = offsetDL * 2;
	id = offsetD * 2;
	idu = offsetDU * 2;
	idu2 = offsetDU2 * 2;
	ip = offsetIPIV;
	for ( i = 0; i < N - 2; i++ ) {
		if ( cabs1( dv, id ) >= cabs1( dlv, idl ) ) {
			// No row interchange
			if ( cabs1( dv, id ) !== 0.0 ) {
				// Fact = DL(i) / D(i)
				ar = dv[ id ];
				ai = dv[ id + 1 ];
				den = ar * ar + ai * ai;
				fr = ( dlv[ idl ] * ar + dlv[ idl + 1 ] * ai ) / den;
				fi = ( dlv[ idl + 1 ] * ar - dlv[ idl ] * ai ) / den;
				dlv[ idl ] = fr;
				dlv[ idl + 1 ] = fi;

				// D(i+1) -= fact * DU(i)
				dv[ id + sd ] -= ( fr * duv[ idu ] - fi * duv[ idu + 1 ] );
				dv[ id + sd + 1 ] -= ( fr * duv[ idu + 1 ] + fi * duv[ idu ] );
			}
		} else {
			// Interchange rows i and i+1
			// Fact = D(i) / DL(i)
			ar = dlv[ idl ];
			ai = dlv[ idl + 1 ];
			den = ar * ar + ai * ai;
			fr = ( dv[ id ] * ar + dv[ id + 1 ] * ai ) / den;
			fi = ( dv[ id + 1 ] * ar - dv[ id ] * ai ) / den;

			// D(i) = DL(i)
			dv[ id ] = dlv[ idl ];
			dv[ id + 1 ] = dlv[ idl + 1 ];

			// DL(i) = fact
			dlv[ idl ] = fr;
			dlv[ idl + 1 ] = fi;

			// Temp = DU(i)
			tr = duv[ idu ];
			ti = duv[ idu + 1 ];

			// Save D(i+1) before overwriting
			d1r = dv[ id + sd ];
			d1i = dv[ id + sd + 1 ];

			// DU(i) = D(i+1)
			duv[ idu ] = d1r;
			duv[ idu + 1 ] = d1i;

			// D(i+1) = temp - fact * D(i+1)
			dv[ id + sd ] = tr - ( fr * d1r - fi * d1i );
			dv[ id + sd + 1 ] = ti - ( fr * d1i + fi * d1r );

			// DU2(i) = DU(i+1)
			du2v[ idu2 ] = duv[ idu + sdu ];
			du2v[ idu2 + 1 ] = duv[ idu + sdu + 1 ];

			// DU(i+1) = -fact * DU(i+1)
			br = duv[ idu + sdu ];
			bi = duv[ idu + sdu + 1 ];
			duv[ idu + sdu ] = -( fr * br - fi * bi );
			duv[ idu + sdu + 1 ] = -( fr * bi + fi * br );

			IPIV[ ip ] = i + 1;
		}
		idl += sdl;
		id += sd;
		idu += sdu;
		idu2 += sdu2;
		ip += strideIPIV;
	}

	// Handle the last row pair (i = N-2) if N > 1
	if ( N > 1 ) {
		if ( cabs1( dv, id ) >= cabs1( dlv, idl ) ) {
			if ( cabs1( dv, id ) !== 0.0 ) {
				// Fact = DL(i) / D(i)
				ar = dv[ id ];
				ai = dv[ id + 1 ];
				den = ar * ar + ai * ai;
				fr = ( dlv[ idl ] * ar + dlv[ idl + 1 ] * ai ) / den;
				fi = ( dlv[ idl + 1 ] * ar - dlv[ idl ] * ai ) / den;
				dlv[ idl ] = fr;
				dlv[ idl + 1 ] = fi;

				// D(i+1) -= fact * DU(i)
				dv[ id + sd ] -= ( fr * duv[ idu ] - fi * duv[ idu + 1 ] );
				dv[ id + sd + 1 ] -= ( fr * duv[ idu + 1 ] + fi * duv[ idu ] );
			}
		} else {
			ar = dlv[ idl ];
			ai = dlv[ idl + 1 ];
			den = ar * ar + ai * ai;
			fr = ( dv[ id ] * ar + dv[ id + 1 ] * ai ) / den;
			fi = ( dv[ id + 1 ] * ar - dv[ id ] * ai ) / den;

			dv[ id ] = dlv[ idl ];
			dv[ id + 1 ] = dlv[ idl + 1 ];
			dlv[ idl ] = fr;
			dlv[ idl + 1 ] = fi;

			tr = duv[ idu ];
			ti = duv[ idu + 1 ];
			d1r = dv[ id + sd ];
			d1i = dv[ id + sd + 1 ];

			duv[ idu ] = d1r;
			duv[ idu + 1 ] = d1i;

			dv[ id + sd ] = tr - ( fr * d1r - fi * d1i );
			dv[ id + sd + 1 ] = ti - ( fr * d1i + fi * d1r );

			IPIV[ ip ] = i + 1;
		}
	}

	// Check for a zero on the diagonal of U
	id = offsetD * 2;
	for ( i = 0; i < N; i++ ) {
		if ( cabs1( dv, id ) === 0.0 ) {
			return i + 1; // 1-based INFO
		}
		id += sd;
	}

	return 0;
}


// EXPORTS //

export default zgttrf;
