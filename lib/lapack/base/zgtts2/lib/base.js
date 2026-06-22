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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Solves one of the systems of equations A_X = B, A^T_X = B, or A^H*X = B.
* with a complex tridiagonal matrix A using the LU factorization computed by zgttrf.
*
* ## Notes
*
* -   IPIV values are 0-based (Fortran convention is 1-based).
* -   `itrans` is an integer: 0 = no transpose, 1 = transpose, 2 = conjugate transpose.
* -   Complex arrays use complex-element strides/offsets. B strides are in Float64 elements.
*
* @private
* @param {integer} itrans - 0 for A*X=B, 1 for A^T*X=B, 2 for A^H*X=B
* @param {NonNegativeInteger} N - order of the matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of B)
* @param {Complex128Array} DL - multipliers from LU factorization (length N-1)
* @param {integer} strideDL - stride for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal of U (length N)
* @param {integer} strideD - stride for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - first superdiagonal of U (length N-1)
* @param {integer} strideDU - stride for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} DU2 - second superdiagonal of U (length N-2)
* @param {integer} strideDU2 - stride for `DU2` (complex elements)
* @param {NonNegativeInteger} offsetDU2 - starting index for `DU2` (complex elements)
* @param {Int32Array} IPIV - pivot indices (length N), 0-based
* @param {integer} strideIPIV - stride for `IPIV`
* @param {NonNegativeInteger} offsetIPIV - starting index for `IPIV`
* @param {Complex128Array} B - right hand side matrix, overwritten with solution
* @param {integer} strideB1 - stride of the first dimension of `B` (Float64 elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (Float64 elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (Float64 elements)
*/
function zgtts2( itrans, N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, DU2, strideDU2, offsetDU2, IPIV, strideIPIV, offsetIPIV, B, strideB1, strideB2, offsetB ) {
	var du2v;
	var sdu2;
	var idu2;
	var dlv;
	var duv;
	var sdl;
	var sdu;
	var sb1;
	var sb2;
	var idl;
	var idu;
	var dr2;
	var di2;
	var den;
	var dv;
	var bv;
	var sd;
	var ip;
	var id;
	var ib;
	var tr;
	var ti;
	var ar;
	var ai;
	var br;
	var bi;
	var cr;
	var ci;
	var i;
	var j;

	if ( N === 0 || nrhs === 0 ) {
		return;
	}

	dlv = reinterpret( DL, 0 );
	dv = reinterpret( d, 0 );
	duv = reinterpret( DU, 0 );
	du2v = reinterpret( DU2, 0 );
	bv = reinterpret( B, 0 );

	sdl = strideDL * 2;
	sd = strideD * 2;
	sdu = strideDU * 2;
	sdu2 = strideDU2 * 2;
	sb1 = strideB1;
	sb2 = strideB2;

	if ( itrans === 0 ) {
		// Solve A*X = B using the LU factorization of A
		for ( j = 0; j < nrhs; j++ ) {
			// Forward elimination with pivoting (solve L*x = b)
			idl = offsetDL * 2;
			ip = offsetIPIV;
			for ( i = 0; i < N - 1; i++ ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );
				if ( IPIV[ ip ] === i ) {
					// No row interchange: B(i+1,j) -= DL(i) * B(i,j)
					ar = dlv[ idl ];
					ai = dlv[ idl + 1 ];
					br = bv[ ib ];
					bi = bv[ ib + 1 ];
					bv[ ib + sb1 ] -= ( ar * br - ai * bi );
					bv[ ib + sb1 + 1 ] -= ( ar * bi + ai * br );
				} else {
					// Interchange rows i and i+1
					tr = bv[ ib ];
					ti = bv[ ib + 1 ];
					bv[ ib ] = bv[ ib + sb1 ];
					bv[ ib + 1 ] = bv[ ib + sb1 + 1 ];

					// B(i+1,j) = temp - DL(i) * B(i,j) (B(i,j) is now old B(i+1,j))
					ar = dlv[ idl ];
					ai = dlv[ idl + 1 ];
					br = bv[ ib ];
					bi = bv[ ib + 1 ];
					bv[ ib + sb1 ] = tr - ( ar * br - ai * bi );
					bv[ ib + sb1 + 1 ] = ti - ( ar * bi + ai * br );
				}
				idl += sdl;
				ip += strideIPIV;
			}

			// Back substitution (solve U*x = b)
			// B(N-1,j) /= D(N-1)
			ib = offsetB + ( ( N - 1 ) * sb1 ) + ( j * sb2 );
			id = ( offsetD * 2 ) + ( ( N - 1 ) * sd );
			den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
			tr = bv[ ib ];
			ti = bv[ ib + 1 ];
			bv[ ib ] = ( tr * dv[ id ] + ti * dv[ id + 1 ] ) / den;
			bv[ ib + 1 ] = ( ti * dv[ id ] - tr * dv[ id + 1 ] ) / den;

			if ( N > 1 ) {
				// B(N-2,j) = (B(N-2,j) - DU(N-2)*B(N-1,j)) / D(N-2)
				ib = offsetB + ( ( N - 2 ) * sb1 ) + ( j * sb2 );
				id = ( offsetD * 2 ) + ( ( N - 2 ) * sd );
				idu = ( offsetDU * 2 ) + ( ( N - 2 ) * sdu );
				ar = duv[ idu ];
				ai = duv[ idu + 1 ];
				br = bv[ ib + sb1 ];
				bi = bv[ ib + sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );
				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
				bv[ ib ] = ( cr * dv[ id ] + ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] - cr * dv[ id + 1 ] ) / den;
			}

			id = ( offsetD * 2 ) + ( ( N - 3 ) * sd );
			idu = ( offsetDU * 2 ) + ( ( N - 3 ) * sdu );
			idu2 = ( offsetDU2 * 2 ) + ( ( N - 3 ) * sdu2 );
			for ( i = N - 3; i >= 0; i-- ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );

				// B(i) = (B(i) - DU(i)*B(i+1) - DU2(i)*B(i+2)) / D(i)
				ar = duv[ idu ];
				ai = duv[ idu + 1 ];
				br = bv[ ib + sb1 ];
				bi = bv[ ib + sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );

				dr2 = du2v[ idu2 ];
				di2 = du2v[ idu2 + 1 ];
				br = bv[ ib + ( 2 * sb1 ) ];
				bi = bv[ ib + ( 2 * sb1 ) + 1 ];
				cr -= ( dr2 * br - di2 * bi );
				ci -= ( dr2 * bi + di2 * br );

				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
				bv[ ib ] = ( cr * dv[ id ] + ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] - cr * dv[ id + 1 ] ) / den;

				id -= sd;
				idu -= sdu;
				idu2 -= sdu2;
			}
		}
	} else if ( itrans === 1 ) {
		// Solve A^T * X = B (transpose, NOT conjugate)
		for ( j = 0; j < nrhs; j++ ) {
			// Forward substitution: solve U^T*x = b
			ib = offsetB + ( j * sb2 );
			id = offsetD * 2;
			den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
			tr = bv[ ib ];
			ti = bv[ ib + 1 ];
			bv[ ib ] = ( tr * dv[ id ] + ti * dv[ id + 1 ] ) / den;
			bv[ ib + 1 ] = ( ti * dv[ id ] - tr * dv[ id + 1 ] ) / den;

			if ( N > 1 ) {
				idu = offsetDU * 2;
				ib = offsetB + sb1 + ( j * sb2 );
				ar = duv[ idu ];
				ai = duv[ idu + 1 ];
				br = bv[ ib - sb1 ];
				bi = bv[ ib - sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );
				id = ( offsetD * 2 ) + sd;
				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
				bv[ ib ] = ( cr * dv[ id ] + ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] - cr * dv[ id + 1 ] ) / den;
			}

			id = ( offsetD * 2 ) + ( 2 * sd );
			idu = ( offsetDU * 2 ) + sdu;
			idu2 = offsetDU2 * 2;
			for ( i = 2; i < N; i++ ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );
				ar = duv[ idu ];
				ai = duv[ idu + 1 ];
				br = bv[ ib - sb1 ];
				bi = bv[ ib - sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );

				dr2 = du2v[ idu2 ];
				di2 = du2v[ idu2 + 1 ];
				br = bv[ ib - ( 2 * sb1 ) ];
				bi = bv[ ib - ( 2 * sb1 ) + 1 ];
				cr -= ( dr2 * br - di2 * bi );
				ci -= ( dr2 * bi + di2 * br );

				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
				bv[ ib ] = ( cr * dv[ id ] + ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] - cr * dv[ id + 1 ] ) / den;

				id += sd;
				idu += sdu;
				idu2 += sdu2;
			}

			// Back substitution: solve L^T*x = b with pivoting
			idl = ( offsetDL * 2 ) + ( ( N - 2 ) * sdl );
			ip = offsetIPIV + ( ( N - 2 ) * strideIPIV );
			for ( i = N - 2; i >= 0; i-- ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );
				if ( IPIV[ ip ] === i ) {
					ar = dlv[ idl ];
					ai = dlv[ idl + 1 ];
					br = bv[ ib + sb1 ];
					bi = bv[ ib + sb1 + 1 ];
					bv[ ib ] -= ( ar * br - ai * bi );
					bv[ ib + 1 ] -= ( ar * bi + ai * br );
				} else {
					tr = bv[ ib + sb1 ];
					ti = bv[ ib + sb1 + 1 ];
					ar = dlv[ idl ];
					ai = dlv[ idl + 1 ];
					bv[ ib + sb1 ] = bv[ ib ] - ( ar * tr - ai * ti );
					bv[ ib + sb1 + 1 ] = bv[ ib + 1 ] - ( ar * ti + ai * tr );
					bv[ ib ] = tr;
					bv[ ib + 1 ] = ti;
				}
				idl -= sdl;
				ip -= strideIPIV;
			}
		}
	} else {
		// Solve A^H * X = B (conjugate transpose)
		for ( j = 0; j < nrhs; j++ ) {
			// Forward substitution: solve U^H*x = b
			// B(0) /= conj(D(0))
			ib = offsetB + ( j * sb2 );
			id = offsetD * 2;
			den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
			tr = bv[ ib ];
			ti = bv[ ib + 1 ];

			// Divide by conj(D(0)) = (dr, -di): real = (tr*dr - ti*di)/den, imag = (ti*dr + tr*di)/den
			bv[ ib ] = ( tr * dv[ id ] - ti * dv[ id + 1 ] ) / den;
			bv[ ib + 1 ] = ( ti * dv[ id ] + tr * dv[ id + 1 ] ) / den;

			if ( N > 1 ) {
				idu = offsetDU * 2;
				ib = offsetB + sb1 + ( j * sb2 );

				// conj(DU(0))
				ar = duv[ idu ];
				ai = -duv[ idu + 1 ];
				br = bv[ ib - sb1 ];
				bi = bv[ ib - sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );
				id = ( offsetD * 2 ) + sd;
				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];

				// Divide by conj(D(1))
				bv[ ib ] = ( cr * dv[ id ] - ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] + cr * dv[ id + 1 ] ) / den;
			}

			id = ( offsetD * 2 ) + ( 2 * sd );
			idu = ( offsetDU * 2 ) + sdu;
			idu2 = offsetDU2 * 2;
			for ( i = 2; i < N; i++ ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );

				// conj(DU(i-1))
				ar = duv[ idu ];
				ai = -duv[ idu + 1 ];
				br = bv[ ib - sb1 ];
				bi = bv[ ib - sb1 + 1 ];
				cr = bv[ ib ] - ( ar * br - ai * bi );
				ci = bv[ ib + 1 ] - ( ar * bi + ai * br );

				// conj(DU2(i-2))
				dr2 = du2v[ idu2 ];
				di2 = -du2v[ idu2 + 1 ];
				br = bv[ ib - ( 2 * sb1 ) ];
				bi = bv[ ib - ( 2 * sb1 ) + 1 ];
				cr -= ( dr2 * br - di2 * bi );
				ci -= ( dr2 * bi + di2 * br );

				// /= conj(D(i))
				den = dv[ id ] * dv[ id ] + dv[ id + 1 ] * dv[ id + 1 ];
				bv[ ib ] = ( cr * dv[ id ] - ci * dv[ id + 1 ] ) / den;
				bv[ ib + 1 ] = ( ci * dv[ id ] + cr * dv[ id + 1 ] ) / den;

				id += sd;
				idu += sdu;
				idu2 += sdu2;
			}

			// Back substitution: solve L^H*x = b with pivoting
			idl = ( offsetDL * 2 ) + ( ( N - 2 ) * sdl );
			ip = offsetIPIV + ( ( N - 2 ) * strideIPIV );
			for ( i = N - 2; i >= 0; i-- ) {
				ib = offsetB + ( i * sb1 ) + ( j * sb2 );
				if ( IPIV[ ip ] === i ) {
					// conj(DL(i))
					ar = dlv[ idl ];
					ai = -dlv[ idl + 1 ];
					br = bv[ ib + sb1 ];
					bi = bv[ ib + sb1 + 1 ];
					bv[ ib ] -= ( ar * br - ai * bi );
					bv[ ib + 1 ] -= ( ar * bi + ai * br );
				} else {
					tr = bv[ ib + sb1 ];
					ti = bv[ ib + sb1 + 1 ];
					ar = dlv[ idl ];
					ai = -dlv[ idl + 1 ]; // conj
					bv[ ib + sb1 ] = bv[ ib ] - ( ar * tr - ai * ti );
					bv[ ib + sb1 + 1 ] = bv[ ib + 1 ] - ( ar * ti + ai * tr );
					bv[ ib ] = tr;
					bv[ ib + 1 ] = ti;
				}
				idl -= sdl;
				ip -= strideIPIV;
			}
		}
	}
}


// EXPORTS //

export default zgtts2;
