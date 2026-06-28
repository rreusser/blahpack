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

/* eslint-disable max-len, max-params, max-depth, max-statements, max-lines-per-function, function-paren-newline, function-call-argument-newline, no-mixed-operators, no-underscore-dangle, require-jsdoc, max-statements-per-line */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlamch from '../../dlamch/lib/base.js';
import dlanhs from '../../dlanhs/lib/base.js';
import dlag2 from '../../dlag2/lib/base.js';
import dlapy2 from '../../dlapy2/lib/base.js';
import dlapy3 from '../../dlapy3/lib/base.js';
import dlarfg from '../../dlarfg/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dlasv2 from '../../dlasv2/lib/base.js';
import drot from '../../../../blas/base/drot/lib/ndarray.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var HALF = 0.5; // eslint-disable-line no-unused-vars
var SAFETY = 100.0;

var SAFMIN = dlamch( 'safe-minimum' );
var SAFMAX = ONE / SAFMIN; // eslint-disable-line no-unused-vars
var ULP = dlamch( 'epsilon' ) * dlamch( 'base' );

// Scratch arrays reused across calls:
var GIVENSBUF = new Float64Array( 3 ); // for dlartg output [c, s, r]
var TAUBUF = new Float64Array( 1 );    // for dlarfg tau output
var ALPHABUF = new Float64Array( 1 );  // for dlarfg alpha in/out


// MAIN //

