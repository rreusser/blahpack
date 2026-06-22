/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, no-mixed-operators */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemv from '../../../../blas/base/dgemv/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlag2 from '../../dlag2/lib/base.js';
import dlaln2 from '../../dlaln2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var SAFETY = 100.0;

// Machine constants (hoisted to module scope)
var SAFMIN = dlamch( 'safe-minimum' );
var ULP = dlamch( 'precision' ) * dlamch( 'base' );

// Scratch arrays for dlaln2 output X (2x2)
var XOUT = new Float64Array( 4 );

// Scratch arrays for dlag2 calls (2x2 submatrices)
var ABLOCK = new Float64Array( 4 );
var BBLOCK = new Float64Array( 4 );

// Scratch arrays for SUM, SUMS, SUMP (2x2 each, column-major)
var SUM = new Float64Array( 4 );
var SUMS = new Float64Array( 4 );
var SUMP = new Float64Array( 4 );
var BDIAG = new Float64Array( 2 );


// MAIN //

/**
* Computes some or all of the right and/or left generalized eigenvectors of.
* a pair of real upper quasi-triangular matrices (S,P).
*
* Matrix S must be in quasi-triangular form. Matrix P must be upper triangular.
*
* @private
* @param {string} side - specifies whether right ('right'), left ('left'), or both ('both') eigenvectors are computed
* @param {string} howmny - specifies which eigenvectors: 'all', 'selected', or 'backtransform'
* @param {Float64Array} SELECT - selection array for eigenvectors (used when howmny='selected')
* @param {integer} strideSELECT - stride length for `SELECT`
* @param {NonNegativeInteger} offsetSELECT - starting index for `SELECT`
* @param {NonNegativeInteger} N - order of the matrices S and P
* @param {Float64Array} S - upper quasi-triangular matrix S
* @param {integer} strideS1 - stride of the first dimension of `S`
* @param {integer} strideS2 - stride of the second dimension of `S`
* @param {NonNegativeInteger} offsetS - starting index for `S`
* @param {Float64Array} P - upper triangular matrix P
* @param {integer} strideP1 - stride of the first dimension of `P`
* @param {integer} strideP2 - stride of the second dimension of `P`
* @param {NonNegativeInteger} offsetP - starting index for `P`
* @param {Float64Array} VL - left eigenvector matrix (input/output)
* @param {integer} strideVL1 - stride of the first dimension of `VL`
* @param {integer} strideVL2 - stride of the second dimension of `VL`
* @param {NonNegativeInteger} offsetVL - starting index for `VL`
* @param {Float64Array} VR - right eigenvector matrix (input/output)
* @param {integer} strideVR1 - stride of the first dimension of `VR`
* @param {integer} strideVR2 - stride of the second dimension of `VR`
* @param {NonNegativeInteger} offsetVR - starting index for `VR`
* @param {integer} mm - number of columns available in VL and/or VR
* @param {NonNegativeInteger} M - (unused, set internally)
* @param {Float64Array} WORK - workspace array of length >= 6*N
* @param {integer} strideWORK - stride length for `WORK`
* @param {NonNegativeInteger} offsetWORK - starting index for `WORK`
* @returns {integer} status code (0 = success)
*/
function dtgevc( side, howmny, SELECT, strideSELECT, offsetSELECT, N, S, strideS1, strideS2, offsetS, P, strideP1, strideP2, offsetP, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, mm, M, WORK, strideWORK, offsetWORK ) { // eslint-disable-line max-len, max-params, no-unused-vars
	var ilcplx;
	var ilcomp;
	var ilback;
	var ilabad;
	var ilbbad;
	var bignum;
	var bcoefa;
	var bcoefi;
	var bcoefr;
	var acoefa;
	var ascale;
	var bscale;
	var creala;
	var crealb;
	var cimaga;
	var cimagb;
	var temp2r;
	var temp2i;
	var salfar;
	var xscale;
	var il2by2;
	var cre2a;
	var cre2b;
	var cim2a;
	var cim2b;
	var compl;
	var compr;
	var ilall;
	var small;
	var sbeta;
	var acoef;
	var anorm;
	var bnorm;
	var scale;
	var temp2;
	var dmin;
	var xmax;
	var temp;
	var ieig;
	var ibeg;
	var iend;
	var big;
	var lsa;
	var lsb;
	var res;
	var nw;
	var na;
	var im;
	var je;
	var jr;
	var jw;
	var ja;
	var jc;
	var j;
	var i;

	// Decode SIDE
	if ( side === 'right' ) {
		compl = false;
		compr = true;
	} else if ( side === 'left' ) {
		compl = true;
		compr = false;
	} else {
		compl = true;
		compr = true;
	}

	// Decode HOWMNY
	if ( howmny === 'all' ) {
		ilall = true;
		ilback = false;
	} else if ( howmny === 'selected' ) {
		ilall = false;
		ilback = false;
	} else {
		// 'backtransform'
		ilall = true;
		ilback = true;
	}

	// Count eigenvectors if not computing all
	if ( ilall ) {
		im = N;
	} else {
		im = 0;
		ilcplx = false;
		for ( j = 0; j < N; j++ ) {
			if ( ilcplx ) {
				ilcplx = false;
				continue;
			}
			if ( j < N - 1 ) {
				if ( S[ offsetS + (j+1)*strideS1 + j*strideS2 ] !== ZERO ) {
					ilcplx = true;
				}
			}
			if ( ilcplx ) {
				if ( SELECT[ offsetSELECT + j*strideSELECT ] !== 0.0 || SELECT[ offsetSELECT + (j+1)*strideSELECT ] !== 0.0 ) {
					im += 2;
				}
			} else if ( SELECT[ offsetSELECT + j*strideSELECT ] !== 0.0 ) {
				im += 1;
			}
		}
	}

	// Check for validity of S (quasi-triangular) and P (upper triangular)
	ilabad = false;
	ilbbad = false;
	for ( j = 0; j < N - 1; j++ ) {
		if ( S[ offsetS + (j+1)*strideS1 + j*strideS2 ] !== ZERO ) {
			if ( P[ offsetP + j*strideP1 + j*strideP2 ] === ZERO ||
				P[ offsetP + (j+1)*strideP1 + (j+1)*strideP2 ] === ZERO ||
				P[ offsetP + j*strideP1 + (j+1)*strideP2 ] !== ZERO ) {
				ilbbad = true;
			}
			if ( j < N - 2 ) {
				if ( S[ offsetS + (j+2)*strideS1 + (j+1)*strideS2 ] !== ZERO ) {
					ilabad = true;
				}
			}
		}
	}

	if ( ilabad ) {
		return -5;
	}
	if ( ilbbad ) {
		return -7;
	}
	if ( mm < im ) {
		return -13;
	}

	// Quick return if possible
	if ( N === 0 ) {
		return 0;
	}

	// Machine constants
	small = SAFMIN * N / ULP;
	big = ONE / small;
	bignum = ONE / ( SAFMIN * N );

	// Compute column norms of S and P (for scaling)
	anorm = Math.abs( S[ offsetS ] );
	if ( N > 1 ) {
		anorm += Math.abs( S[ offsetS + strideS1 ] );
	}
	bnorm = Math.abs( P[ offsetP ] );
	WORK[ offsetWORK ] = ZERO;
	WORK[ offsetWORK + N * strideWORK ] = ZERO;

	for ( j = 1; j < N; j++ ) {
		temp = ZERO;
		temp2 = ZERO;
		if ( S[ offsetS + j*strideS1 + (j-1)*strideS2 ] === ZERO ) {
			iend = j - 1;
		} else {
			iend = j - 2;
		}
		for ( i = 0; i <= iend; i++ ) {
			temp += Math.abs( S[ offsetS + i*strideS1 + j*strideS2 ] );
			temp2 += Math.abs( P[ offsetP + i*strideP1 + j*strideP2 ] );
		}
		WORK[ offsetWORK + j*strideWORK ] = temp;
		WORK[ offsetWORK + (N+j)*strideWORK ] = temp2;
		for ( i = iend + 1; i <= Math.min( j + 1, N - 1 ); i++ ) {
			temp += Math.abs( S[ offsetS + i*strideS1 + j*strideS2 ] );
			temp2 += Math.abs( P[ offsetP + i*strideP1 + j*strideP2 ] );
		}
		anorm = Math.max( anorm, temp );
		bnorm = Math.max( bnorm, temp2 );
	}

	ascale = ONE / Math.max( anorm, SAFMIN );
	bscale = ONE / Math.max( bnorm, SAFMIN );

	// =============================================

	// Left eigenvectors

	// =============================================
	if ( compl ) {
		ieig = 0;
		ilcplx = false;

		for ( je = 0; je < N; je++ ) {
			// Skip second of a complex pair
			if ( ilcplx ) {
				ilcplx = false;
				continue;
			}
			nw = 1;
			if ( je < N - 1 ) {
				if ( S[ offsetS + (je+1)*strideS1 + je*strideS2 ] !== ZERO ) {
					ilcplx = true;
					nw = 2;
				}
			}
			if ( ilall ) {
				ilcomp = true;
			} else if ( ilcplx ) {
				ilcomp = ( SELECT[ offsetSELECT + je*strideSELECT ] !== 0.0 || SELECT[ offsetSELECT + (je+1)*strideSELECT ] !== 0.0 );
			} else {
				ilcomp = ( SELECT[ offsetSELECT + je*strideSELECT ] !== 0.0 );
			}
			if ( !ilcomp ) {
				continue;
			}

			// Handle degenerate case: both S(je,je) and P(je,je) small
			if ( !ilcplx ) {
				if ( Math.abs( S[ offsetS + je*strideS1 + je*strideS2 ] ) <= SAFMIN &&
					Math.abs( P[ offsetP + je*strideP1 + je*strideP2 ] ) <= SAFMIN ) {
					// Set unit eigenvector
					for ( jr = 0; jr < N; jr++ ) {
						VL[ offsetVL + jr*strideVL1 + ieig*strideVL2 ] = ZERO;
					}
					VL[ offsetVL + ieig*strideVL1 + ieig*strideVL2 ] = ONE;
					ieig += 1;
					continue;
				}
			}

			// Clear work vectors
			for ( jr = 0; jr < nw * N; jr++ ) {
				WORK[ offsetWORK + (2*N + jr)*strideWORK ] = ZERO;
			}

			if ( ilcplx ) {
				// Complex eigenvalue pair - use dlag2
				// Copy 2x2 block of S into scratch
				ABLOCK[ 0 ] = S[ offsetS + je*strideS1 + je*strideS2 ];
				ABLOCK[ 1 ] = S[ offsetS + (je+1)*strideS1 + je*strideS2 ];
				ABLOCK[ 2 ] = S[ offsetS + je*strideS1 + (je+1)*strideS2 ];
				ABLOCK[ 3 ] = S[ offsetS + (je+1)*strideS1 + (je+1)*strideS2 ];

				BBLOCK[ 0 ] = P[ offsetP + je*strideP1 + je*strideP2 ];
				BBLOCK[ 1 ] = P[ offsetP + (je+1)*strideP1 + je*strideP2 ];
				BBLOCK[ 2 ] = P[ offsetP + je*strideP1 + (je+1)*strideP2 ];
				BBLOCK[ 3 ] = P[ offsetP + (je+1)*strideP1 + (je+1)*strideP2 ];

				res = dlag2( ABLOCK, 1, 2, 0, BBLOCK, 1, 2, 0, SAFMIN * SAFETY );
				acoef = res.scale1;
				bcoefr = res.wr1;
				bcoefi = -res.wi;

				if ( bcoefi === ZERO ) {
					return je + 1; // INFO = JE (1-based)
				}

				// Scale coefficients
				acoefa = Math.abs( acoef );
				bcoefa = Math.abs( bcoefr ) + Math.abs( bcoefi );
				scale = ONE;
				if ( acoefa * ULP < SAFMIN && acoefa >= SAFMIN ) {
					scale = ( SAFMIN / ULP ) / acoefa;
				}
				if ( bcoefa * ULP < SAFMIN && bcoefa >= SAFMIN ) {
					scale = Math.max( scale, ( SAFMIN / ULP ) / bcoefa );
				}
				if ( SAFMIN * acoefa > ascale ) {
					scale = ascale / ( SAFMIN * acoefa );
				}
				if ( SAFMIN * bcoefa > bscale ) {
					scale = Math.min( scale, bscale / ( SAFMIN * bcoefa ) );
				}
				if ( scale !== ONE ) {
					acoef = scale * acoef;
					acoefa = Math.abs( acoef );
					bcoefr = scale * bcoefr;
					bcoefi = scale * bcoefi;
					bcoefa = Math.abs( bcoefr ) + Math.abs( bcoefi );
				}

				// Compute initial vector for complex pair
				temp = acoef * S[ offsetS + (je+1)*strideS1 + je*strideS2 ];
				temp2r = acoef * S[ offsetS + je*strideS1 + je*strideS2 ] - bcoefr * P[ offsetP + je*strideP1 + je*strideP2 ];
				temp2i = -bcoefi * P[ offsetP + je*strideP1 + je*strideP2 ];
				if ( Math.abs( temp ) > Math.abs( temp2r ) + Math.abs( temp2i ) ) {
					WORK[ offsetWORK + (2*N + je)*strideWORK ] = ONE;
					WORK[ offsetWORK + (3*N + je)*strideWORK ] = ZERO;
					WORK[ offsetWORK + (2*N + je + 1)*strideWORK ] = -temp2r / temp;
					WORK[ offsetWORK + (3*N + je + 1)*strideWORK ] = -temp2i / temp;
				} else {
					WORK[ offsetWORK + (2*N + je + 1)*strideWORK ] = ONE;
					WORK[ offsetWORK + (3*N + je + 1)*strideWORK ] = ZERO;
					temp = acoef * S[ offsetS + je*strideS1 + (je+1)*strideS2 ];
					WORK[ offsetWORK + (2*N + je)*strideWORK ] = ( bcoefr * P[ offsetP + (je+1)*strideP1 + (je+1)*strideP2 ] - acoef * S[ offsetS + (je+1)*strideS1 + (je+1)*strideS2 ] ) / temp;
					WORK[ offsetWORK + (3*N + je)*strideWORK ] = bcoefi * P[ offsetP + (je+1)*strideP1 + (je+1)*strideP2 ] / temp;
				}
				xmax = Math.max(Math.abs( WORK[ offsetWORK + (2*N + je)*strideWORK ] ) + Math.abs( WORK[ offsetWORK + (3*N + je)*strideWORK ] ), Math.abs( WORK[ offsetWORK + (2*N + je + 1)*strideWORK ] ) + Math.abs( WORK[ offsetWORK + (3*N + je + 1)*strideWORK ] ));
			} else {
				// Real eigenvalue - compute coefficients
				temp = ONE / Math.max(Math.abs( S[ offsetS + je*strideS1 + je*strideS2 ] ) * ascale, Math.abs( P[ offsetP + je*strideP1 + je*strideP2 ] ) * bscale, SAFMIN);
				salfar = ( temp * S[ offsetS + je*strideS1 + je*strideS2 ] ) * ascale;
				sbeta = ( temp * P[ offsetP + je*strideP1 + je*strideP2 ] ) * bscale;
				acoef = sbeta * ascale;
				bcoefr = salfar * bscale;
				bcoefi = ZERO;

				// Scale to avoid underflow
				scale = ONE;
				lsa = ( Math.abs( sbeta ) >= SAFMIN && Math.abs( acoef ) < small );
				lsb = ( Math.abs( salfar ) >= SAFMIN && Math.abs( bcoefr ) < small );
				if ( lsa ) {
					scale = ( small / Math.abs( sbeta ) ) * Math.min( anorm, big );
				}
				if ( lsb ) {
					scale = Math.max( scale, ( small / Math.abs( salfar ) ) * Math.min( bnorm, big ) );
				}
				if ( lsa || lsb ) {
					scale = Math.min( scale, ONE / ( SAFMIN * Math.max( ONE, Math.abs( acoef ), Math.abs( bcoefr ) ) ) );
					if ( lsa ) {
						acoef = ascale * ( scale * sbeta );
					} else {
						acoef = scale * acoef;
					}
					if ( lsb ) {
						bcoefr = bscale * ( scale * salfar );
					} else {
						bcoefr = scale * bcoefr;
					}
				}
				acoefa = Math.abs( acoef );
				bcoefa = Math.abs( bcoefr );

				// Set initial vector
				WORK[ offsetWORK + (2*N + je)*strideWORK ] = ONE;
				xmax = ONE;
			}

			dmin = Math.max( ULP * acoefa * anorm, ULP * bcoefa * bnorm, SAFMIN );

			// Triangular solve - forward substitution for left eigenvectors
			il2by2 = false;
			for ( j = je + nw; j < N; j++ ) {
				if ( il2by2 ) {
					il2by2 = false;
					continue;
				}

				na = 1;
				BDIAG[ 0 ] = P[ offsetP + j*strideP1 + j*strideP2 ];
				if ( j < N - 1 ) {
					if ( S[ offsetS + (j+1)*strideS1 + j*strideS2 ] !== ZERO ) {
						il2by2 = true;
						BDIAG[ 1 ] = P[ offsetP + (j+1)*strideP1 + (j+1)*strideP2 ];
						na = 2;
					}
				}

				// Check for scaling
				xscale = ONE / Math.max( ONE, xmax );
				temp = Math.max(WORK[ offsetWORK + j*strideWORK ], WORK[ offsetWORK + (N+j)*strideWORK ], acoefa * WORK[ offsetWORK + j*strideWORK ] + bcoefa * WORK[ offsetWORK + (N+j)*strideWORK ]);
				if ( il2by2 ) {
					temp = Math.max( temp, WORK[ offsetWORK + (j+1)*strideWORK ], WORK[ offsetWORK + (N+j+1)*strideWORK ], acoefa * WORK[ offsetWORK + (j+1)*strideWORK ] + bcoefa * WORK[ offsetWORK + (N+j+1)*strideWORK ]);
				}
				if ( temp > bignum * xscale ) {
					for ( jw = 0; jw < nw; jw++ ) {
						for ( jr = je; jr < j; jr++ ) {
							WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ] = xscale * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
						}
					}
					xmax *= xscale;
				}

				// Compute SUMS and SUMP
				for ( jw = 0; jw < nw; jw++ ) {
					for ( ja = 0; ja < na; ja++ ) {
						SUMS[ ja + jw * 2 ] = ZERO;
						SUMP[ ja + jw * 2 ] = ZERO;
						for ( jr = je; jr < j; jr++ ) {
							SUMS[ ja + jw * 2 ] += S[ offsetS + jr*strideS1 + (j+ja)*strideS2 ] * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
							SUMP[ ja + jw * 2 ] += P[ offsetP + jr*strideP1 + (j+ja)*strideP2 ] * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
						}
					}
				}

				// Compute SUM
				for ( ja = 0; ja < na; ja++ ) {
					if ( ilcplx ) {
						SUM[ ja ] = -acoef * SUMS[ ja ] + bcoefr * SUMP[ ja ] - bcoefi * SUMP[ ja + 2 ];
						SUM[ ja + 2 ] = -acoef * SUMS[ ja + 2 ] + bcoefr * SUMP[ ja + 2 ] + bcoefi * SUMP[ ja ];
					} else {
						SUM[ ja ] = -acoef * SUMS[ ja ] + bcoefr * SUMP[ ja ];
					}
				}

				// Solve via dlaln2
				res = dlaln2( true, na, nw, dmin, acoef, S, strideS1, strideS2, offsetS + j*strideS1 + j*strideS2, BDIAG[ 0 ], BDIAG[ 1 ], SUM, 1, 2, 0, bcoefr, bcoefi, XOUT, 1, 2, 0);
				scale = res.scale;
				temp = res.xnorm;

				if ( scale < ONE ) {
					for ( jw = 0; jw < nw; jw++ ) {
						for ( jr = je; jr < j; jr++ ) {
							WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ] = scale * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
						}
					}
					xmax = scale * xmax;
				}

				// Copy solution back to WORK
				for ( jw = 0; jw < nw; jw++ ) {
					for ( ja = 0; ja < na; ja++ ) {
						WORK[ offsetWORK + ((jw+2)*N + j + ja)*strideWORK ] = XOUT[ ja + jw * 2 ];
					}
				}
				xmax = Math.max( xmax, temp );
			}

			// Back-transform or copy eigenvectors
			ieig += 1;
			if ( ilback ) {
				for ( jw = 0; jw < nw; jw++ ) {
					dgemv( 'no-transpose', N, N - je, ONE, VL, strideVL1, strideVL2, offsetVL + je*strideVL2, WORK, strideWORK, offsetWORK + ((jw+2)*N + je)*strideWORK, ZERO, WORK, strideWORK, offsetWORK + ((jw+4)*N)*strideWORK);
				}
				dlacpy( 'all', N, nw, WORK, strideWORK, N * strideWORK, offsetWORK + 4*N*strideWORK, VL, strideVL1, strideVL2, offsetVL + je*strideVL2);
				ibeg = 0;
			} else {
				dlacpy( 'all', N, nw, WORK, strideWORK, N * strideWORK, offsetWORK + 2*N*strideWORK, VL, strideVL1, strideVL2, offsetVL + (ieig - 1)*strideVL2);
				ibeg = je;
			}

			// Normalize eigenvectors
			xmax = ZERO;
			if ( ilcplx ) {
				for ( j = ibeg; j < N; j++ ) {
					xmax = Math.max( xmax, Math.abs( VL[ offsetVL + j*strideVL1 + (ieig-1)*strideVL2 ] ) +
						Math.abs( VL[ offsetVL + j*strideVL1 + ieig*strideVL2 ] ));
				}
			} else {
				for ( j = ibeg; j < N; j++ ) {
					xmax = Math.max( xmax, Math.abs( VL[ offsetVL + j*strideVL1 + (ieig-1)*strideVL2 ] ) );
				}
			}

			if ( xmax > SAFMIN ) {
				xscale = ONE / xmax;
				for ( jw = 0; jw < nw; jw++ ) {
					for ( jr = ibeg; jr < N; jr++ ) {
						VL[ offsetVL + jr*strideVL1 + (ieig - 1 + jw)*strideVL2 ] = xscale * VL[ offsetVL + jr*strideVL1 + (ieig - 1 + jw)*strideVL2 ];
					}
				}
			}
			ieig += nw - 1;
		}
	}

	// =============================================
	// Right eigenvectors
	// =============================================
	if ( compr ) {
		ieig = im;
		ilcplx = false;

		for ( je = N - 1; je >= 0; je-- ) {
			// Skip second of a complex pair
			if ( ilcplx ) {
				ilcplx = false;
				continue;
			}
			nw = 1;
			if ( je > 0 ) {
				if ( S[ offsetS + je*strideS1 + (je-1)*strideS2 ] !== ZERO ) {
					ilcplx = true;
					nw = 2;
				}
			}
			if ( ilall ) {
				ilcomp = true;
			} else if ( ilcplx ) {
				ilcomp = ( SELECT[ offsetSELECT + je*strideSELECT ] !== 0.0 || SELECT[ offsetSELECT + (je-1)*strideSELECT ] !== 0.0 );
			} else {
				ilcomp = ( SELECT[ offsetSELECT + je*strideSELECT ] !== 0.0 );
			}
			if ( !ilcomp ) {
				continue;
			}

			// Handle degenerate case
			if ( !ilcplx ) {
				if ( Math.abs( S[ offsetS + je*strideS1 + je*strideS2 ] ) <= SAFMIN &&
					Math.abs( P[ offsetP + je*strideP1 + je*strideP2 ] ) <= SAFMIN ) {
					ieig -= 1;
					for ( jr = 0; jr < N; jr++ ) {
						VR[ offsetVR + jr*strideVR1 + ieig*strideVR2 ] = ZERO;
					}
					VR[ offsetVR + ieig*strideVR1 + ieig*strideVR2 ] = ONE;
					continue;
				}
			}

			// Clear work vectors
			for ( jw = 0; jw < nw; jw++ ) {
				for ( jr = 0; jr < N; jr++ ) {
					WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ] = ZERO;
				}
			}

			if ( ilcplx ) {
				// Complex eigenvalue pair - use dlag2
				ABLOCK[ 0 ] = S[ offsetS + (je-1)*strideS1 + (je-1)*strideS2 ];
				ABLOCK[ 1 ] = S[ offsetS + je*strideS1 + (je-1)*strideS2 ];
				ABLOCK[ 2 ] = S[ offsetS + (je-1)*strideS1 + je*strideS2 ];
				ABLOCK[ 3 ] = S[ offsetS + je*strideS1 + je*strideS2 ];

				BBLOCK[ 0 ] = P[ offsetP + (je-1)*strideP1 + (je-1)*strideP2 ];
				BBLOCK[ 1 ] = P[ offsetP + je*strideP1 + (je-1)*strideP2 ];
				BBLOCK[ 2 ] = P[ offsetP + (je-1)*strideP1 + je*strideP2 ];
				BBLOCK[ 3 ] = P[ offsetP + je*strideP1 + je*strideP2 ];

				res = dlag2( ABLOCK, 1, 2, 0, BBLOCK, 1, 2, 0, SAFMIN * SAFETY );
				acoef = res.scale1;
				bcoefr = res.wr1;
				bcoefi = res.wi;

				if ( bcoefi === ZERO ) {
					return je; // INFO = JE-1 (0-based) -> je in Fortran is je-1+1
				}

				// Scale coefficients
				acoefa = Math.abs( acoef );
				bcoefa = Math.abs( bcoefr ) + Math.abs( bcoefi );
				scale = ONE;
				if ( acoefa * ULP < SAFMIN && acoefa >= SAFMIN ) {
					scale = ( SAFMIN / ULP ) / acoefa;
				}
				if ( bcoefa * ULP < SAFMIN && bcoefa >= SAFMIN ) {
					scale = Math.max( scale, ( SAFMIN / ULP ) / bcoefa );
				}
				if ( SAFMIN * acoefa > ascale ) {
					scale = ascale / ( SAFMIN * acoefa );
				}
				if ( SAFMIN * bcoefa > bscale ) {
					scale = Math.min( scale, bscale / ( SAFMIN * bcoefa ) );
				}
				if ( scale !== ONE ) {
					acoef = scale * acoef;
					acoefa = Math.abs( acoef );
					bcoefr = scale * bcoefr;
					bcoefi = scale * bcoefi;
					bcoefa = Math.abs( bcoefr ) + Math.abs( bcoefi );
				}

				// Compute initial vector for complex pair
				temp = acoef * S[ offsetS + je*strideS1 + (je-1)*strideS2 ];
				temp2r = acoef * S[ offsetS + je*strideS1 + je*strideS2 ] - bcoefr * P[ offsetP + je*strideP1 + je*strideP2 ];
				temp2i = -bcoefi * P[ offsetP + je*strideP1 + je*strideP2 ];
				if ( Math.abs( temp ) >= Math.abs( temp2r ) + Math.abs( temp2i ) ) {
					WORK[ offsetWORK + (2*N + je)*strideWORK ] = ONE;
					WORK[ offsetWORK + (3*N + je)*strideWORK ] = ZERO;
					WORK[ offsetWORK + (2*N + je - 1)*strideWORK ] = -temp2r / temp;
					WORK[ offsetWORK + (3*N + je - 1)*strideWORK ] = -temp2i / temp;
				} else {
					WORK[ offsetWORK + (2*N + je - 1)*strideWORK ] = ONE;
					WORK[ offsetWORK + (3*N + je - 1)*strideWORK ] = ZERO;
					temp = acoef * S[ offsetS + (je-1)*strideS1 + je*strideS2 ];
					WORK[ offsetWORK + (2*N + je)*strideWORK ] = ( bcoefr * P[ offsetP + (je-1)*strideP1 + (je-1)*strideP2 ] - acoef * S[ offsetS + (je-1)*strideS1 + (je-1)*strideS2 ] ) / temp;
					WORK[ offsetWORK + (3*N + je)*strideWORK ] = bcoefi * P[ offsetP + (je-1)*strideP1 + (je-1)*strideP2 ] / temp;
				}

				xmax = Math.max(Math.abs( WORK[ offsetWORK + (2*N + je)*strideWORK ] ) + Math.abs( WORK[ offsetWORK + (3*N + je)*strideWORK ] ), Math.abs( WORK[ offsetWORK + (2*N + je - 1)*strideWORK ] ) + Math.abs( WORK[ offsetWORK + (3*N + je - 1)*strideWORK ] ));

				// Compute initial RHS
				creala = acoef * WORK[ offsetWORK + (2*N + je - 1)*strideWORK ];
				cimaga = acoef * WORK[ offsetWORK + (3*N + je - 1)*strideWORK ];
				crealb = bcoefr * WORK[ offsetWORK + (2*N + je - 1)*strideWORK ] - bcoefi * WORK[ offsetWORK + (3*N + je - 1)*strideWORK ];
				cimagb = bcoefi * WORK[ offsetWORK + (2*N + je - 1)*strideWORK ] + bcoefr * WORK[ offsetWORK + (3*N + je - 1)*strideWORK ];
				cre2a = acoef * WORK[ offsetWORK + (2*N + je)*strideWORK ];
				cim2a = acoef * WORK[ offsetWORK + (3*N + je)*strideWORK ];
				cre2b = bcoefr * WORK[ offsetWORK + (2*N + je)*strideWORK ] - bcoefi * WORK[ offsetWORK + (3*N + je)*strideWORK ];
				cim2b = bcoefi * WORK[ offsetWORK + (2*N + je)*strideWORK ] + bcoefr * WORK[ offsetWORK + (3*N + je)*strideWORK ];
				for ( jr = 0; jr < je - 1; jr++ ) {
					WORK[ offsetWORK + (2*N + jr)*strideWORK ] =
						-creala * S[ offsetS + jr*strideS1 + (je-1)*strideS2 ] +
						crealb * P[ offsetP + jr*strideP1 + (je-1)*strideP2 ] -
						cre2a * S[ offsetS + jr*strideS1 + je*strideS2 ] +
						cre2b * P[ offsetP + jr*strideP1 + je*strideP2 ];
					WORK[ offsetWORK + (3*N + jr)*strideWORK ] =
						-cimaga * S[ offsetS + jr*strideS1 + (je-1)*strideS2 ] +
						cimagb * P[ offsetP + jr*strideP1 + (je-1)*strideP2 ] -
						cim2a * S[ offsetS + jr*strideS1 + je*strideS2 ] +
						cim2b * P[ offsetP + jr*strideP1 + je*strideP2 ];
				}
			} else {
				// Real eigenvalue
				temp = ONE / Math.max(Math.abs( S[ offsetS + je*strideS1 + je*strideS2 ] ) * ascale, Math.abs( P[ offsetP + je*strideP1 + je*strideP2 ] ) * bscale, SAFMIN);
				salfar = ( temp * S[ offsetS + je*strideS1 + je*strideS2 ] ) * ascale;
				sbeta = ( temp * P[ offsetP + je*strideP1 + je*strideP2 ] ) * bscale;
				acoef = sbeta * ascale;
				bcoefr = salfar * bscale;
				bcoefi = ZERO;

				// Scale to avoid underflow
				scale = ONE;
				lsa = ( Math.abs( sbeta ) >= SAFMIN && Math.abs( acoef ) < small );
				lsb = ( Math.abs( salfar ) >= SAFMIN && Math.abs( bcoefr ) < small );
				if ( lsa ) {
					scale = ( small / Math.abs( sbeta ) ) * Math.min( anorm, big );
				}
				if ( lsb ) {
					scale = Math.max( scale, ( small / Math.abs( salfar ) ) * Math.min( bnorm, big ) );
				}
				if ( lsa || lsb ) {
					scale = Math.min( scale, ONE / ( SAFMIN * Math.max( ONE, Math.abs( acoef ), Math.abs( bcoefr ) ) ) );
					if ( lsa ) {
						acoef = ascale * ( scale * sbeta );
					} else {
						acoef = scale * acoef;
					}
					if ( lsb ) {
						bcoefr = bscale * ( scale * salfar );
					} else {
						bcoefr = scale * bcoefr;
					}
				}
				acoefa = Math.abs( acoef );
				bcoefa = Math.abs( bcoefr );

				// Set initial vector
				WORK[ offsetWORK + (2*N + je)*strideWORK ] = ONE;
				xmax = ONE;

				// Compute RHS
				for ( jr = 0; jr < je; jr++ ) {
					WORK[ offsetWORK + (2*N + jr)*strideWORK ] =
						bcoefr * P[ offsetP + jr*strideP1 + je*strideP2 ] -
						acoef * S[ offsetS + jr*strideS1 + je*strideS2 ];
				}
			}

			dmin = Math.max( ULP * acoefa * anorm, ULP * bcoefa * bnorm, SAFMIN );

			// Triangular solve - backward substitution for right eigenvectors
			il2by2 = false;
			for ( j = je - nw; j >= 0; j-- ) {
				if ( !il2by2 && j > 0 ) {
					if ( S[ offsetS + j*strideS1 + (j-1)*strideS2 ] !== ZERO ) {
						il2by2 = true;
						continue;
					}
				}
				BDIAG[ 0 ] = P[ offsetP + j*strideP1 + j*strideP2 ];
				if ( il2by2 ) {
					na = 2;
					BDIAG[ 1 ] = P[ offsetP + (j+1)*strideP1 + (j+1)*strideP2 ];
				} else {
					na = 1;
				}

				// Solve via dlaln2
				res = dlaln2( false, na, nw, dmin, acoef, S, strideS1, strideS2, offsetS + j*strideS1 + j*strideS2, BDIAG[ 0 ], BDIAG[ 1 ], WORK, strideWORK, N * strideWORK, offsetWORK + 2*N*strideWORK + j*strideWORK, bcoefr, bcoefi, SUM, 1, 2, 0);
				scale = res.scale;
				temp = res.xnorm;

				if ( scale < ONE ) {
					for ( jw = 0; jw < nw; jw++ ) {
						for ( jr = 0; jr <= je; jr++ ) {
							WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ] = scale * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
						}
					}
				}
				xmax = Math.max( scale * xmax, temp );

				// Copy solution to WORK
				for ( jw = 0; jw < nw; jw++ ) {
					for ( ja = 0; ja < na; ja++ ) {
						WORK[ offsetWORK + ((jw+2)*N + j + ja)*strideWORK ] = SUM[ ja + jw * 2 ];
					}
				}

				// Update RHS
				if ( j > 0 ) {
					xscale = ONE / Math.max( ONE, xmax );
					temp = acoefa * WORK[ offsetWORK + j*strideWORK ] + bcoefa * WORK[ offsetWORK + (N+j)*strideWORK ];
					if ( il2by2 ) {
						temp = Math.max( temp, acoefa * WORK[ offsetWORK + (j+1)*strideWORK ] + bcoefa * WORK[ offsetWORK + (N+j+1)*strideWORK ] );
					}
					temp = Math.max( temp, acoefa, bcoefa );
					if ( temp > bignum * xscale ) {
						for ( jw = 0; jw < nw; jw++ ) {
							for ( jr = 0; jr <= je; jr++ ) {
								WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ] = xscale * WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
							}
						}
						xmax *= xscale;
					}

					for ( ja = 0; ja < na; ja++ ) {
						if ( ilcplx ) {
							creala = acoef * WORK[ offsetWORK + (2*N + j + ja)*strideWORK ];
							cimaga = acoef * WORK[ offsetWORK + (3*N + j + ja)*strideWORK ];
							crealb = bcoefr * WORK[ offsetWORK + (2*N + j + ja)*strideWORK ] - bcoefi * WORK[ offsetWORK + (3*N + j + ja)*strideWORK ];
							cimagb = bcoefi * WORK[ offsetWORK + (2*N + j + ja)*strideWORK ] + bcoefr * WORK[ offsetWORK + (3*N + j + ja)*strideWORK ];
							for ( jr = 0; jr < j; jr++ ) {
								WORK[ offsetWORK + (2*N + jr)*strideWORK ] = WORK[ offsetWORK + (2*N + jr)*strideWORK ] -
									creala * S[ offsetS + jr*strideS1 + (j+ja)*strideS2 ] +
									crealb * P[ offsetP + jr*strideP1 + (j+ja)*strideP2 ];
								WORK[ offsetWORK + (3*N + jr)*strideWORK ] = WORK[ offsetWORK + (3*N + jr)*strideWORK ] -
									cimaga * S[ offsetS + jr*strideS1 + (j+ja)*strideS2 ] +
									cimagb * P[ offsetP + jr*strideP1 + (j+ja)*strideP2 ];
							}
						} else {
							creala = acoef * WORK[ offsetWORK + (2*N + j + ja)*strideWORK ];
							crealb = bcoefr * WORK[ offsetWORK + (2*N + j + ja)*strideWORK ];
							for ( jr = 0; jr < j; jr++ ) {
								WORK[ offsetWORK + (2*N + jr)*strideWORK ] = WORK[ offsetWORK + (2*N + jr)*strideWORK ] -
									creala * S[ offsetS + jr*strideS1 + (j+ja)*strideS2 ] +
									crealb * P[ offsetP + jr*strideP1 + (j+ja)*strideP2 ];
							}
						}
					}
				}

				il2by2 = false;
			}

			// Back-transform or copy eigenvectors
			ieig -= nw;
			if ( ilback ) {
				for ( jw = 0; jw < nw; jw++ ) {
					for ( jr = 0; jr < N; jr++ ) {
						WORK[ offsetWORK + ((jw+4)*N + jr)*strideWORK ] = WORK[ offsetWORK + ((jw+2)*N)*strideWORK ] * VR[ offsetVR + jr*strideVR1 ];
					}
					for ( jc = 1; jc <= je; jc++ ) {
						for ( jr = 0; jr < N; jr++ ) {
							WORK[ offsetWORK + ((jw+4)*N + jr)*strideWORK ] += WORK[ offsetWORK + ((jw+2)*N + jc)*strideWORK ] * VR[ offsetVR + jr*strideVR1 + jc*strideVR2 ];
						}
					}
				}
				for ( jw = 0; jw < nw; jw++ ) {
					for ( jr = 0; jr < N; jr++ ) {
						VR[ offsetVR + jr*strideVR1 + (ieig + jw)*strideVR2 ] = WORK[ offsetWORK + ((jw+4)*N + jr)*strideWORK ];
					}
				}
				iend = N;
			} else {
				for ( jw = 0; jw < nw; jw++ ) {
					for ( jr = 0; jr < N; jr++ ) {
						VR[ offsetVR + jr*strideVR1 + (ieig + jw)*strideVR2 ] = WORK[ offsetWORK + ((jw+2)*N + jr)*strideWORK ];
					}
				}
				iend = je + 1;
			}

			// Normalize eigenvectors
			xmax = ZERO;
			if ( ilcplx ) {
				for ( j = 0; j < iend; j++ ) {
					xmax = Math.max( xmax, Math.abs( VR[ offsetVR + j*strideVR1 + ieig*strideVR2 ] ) +
						Math.abs( VR[ offsetVR + j*strideVR1 + (ieig+1)*strideVR2 ] ));
				}
			} else {
				for ( j = 0; j < iend; j++ ) {
					xmax = Math.max( xmax, Math.abs( VR[ offsetVR + j*strideVR1 + ieig*strideVR2 ] ) );
				}
			}

			if ( xmax > SAFMIN ) {
				xscale = ONE / xmax;
				for ( jw = 0; jw < nw; jw++ ) {
					for ( jr = 0; jr < iend; jr++ ) {
						VR[ offsetVR + jr*strideVR1 + (ieig + jw)*strideVR2 ] = xscale * VR[ offsetVR + jr*strideVR1 + (ieig + jw)*strideVR2 ];
					}
				}
			}
		}
	}

	return 0;
}


// EXPORTS //

export default dtgevc;
