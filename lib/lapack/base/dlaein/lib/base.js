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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dasum from './../../../../blas/base/dasum/lib/base.js';
import idamax from './../../../../blas/base/idamax/lib/base.js';
import dnrm2 from './../../../../blas/base/dnrm2/lib/base.js';
import dscal from './../../../../blas/base/dscal/lib/base.js';
import dladiv from './../../dladiv/lib/base.js';
import dlapy2 from './../../dlapy2/lib/base.js';
import dlatrs from './../../dlatrs/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TENTH = 1.0e-1;


// MAIN //

/**
* Uses inverse iteration to find a right or left eigenvector of a real upper Hessenberg matrix H corresponding to a specified eigenvalue.
*
* ## Notes
*
* On entry, if NOINIT is true, the initial eigenvector estimate is generated internally; otherwise VR (and VI for complex) is used. On exit, VR (and VI) contains the normalized eigenvector. INFO = 0 on success, INFO = 1 if inverse iteration failed to converge.
*
* @private
* @param {boolean} rightv - if true, compute a right eigenvector; if false, a left eigenvector
* @param {boolean} noinit - if true, generate the initial vector internally; if false, use VR (and VI) as supplied
* @param {NonNegativeInteger} N - order of the matrix H
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - stride of the first dimension of `H`
* @param {integer} strideH2 - stride of the second dimension of `H`
* @param {NonNegativeInteger} offsetH - starting index for `H`
* @param {number} wr - real part of the eigenvalue
* @param {number} wi - imaginary part of the eigenvalue (zero for a real eigenvalue)
* @param {Float64Array} VR - on entry, initial real part of eigenvector (if noinit is false); on exit, the real part of the computed eigenvector
* @param {integer} strideVR - stride length for `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} VI - on entry, initial imaginary part (if noinit is false and complex); on exit, the imaginary part of the computed eigenvector
* @param {integer} strideVI - stride length for `VI`
* @param {NonNegativeInteger} offsetVI - starting index for `VI`
* @param {Float64Array} B - workspace matrix, leading dimension must be at least N+1 (complex case needs row N+1)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} WORK - real workspace of length N (used by complex path)
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {number} eps3 - small machine-dependent value used to perturb close eigenvalues
* @param {number} smlnum - a machine-dependent lower bound
* @param {number} bignum - a machine-dependent upper bound (typically 1/smlnum)
* @returns {integer} info - 0 on success, 1 if inverse iteration failed to converge
*/
function dlaein( rightv, noinit, N, H, strideH1, strideH2, offsetH, wr, wi, VR, strideVR, offsetVR, VI, strideVI, offsetVI, B, strideB1, strideB2, offsetB, WORK, strideWORK, offsetWORK, eps3, smlnum, bignum ) {
	var dladivOut;
	var absbii;
	var absbjj;
	var nrmsml;
	var growto;
	var normin;
	var scaleA;
	var vnorm;
	var rootn;
	var trans;
	var scale;
	var vcrit;
	var info;
	var norm;
	var temp;
	var vmax;
	var sVR;
	var sVI;
	var sB1;
	var sB2;
	var sH1;
	var sH2;
	var sWK;
	var oVR;
	var oVI;
	var oWK;
	var its;
	var rec;
	var oH;
	var oB;
	var i1;
	var i2;
	var i3;
	var xr;
	var xi;
	var ej;
	var ei;
	var w1;
	var x;
	var y;
	var w;
	var i;
	var j;

	info = 0;

	// DLATRS scale is returned via length-1 array:
	scale = new Float64Array( 1 );
	dladivOut = new Float64Array( 2 );

	sH1 = strideH1;
	sH2 = strideH2;
	sB1 = strideB1;
	sB2 = strideB2;
	sVR = strideVR;
	sVI = strideVI;
	sWK = strideWORK;
	oH = offsetH;
	oB = offsetB;
	oVR = offsetVR;
	oVI = offsetVI;
	oWK = offsetWORK;

	if ( N <= 0 ) {
		return info;
	}

	rootn = Math.sqrt( N );
	growto = TENTH / rootn;
	nrmsml = Math.max( ONE, eps3 * rootn ) * smlnum;

	// Form B = H - wr*I (copy H into B):
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < j; i++ ) {
			B[ oB + ( i * sB1 ) + ( j * sB2 ) ] = H[ oH + ( i * sH1 ) + ( j * sH2 ) ];
		}
		B[ oB + ( j * sB1 ) + ( j * sB2 ) ] = H[ oH + ( j * sH1 ) + ( j * sH2 ) ] - wr;
	}

	if ( wi === ZERO ) {
		// Real eigenvalue.
		if ( noinit ) {
			// EPS3 initial vector:
			for ( i = 0; i < N; i++ ) {
				VR[ oVR + ( i * sVR ) ] = eps3;
			}
		} else {
			// Scale supplied initial vector:
			vnorm = dnrm2( N, VR, sVR, oVR );
			dscal( N, ( eps3 * rootn ) / Math.max( vnorm, nrmsml ), VR, sVR, oVR );
		}

		if ( rightv ) {
			// Reduce B to upper triangular using row operations from below.
			for ( i = 0; i < N - 1; i++ ) {
				ei = H[ oH + ( ( i + 1 ) * sH1 ) + ( i * sH2 ) ];
				if ( Math.abs( B[ oB + ( i * sB1 ) + ( i * sB2 ) ] ) < Math.abs( ei ) ) {
					// Interchange rows and eliminate.
					x = B[ oB + ( i * sB1 ) + ( i * sB2 ) ] / ei;
					B[ oB + ( i * sB1 ) + ( i * sB2 ) ] = ei;
					for ( j = i + 1; j < N; j++ ) {
						temp = B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ];
						B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] = B[ oB + ( i * sB1 ) + ( j * sB2 ) ] - ( x * temp );
						B[ oB + ( i * sB1 ) + ( j * sB2 ) ] = temp;
					}
				} else {
					if ( B[ oB + ( i * sB1 ) + ( i * sB2 ) ] === ZERO ) {
						B[ oB + ( i * sB1 ) + ( i * sB2 ) ] = eps3;
					}
					x = ei / B[ oB + ( i * sB1 ) + ( i * sB2 ) ];
					if ( x !== ZERO ) {
						for ( j = i + 1; j < N; j++ ) {
							B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] -= x * B[ oB + ( i * sB1 ) + ( j * sB2 ) ];
						}
					}
				}
			}
			if ( B[ oB + ( ( N - 1 ) * sB1 ) + ( ( N - 1 ) * sB2 ) ] === ZERO ) {
				B[ oB + ( ( N - 1 ) * sB1 ) + ( ( N - 1 ) * sB2 ) ] = eps3;
			}
			trans = 'no-transpose';
		} else {
			// Reduce B to lower triangular using column operations from right.
			for ( j = N - 1; j >= 1; j-- ) {
				ej = H[ oH + ( j * sH1 ) + ( ( j - 1 ) * sH2 ) ];
				if ( Math.abs( B[ oB + ( j * sB1 ) + ( j * sB2 ) ] ) < Math.abs( ej ) ) {
					x = B[ oB + ( j * sB1 ) + ( j * sB2 ) ] / ej;
					B[ oB + ( j * sB1 ) + ( j * sB2 ) ] = ej;
					for ( i = 0; i < j; i++ ) {
						temp = B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ];
						B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ] = B[ oB + ( i * sB1 ) + ( j * sB2 ) ] - ( x * temp );
						B[ oB + ( i * sB1 ) + ( j * sB2 ) ] = temp;
					}
				} else {
					if ( B[ oB + ( j * sB1 ) + ( j * sB2 ) ] === ZERO ) {
						B[ oB + ( j * sB1 ) + ( j * sB2 ) ] = eps3;
					}
					x = ej / B[ oB + ( j * sB1 ) + ( j * sB2 ) ];
					if ( x !== ZERO ) {
						for ( i = 0; i < j; i++ ) {
							B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ] -= x * B[ oB + ( i * sB1 ) + ( j * sB2 ) ];
						}
					}
				}
			}
			if ( B[ oB ] === ZERO ) {
				B[ oB ] = eps3;
			}
			trans = 'transpose';
		}

		normin = 'no';
		for ( its = 0; its < N; its++ ) {
			dlatrs( 'upper', trans, 'non-unit', normin, N, B, sB1, sB2, oB, VR, sVR, oVR, scale, WORK, sWK, oWK );
			normin = 'yes';

			vnorm = dasum( N, VR, sVR, oVR );
			if ( vnorm >= growto * scale[ 0 ] ) {
				// Converged.
				break;
			}

			// Choose new orthogonal starting vector and try again.
			temp = eps3 / ( rootn + ONE );
			VR[ oVR ] = eps3;
			for ( i = 1; i < N; i++ ) {
				VR[ oVR + ( i * sVR ) ] = temp;
			}
			VR[ oVR + ( ( N - 1 - its ) * sVR ) ] -= eps3 * rootn;
		}
		if ( its >= N ) {
			info = 1;
		}

		// Normalize eigenvector so that largest component has magnitude 1.
		i = idamax( N, VR, sVR, oVR );
		dscal( N, ONE / Math.abs( VR[ oVR + ( i * sVR ) ] ), VR, sVR, oVR );
	} else {
		// Complex eigenvalue: use same B for (H - wr*I); imaginary part stored implicitly.
		if ( noinit ) {
			for ( i = 0; i < N; i++ ) {
				VR[ oVR + ( i * sVR ) ] = eps3;
				VI[ oVI + ( i * sVI ) ] = ZERO;
			}
		} else {
			norm = dlapy2( dnrm2( N, VR, sVR, oVR ), dnrm2( N, VI, sVI, oVI ) );
			rec = ( eps3 * rootn ) / Math.max( norm, nrmsml );
			dscal( N, rec, VR, sVR, oVR );
			dscal( N, rec, VI, sVI, oVI );
		}

		if ( rightv ) {
			// B( 2, 1 ) = -WI (Fortran 1-based, JS index (1,0))
			B[ oB + sB1 ] = -wi;
			for ( i = 1; i < N; i++ ) {
				// B( I+1, 1 ) = 0 for I = 2..N => rows 2..N (0-based rows 2..N)
				B[ oB + ( ( i + 1 ) * sB1 ) ] = ZERO;
			}
			// Reduce (H - (wr + i*wi)*I) to upper quasi-triangular. The imag
			// Multiplications are stored in the strictly lower triangle of B
			// (rows I+1..N+1 below the diagonal pattern) per LAPACK layout.
			for ( i = 0; i < N - 1; i++ ) {
				absbii = dlapy2( B[ oB + ( i * sB1 ) + ( i * sB2 ) ], B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] );
				ei = H[ oH + ( ( i + 1 ) * sH1 ) + ( i * sH2 ) ];
				if ( absbii < Math.abs( ei ) ) {
					// Interchange rows and eliminate.
					xr = B[ oB + ( i * sB1 ) + ( i * sB2 ) ] / ei;
					xi = B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] / ei;
					B[ oB + ( i * sB1 ) + ( i * sB2 ) ] = ei;
					B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] = ZERO;
					for ( j = i + 1; j < N; j++ ) {
						temp = B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ];
						B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] = B[ oB + ( i * sB1 ) + ( j * sB2 ) ] - ( xr * temp );
						B[ oB + ( ( j + 1 ) * sB1 ) + ( ( i + 1 ) * sB2 ) ] = B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] - ( xi * temp );
						B[ oB + ( i * sB1 ) + ( j * sB2 ) ] = temp;
						B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] = ZERO;
					}
					B[ oB + ( ( i + 2 ) * sB1 ) + ( i * sB2 ) ] = -wi;
					B[ oB + ( ( i + 1 ) * sB1 ) + ( ( i + 1 ) * sB2 ) ] -= xi * wi;
					B[ oB + ( ( i + 2 ) * sB1 ) + ( ( i + 1 ) * sB2 ) ] += xr * wi;
				} else {
					if ( absbii === ZERO ) {
						B[ oB + ( i * sB1 ) + ( i * sB2 ) ] = eps3;
						B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] = ZERO;
						absbii = eps3;
					}
					ei = ( ei / absbii ) / absbii;
					xr = B[ oB + ( i * sB1 ) + ( i * sB2 ) ] * ei;
					xi = -B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] * ei;
					for ( j = i + 1; j < N; j++ ) {
						B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] += ( -xr * B[ oB + ( i * sB1 ) + ( j * sB2 ) ] ) + ( xi * B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] );
						B[ oB + ( ( j + 1 ) * sB1 ) + ( ( i + 1 ) * sB2 ) ] = ( -xr * B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] ) - ( xi * B[ oB + ( i * sB1 ) + ( j * sB2 ) ] );
					}
					B[ oB + ( ( i + 2 ) * sB1 ) + ( ( i + 1 ) * sB2 ) ] -= wi;
				}

				// WORK( I ) = |row i+1..N of row I| + |col rows I+2..N+1 of col I|
				WORK[ oWK + ( i * sWK ) ] = dasum( N - 1 - i, B, sB2, oB + ( i * sB1 ) + ( ( i + 1 ) * sB2 ) ) + dasum( N - 1 - i, B, sB1, oB + ( ( i + 2 ) * sB1 ) + ( i * sB2 ) );
			}
			if ( B[ oB + ( ( N - 1 ) * sB1 ) + ( ( N - 1 ) * sB2 ) ] === ZERO && B[ oB + ( N * sB1 ) + ( ( N - 1 ) * sB2 ) ] === ZERO ) {
				B[ oB + ( ( N - 1 ) * sB1 ) + ( ( N - 1 ) * sB2 ) ] = eps3;
			}
			WORK[ oWK + ( ( N - 1 ) * sWK ) ] = ZERO;

			i1 = N - 1;
			i2 = 0;
			i3 = -1;
		} else {
			// Left complex vector path. Fortran: B(N+1, N) = WI (1-based) => row N (0-based) col N-1.
			B[ oB + ( N * sB1 ) + ( ( N - 1 ) * sB2 ) ] = wi;
			for ( j = 0; j < N - 1; j++ ) {
				B[ oB + ( N * sB1 ) + ( j * sB2 ) ] = ZERO;
			}

			for ( j = N - 1; j >= 1; j-- ) {
				ej = H[ oH + ( j * sH1 ) + ( ( j - 1 ) * sH2 ) ];
				absbjj = dlapy2( B[ oB + ( j * sB1 ) + ( j * sB2 ) ], B[ oB + ( ( j + 1 ) * sB1 ) + ( j * sB2 ) ] );
				if ( absbjj < Math.abs( ej ) ) {
					xr = B[ oB + ( j * sB1 ) + ( j * sB2 ) ] / ej;
					xi = B[ oB + ( ( j + 1 ) * sB1 ) + ( j * sB2 ) ] / ej;
					B[ oB + ( j * sB1 ) + ( j * sB2 ) ] = ej;
					B[ oB + ( ( j + 1 ) * sB1 ) + ( j * sB2 ) ] = ZERO;
					for ( i = 0; i < j; i++ ) {
						temp = B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ];
						B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ] = B[ oB + ( i * sB1 ) + ( j * sB2 ) ] - ( xr * temp );
						B[ oB + ( j * sB1 ) + ( i * sB2 ) ] = B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] - ( xi * temp );
						B[ oB + ( i * sB1 ) + ( j * sB2 ) ] = temp;
						B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] = ZERO;
					}
					B[ oB + ( ( j + 1 ) * sB1 ) + ( ( j - 1 ) * sB2 ) ] = wi;
					B[ oB + ( ( j - 1 ) * sB1 ) + ( ( j - 1 ) * sB2 ) ] += xi * wi;
					B[ oB + ( j * sB1 ) + ( ( j - 1 ) * sB2 ) ] -= xr * wi;
				} else {
					if ( absbjj === ZERO ) {
						B[ oB + ( j * sB1 ) + ( j * sB2 ) ] = eps3;
						B[ oB + ( ( j + 1 ) * sB1 ) + ( j * sB2 ) ] = ZERO;
						absbjj = eps3;
					}
					ej = ( ej / absbjj ) / absbjj;
					xr = B[ oB + ( j * sB1 ) + ( j * sB2 ) ] * ej;
					xi = -B[ oB + ( ( j + 1 ) * sB1 ) + ( j * sB2 ) ] * ej;
					for ( i = 0; i < j; i++ ) {
						B[ oB + ( i * sB1 ) + ( ( j - 1 ) * sB2 ) ] += ( -xr * B[ oB + ( i * sB1 ) + ( j * sB2 ) ] ) + ( xi * B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] );
						B[ oB + ( j * sB1 ) + ( i * sB2 ) ] = ( -xr * B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] ) - ( xi * B[ oB + ( i * sB1 ) + ( j * sB2 ) ] );
					}
					B[ oB + ( j * sB1 ) + ( ( j - 1 ) * sB2 ) ] += wi;
				}

				// WORK( J ) = sum over col J rows 1..J-1 of |B| + sum over row J+1 cols 1..J-1 of |B|
				WORK[ oWK + ( j * sWK ) ] = dasum( j, B, sB1, oB + ( j * sB2 ) ) + dasum( j, B, sB2, oB + ( ( j + 1 ) * sB1 ) );
			}
			if ( B[ oB ] === ZERO && B[ oB + sB1 ] === ZERO ) {
				B[ oB ] = eps3;
			}
			WORK[ oWK ] = ZERO;

			i1 = 0;
			i2 = N - 1;
			i3 = 1;
		}

		// Main inverse-iteration loop for complex eigenvalue.
		for ( its = 0; its < N; its++ ) {
			scaleA = ONE;
			vmax = ONE;
			vcrit = bignum;

			i = i1;
			while ( true ) {
				if ( WORK[ oWK + ( i * sWK ) ] > vcrit ) {
					rec = ONE / vmax;
					dscal( N, rec, VR, sVR, oVR );
					dscal( N, rec, VI, sVI, oVI );
					scaleA *= rec;
					vmax = ONE;
					vcrit = bignum;
				}

				xr = VR[ oVR + ( i * sVR ) ];
				xi = VI[ oVI + ( i * sVI ) ];
				if ( rightv ) {
					for ( j = i + 1; j < N; j++ ) {
						xr = xr - ( B[ oB + ( i * sB1 ) + ( j * sB2 ) ] * VR[ oVR + ( j * sVR ) ] ) + ( B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] * VI[ oVI + ( j * sVI ) ] );
						xi = xi - ( B[ oB + ( i * sB1 ) + ( j * sB2 ) ] * VI[ oVI + ( j * sVI ) ] ) - ( B[ oB + ( ( j + 1 ) * sB1 ) + ( i * sB2 ) ] * VR[ oVR + ( j * sVR ) ] );
					}
				} else {
					for ( j = 0; j < i; j++ ) {
						xr = xr - ( B[ oB + ( j * sB1 ) + ( i * sB2 ) ] * VR[ oVR + ( j * sVR ) ] ) + ( B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] * VI[ oVI + ( j * sVI ) ] );
						xi = xi - ( B[ oB + ( j * sB1 ) + ( i * sB2 ) ] * VI[ oVI + ( j * sVI ) ] ) - ( B[ oB + ( ( i + 1 ) * sB1 ) + ( j * sB2 ) ] * VR[ oVR + ( j * sVR ) ] );
					}
				}

				w = Math.abs( B[ oB + ( i * sB1 ) + ( i * sB2 ) ] ) + Math.abs( B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ] );
				if ( w > smlnum ) {
					if ( w < ONE ) {
						w1 = Math.abs( xr ) + Math.abs( xi );
						if ( w1 > w * bignum ) {
							rec = ONE / w1;
							dscal( N, rec, VR, sVR, oVR );
							dscal( N, rec, VI, sVI, oVI );
							xr = VR[ oVR + ( i * sVR ) ];
							xi = VI[ oVI + ( i * sVI ) ];
							scaleA *= rec;
							vmax *= rec;
						}
					}

					// Divide complex (xr, xi) / (B(i,i), B(i+1,i)):
					dladiv( xr, xi, B[ oB + ( i * sB1 ) + ( i * sB2 ) ], B[ oB + ( ( i + 1 ) * sB1 ) + ( i * sB2 ) ], dladivOut );
					VR[ oVR + ( i * sVR ) ] = dladivOut[ 0 ];
					VI[ oVI + ( i * sVI ) ] = dladivOut[ 1 ];
					vmax = Math.max( Math.abs( VR[ oVR + ( i * sVR ) ] ) + Math.abs( VI[ oVI + ( i * sVI ) ] ), vmax );
					vcrit = bignum / vmax;
				} else {
					// Row is negligible: restart with unit vector in position i.
					for ( j = 0; j < N; j++ ) {
						VR[ oVR + ( j * sVR ) ] = ZERO;
						VI[ oVI + ( j * sVI ) ] = ZERO;
					}
					VR[ oVR + ( i * sVR ) ] = ONE;
					VI[ oVI + ( i * sVI ) ] = ONE;
					scaleA = ZERO;
					vmax = ONE;
					vcrit = bignum;
				}

				if ( i === i2 ) {
					break;
				}
				i += i3;
			}

			vnorm = dasum( N, VR, sVR, oVR ) + dasum( N, VI, sVI, oVI );
			if ( vnorm >= growto * scaleA ) {
				// Converged.
				break;
			}

			// Choose new orthogonal starting vector and try again.
			y = eps3 / ( rootn + ONE );
			VR[ oVR ] = eps3;
			VI[ oVI ] = ZERO;
			for ( i = 1; i < N; i++ ) {
				VR[ oVR + ( i * sVR ) ] = y;
				VI[ oVI + ( i * sVI ) ] = ZERO;
			}
			VR[ oVR + ( ( N - 1 - its ) * sVR ) ] -= eps3 * rootn;
		}
		if ( its >= N ) {
			info = 1;
		}

		// Normalize by max-norm of (VR + i*VI) componentwise:
		vnorm = ZERO;
		for ( i = 0; i < N; i++ ) {
			vnorm = Math.max( vnorm, Math.abs( VR[ oVR + ( i * sVR ) ] ) + Math.abs( VI[ oVI + ( i * sVI ) ] ) );
		}
		dscal( N, ONE / vnorm, VR, sVR, oVR );
		dscal( N, ONE / vnorm, VI, sVI, oVI );
	}

	return info;
}


// EXPORTS //

export default dlaein;