/**
* Implements the QZ iteration for a Hessenberg-triangular matrix pair (H,T).
* computing generalized eigenvalues and optionally the generalized Schur form
* with orthogonal transformation matrices Q and Z.
*
* ## Notes
*
* -   `H` must be in upper Hessenberg form and `T` must be in upper triangular form.
*
* -   On exit, ALPHAR, ALPHAI, and BETA contain the generalized eigenvalues.
*     The eigenvalues are `(ALPHAR(j) + i*ALPHAI(j)) / BETA(j)`, j=0,...,N-1.
*
* -   INFO = 0 on success, INFO = j+1 if the j-th eigenvalue failed to converge,
*     INFO = N+1 or N+2 for unexpected failures.
*
* @private
* @param {string} job - `'eigenvalues'` or `'schur'`
* @param {string} compq - `'none'`, `'initialize'`, or `'update'`
* @param {string} compz - `'none'`, `'initialize'`, or `'update'`
* @param {NonNegativeInteger} N - order of the matrices H and T
* @param {integer} ilo - start index of balanced submatrix (1-based from caller, converted to 0-based internally)
* @param {integer} ihi - end index of balanced submatrix (1-based from caller, converted to 0-based internally)
* @param {Float64Array} H - upper Hessenberg matrix
* @param {integer} strideH1 - first dimension stride of H
* @param {integer} strideH2 - second dimension stride of H
* @param {NonNegativeInteger} offsetH - starting index for H
* @param {Float64Array} T - upper triangular matrix
* @param {integer} strideT1 - first dimension stride of T
* @param {integer} strideT2 - second dimension stride of T
* @param {NonNegativeInteger} offsetT - starting index for T
* @param {Float64Array} ALPHAR - real parts of generalized eigenvalues
* @param {integer} strideALPHAR - stride for ALPHAR
* @param {NonNegativeInteger} offsetALPHAR - starting index for ALPHAR
* @param {Float64Array} ALPHAI - imaginary parts of generalized eigenvalues
* @param {integer} strideALPHAI - stride for ALPHAI
* @param {NonNegativeInteger} offsetALPHAI - starting index for ALPHAI
* @param {Float64Array} BETA - scaling factors for eigenvalues
* @param {integer} strideBETA - stride for BETA
* @param {NonNegativeInteger} offsetBETA - starting index for BETA
* @param {Float64Array} Q - left Schur vectors
* @param {integer} strideQ1 - first dimension stride of Q
* @param {integer} strideQ2 - second dimension stride of Q
* @param {NonNegativeInteger} offsetQ - starting index for Q
* @param {Float64Array} Z - right Schur vectors
* @param {integer} strideZ1 - first dimension stride of Z
* @param {integer} strideZ2 - second dimension stride of Z
* @param {NonNegativeInteger} offsetZ - starting index for Z
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride for WORK
* @param {NonNegativeInteger} offsetWork - starting index for WORK
* @param {integer} lwork - workspace size (unused; kept for API compatibility)
* @returns {integer} info - 0 on success
*/
function dhgeqz( job, compq, compz, N, ilo, ihi, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line no-unused-vars
	var ilschr;
	var ifirst;
	var ifrstm;
	var ilastm;
	var istart;
	var eshift;
	var ascale;
	var bscale;
	var ilazro;
	var ilazr2;
	var ilpivt;
	var ilast;
	var iiter;
	var maxit;
	var anorm;
	var bnorm;
	var jiter;
	var ad11l;
	var ad21l;
	var ad12l;
	var ad22l;
	var ad32l;
	var temp2;
	var tempr;
	var tempi;
	var scale;
	var s1inv;
	var done;
	var atol;
	var btol;
	var info;
	var ad11;
	var ad21;
	var ad12;
	var ad22;
	var u12l;
	var temp;
	var c11r;
	var c11i;
	var c22r;
	var c22i;
	var wabs;
	var lag2;
	var ilq;
	var ilz;
	var u12;
	var tau;
	var wr2;
	var a11;
	var a12;
	var a21;
	var a22;
	var b11;
	var b22;
	var c12;
	var c21;
	var szr;
	var szi;
	var sqr;
	var sqi;
	var a1r;
	var a1i;
	var a2r;
	var a2i;
	var b1r;
	var b1i;
	var b1a;
	var b2r;
	var b2i;
	var b2a;
	var w11;
	var w12;
	var w21;
	var w22;
	var in_;
	var jch;
	var svd;
	var t2;
	var t3;
	var v1;
	var v2;
	var v3;
	var s1;
	var s2;
	var wr;
	var wi;
	var t1;
	var cz;
	var cq;
	var an;
	var bn;
	var cr;
	var sr;
	var cl;
	var sl;
	var u1;
	var u2;
	var vs;
	var jc;
	var jr;
	var c;
	var s;
	var j;

	// Decode JOB
	if ( job === 'eigenvalues' ) {
		ilschr = false;
	} else {
		// 'schur'
		ilschr = true;
	}

	// Decode COMPQ
	if ( compq === 'none' ) {
		ilq = false;
	} else {
		// 'initialize' or 'update'
		ilq = true;
	}

	// Decode COMPZ
	if ( compz === 'none' ) {
		ilz = false;
	} else {
		// 'initialize' or 'update'
		ilz = true;
	}

	info = 0;

	// Quick return
	if ( N <= 0 ) {
		WORK[ offsetWork ] = 1.0;
		return info;
	}

	// Initialize Q to identity if requested
	if ( compq === 'initialize' ) {
		dlaset( 'full', N, N, ZERO, ONE, Q, strideQ1, strideQ2, offsetQ );
	}
	// Initialize Z to identity if requested
	if ( compz === 'initialize' ) {
		dlaset( 'full', N, N, ZERO, ONE, Z, strideZ1, strideZ2, offsetZ );
	}

	// Machine constants and norms
	// ilo and ihi are 0-based in the JS API
	in_ = ihi - ilo + 1;
	anorm = dlanhs( 'frobenius', in_, H, strideH1, strideH2, offsetH + ( ilo * strideH1 ) + ( ilo * strideH2 ), WORK, strideWork, offsetWork );
	bnorm = dlanhs( 'frobenius', in_, T, strideT1, strideT2, offsetT + ( ilo * strideT1 ) + ( ilo * strideT2 ), WORK, strideWork, offsetWork );
	atol = Math.max( SAFMIN, ULP * anorm );
	btol = Math.max( SAFMIN, ULP * bnorm );
	ascale = ONE / Math.max( SAFMIN, anorm );
	bscale = ONE / Math.max( SAFMIN, bnorm );

	// Handle eigenvalues outside the active block [ILO..IHI]: columns IHI+1..N-1 (Fortran IHI+1..N)
	for ( j = ihi + 1; j < N; j++ ) {
		if ( T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] < ZERO ) {
			if ( ilschr ) {
				for ( jr = 0; jr <= j; jr++ ) {
					H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] = -H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ];
					T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] = -T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ];
				}
			} else {
				H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ] = -H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ];
				T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] = -T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ];
			}
			if ( ilz ) {
				for ( jr = 0; jr < N; jr++ ) {
					Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] = -Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ];
				}
			}
		}
		ALPHAR[ offsetALPHAR + ( j * strideALPHAR ) ] = H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ];
		ALPHAI[ offsetALPHAI + ( j * strideALPHAI ) ] = ZERO;
		BETA[ offsetBETA + ( j * strideBETA ) ] = T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ];
	}

	// If IHI < ILO, skip main iteration
	if ( ihi < ilo ) {
		// Handle eigenvalues below the active block (columns 0..ILO-1)
		info = handleLowEigenvalues( ilo, ilschr, ilz, N, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Z, strideZ1, strideZ2, offsetZ );
		WORK[ offsetWork ] = N;
		return info;
	}

	// Set up iteration variables
	ilast = ihi;
	if ( ilschr ) {
		ifrstm = 0;
		ilastm = N - 1;
	} else {
		ifrstm = ilo;
		ilastm = ihi;
	}
	iiter = 0;
	eshift = ZERO;
	maxit = 30 * ( ihi - ilo + 1 );
	done = false;

	// Main QZ iteration loop
	for ( jiter = 0; jiter < maxit; jiter++ ) {
		// Check for deflation at bottom of active block
		// This corresponds to the check before label 80 and GOTO 80 logic
		if ( !checkDeflation() ) {
			// Non-convergence detected inside
			WORK[ offsetWork ] = N;
			return info;
		}
		if ( done ) {
			WORK[ offsetWork ] = N;
			return info;
		}
	}

	// If we fall through the loop, we didn't converge
	info = ilast + 1;
	WORK[ offsetWork ] = N;
	return info;

	// checkDeflation: handles GOTO logic within a single iteration. Returns true to continue, false for non-convergence.
	function checkDeflation() { // eslint-disable-line max-statements
		var converged;
		var found80;

		// Special-case: single eigenvalue at bottom
		if ( ilast === ilo ) {
			doLabel80();
			return true;
		}

		// Test whether H(ilast, ilast-1) is small enough to deflate
		if ( Math.abs( H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] ) <=
			Math.max( SAFMIN, ULP * ( Math.abs( H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] ) + Math.abs( H[ offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] ) ) ) ) {
			H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] = ZERO;
			doLabel80();
			return true;
		}

		// Test whether T(ilast, ilast) is negligible
		if ( Math.abs( T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] ) <= btol ) {
			T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] = ZERO;
			doLabel70();
			return true;
		}

		// Scan from bottom to find deflation point (DO 60 loop)
		found80 = false;
		converged = false;
		ifirst = -1; // will be set if we find a start

		for ( j = ilast - 1; j >= ilo; j-- ) {
			// Test H(j, j-1)
			if ( j === ilo ) {
				ilazro = true;
			} else if ( Math.abs( H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] ) <=
				Math.max( SAFMIN, ULP * ( Math.abs( H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ] ) + Math.abs( H[ offsetH + ( ( j - 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] ) ) ) ) {
				H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ZERO;
				ilazro = true;
			} else {
				ilazro = false;
			}

			// Test T(j, j)
			if ( Math.abs( T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] ) < btol ) {
				T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] = ZERO;

				// Check ilazr2 condition
				ilazr2 = false;
				if ( !ilazro ) {
					temp = Math.abs( H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] );
					temp2 = Math.abs( H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ] );
					tempr = Math.max( temp, temp2 );
					if ( tempr < ONE && tempr !== ZERO ) {
						temp /= tempr;
						temp2 /= tempr;
					}
					if ( temp * ( ascale * Math.abs( H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( j * strideH2 ) ] ) ) <= temp2 * ( ascale * atol ) ) {
						ilazr2 = true;
					}
				}

				if ( ilazro || ilazr2 ) {
					// Chase zero T diagonal from top (DO 40 loop)
					for ( jch = j; jch < ilast; jch++ ) {
						temp = H[ offsetH + ( jch * strideH1 ) + ( jch * strideH2 ) ];
						dlartg( temp, H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( jch * strideH2 ) ], GIVENSBUF );
						c = GIVENSBUF[ 0 ];
						s = GIVENSBUF[ 1 ];
						H[ offsetH + ( jch * strideH1 ) + ( jch * strideH2 ) ] = GIVENSBUF[ 2 ];
						H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( jch * strideH2 ) ] = ZERO;
						drot( ilastm - jch, H, strideH2, offsetH + ( jch * strideH1 ) + ( ( jch + 1 ) * strideH2 ), H, strideH2, offsetH + ( ( jch + 1 ) * strideH1 ) + ( ( jch + 1 ) * strideH2 ), c, s );
						drot( ilastm - jch, T, strideT2, offsetT + ( jch * strideT1 ) + ( ( jch + 1 ) * strideT2 ), T, strideT2, offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 1 ) * strideT2 ), c, s );
						if ( ilq ) {
							drot( N, Q, strideQ1, offsetQ + ( jch * strideQ2 ), Q, strideQ1, offsetQ + ( ( jch + 1 ) * strideQ2 ), c, s );
						}
						if ( ilazr2 ) {
							H[ offsetH + ( jch * strideH1 ) + ( ( jch - 1 ) * strideH2 ) ] = H[ offsetH + ( jch * strideH1 ) + ( ( jch - 1 ) * strideH2 ) ] * c;
						}
						ilazr2 = false;
						if ( Math.abs( T[ offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ] ) >= btol ) {
							if ( jch + 1 >= ilast ) {
								found80 = true;
								break;
							}
							ifirst = jch + 1;
							converged = true;
							break;
						}
						T[ offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ] = ZERO;
					}
					if ( found80 ) {
						doLabel80();
						return true;
					}
					if ( converged ) {
						break; // break out of DO 60 to go to label 110
					}
					// If we completed the DO 40 loop without breaking, go to label 70
					doLabel70();
					return true;
				}

				// Chase zero T diagonal from bottom (DO 50 loop)
				for ( jch = j; jch < ilast; jch++ ) {
					temp = T[ offsetT + ( jch * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ];
					dlartg( temp, T[ offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ], GIVENSBUF );
					c = GIVENSBUF[ 0 ];
					s = GIVENSBUF[ 1 ];
					T[ offsetT + ( jch * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ] = GIVENSBUF[ 2 ];
					T[ offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 1 ) * strideT2 ) ] = ZERO;
					if ( jch < ilastm - 1 ) {
						drot( ilastm - jch - 1, T, strideT2, offsetT + ( jch * strideT1 ) + ( ( jch + 2 ) * strideT2 ), T, strideT2, offsetT + ( ( jch + 1 ) * strideT1 ) + ( ( jch + 2 ) * strideT2 ), c, s );
					}
					drot( ilastm - jch + 2, H, strideH2, offsetH + ( jch * strideH1 ) + ( ( jch - 1 ) * strideH2 ), H, strideH2, offsetH + ( ( jch + 1 ) * strideH1 ) + ( ( jch - 1 ) * strideH2 ), c, s );
					if ( ilq ) {
						drot( N, Q, strideQ1, offsetQ + ( jch * strideQ2 ), Q, strideQ1, offsetQ + ( ( jch + 1 ) * strideQ2 ), c, s );
					}
					temp = H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( jch * strideH2 ) ];
					dlartg( temp, H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( ( jch - 1 ) * strideH2 ) ], GIVENSBUF );
					c = GIVENSBUF[ 0 ];
					s = GIVENSBUF[ 1 ];
					H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( jch * strideH2 ) ] = GIVENSBUF[ 2 ];
					H[ offsetH + ( ( jch + 1 ) * strideH1 ) + ( ( jch - 1 ) * strideH2 ) ] = ZERO;
					drot( jch + 1 - ifrstm, H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( jch * strideH2 ), H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( ( jch - 1 ) * strideH2 ), c, s );
					drot( jch - ifrstm, T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( jch * strideT2 ), T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( ( jch - 1 ) * strideT2 ), c, s );
					if ( ilz ) {
						drot( N, Z, strideZ1, offsetZ + ( jch * strideZ2 ), Z, strideZ1, offsetZ + ( ( jch - 1 ) * strideZ2 ), c, s );
					}
				}
				doLabel70();
				return true;
			} if ( ilazro ) {
				// H(j,j-1) is zero but T(j,j) is nonzero -> found start
				ifirst = j;
				converged = true;
				break;
			}
		} // end DO 60

		if ( !converged ) {
			// Fell through DO 60 without finding a start -> non-convergence
			info = N + 1;
			return false; // signal: stop outer loop
		}

		// Label 110: begin QZ step
		doLabel110();
		return true;
	}

	// Label 70: Bumping into zero T diagonal — apply from right
	function doLabel70() {
		temp = H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ];
		dlartg( temp, H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ], GIVENSBUF );
		c = GIVENSBUF[ 0 ];
		s = GIVENSBUF[ 1 ];
		H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] = GIVENSBUF[ 2 ];
		H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] = ZERO;
		drot( ilast - ifrstm, H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( ilast * strideH2 ), H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( ( ilast - 1 ) * strideH2 ), c, s );
		drot( ilast - ifrstm, T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( ilast * strideT2 ), T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( ( ilast - 1 ) * strideT2 ), c, s );
		if ( ilz ) {
			drot( N, Z, strideZ1, offsetZ + ( ilast * strideZ2 ), Z, strideZ1, offsetZ + ( ( ilast - 1 ) * strideZ2 ), c, s );
		}
		doLabel80();
	}

	// Label 80: Real eigenvalue deflation at ilast
	function doLabel80() {
		if ( T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] < ZERO ) {
			if ( ilschr ) {
				for ( j = ifrstm; j <= ilast; j++ ) {
					H[ offsetH + ( j * strideH1 ) + ( ilast * strideH2 ) ] = -H[ offsetH + ( j * strideH1 ) + ( ilast * strideH2 ) ];
					T[ offsetT + ( j * strideT1 ) + ( ilast * strideT2 ) ] = -T[ offsetT + ( j * strideT1 ) + ( ilast * strideT2 ) ];
				}
			} else {
				H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] = -H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ];
				T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] = -T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ];
			}
			if ( ilz ) {
				for ( j = 0; j < N; j++ ) {
					Z[ offsetZ + ( j * strideZ1 ) + ( ilast * strideZ2 ) ] = -Z[ offsetZ + ( j * strideZ1 ) + ( ilast * strideZ2 ) ];
				}
			}
		}
		ALPHAR[ offsetALPHAR + ( ilast * strideALPHAR ) ] = H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ];
		ALPHAI[ offsetALPHAI + ( ilast * strideALPHAI ) ] = ZERO;
		BETA[ offsetBETA + ( ilast * strideBETA ) ] = T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ];

		// Shrink active block
		ilast -= 1;
		if ( ilast < ilo ) {
			// All eigenvalues found — go to label 380
			info = handleLowEigenvalues( ilo, ilschr, ilz, N, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Z, strideZ1, strideZ2, offsetZ );
			done = true;
			return; // signal: done
		}

		// Reset iteration counter
		iiter = 0;
		eshift = ZERO;
		if ( !ilschr ) {
			ilastm = ilast;
			if ( ifrstm > ilast ) {
				ifrstm = ilo;
			}
		}
		// Label 350: continue to next iteration
	}

	// Label 110: QZ step
	function doLabel110() { // eslint-disable-line max-statements
		iiter += 1;
		if ( !ilschr ) {
			ifrstm = ifirst;
		}

		// Every 10th iteration: use ad-hoc shift
		if ( ( iiter % 10 ) === 0 ) {
			if ( ( maxit * SAFMIN ) * Math.abs( H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] ) <
				Math.abs( T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ] ) ) {
				eshift = H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] /
					T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ];
			} else {
				eshift += ONE / ( SAFMIN * maxit );
			}
			s1 = ONE;
			wr = eshift;

			doRealShiftQZStep();
		} else {
			// Wilkinson shift from bottom 2x2 block
			lag2 = dlag2(
				H, strideH1, strideH2, offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ),
				T, strideT1, strideT2, offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ),
				SAFMIN * SAFETY
			);
			s1 = lag2.scale1;
			s2 = lag2.scale2;
			wr = lag2.wr1;
			wr2 = lag2.wr2;
			wi = lag2.wi;

			// Pick the shift closest to the bottom element
			if ( Math.abs( ( wr / s1 ) * T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] - H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] ) >
				Math.abs( ( wr2 / s2 ) * T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] - H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] ) ) {
				temp = wr;
				wr = wr2;
				wr2 = temp;
				temp = s1;
				s1 = s2;
				s2 = temp;
			}
			temp = Math.max( s1, SAFMIN * Math.max( ONE, Math.abs( wr ), Math.abs( wi ) ) );
			if ( wi !== ZERO ) {
				// Complex eigenvalues: go to label 200
				doComplexShift();
				return;
			}

			doRealShiftQZStep();
		}
	}

	// Real single-shift QZ step (label 120-190)
	function doRealShiftQZStep() { // eslint-disable-line max-statements
		// Scale
		temp = Math.min( ascale, ONE ) * ( HALF * SAFMAX );
		if ( s1 > temp ) {
			scale = temp / s1;
		} else {
			scale = ONE;
		}
		temp = Math.min( bscale, ONE ) * ( HALF * SAFMAX );
		if ( Math.abs( wr ) > temp ) {
			scale = Math.min( scale, temp / Math.abs( wr ) );
		}
		s1 = scale * s1;
		wr = scale * wr;

		// Look for a start point in the subdiagonal (DO 120 loop)
		istart = ifirst;
		for ( j = ilast - 1; j >= ifirst + 1; j-- ) {
			temp = Math.abs( s1 * H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] );
			temp2 = Math.abs( s1 * H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ] - wr * T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] );
			tempr = Math.max( temp, temp2 );
			if ( tempr < ONE && tempr !== ZERO ) {
				temp /= tempr;
				temp2 /= tempr;
			}
			if ( Math.abs( ( ascale * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( j * strideH2 ) ] ) * temp ) <=
				( ascale * atol ) * temp2 ) {
				istart = j;
				break;
			}
		}

		// Label 130: Compute initial rotations
		temp = s1 * H[ offsetH + ( istart * strideH1 ) + ( istart * strideH2 ) ] - wr * T[ offsetT + ( istart * strideT1 ) + ( istart * strideT2 ) ];
		temp2 = s1 * H[ offsetH + ( ( istart + 1 ) * strideH1 ) + ( istart * strideH2 ) ];
		dlartg( temp, temp2, GIVENSBUF );
		c = GIVENSBUF[ 0 ];
		s = GIVENSBUF[ 1 ];

		// DO 190 loop: single-shift QZ step
		for ( j = istart; j < ilast; j++ ) {
			if ( j > istart ) {
				temp = H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ];
				dlartg( temp, H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ], GIVENSBUF );
				c = GIVENSBUF[ 0 ];
				s = GIVENSBUF[ 1 ];
				H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = GIVENSBUF[ 2 ];
				H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ZERO;
			}

			// Apply from left to H and T rows j, j+1 for columns j..ilastm (DO 140)
			for ( jc = j; jc <= ilastm; jc++ ) {
				temp = ( c * H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] ) + ( s * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] );
				H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] = ( -s * H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] ) + ( c * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] );
				H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] = temp;
				temp2 = ( c * T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] ) + ( s * T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] );
				T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] = ( -s * T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] ) + ( c * T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] );
				T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] = temp2;
			}
			if ( ilq ) {
				// Apply from right to Q columns j, j+1 (DO 150)
				for ( jr = 0; jr < N; jr++ ) {
					temp = ( c * Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] ) + ( s * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] );
					Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] = ( -s * Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] ) + ( c * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] );
					Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] = temp;
				}
			}

			// Compute right Givens rotation to zero T(j+1, j)
			temp = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
			dlartg( temp, T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ], GIVENSBUF );
			c = GIVENSBUF[ 0 ];
			s = GIVENSBUF[ 1 ];
			T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] = GIVENSBUF[ 2 ];
			T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ] = ZERO;

			// Apply from right to H rows ifrstm..min(j+2, ilast) (DO 160)
			for ( jr = ifrstm; jr <= Math.min( j + 2, ilast ); jr++ ) {
				temp = ( c * H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] ) + ( s * H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] );
				H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] = ( -s * H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] ) + ( c * H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] );
				H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] = temp;
			}
			// Apply from right to T rows ifrstm..j (DO 170)
			for ( jr = ifrstm; jr <= j; jr++ ) {
				temp = ( c * T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ) + ( s * T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] );
				T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] = ( -s * T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ) + ( c * T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] );
				T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] = temp;
			}
			if ( ilz ) {
				// Apply from right to Z (DO 180)
				for ( jr = 0; jr < N; jr++ ) {
					temp = ( c * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] ) + ( s * Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] );
					Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] = ( -s * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] ) + ( c * Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] );
					Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] = temp;
				}
			}
		}
		// Label 350: continue to next iteration
	}

	// Label 200: Complex eigenvalue shift (double-shift for 2x2 block or implicit double shift for larger blocks)
	function doComplexShift() { // eslint-disable-line max-statements
		if ( ifirst + 1 === ilast ) {
			// 2x2 block: compute eigenvalues directly
			do2x2Block();
		} else {
			// Larger block: implicit double shift QZ step
			doDoubleShiftQZStep();
		}
	}

	// 2x2 block eigenvalue extraction (label 200, IFIRST+1==ILAST case)
	function do2x2Block() { // eslint-disable-line max-statements
		// Compute SVD of T(ilast-1:ilast, ilast-1:ilast)
		svd = dlasv2(
			T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ],
			T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ilast * strideT2 ) ],
			T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ]
		);
		b22 = svd.ssmin;
		b11 = svd.ssmax;
		sr = svd.snr;
		cr = svd.csr;
		sl = svd.snl;
		cl = svd.csl;

		if ( b11 < ZERO ) {
			cr = -cr;
			sr = -sr;
			b11 = -b11;
			b22 = -b22;
		}

		// Apply rotations
		drot( ilastm + 1 - ifirst, H, strideH2, offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ), H, strideH2, offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ), cl, sl );
		drot( ilast + 1 - ifrstm, H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( ( ilast - 1 ) * strideH2 ), H, strideH1, offsetH + ( ifrstm * strideH1 ) + ( ilast * strideH2 ), cr, sr );

		if ( ilast < ilastm ) {
			drot( ilastm - ilast, T, strideT2, offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast + 1 ) * strideT2 ), T, strideT2, offsetT + ( ilast * strideT1 ) + ( ( ilast + 1 ) * strideT2 ), cl, sl );
		}
		if ( ifrstm < ilast - 1 ) {
			drot( ifirst - ifrstm, T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( ( ilast - 1 ) * strideT2 ), T, strideT1, offsetT + ( ifrstm * strideT1 ) + ( ilast * strideT2 ), cr, sr );
		}

		if ( ilq ) {
			drot( N, Q, strideQ1, offsetQ + ( ( ilast - 1 ) * strideQ2 ), Q, strideQ1, offsetQ + ( ilast * strideQ2 ), cl, sl );
		}
		if ( ilz ) {
			drot( N, Z, strideZ1, offsetZ + ( ( ilast - 1 ) * strideZ2 ), Z, strideZ1, offsetZ + ( ilast * strideZ2 ), cr, sr );
		}

		T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ] = b11;
		T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ilast * strideT2 ) ] = ZERO;
		T[ offsetT + ( ilast * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ] = ZERO;
		T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] = b22;

		// Ensure positive diagonal of T
		if ( b22 < ZERO ) {
			for ( j = ifrstm; j <= ilast; j++ ) {
				H[ offsetH + ( j * strideH1 ) + ( ilast * strideH2 ) ] = -H[ offsetH + ( j * strideH1 ) + ( ilast * strideH2 ) ];
				T[ offsetT + ( j * strideT1 ) + ( ilast * strideT2 ) ] = -T[ offsetT + ( j * strideT1 ) + ( ilast * strideT2 ) ];
			}
			if ( ilz ) {
				for ( j = 0; j < N; j++ ) {
					Z[ offsetZ + ( j * strideZ1 ) + ( ilast * strideZ2 ) ] = -Z[ offsetZ + ( j * strideZ1 ) + ( ilast * strideZ2 ) ];
				}
			}
			b22 = -b22;
		}

		// Compute eigenvalues of the 2x2 block
		lag2 = dlag2(
			H, strideH1, strideH2, offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ),
			T, strideT1, strideT2, offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ),
			SAFMIN * SAFETY
		);
		s1 = lag2.scale1;
		temp = lag2.scale2;
		wr = lag2.wr1;
		temp2 = lag2.wr2;
		wi = lag2.wi;

		// If the eigenvalues are real, we need to go back to label 350
		if ( wi === ZERO ) {
			// Label 350: continue
			return;
		}
		s1inv = ONE / s1;

		// Compute the complex Schur form
		a11 = H[ offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ];
		a21 = H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ];
		a12 = H[ offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ilast * strideH2 ) ];
		a22 = H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ];

		c11r = ( s1 * a11 ) - ( wr * b11 );
		c11i = -( wi * b11 );
		c12 = s1 * a12;
		c21 = s1 * a21;
		c22r = ( s1 * a22 ) - ( wr * b22 );
		c22i = -( wi * b22 );

		if ( Math.abs( c11r ) + Math.abs( c11i ) + Math.abs( c12 ) > Math.abs( c21 ) + Math.abs( c22r ) + Math.abs( c22i ) ) {
			t1 = dlapy3( c12, c11r, c11i );
			cz = c12 / t1;
			szr = -c11r / t1;
			szi = -c11i / t1;
		} else {
			cz = dlapy2( c22r, c22i );
			if ( cz <= SAFMIN ) {
				cz = ZERO;
				szr = ONE;
				szi = ZERO;
			} else {
				tempr = c22r / cz;
				tempi = c22i / cz;
				t1 = dlapy2( cz, c21 );
				cz /= t1;
				szr = -( c21 * tempr ) / t1;
				szi = ( c21 * tempi ) / t1;
			}
		}

		// Compute CQ, SQR, SQI
		an = Math.abs( a11 ) + Math.abs( a12 ) + Math.abs( a21 ) + Math.abs( a22 );
		bn = Math.abs( b11 ) + Math.abs( b22 );
		wabs = Math.abs( wr ) + Math.abs( wi );
		if ( s1 * an > wabs * bn ) {
			cq = cz * b11;
			sqr = szr * b22;
			sqi = -szi * b22;
		} else {
			a1r = ( cz * a11 ) + ( szr * a12 );
			a1i = szi * a12;
			a2r = ( cz * a21 ) + ( szr * a22 );
			a2i = szi * a22;
			cq = dlapy2( a1r, a1i );
			if ( cq <= SAFMIN ) {
				cq = ZERO;
				sqr = ONE;
				sqi = ZERO;
			} else {
				tempr = a1r / cq;
				tempi = a1i / cq;
				sqr = ( tempr * a2r ) + ( tempi * a2i );
				sqi = ( tempi * a2r ) - ( tempr * a2i );
			}
		}
		t1 = dlapy3( cq, sqr, sqi );
		cq /= t1;
		sqr /= t1;
		sqi /= t1;

		// Compute BETA and ALPHA for the two eigenvalues
		tempr = ( sqr * szr ) - ( sqi * szi );
		tempi = ( sqr * szi ) + ( sqi * szr );
		b1r = ( cq * cz * b11 ) + ( tempr * b22 );
		b1i = tempi * b22;
		b1a = dlapy2( b1r, b1i );
		b2r = ( cq * cz * b22 ) + ( tempr * b11 );
		b2i = -tempi * b11;
		b2a = dlapy2( b2r, b2i );

		BETA[ offsetBETA + ( ( ilast - 1 ) * strideBETA ) ] = b1a;
		BETA[ offsetBETA + ( ilast * strideBETA ) ] = b2a;
		ALPHAR[ offsetALPHAR + ( ( ilast - 1 ) * strideALPHAR ) ] = ( wr * b1a ) * s1inv;
		ALPHAI[ offsetALPHAI + ( ( ilast - 1 ) * strideALPHAI ) ] = ( wi * b1a ) * s1inv;
		ALPHAR[ offsetALPHAR + ( ilast * strideALPHAR ) ] = ( wr * b2a ) * s1inv;
		ALPHAI[ offsetALPHAI + ( ilast * strideALPHAI ) ] = -( wi * b2a ) * s1inv;

		// Deflate by 2
		ilast = ifirst - 1;
		if ( ilast < ilo ) {
			// All eigenvalues found — go to label 380
			info = handleLowEigenvalues( ilo, ilschr, ilz, N, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Z, strideZ1, strideZ2, offsetZ );
			done = true;
			return;
		}

		// Reset iteration counter
		iiter = 0;
		eshift = ZERO;
		if ( !ilschr ) {
			ilastm = ilast;
			if ( ifrstm > ilast ) {
				ifrstm = ilo;
			}
		}
		// Label 350: continue
	}

	// Implicit double shift QZ step (label 200, larger block case)
	function doDoubleShiftQZStep() { // eslint-disable-line max-statements
		// Compute shift vector from bottom 2x2 block
		ad11 = ( ascale * H[ offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ] );
		ad21 = ( ascale * H[ offsetH + ( ilast * strideH1 ) + ( ( ilast - 1 ) * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ( ilast - 1 ) * strideT2 ) ] );
		ad12 = ( ascale * H[ offsetH + ( ( ilast - 1 ) * strideH1 ) + ( ilast * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] );
		ad22 = ( ascale * H[ offsetH + ( ilast * strideH1 ) + ( ilast * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ] );
		u12 = T[ offsetT + ( ( ilast - 1 ) * strideT1 ) + ( ilast * strideT2 ) ] / T[ offsetT + ( ilast * strideT1 ) + ( ilast * strideT2 ) ];
		ad11l = ( ascale * H[ offsetH + ( ifirst * strideH1 ) + ( ifirst * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ifirst * strideT1 ) + ( ifirst * strideT2 ) ] );
		ad21l = ( ascale * H[ offsetH + ( ( ifirst + 1 ) * strideH1 ) + ( ifirst * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ifirst * strideT1 ) + ( ifirst * strideT2 ) ] );
		ad12l = ( ascale * H[ offsetH + ( ifirst * strideH1 ) + ( ( ifirst + 1 ) * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ( ifirst + 1 ) * strideT1 ) + ( ( ifirst + 1 ) * strideT2 ) ] );
		ad22l = ( ascale * H[ offsetH + ( ( ifirst + 1 ) * strideH1 ) + ( ( ifirst + 1 ) * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ( ifirst + 1 ) * strideT1 ) + ( ( ifirst + 1 ) * strideT2 ) ] );
		ad32l = ( ascale * H[ offsetH + ( ( ifirst + 2 ) * strideH1 ) + ( ( ifirst + 1 ) * strideH2 ) ] ) / ( bscale * T[ offsetT + ( ( ifirst + 1 ) * strideT1 ) + ( ( ifirst + 1 ) * strideT2 ) ] );
		u12l = T[ offsetT + ( ifirst * strideT1 ) + ( ( ifirst + 1 ) * strideT2 ) ] / T[ offsetT + ( ( ifirst + 1 ) * strideT1 ) + ( ( ifirst + 1 ) * strideT2 ) ];

		v1 = ( ( ad11 - ad11l ) * ( ad22 - ad11l ) ) - ( ad12 * ad21 ) + ( ad21 * u12 * ad11l ) + ( ( ad12l - ( ad11l * u12l ) ) * ad21l );
		v2 = ( ( ( ad22l - ad11l ) - ( ad21l * u12l ) - ( ad11 - ad11l ) - ( ad22 - ad11l ) ) + ( ad21 * u12 ) ) * ad21l;
		v3 = ad32l * ad21l;

		istart = ifirst;

		// Apply Householder reflector
		ALPHABUF[ 0 ] = v1;
		WORK[ offsetWork ] = v2;
		WORK[ offsetWork + strideWork ] = v3;
		dlarfg( 3, ALPHABUF, 0, WORK, strideWork, offsetWork, TAUBUF, 0 );
		tau = TAUBUF[ 0 ];
		v1 = ONE;
		v2 = WORK[ offsetWork ];
		v3 = WORK[ offsetWork + strideWork ];

		// DO 290 loop: main implicit double-shift chase
		for ( j = istart; j <= ilast - 2; j++ ) {
			if ( j > istart ) {
				v1 = H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ];
				v2 = H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ];
				v3 = H[ offsetH + ( ( j + 2 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ];

				ALPHABUF[ 0 ] = v1;
				WORK[ offsetWork ] = v2;
				WORK[ offsetWork + strideWork ] = v3;
				dlarfg( 3, ALPHABUF, 0, WORK, strideWork, offsetWork, TAUBUF, 0 );
				tau = TAUBUF[ 0 ];
				v1 = ONE;
				v2 = WORK[ offsetWork ];
				v3 = WORK[ offsetWork + strideWork ];

				H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ALPHABUF[ 0 ];
				H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ZERO;
				H[ offsetH + ( ( j + 2 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ZERO;
			}

			t2 = tau * v2;
			t3 = tau * v3;

			// Apply reflector from the left to H (DO 230)
			for ( jc = j; jc <= ilastm; jc++ ) {
				temp = H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] + ( v2 * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] ) + ( v3 * H[ offsetH + ( ( j + 2 ) * strideH1 ) + ( jc * strideH2 ) ] );
				H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] -= temp * tau;
				H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] -= temp * t2;
				H[ offsetH + ( ( j + 2 ) * strideH1 ) + ( jc * strideH2 ) ] -= temp * t3;
				temp2 = T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] + ( v2 * T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] ) + ( v3 * T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( jc * strideT2 ) ] );
				T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] -= temp2 * tau;
				T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] -= temp2 * t2;
				T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( jc * strideT2 ) ] -= temp2 * t3;
			}
			if ( ilq ) {
				// Apply reflector from right to Q (DO 240)
				for ( jr = 0; jr < N; jr++ ) {
					temp = Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] + ( v2 * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] ) + ( v3 * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 2 ) * strideQ2 ) ] );
					Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] -= temp * tau;
					Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] -= temp * t2;
					Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 2 ) * strideQ2 ) ] -= temp * t3;
				}
			}

			// Zero out T(j+2, j) and T(j+1, j) using Givens rotations
			ilpivt = false;
			temp = Math.max( Math.abs( T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ), Math.abs( T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ] ) );
			temp2 = Math.max( Math.abs( T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ), Math.abs( T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ] ) );

			if ( Math.max( temp, temp2 ) < SAFMIN ) {
				scale = ZERO;
				u1 = ONE;
				u2 = ZERO;
			} else if ( temp >= temp2 ) {
				w11 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
				w21 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
				w12 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ];
				w22 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ];
				u1 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ];
				u2 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( j * strideT2 ) ];
			} else {
				w21 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
				w11 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
				w22 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ];
				w12 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( ( j + 2 ) * strideT2 ) ];
				u2 = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ];
				u1 = T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( j * strideT2 ) ];
			}

			// Pivot if needed
			if ( Math.abs( w12 ) > Math.abs( w11 ) ) {
				ilpivt = true;
				temp = w12;
				temp2 = w22;
				w12 = w11;
				w22 = w21;
				w11 = temp;
				w21 = temp2;
			}

			// Gaussian elimination
			temp = w21 / w11;
			u2 -= ( temp * u1 );
			w22 -= ( temp * w12 );
			w21 = ZERO;

			// Compute scale
			scale = ONE;
			if ( Math.abs( w22 ) < SAFMIN ) {
				scale = ZERO;
				u2 = ONE;
				u1 = -w12 / w11;
			} else {
				if ( Math.abs( w22 ) < Math.abs( u2 ) ) {
					scale = Math.abs( w22 / u2 );
				}
				if ( Math.abs( w11 ) < Math.abs( u1 ) ) {
					scale = Math.min( scale, Math.abs( w11 / u1 ) );
				}

				// Back-substitution
				u2 = ( scale * u2 ) / w22;
				u1 = ( ( scale * u1 ) - ( w12 * u2 ) ) / w11;
			}

			// Undo pivot
			if ( ilpivt ) {
				temp = u2;
				u2 = u1;
				u1 = temp;
			}

			// Construct Householder reflector
			t1 = Math.sqrt( ( scale * scale ) + ( u1 * u1 ) + ( u2 * u2 ) );
			tau = ONE + ( scale / t1 );
			vs = -ONE / ( scale + t1 );
			v1 = ONE;
			v2 = vs * u1;
			v3 = vs * u2;

			// Apply reflector from the right to H (DO 260)
			t2 = tau * v2;
			t3 = tau * v3;
			for ( jr = ifrstm; jr <= Math.min( j + 3, ilast ); jr++ ) {
				temp = H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] + ( v2 * H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] ) + ( v3 * H[ offsetH + ( jr * strideH1 ) + ( ( j + 2 ) * strideH2 ) ] );
				H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] -= temp * tau;
				H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] -= temp * t2;
				H[ offsetH + ( jr * strideH1 ) + ( ( j + 2 ) * strideH2 ) ] -= temp * t3;
			}
			// Apply reflector from the right to T (DO 270)
			for ( jr = ifrstm; jr <= j + 2; jr++ ) {
				temp = T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] + ( v2 * T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ) + ( v3 * T[ offsetT + ( jr * strideT1 ) + ( ( j + 2 ) * strideT2 ) ] );
				T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] -= temp * tau;
				T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] -= temp * t2;
				T[ offsetT + ( jr * strideT1 ) + ( ( j + 2 ) * strideT2 ) ] -= temp * t3;
			}
			if ( ilz ) {
				// Apply reflector from the right to Z (DO 280)
				for ( jr = 0; jr < N; jr++ ) {
					temp = Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] + ( v2 * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] ) + ( v3 * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 2 ) * strideZ2 ) ] );
					Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] -= temp * tau;
					Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] -= temp * t2;
					Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 2 ) * strideZ2 ) ] -= temp * t3;
				}
			}
			T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ] = ZERO;
			T[ offsetT + ( ( j + 2 ) * strideT1 ) + ( j * strideT2 ) ] = ZERO;
		}
		// End DO 290

		// Last step: 2x2 rotation to finish the chase (after DO 290)
		j = ilast - 1;
		temp = H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ];
		dlartg( temp, H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ], GIVENSBUF );
		c = GIVENSBUF[ 0 ];
		s = GIVENSBUF[ 1 ];
		H[ offsetH + ( j * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = GIVENSBUF[ 2 ];
		H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( ( j - 1 ) * strideH2 ) ] = ZERO;

		// Apply from left (DO 300)
		for ( jc = j; jc <= ilastm; jc++ ) {
			temp = ( c * H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] ) + ( s * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] );
			H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] = ( -s * H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] ) + ( c * H[ offsetH + ( ( j + 1 ) * strideH1 ) + ( jc * strideH2 ) ] );
			H[ offsetH + ( j * strideH1 ) + ( jc * strideH2 ) ] = temp;
			temp2 = ( c * T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] ) + ( s * T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] );
			T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] = ( -s * T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] ) + ( c * T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( jc * strideT2 ) ] );
			T[ offsetT + ( j * strideT1 ) + ( jc * strideT2 ) ] = temp2;
		}
		if ( ilq ) {
			for ( jr = 0; jr < N; jr++ ) {
				temp = ( c * Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] ) + ( s * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] );
				Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] = ( -s * Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] ) + ( c * Q[ offsetQ + ( jr * strideQ1 ) + ( ( j + 1 ) * strideQ2 ) ] );
				Q[ offsetQ + ( jr * strideQ1 ) + ( j * strideQ2 ) ] = temp;
			}
		}

		// Compute right Givens to zero T(j+1, j)
		temp = T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ];
		dlartg( temp, T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ], GIVENSBUF );
		c = GIVENSBUF[ 0 ];
		s = GIVENSBUF[ 1 ];
		T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] = GIVENSBUF[ 2 ];
		T[ offsetT + ( ( j + 1 ) * strideT1 ) + ( j * strideT2 ) ] = ZERO;

		// Apply from right to H (DO 320)
		for ( jr = ifrstm; jr <= ilast; jr++ ) {
			temp = ( c * H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] ) + ( s * H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] );
			H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] = ( -s * H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] ) + ( c * H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] );
			H[ offsetH + ( jr * strideH1 ) + ( ( j + 1 ) * strideH2 ) ] = temp;
		}
		// Apply from right to T (DO 330)
		for ( jr = ifrstm; jr <= ilast - 1; jr++ ) {
			temp = ( c * T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ) + ( s * T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] );
			T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] = ( -s * T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] ) + ( c * T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] );
			T[ offsetT + ( jr * strideT1 ) + ( ( j + 1 ) * strideT2 ) ] = temp;
		}
		if ( ilz ) {
			for ( jr = 0; jr < N; jr++ ) {
				temp = ( c * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] ) + ( s * Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] );
				Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] = ( -s * Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] ) + ( c * Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] );
				Z[ offsetZ + ( jr * strideZ1 ) + ( ( j + 1 ) * strideZ2 ) ] = temp;
			}
		}
		// Label 350: continue
	}
}

