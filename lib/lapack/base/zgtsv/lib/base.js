
// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import cmplx from '../../../../cmplx.js';


// MAIN //

/**
* Solves a complex general tridiagonal system of linear equations A * X = B.
* using Gaussian elimination with partial pivoting.
*
* ## Notes
*
* -   All complex arrays (DL, d, DU, B) are `Complex128Array` with strides and
*     offsets in complex elements. Internally reinterpreted to Float64Array
*     views for efficient indexed access.
* -   Comparison uses CABS1: |re(z)| + |im(z)|.
* -   Complex division uses numerically stable `cmplx.divAt`.
*
* @private
* @param {NonNegativeInteger} N - order of the matrix A
* @param {integer} nrhs - number of right hand sides
* @param {Complex128Array} DL - sub-diagonal elements (length N-1)
* @param {integer} strideDL - stride length for `DL` (complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for `DL` (complex elements)
* @param {Complex128Array} d - diagonal elements (length N)
* @param {integer} strideD - stride length for `d` (complex elements)
* @param {NonNegativeInteger} offsetD - starting index for `d` (complex elements)
* @param {Complex128Array} DU - super-diagonal elements (length N-1)
* @param {integer} strideDU - stride length for `DU` (complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for `DU` (complex elements)
* @param {Complex128Array} B - right hand side matrix (N x nrhs)
* @param {integer} strideB1 - stride of the first dimension of `B` (complex elements)
* @param {integer} strideB2 - stride of the second dimension of `B` (complex elements)
* @param {NonNegativeInteger} offsetB - starting index for `B` (complex elements)
* @returns {integer} status code (0 = success, k > 0 means U(k,k) is zero)
*/
function zgtsv( N, nrhs, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, B, strideB1, strideB2, offsetB ) { // eslint-disable-line max-len, max-params
	var dlv;
	var duv;
	var sdl;
	var sdu;
	var sb1;
	var sb2;
	var idl;
	var idu;
	var dv;
	var bv;
	var sd;
	var id;
	var ib;
	var jb;
	var tr;
	var ti;
	var mr;
	var mi;
	var k;
	var j;

	if ( N === 0 ) {
		return 0;
	}

	// Reinterpret Complex128Arrays to Float64Arrays
	dlv = reinterpret( DL, 0 );
	dv = reinterpret( d, 0 );
	duv = reinterpret( DU, 0 );
	bv = reinterpret( B, 0 );

	// Convert strides/offsets from complex elements to Float64 indices
	sdl = strideDL * 2;
	sd = strideD * 2;
	sdu = strideDU * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;

	idl = offsetDL * 2;
	id = offsetD * 2;
	idu = offsetDU * 2;
	ib = offsetB * 2;

	// Forward elimination: k = 0 .. N-2
	for ( k = 0; k < N - 1; k++ ) {
		if ( dlv[ idl ] === 0.0 && dlv[ idl + 1 ] === 0.0 ) {
			// Subdiagonal is zero, no elimination required
			if ( dv[ id ] === 0.0 && dv[ id + 1 ] === 0.0 ) {
				// Diagonal is zero: singular
				return k + 1;
			}
		} else if ( cmplx.abs1At( dv, id ) >= cmplx.abs1At( dlv, idl ) ) {
			// No row interchange required: MULT = DL(k) / D(k)
			cmplx.divAt( dlv, idl, dlv, idl, dv, id );
			mr = dlv[ idl ];
			mi = dlv[ idl + 1 ];

			// D(k+1) = D(k+1) - MULT * DU(k)

			// (mr + mi*i) * (duv[idu] + duv[idu+1]*i)
			dv[ id + sd ] -= mr * duv[ idu ] - mi * duv[ idu + 1 ];
			dv[ id + sd + 1 ] -= mr * duv[ idu + 1 ] + mi * duv[ idu ];

			// B(k+1, j) -= MULT * B(k, j) for each j
			jb = ib;
			for ( j = 0; j < nrhs; j++ ) {
				// B(k+1,j) -= MULT * B(k,j)
				bv[ jb + sb1 ] -= mr * bv[ jb ] - mi * bv[ jb + 1 ];
				bv[ jb + sb1 + 1 ] -= mr * bv[ jb + 1 ] + mi * bv[ jb ];
				jb += sb2;
			}

			if ( k < N - 2 ) {
				dlv[ idl ] = 0.0;
				dlv[ idl + 1 ] = 0.0;
			}
		} else {
			// Interchange rows k and k+1: MULT = D(k) / DL(k)
			cmplx.divAt( dv, id, dv, id, dlv, idl ); // store mult temporarily in D(k) slot; but we need D(k) = DL(k) first...

			// Actually: mult = D(k) / DL(k), then D(k) = DL(k)

			// We need to be more careful. Let's compute mult first, then overwrite.

			// But divAt already overwrote dv[id]. We stored mult there. Save DL(k) → D(k):
			mr = dv[ id ];     // mult real
			mi = dv[ id + 1 ]; // mult imag
			dv[ id ] = dlv[ idl ];
			dv[ id + 1 ] = dlv[ idl + 1 ];

			// TEMP = D(k+1)
			tr = dv[ id + sd ];
			ti = dv[ id + sd + 1 ];

			// D(k+1) = DU(k) - MULT * TEMP
			dv[ id + sd ] = duv[ idu ] - ( mr * tr - mi * ti );
			dv[ id + sd + 1 ] = duv[ idu + 1 ] - ( mr * ti + mi * tr );

			if ( k < N - 2 ) {
				// DL(k) = DU(k+1)
				dlv[ idl ] = duv[ idu + sdu ];
				dlv[ idl + 1 ] = duv[ idu + sdu + 1 ];

				// DU(k+1) = -MULT * DL(k)  (i.e., -MULT * DU(k+1)_original, which is now in DL(k))
				duv[ idu + sdu ] = -( mr * dlv[ idl ] - mi * dlv[ idl + 1 ] );
				duv[ idu + sdu + 1 ] = -( mr * dlv[ idl + 1 ] + mi * dlv[ idl ] );
			}

			// DU(k) = TEMP
			duv[ idu ] = tr;
			duv[ idu + 1 ] = ti;

			// Swap B rows k and k+1 for each RHS
			jb = ib;
			for ( j = 0; j < nrhs; j++ ) {
				tr = bv[ jb ];
				ti = bv[ jb + 1 ];
				bv[ jb ] = bv[ jb + sb1 ];
				bv[ jb + 1 ] = bv[ jb + sb1 + 1 ];

				// B(k+1,j) = TEMP - MULT * B(k+1,j)  (B(k+1,j) is now the old B(k,j))

				// Wait: after swap, B(k,j) = old B(k+1,j) and B(k+1,j) = old B(k,j) = (tr,ti)

				// Actually: B(k+1,j) = TEMP - MULT * new_B(k,j) = (tr,ti) - MULT * old_B(k+1,j)

				// But we already set bv[jb] = old B(k+1,j). So:
				bv[ jb + sb1 ] = tr - ( mr * bv[ jb ] - mi * bv[ jb + 1 ] );
				bv[ jb + sb1 + 1 ] = ti - ( mr * bv[ jb + 1 ] + mi * bv[ jb ] );
				jb += sb2;
			}
		}

		idl += sdl;
		id += sd;
		idu += sdu;
		ib += sb1;
	}

	// Check last diagonal element
	id = ( offsetD + ( N - 1 ) * strideD ) * 2;
	if ( dv[ id ] === 0.0 && dv[ id + 1 ] === 0.0 ) {
		return N;
	}

	// Back solve with the matrix U from the factorization
	backSolve( N, nrhs, dlv, sdl, offsetDL * 2, dv, sd, offsetD * 2, duv, sdu, offsetDU * 2, bv, sb1, sb2, offsetB * 2 ); // eslint-disable-line max-len

	return 0;
}

