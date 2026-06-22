
/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import ddot from '../../../../blas/base/ddot/lib/base.js';
import dnrm2 from '../../../../blas/base/dnrm2/lib/base.js';
import dgemv from '../../../../blas/base/dgemv/lib/ndarray.js';
import dlamch from '../../dlamch/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlag2 from '../../dlag2/lib/base.js';
import dtgexc from '../../dtgexc/lib/base.js';
import dtgsyl from '../../dtgsyl/lib/base.js';


// VARIABLES //

var DIFDRI = 3;
var ZERO = 0.0;
var ONE = 1.0;
var TWO = 2.0;
var FOUR = 4.0;


// MAIN //

/**
* Estimates reciprocal condition numbers for specified eigenvalues and/or eigenvectors of a matrix pair (A,B) in generalized real Schur canonical form.
*
* @private
* @param {string} job - `'eigenvalues'`, `'eigenvectors'`, or `'both'`
* @param {string} howmny - `'all'` or `'selected'`
* @param {Uint8Array} SELECT - selection array (used when howmny='selected')
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of the matrix pair
* @param {Float64Array} A - upper quasi-triangular matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - upper triangular matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} VL - left eigenvectors
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VR - right eigenvectors
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {Float64Array} s - output reciprocal condition numbers of eigenvalues
* @param {integer} strideS - stride length for `s`
* @param {NonNegativeInteger} offsetS - starting index for `s`
* @param {Float64Array} DIF - output estimated reciprocal condition numbers of eigenvectors
* @param {integer} strideDIF - stride length for `DIF`
* @param {NonNegativeInteger} offsetDIF - starting index for `DIF`
* @param {integer} mm - number of elements available in s and DIF
* @param {Int32Array} M - output: M[0] = number of elements of s and/or DIF used
* @param {Float64Array} WORK - workspace
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @param {integer} lwork - workspace length
* @param {Int32Array} IWORK - integer workspace
* @param {integer} strideIWORK - stride length for `IWORK`
* @param {NonNegativeInteger} offsetIWORK - starting index for `IWORK`
* @returns {integer} info (0 = success, negative = illegal argument)
*/
function dtgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ) {
	var scaleArr;
	var wantbh;
	var wantdf;
	var somcon;
	var lquery;
	var smlnum;
	var alphai;
	var alphar;
	var alprqt;
	var difArr;
	var dummyQ;
	var dummyZ;
	var result;
	var wants;
	var lwmin;
	var tmprr;
	var tmpri;
	var tmpii;
	var tmpir;
	var uhavi;
	var uhbvi;
	var root1;
	var root2;
	var pair;
	var rnrm;
	var lnrm;
	var uhav;
	var uhbv;
	var cond;
	var lag2;
	var beta;
	var ierr;
	var ifst;
	var ilst;
	var eps;
	var ks;
	var c1;
	var c2;
	var n1;
	var n2;
	var iz;
	var m;
	var k;
	var i;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' ) || wantbh;
	wantdf = ( job === 'eigenvectors' ) || wantbh;

	somcon = ( howmny === 'selected' );

	lquery = ( lwork === -1 );

	if ( !wants && !wantdf ) {
		return -1;
	}
	if ( howmny !== 'all' && !somcon ) {
		return -2;
	}
	if ( N < 0 ) {
		return -4;
	}
	// Count selected eigenvalues
	if ( somcon ) {
		m = 0;
		pair = false;
		for ( k = 0; k < N; k++ ) {
			if ( pair ) {
				pair = false;
			} else if ( k < N - 1 ) {
				if ( A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ] === ZERO ) {
					if ( SELECT[ offsetSELECT + k * strideSELECT ] ) {
						m += 1;
					}
				} else {
					pair = true;
					if ( SELECT[ offsetSELECT + k * strideSELECT ] || SELECT[ offsetSELECT + ( k + 1 ) * strideSELECT ] ) {
						m += 2;
					}
				}
			} else if ( SELECT[ offsetSELECT + ( N - 1 ) * strideSELECT ] ) {
				m += 1;
			}
		}
	} else {
		m = N;
	}
	M[ 0 ] = m;

	if ( N === 0 ) {
		lwmin = 1;
	} else if ( job === 'eigenvectors' || job === 'both' ) {
		lwmin = ( 2 * N * ( N + 2 ) ) + 16;
	} else {
		lwmin = N;
	}
	WORK[ offsetWORK ] = lwmin;

	if ( mm < m ) {
		return -15;
	}
	if ( lwork < lwmin && !lquery ) {
		return -18;
	}

	if ( lquery ) {
		return 0;
	}

	if ( N === 0 ) {
		return 0;
	}

	eps = dlamch( 'precision' );
	smlnum = dlamch( 'safe minimum' ) / eps;
	ks = 0; // 0-based index into s / DIF
	pair = false;

	// Allocate small scalar arrays for dtgsyl outputs
	scaleArr = new Float64Array( 1 );
	difArr = new Float64Array( 1 );
	dummyQ = new Float64Array( 1 );
	dummyZ = new Float64Array( 1 );

	for ( k = 0; k < N; k++ ) {
		// Determine whether A(k+1,k) is non-zero
		if ( pair ) {
			pair = false;
			continue; // eslint-disable-line no-continue
		} else if ( k < N - 1 ) {
			pair = ( A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ] !== ZERO );
		}

		// Skip if not selected
		if ( somcon ) {
			if ( pair ) {
				if ( !SELECT[ offsetSELECT + k * strideSELECT ] && !SELECT[ offsetSELECT + ( k + 1 ) * strideSELECT ] ) {
					continue; // eslint-disable-line no-continue
				}
			} else if ( !SELECT[ offsetSELECT + k * strideSELECT ] ) {
				continue; // eslint-disable-line no-continue
			}
		}

		if ( wants ) {
			if ( pair ) {
				// Complex eigenvalue pair
				rnrm = dlapy2(dnrm2( N, VR, strideVR1, offsetVR + ks * strideVR2 ), dnrm2( N, VR, strideVR1, offsetVR + ( ks + 1 ) * strideVR2 ));
				lnrm = dlapy2(dnrm2( N, VL, strideVL1, offsetVL + ks * strideVL2 ), dnrm2( N, VL, strideVL1, offsetVL + ( ks + 1 ) * strideVL2 ));

				// WORK := A * VR(:,ks)
				dgemv( 'no-transpose', N, N, ONE, A, strideA1, strideA2, offsetA, VR, strideVR1, offsetVR + ks * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				tmprr = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				tmpri = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ( ks + 1 ) * strideVL2 );

				// WORK := A * VR(:,ks+1)
				dgemv( 'no-transpose', N, N, ONE, A, strideA1, strideA2, offsetA, VR, strideVR1, offsetVR + ( ks + 1 ) * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				tmpii = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ( ks + 1 ) * strideVL2 );
				tmpir = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				uhav = tmprr + tmpii;
				uhavi = tmpir - tmpri;

				// WORK := B * VR(:,ks)
				dgemv( 'no-transpose', N, N, ONE, B, strideB1, strideB2, offsetB, VR, strideVR1, offsetVR + ks * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				tmprr = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				tmpri = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ( ks + 1 ) * strideVL2 );

				// WORK := B * VR(:,ks+1)
				dgemv( 'no-transpose', N, N, ONE, B, strideB1, strideB2, offsetB, VR, strideVR1, offsetVR + ( ks + 1 ) * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				tmpii = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ( ks + 1 ) * strideVL2 );
				tmpir = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				uhbv = tmprr + tmpii;
				uhbvi = tmpir - tmpri;
				uhav = dlapy2( uhav, uhavi );
				uhbv = dlapy2( uhbv, uhbvi );
				cond = dlapy2( uhav, uhbv );
				s[ offsetS + ks * strideS ] = cond / ( rnrm * lnrm );
				s[ offsetS + ( ks + 1 ) * strideS ] = s[ offsetS + ks * strideS ];
			} else {
				// Real eigenvalue
				rnrm = dnrm2( N, VR, strideVR1, offsetVR + ks * strideVR2 );
				lnrm = dnrm2( N, VL, strideVL1, offsetVL + ks * strideVL2 );
				dgemv( 'no-transpose', N, N, ONE, A, strideA1, strideA2, offsetA, VR, strideVR1, offsetVR + ks * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				uhav = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				dgemv( 'no-transpose', N, N, ONE, B, strideB1, strideB2, offsetB, VR, strideVR1, offsetVR + ks * strideVR2, ZERO, WORK, strideWORK, offsetWORK );
				uhbv = ddot( N, WORK, strideWORK, offsetWORK, VL, strideVL1, offsetVL + ks * strideVL2 );
				cond = dlapy2( uhav, uhbv );
				if ( cond === ZERO ) {
					s[ offsetS + ks * strideS ] = -ONE;
				} else {
					s[ offsetS + ks * strideS ] = cond / ( rnrm * lnrm );
				}
			}
		}

		if ( wantdf ) {
			if ( N === 1 ) {
				DIF[ offsetDIF + ks * strideDIF ] = dlapy2( A[ offsetA ], B[ offsetB ] );
				if ( pair ) {
					ks += 1;
				}
				ks += 1;
				continue; // eslint-disable-line no-continue
			}

			alprqt = ONE;
			cond = ZERO;
			if ( pair ) {
				// Copy 2x2 diagonal blocks of A and B into WORK (contiguous, 2x2 col-major, ld=2)
				WORK[ offsetWORK + 0 ] = A[ offsetA + k * strideA1 + k * strideA2 ];
				WORK[ offsetWORK + 1 ] = A[ offsetA + ( k + 1 ) * strideA1 + k * strideA2 ];
				WORK[ offsetWORK + 2 ] = A[ offsetA + k * strideA1 + ( k + 1 ) * strideA2 ];
				WORK[ offsetWORK + 3 ] = A[ offsetA + ( k + 1 ) * strideA1 + ( k + 1 ) * strideA2 ];
				WORK[ offsetWORK + 4 ] = B[ offsetB + k * strideB1 + k * strideB2 ];
				WORK[ offsetWORK + 5 ] = B[ offsetB + ( k + 1 ) * strideB1 + k * strideB2 ];
				WORK[ offsetWORK + 6 ] = B[ offsetB + k * strideB1 + ( k + 1 ) * strideB2 ];
				WORK[ offsetWORK + 7 ] = B[ offsetB + ( k + 1 ) * strideB1 + ( k + 1 ) * strideB2 ];

				// Call dlag2 on the 2x2 pair (WORK[0..3]=A, WORK[4..7]=B, both col-major ld=2)
				lag2 = dlag2( WORK, 1, 2, offsetWORK, WORK, 1, 2, offsetWORK + 4, smlnum * eps );
				beta = lag2.scale1;
				alphar = lag2.wr1;
				alphai = lag2.wi;

				c1 = TWO * ( ( alphar * alphar ) + ( alphai * alphai ) + ( beta * beta ) );
				c2 = FOUR * beta * beta * alphai * alphai;
				root1 = c1 + Math.sqrt( ( c1 * c1 ) - ( 4.0 * c2 ) );
				root1 /= TWO;
				root2 = c2 / root1;
				cond = Math.min( Math.sqrt( root1 ), Math.sqrt( root2 ) );
			}

			// Copy A and B into WORK (N x N col-major, ld=N) and WORK(N*N..) similarly
			dlacpy( 'full', N, N, A, strideA1, strideA2, offsetA, WORK, 1, N, offsetWORK );
			dlacpy( 'full', N, N, B, strideB1, strideB2, offsetB, WORK, 1, N, offsetWORK + ( N * N ) );

			ifst = k; // 0-based
			ilst = 0;

			// Reorder the pair so the (k..) block moves to position 0
			result = dtgexc( false, false, N, WORK, 1, N, offsetWORK, WORK, 1, N, offsetWORK + ( N * N ), dummyQ, 1, 1, 0, dummyZ, 1, 1, 0, ifst, ilst, WORK, 1, offsetWORK + ( 2 * N * N ), lwork - ( 2 * N * N ) );

			if ( typeof result === 'object' && result !== null ) {
				ierr = result.info;
			} else {
				ierr = result;
			}

			if ( ierr > 0 ) {
				DIF[ offsetDIF + ks * strideDIF ] = ZERO;
			} else {
				n1 = 1;
				if ( WORK[ offsetWORK + 1 ] !== ZERO ) {
					n1 = 2;
				}
				n2 = N - n1;
				if ( n2 === 0 ) {
					DIF[ offsetDIF + ks * strideDIF ] = cond;
				} else {
					i = N * N; // offset to second N*N block (B copy)
					iz = ( 2 * N * N ) + 1; // workspace offset for dtgsyl (matches Fortran WORK(IZ+1))

					// dtgsyl: solve generalized Sylvester; computes DIF estimate
					scaleArr[ 0 ] = ZERO;
					difArr[ 0 ] = ZERO;
					dtgsyl('no-transpose', DIFDRI, n2, n1, WORK, 1, N, offsetWORK + ( N * n1 ) + n1, WORK, 1, N, offsetWORK, WORK, 1, N, offsetWORK + n1, WORK, 1, N, offsetWORK + ( N * n1 ) + n1 + i, WORK, 1, N, offsetWORK + i, WORK, 1, N, offsetWORK + n1 + i, scaleArr, difArr, WORK, 1, offsetWORK + iz, lwork - ( 2 * N * N ), IWORK, strideIWORK, offsetIWORK);
					DIF[ offsetDIF + ks * strideDIF ] = difArr[ 0 ];

					if ( pair ) {
						DIF[ offsetDIF + ks * strideDIF ] = Math.min(Math.max( ONE, alprqt ) * DIF[ offsetDIF + ks * strideDIF ], cond);
					}
				}
			}
			if ( pair ) {
				DIF[ offsetDIF + ( ks + 1 ) * strideDIF ] = DIF[ offsetDIF + ks * strideDIF ];
			}
		}
		if ( pair ) {
			ks += 1;
		}
		ks += 1;
	}

	WORK[ offsetWORK ] = lwmin;
	return 0;
}


// EXPORTS //

export default dtgsna;