// -----------------------------------------------------------------------
// Label 380: handle eigenvalues below the active block (j=0..ilo-1)
// -----------------------------------------------------------------------
function handleLowEigenvalues( ilo, ilschr, ilz, N, H, strideH1, strideH2, offsetH, T, strideT1, strideT2, offsetT, ALPHAR, strideALPHAR, offsetALPHAR, ALPHAI, strideALPHAI, offsetALPHAI, BETA, strideBETA, offsetBETA, Z, strideZ1, strideZ2, offsetZ ) { // eslint-disable-line max-len, max-params
	var jr;
	var j;

	for ( j = 0; j < ilo; j++ ) {
		if ( T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] < ZERO ) {
			if ( ilschr ) {
				for ( jr = 0; jr <= j; jr++ ) {
					H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ] = -H[ offsetH + ( jr * strideH1 ) + ( j * strideH2 ) ];
					T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ] = -T[ offsetT + ( jr * strideT1 ) + ( j * strideT2 ) ];
				}
			} else {
				H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ] = -H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ];
				T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ] = -T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ];
			}
			if ( ilz ) {
				for ( jr = 0; jr < N; jr++ ) {
					Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ] = -Z[ offsetZ + ( jr * strideZ1 ) + ( j * strideZ2 ) ];
				}
			}
		}
		ALPHAR[ offsetALPHAR + ( j * strideALPHAR ) ] = H[ offsetH + ( j * strideH1 ) + ( j * strideH2 ) ];
		ALPHAI[ offsetALPHAI + ( j * strideALPHAI ) ] = ZERO;
		BETA[ offsetBETA + ( j * strideBETA ) ] = T[ offsetT + ( j * strideT1 ) + ( j * strideT2 ) ];
	}
	return 0;
}


// EXPORTS //

export default dhgeqz;