/**
* Back substitution: solve U * X = B where U is the upper triangular factor.
*
* All arrays are Float64Array views (interleaved re/im). All strides/offsets
* are in Float64 units.
*
* @private
* @param {NonNegativeInteger} N - order
* @param {integer} nrhs - number of right hand sides
* @param {Float64Array} dlv - second superdiagonal from factorization
* @param {integer} sdl - stride for dlv (Float64)
* @param {NonNegativeInteger} odl - offset for dlv (Float64)
* @param {Float64Array} dv - diagonal of U
* @param {integer} sd - stride for dv (Float64)
* @param {NonNegativeInteger} od - offset for dv (Float64)
* @param {Float64Array} duv - first superdiagonal of U
* @param {integer} sdu - stride for duv (Float64)
* @param {NonNegativeInteger} odu - offset for duv (Float64)
* @param {Float64Array} bv - right hand side / solution
* @param {integer} sb1 - row stride for bv (Float64)
* @param {integer} sb2 - column stride for bv (Float64)
* @param {NonNegativeInteger} ob - offset for bv (Float64)
*/
function backSolve( N, nrhs, dlv, sdl, odl, dv, sd, od, duv, sdu, odu, bv, sb1, sb2, ob ) { // eslint-disable-line max-len, max-params
	var idu;
	var idl;
	var pN;
	var ib;
	var id;
	var j;
	var k;

	pN = od + ( N - 1 ) * sd;

	for ( j = 0; j < nrhs; j++ ) {
		ib = ob + ( N - 1 ) * sb1 + j * sb2;

		// B(N-1, j) = B(N-1, j) / D(N-1)
		cmplx.divAt( bv, ib, bv, ib, dv, pN );

		if ( N > 1 ) {
			// B(N-2, j) = (B(N-2, j) - DU(N-2) * B(N-1, j)) / D(N-2)
			idu = odu + ( N - 2 ) * sdu;
			id = od + ( N - 2 ) * sd;

			// B(N-2, j) -= DU(N-2) * B(N-1, j)
			bv[ ib - sb1 ] -= duv[ idu ] * bv[ ib ] - duv[ idu + 1 ] * bv[ ib + 1 ];
			bv[ ib - sb1 + 1 ] -= duv[ idu ] * bv[ ib + 1 ] + duv[ idu + 1 ] * bv[ ib ];

			// B(N-2, j) /= D(N-2)
			cmplx.divAt( bv, ib - sb1, bv, ib - sb1, dv, id );
		}

		// Back substitute: k = N-3 .. 0 (0-based)
		for ( k = N - 3; k >= 0; k-- ) {
			id = od + k * sd;
			idu = odu + k * sdu;
			idl = odl + k * sdl;
			ib = ob + k * sb1 + j * sb2;

			// B(k,j) -= DU(k) * B(k+1,j)
			bv[ ib ] -= duv[ idu ] * bv[ ib + sb1 ] - duv[ idu + 1 ] * bv[ ib + sb1 + 1 ];
			bv[ ib + 1 ] -= duv[ idu ] * bv[ ib + sb1 + 1 ] + duv[ idu + 1 ] * bv[ ib + sb1 ];

			// B(k,j) -= DL(k) * B(k+2,j)
			bv[ ib ] -= dlv[ idl ] * bv[ ib + 2 * sb1 ] - dlv[ idl + 1 ] * bv[ ib + 2 * sb1 + 1 ];
			bv[ ib + 1 ] -= dlv[ idl ] * bv[ ib + 2 * sb1 + 1 ] + dlv[ idl + 1 ] * bv[ ib + 2 * sb1 ];

			// B(k,j) /= D(k)
			cmplx.divAt( bv, ib, bv, ib, dv, id );
		}
	}
}


// EXPORTS //

export default zgtsv;
