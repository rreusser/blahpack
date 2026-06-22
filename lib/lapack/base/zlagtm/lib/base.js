/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, max-lines, no-mixed-operators */

// MODULES //

import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';


// MAIN //

/**
* Performs a matrix-matrix product of the form `B := α*A*X + β*B` where A is a complex tridiagonal matrix.
*
* Depending on `trans`, computes `B := α*A*X + β*B`, `B := α*A^T*X + β*B`,
* or `B := α*A^H*X + β*B`, where A is an N-by-N complex tridiagonal matrix
* with sub-diagonal DL, diagonal D, and super-diagonal DU; X and B are
* N-by-NRHS matrices; and alpha and beta are real scalars (0, 1, or -1).
*
* @private
* @param {string} trans - specifies the operation: `'no-transpose'`, `'transpose'`, or `'conjugate-transpose'`
* @param {NonNegativeInteger} N - order of the tridiagonal matrix A
* @param {NonNegativeInteger} nrhs - number of right hand sides (columns of X and B)
* @param {number} alpha - real scalar multiplier (must be 0.0, 1.0, or -1.0)
* @param {Complex128Array} DL - sub-diagonal of A (length N-1)
* @param {integer} strideDL - stride for DL (in complex elements)
* @param {NonNegativeInteger} offsetDL - starting index for DL (in complex elements)
* @param {Complex128Array} d - diagonal of A (length N)
* @param {integer} strideD - stride for d (in complex elements)
* @param {NonNegativeInteger} offsetD - starting index for d (in complex elements)
* @param {Complex128Array} DU - super-diagonal of A (length N-1)
* @param {integer} strideDU - stride for DU (in complex elements)
* @param {NonNegativeInteger} offsetDU - starting index for DU (in complex elements)
* @param {Complex128Array} X - input matrix (N x NRHS)
* @param {integer} strideX1 - stride of the first dimension of X (in complex elements)
* @param {integer} strideX2 - stride of the second dimension of X (in complex elements)
* @param {NonNegativeInteger} offsetX - starting index for X (in complex elements)
* @param {number} beta - real scalar multiplier for B (0.0, 1.0, or -1.0)
* @param {Complex128Array} B - input/output matrix (N x NRHS)
* @param {integer} strideB1 - stride of the first dimension of B (in complex elements)
* @param {integer} strideB2 - stride of the second dimension of B (in complex elements)
* @param {NonNegativeInteger} offsetB - starting index for B (in complex elements)
*/
function zlagtm( trans, N, nrhs, alpha, DL, strideDL, offsetDL, d, strideD, offsetD, DU, strideDU, offsetDU, X, strideX1, strideX2, offsetX, beta, B, strideB1, strideB2, offsetB ) {
	var DUv;
	var DLv;
	var sdl;
	var sdu;
	var oDU;
	var oDL;
	var sx1;
	var sx2;
	var sb1;
	var sb2;
	var Bv;
	var Xv;
	var dv;
	var oD;
	var oX;
	var oB;
	var sd;
	var pb;
	var px;
	var ar;
	var ai;
	var xr;
	var xi;
	var tr;
	var ti;
	var i;
	var j;

	if ( N === 0 ) {
		return;
	}

	// Reinterpret Complex128Arrays as Float64Arrays
	Bv = reinterpret( B, 0 );
	Xv = reinterpret( X, 0 );
	DLv = reinterpret( DL, 0 );
	dv = reinterpret( d, 0 );
	DUv = reinterpret( DU, 0 );

	// Convert complex-element strides/offsets to Float64 strides/offsets
	sdl = strideDL * 2;
	sd = strideD * 2;
	sdu = strideDU * 2;
	sx1 = strideX1 * 2;
	sx2 = strideX2 * 2;
	sb1 = strideB1 * 2;
	sb2 = strideB2 * 2;
	oDL = offsetDL * 2;
	oD = offsetD * 2;
	oDU = offsetDU * 2;
	oX = offsetX * 2;
	oB = offsetB * 2;

	// Scale B by beta
	if ( beta === 0.0 ) {
		for ( j = 0; j < nrhs; j += 1 ) {
			pb = oB + ( j * sb2 );
			for ( i = 0; i < N; i += 1 ) {
				Bv[ pb ] = 0.0;
				Bv[ pb + 1 ] = 0.0;
				pb += sb1;
			}
		}
	} else if ( beta === -1.0 ) {
		for ( j = 0; j < nrhs; j += 1 ) {
			pb = oB + ( j * sb2 );
			for ( i = 0; i < N; i += 1 ) {
				Bv[ pb ] = -Bv[ pb ];
				Bv[ pb + 1 ] = -Bv[ pb + 1 ];
				pb += sb1;
			}
		}
	}

	// beta === 1.0: leave B unchanged

	if ( alpha === 1.0 ) {
		if ( trans === 'no-transpose' ) {
			// B += A * X
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					// B[0,j] += D[0] * X[0,j]
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] += ar * xr - ai * xi;
					Bv[ pb + 1 ] += ar * xi + ai * xr;
				} else {
					// First row: B[0,j] += D[0]*X[0,j] + DU[0]*X[1,j]
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DUv[ oDU ];
					ai = DUv[ oDU + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] += tr;
					Bv[ pb + 1 ] += ti;

					// Last row: B[N-1,j] += DL[N-2]*X[N-2,j] + D[N-1]*X[N-1,j]
					ar = DLv[ oDL + ( ( N - 2 ) * sdl ) ];
					ai = DLv[ oDL + ( ( N - 2 ) * sdl ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] += tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] += ti;

					// Middle rows: B[i,j] += DL[i-1]*X[i-1,j] + D[i]*X[i,j] + DU[i]*X[i+1,j]
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DLv[ oDL + ( ( i - 1 ) * sdl ) ];
						ai = DLv[ oDL + ( ( i - 1 ) * sdl ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DUv[ oDU + ( i * sdu ) ];
						ai = DUv[ oDU + ( i * sdu ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] += tr;
						Bv[ pb + ( i * sb1 ) + 1 ] += ti;
					}
				}
			}
		} else if ( trans === 'transpose' ) {
			// B += A^T * X
			// A^T has: super-diag of A becomes sub-diag of A^T and vice versa
			// Row i of A^T = column i of A:
			//   A^T[i,i-1] = DU[i-1], A^T[i,i] = D[i], A^T[i,i+1] = DL[i]
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					// B[0,j] += D[0] * X[0,j]
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] += ar * xr - ai * xi;
					Bv[ pb + 1 ] += ar * xi + ai * xr;
				} else {
					// First row: B[0,j] += D[0]*X[0,j] + DL[0]*X[1,j]
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DLv[ oDL ];
					ai = DLv[ oDL + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] += tr;
					Bv[ pb + 1 ] += ti;

					// Last row: B[N-1,j] += DU[N-2]*X[N-2,j] + D[N-1]*X[N-1,j]
					ar = DUv[ oDU + ( ( N - 2 ) * sdu ) ];
					ai = DUv[ oDU + ( ( N - 2 ) * sdu ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] += tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] += ti;

					// Middle rows: B[i,j] += DU[i-1]*X[i-1,j] + D[i]*X[i,j] + DL[i]*X[i+1,j]
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DUv[ oDU + ( ( i - 1 ) * sdu ) ];
						ai = DUv[ oDU + ( ( i - 1 ) * sdu ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DLv[ oDL + ( i * sdl ) ];
						ai = DLv[ oDL + ( i * sdl ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] += tr;
						Bv[ pb + ( i * sb1 ) + 1 ] += ti;
					}
				}
			}
		} else {
			// trans === 'conjugate-transpose'
			// B += A^H * X
			// A^H[i,i-1] = conj(DU[i-1]), A^H[i,i] = conj(D[i]), A^H[i,i+1] = conj(DL[i])
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					// B[0,j] += conj(D[0]) * X[0,j]
					ar = dv[ oD ];
					ai = -dv[ oD + 1 ]; // conjugate
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] += ar * xr - ai * xi;
					Bv[ pb + 1 ] += ar * xi + ai * xr;
				} else {
					// First row: B[0,j] += conj(D[0])*X[0,j] + conj(DL[0])*X[1,j]
					ar = dv[ oD ];
					ai = -dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DLv[ oDL ];
					ai = -DLv[ oDL + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] += tr;
					Bv[ pb + 1 ] += ti;

					// Last row: B[N-1,j] += conj(DU[N-2])*X[N-2,j] + conj(D[N-1])*X[N-1,j]
					ar = DUv[ oDU + ( ( N - 2 ) * sdu ) ];
					ai = -DUv[ oDU + ( ( N - 2 ) * sdu ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = -dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] += tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] += ti;

					// Middle rows: B[i,j] += conj(DU[i-1])*X[i-1,j] + conj(D[i])*X[i,j] + conj(DL[i])*X[i+1,j]
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DUv[ oDU + ( ( i - 1 ) * sdu ) ];
						ai = -DUv[ oDU + ( ( i - 1 ) * sdu ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = -dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DLv[ oDL + ( i * sdl ) ];
						ai = -DLv[ oDL + ( i * sdl ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] += tr;
						Bv[ pb + ( i * sb1 ) + 1 ] += ti;
					}
				}
			}
		}
	} else if ( alpha === -1.0 ) {
		if ( trans === 'no-transpose' ) {
			// B -= A * X
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] -= ar * xr - ai * xi;
					Bv[ pb + 1 ] -= ar * xi + ai * xr;
				} else {
					// First row
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DUv[ oDU ];
					ai = DUv[ oDU + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] -= tr;
					Bv[ pb + 1 ] -= ti;

					// Last row
					ar = DLv[ oDL + ( ( N - 2 ) * sdl ) ];
					ai = DLv[ oDL + ( ( N - 2 ) * sdl ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] -= tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] -= ti;

					// Middle rows
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DLv[ oDL + ( ( i - 1 ) * sdl ) ];
						ai = DLv[ oDL + ( ( i - 1 ) * sdl ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DUv[ oDU + ( i * sdu ) ];
						ai = DUv[ oDU + ( i * sdu ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] -= tr;
						Bv[ pb + ( i * sb1 ) + 1 ] -= ti;
					}
				}
			}
		} else if ( trans === 'transpose' ) {
			// B -= A^T * X
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] -= ar * xr - ai * xi;
					Bv[ pb + 1 ] -= ar * xi + ai * xr;
				} else {
					// First row
					ar = dv[ oD ];
					ai = dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DLv[ oDL ];
					ai = DLv[ oDL + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] -= tr;
					Bv[ pb + 1 ] -= ti;

					// Last row
					ar = DUv[ oDU + ( ( N - 2 ) * sdu ) ];
					ai = DUv[ oDU + ( ( N - 2 ) * sdu ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] -= tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] -= ti;

					// Middle rows
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DUv[ oDU + ( ( i - 1 ) * sdu ) ];
						ai = DUv[ oDU + ( ( i - 1 ) * sdu ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DLv[ oDL + ( i * sdl ) ];
						ai = DLv[ oDL + ( i * sdl ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] -= tr;
						Bv[ pb + ( i * sb1 ) + 1 ] -= ti;
					}
				}
			}
		} else {
			// trans === 'conjugate-transpose'
			// B -= A^H * X
			for ( j = 0; j < nrhs; j += 1 ) {
				px = oX + ( j * sx2 );
				pb = oB + ( j * sb2 );
				if ( N === 1 ) {
					ar = dv[ oD ];
					ai = -dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					Bv[ pb ] -= ar * xr - ai * xi;
					Bv[ pb + 1 ] -= ar * xi + ai * xr;
				} else {
					// First row
					ar = dv[ oD ];
					ai = -dv[ oD + 1 ];
					xr = Xv[ px ];
					xi = Xv[ px + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = DLv[ oDL ];
					ai = -DLv[ oDL + 1 ];
					xr = Xv[ px + sx1 ];
					xi = Xv[ px + sx1 + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb ] -= tr;
					Bv[ pb + 1 ] -= ti;

					// Last row
					ar = DUv[ oDU + ( ( N - 2 ) * sdu ) ];
					ai = -DUv[ oDU + ( ( N - 2 ) * sdu ) + 1 ];
					xr = Xv[ px + ( ( N - 2 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 2 ) * sx1 ) + 1 ];
					tr = ar * xr - ai * xi;
					ti = ar * xi + ai * xr;

					ar = dv[ oD + ( ( N - 1 ) * sd ) ];
					ai = -dv[ oD + ( ( N - 1 ) * sd ) + 1 ];
					xr = Xv[ px + ( ( N - 1 ) * sx1 ) ];
					xi = Xv[ px + ( ( N - 1 ) * sx1 ) + 1 ];
					tr += ar * xr - ai * xi;
					ti += ar * xi + ai * xr;

					Bv[ pb + ( ( N - 1 ) * sb1 ) ] -= tr;
					Bv[ pb + ( ( N - 1 ) * sb1 ) + 1 ] -= ti;

					// Middle rows
					for ( i = 1; i < N - 1; i += 1 ) {
						ar = DUv[ oDU + ( ( i - 1 ) * sdu ) ];
						ai = -DUv[ oDU + ( ( i - 1 ) * sdu ) + 1 ];
						xr = Xv[ px + ( ( i - 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i - 1 ) * sx1 ) + 1 ];
						tr = ar * xr - ai * xi;
						ti = ar * xi + ai * xr;

						ar = dv[ oD + ( i * sd ) ];
						ai = -dv[ oD + ( i * sd ) + 1 ];
						xr = Xv[ px + ( i * sx1 ) ];
						xi = Xv[ px + ( i * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						ar = DLv[ oDL + ( i * sdl ) ];
						ai = -DLv[ oDL + ( i * sdl ) + 1 ];
						xr = Xv[ px + ( ( i + 1 ) * sx1 ) ];
						xi = Xv[ px + ( ( i + 1 ) * sx1 ) + 1 ];
						tr += ar * xr - ai * xi;
						ti += ar * xi + ai * xr;

						Bv[ pb + ( i * sb1 ) ] -= tr;
						Bv[ pb + ( i * sb1 ) + 1 ] -= ti;
					}
				}
			}
		}
	}

	// alpha === 0.0: no multiply needed
}


// EXPORTS //

export default zlagtm;
