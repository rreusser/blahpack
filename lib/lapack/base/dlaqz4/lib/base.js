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

/* eslint-disable max-len, max-params, max-statements, max-lines-per-function, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import dgemm from '../../../../blas/base/dgemm/lib/ndarray.js';
import drot from '../../../../blas/base/drot/lib/ndarray.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlaqz1 from '../../dlaqz1/lib/base.js';
import dlaqz2 from '../../dlaqz2/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';


// MAIN //

/**
* Executes a single multishift QZ sweep on the matrix pencil `(A, B)`.
*
* ## Notes
*
* -   `ilo`, `ihi` follow Fortran semantics: the active range is rows/columns `ilo .. ihi` (1-based, inclusive). At the JS API boundary the indices are passed in 0-based form (`ilo`, `ihi` are 0-based row/column indices) and converted internally.
* -   The shift triplets `(SR, SI, SS)` are expected to be in complex-conjugate pairs `(sr, ±si)` with a common scale `ss`. The routine shuffles unpaired entries forward into the unused tail before sweeping.
* -   If `nshifts < 2` or `ilo >= ihi`, the routine returns immediately.
* -   `info = -8` when `nblockDesired < nshifts + 1`. The Fortran workspace-size check (`info = -25`) is removed in JS because `WORK` is sized externally and the routine never uses more than `N * nblockDesired` doubles.
*
* @private
* @param {boolean} ilschur - if true, update the full Schur form; otherwise restrict updates to the active window
* @param {boolean} ilq - if true, update the matrix `Q`
* @param {boolean} ilz - if true, update the matrix `Z`
* @param {NonNegativeInteger} N - order of the matrices `A`, `B`, `Q`, `Z`
* @param {NonNegativeInteger} ilo - (0-based) first index of the active Hessenberg region
* @param {NonNegativeInteger} ihi - (0-based) last index of the active Hessenberg region
* @param {NonNegativeInteger} nshifts - desired number of shifts to use
* @param {PositiveInteger} nblockDesired - desired size of the computational windows
* @param {Float64Array} SR - real parts of the shifts
* @param {integer} strideSR - stride for `SR`
* @param {NonNegativeInteger} offsetSR - starting index for `SR`
* @param {Float64Array} SI - imaginary parts of the shifts
* @param {integer} strideSI - stride for `SI`
* @param {NonNegativeInteger} offsetSI - starting index for `SI`
* @param {Float64Array} SS - scales of the shifts
* @param {integer} strideSS - stride for `SS`
* @param {NonNegativeInteger} offsetSS - starting index for `SS`
* @param {Float64Array} A - matrix `A`
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - matrix `B`
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - matrix `Q`
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - matrix `Z`
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {Float64Array} QC - workspace matrix (`nblockDesired`-by-`nblockDesired`)
* @param {integer} strideQC1 - stride of the first dimension of `QC`
* @param {integer} strideQC2 - stride of the second dimension of `QC`
* @param {NonNegativeInteger} offsetQC - starting index for `QC`
* @param {Float64Array} ZC - workspace matrix (`nblockDesired`-by-`nblockDesired`)
* @param {integer} strideZC1 - stride of the first dimension of `ZC`
* @param {integer} strideZC2 - stride of the second dimension of `ZC`
* @param {NonNegativeInteger} offsetZC - starting index for `ZC`
* @param {Float64Array} WORK - workspace of size at least `N * nblockDesired`
* @param {integer} strideWork - stride for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @returns {integer} status code (`0` on success, negative on illegal argument)
*/
function dlaqz4( ilschur, ilq, ilz, N, ilo, ihi, nshifts, nblockDesired, SR, strideSR, offsetSR, SI, strideSI, offsetSI, SS, strideSS, offsetSS, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, QC, strideQC1, strideQC2, offsetQC, ZC, strideZC1, strideZC2, offsetZC, WORK, strideWork, offsetWork ) {
	var SHEIGHT;
	var ISTARTM;
	var ISTARTB;
	var NBLOCK;
	var ISHIFT;
	var ISTOPM;
	var ISTOPB;
	var SWIDTH;
	var NPOS;
	var TEMP;
	var SWAP;
	var info;
	var iSI;
	var iSR;
	var iSS;
	var IHI;
	var ILO;
	var out;
	var NP;
	var NS;
	var c1;
	var c2;
	var s1;
	var s2;
	var I;
	var J;
	var K;
	var V;

	info = 0;
	if ( nblockDesired < nshifts + 1 ) {
		info = -8;
	}
	if ( info !== 0 ) {
		return info;
	}

	// Quick returns:
	if ( nshifts < 2 ) {
		return 0;
	}
	if ( ilo >= ihi ) {
		return 0;
	}

	// Convert API 0-based ilo/ihi to 1-based internals:
	ILO = ilo + 1;
	IHI = ihi + 1;

	// Set active window:
	if ( ilschur ) {
		ISTARTM = 1;
		ISTOPM = N;
	} else {
		ISTARTM = ILO;
		ISTOPM = IHI;
	}

	// Shuffle shifts into pairs of real shifts and pairs of complex conjugate shifts assuming complex conjugate shifts are already adjacent to one another:
	for ( I = 1; I <= nshifts - 2; I += 2 ) {
		iSI = offsetSI + ( ( I - 1 ) * strideSI );
		if ( SI[ iSI ] !== -SI[ iSI + strideSI ] ) {
			iSR = offsetSR + ( ( I - 1 ) * strideSR );
			iSS = offsetSS + ( ( I - 1 ) * strideSS );

			SWAP = SR[ iSR ];
			SR[ iSR ] = SR[ iSR + strideSR ];
			SR[ iSR + strideSR ] = SR[ iSR + ( 2 * strideSR ) ];
			SR[ iSR + ( 2 * strideSR ) ] = SWAP;

			SWAP = SI[ iSI ];
			SI[ iSI ] = SI[ iSI + strideSI ];
			SI[ iSI + strideSI ] = SI[ iSI + ( 2 * strideSI ) ];
			SI[ iSI + ( 2 * strideSI ) ] = SWAP;

			SWAP = SS[ iSS ];
			SS[ iSS ] = SS[ iSS + strideSS ];
			SS[ iSS + strideSS ] = SS[ iSS + ( 2 * strideSS ) ];
			SS[ iSS + ( 2 * strideSS ) ] = SWAP;
		}
	}

	// NSHFTS is supposed to be even, but if it is odd, reduce it by one. The shuffle above ensures the dropped shift is real and the remaining shifts are paired:
	NS = nshifts - ( nshifts % 2 );
	NPOS = Math.max( nblockDesired - NS, 1 );

	// Scratch rotation output (cs, sn, r):
	out = new Float64Array( 3 );

	// V vector (length 3) used as scratch for dlaqz1:
	V = new Float64Array( 3 );

	// Introduce shifts at the top of the active window and chase each just enough to make room for the next. Near-the-diagonal block is `(NS+1) x NS`:
	dlaset( 'all', NS + 1, NS + 1, 0.0, 1.0, QC, strideQC1, strideQC2, offsetQC );
	dlaset( 'all', NS, NS, 0.0, 1.0, ZC, strideZC1, strideZC2, offsetZC );

	for ( I = 1; I <= NS; I += 2 ) {
		// Introduce the shift via dlaqz1 on the 3x3 block at (ILO, ILO).
		// Fortran: DLAQZ1( A(ILO,ILO), LDA, B(ILO,ILO), LDB, SR(I), SR(I+1), SI(I), SS(I), SS(I+1), V ):
		iSR = offsetSR + ( ( I - 1 ) * strideSR );
		iSI = offsetSI + ( ( I - 1 ) * strideSI );
		iSS = offsetSS + ( ( I - 1 ) * strideSS );
		dlaqz1( A, strideA1, strideA2, offsetA + ( (ILO-1) * strideA1 ) + ( (ILO-1) * strideA2 ), B, strideB1, strideB2, offsetB + ( (ILO-1) * strideB1 ) + ( (ILO-1) * strideB2 ), SR[ iSR ], SR[ iSR + strideSR ], SI[ iSI ], SS[ iSS ], SS[ iSS + strideSS ], V, 1, 0 );

		// Create the rotations that introduce the bulge.

		// DLARTG( V(2), V(3), C1, S1, V(2) ):
		TEMP = V[ 1 ];
		dlartg( TEMP, V[ 2 ], out );
		c1 = out[ 0 ];
		s1 = out[ 1 ];
		V[ 1 ] = out[ 2 ];

		// DLARTG( V(1), V(2), C2, S2, TEMP ):
		dlartg( V[ 0 ], V[ 1 ], out );
		c2 = out[ 0 ];
		s2 = out[ 1 ];

		// Apply rotations:

		// DROT( NS, A(ILO+1,ILO), LDA, A(ILO+2,ILO), LDA, C1, S1 ) — rotate rows ILO+1 and ILO+2 across NS columns starting at column ILO:
		drot( NS, A, strideA2, offsetA + ( ILO * strideA1 ) + ( (ILO-1) * strideA2 ), A, strideA2, offsetA + ( (ILO+1) * strideA1 ) + ( (ILO-1) * strideA2 ), c1, s1 );

		// DROT( NS, A(ILO,ILO), LDA, A(ILO+1,ILO), LDA, C2, S2 ):
		drot( NS, A, strideA2, offsetA + ( (ILO-1) * strideA1 ) + ( (ILO-1) * strideA2 ), A, strideA2, offsetA + ( ILO * strideA1 ) + ( (ILO-1) * strideA2 ), c2, s2 );

		// DROT( NS, B(ILO+1,ILO), LDB, B(ILO+2,ILO), LDB, C1, S1 ):
		drot( NS, B, strideB2, offsetB + ( ILO * strideB1 ) + ( (ILO-1) * strideB2 ), B, strideB2, offsetB + ( (ILO+1) * strideB1 ) + ( (ILO-1) * strideB2 ), c1, s1 );

		// DROT( NS, B(ILO,ILO), LDB, B(ILO+1,ILO), LDB, C2, S2 ):
		drot( NS, B, strideB2, offsetB + ( (ILO-1) * strideB1 ) + ( (ILO-1) * strideB2 ), B, strideB2, offsetB + ( ILO * strideB1 ) + ( (ILO-1) * strideB2 ), c2, s2 );

		// DROT( NS+1, QC(1,2), 1, QC(1,3), 1, C1, S1 ) — operates on column 2 vs 3 (1-based) = columns 1 vs 2 (0-based):
		drot( NS + 1, QC, strideQC1, offsetQC + strideQC2, QC, strideQC1, offsetQC + ( 2 * strideQC2 ), c1, s1 );

		// DROT( NS+1, QC(1,1), 1, QC(1,2), 1, C2, S2 ):
		drot( NS + 1, QC, strideQC1, offsetQC, QC, strideQC1, offsetQC + strideQC2, c2, s2 );

		// Chase the shift down:
		for ( J = 1; J <= NS - 1 - I; J++ ) {
			// CALL DLAQZ2( .TRUE., .TRUE., J, 1, NS, IHI-ILO+1, A(ILO,ILO), LDA, B(ILO,ILO), LDB, NS+1, 1, QC, LDQC, NS, 1, ZC, LDZC )
			// dlaqz2's k, istartm, istopm, ihi, qstart, zstart are 0-based:
			dlaqz2( true, true, J - 1, 0, NS - 1, IHI - ILO, A, strideA1, strideA2, offsetA + ( (ILO-1) * strideA1 ) + ( (ILO-1) * strideA2 ), B, strideB1, strideB2, offsetB + ( (ILO-1) * strideB1 ) + ( (ILO-1) * strideB2 ), NS + 1, 0, QC, strideQC1, strideQC2, offsetQC, NS, 0, ZC, strideZC1, strideZC2, offsetZC );
		}
	}

	// Update the rest of the pencil with the accumulated QC/ZC.

	// Update `A(ilo:ilo+ns, ilo+ns:istopm)` and `B(ilo:ilo+ns, ilo+ns:istopm)` from the left with `QC(1:ns+1, 1:ns+1)'`:
	SHEIGHT = NS + 1;
	SWIDTH = ISTOPM - ( ILO + NS ) + 1;
	if ( SWIDTH > 0 ) {
		// `WORK` is treated as `SHEIGHT`-by-`SWIDTH` column-major (leading dim `SHEIGHT`):
		dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, A, strideA1, strideA2, offsetA + ( (ILO-1) * strideA1 ) + ( (ILO+NS-1) * strideA2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( (ILO-1) * strideA1 ) + ( (ILO+NS-1) * strideA2 ) );
		dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, B, strideB1, strideB2, offsetB + ( (ILO-1) * strideB1 ) + ( (ILO+NS-1) * strideB2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( (ILO-1) * strideB1 ) + ( (ILO+NS-1) * strideB2 ) );
	}
	if ( ilq ) {
		// DGEMM( 'N', 'N', N, SHEIGHT, SHEIGHT, ONE, Q(1, ILO), LDQ, QC, LDQC, ZERO, WORK, N ):
		dgemm( 'no-transpose', 'no-transpose', N, SHEIGHT, SHEIGHT, 1.0, Q, strideQ1, strideQ2, offsetQ + ( (ILO-1) * strideQ2 ), QC, strideQC1, strideQC2, offsetQC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
		dlacpy( 'all', N, SHEIGHT, WORK, strideWork, N * strideWork, offsetWork, Q, strideQ1, strideQ2, offsetQ + ( (ILO-1) * strideQ2 ) );
	}

	// Update `A(istartm:ilo-1, ilo:ilo+ns-1)` and `B(istartm:ilo-1, ilo:ilo+ns-1)` from the right with `ZC(1:ns, 1:ns)`:
	SHEIGHT = ILO - 1 - ISTARTM + 1;
	SWIDTH = NS;
	if ( SHEIGHT > 0 ) {
		dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (ILO-1) * strideA2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (ILO-1) * strideA2 ) );
		dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (ILO-1) * strideB2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (ILO-1) * strideB2 ) );
	}
	if ( ilz ) {
		dgemm( 'no-transpose', 'no-transpose', N, SWIDTH, SWIDTH, 1.0, Z, strideZ1, strideZ2, offsetZ + ( (ILO-1) * strideZ2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
		dlacpy( 'all', N, SWIDTH, WORK, strideWork, N * strideWork, offsetWork, Z, strideZ1, strideZ2, offsetZ + ( (ILO-1) * strideZ2 ) );
	}

	// Chase the shifts down to the bottom-right block. If possible, move a shift down `NPOS` positions at a time:
	K = ILO;
	while ( K < IHI - NS ) {
		NP = Math.min( IHI - NS - K, NPOS );

		// Size of the near-the-diagonal block:
		NBLOCK = NS + NP;

		// First row we will be updating:
		ISTARTB = K + 1;

		// Last column we will be updating:
		ISTOPB = K + NBLOCK - 1;

		dlaset( 'all', NS + NP, NS + NP, 0.0, 1.0, QC, strideQC1, strideQC2, offsetQC );
		dlaset( 'all', NS + NP, NS + NP, 0.0, 1.0, ZC, strideZC1, strideZC2, offsetZC );

		// Near-the-diagonal shift chase:
		for ( I = NS - 1; I >= 0; I -= 2 ) {
			for ( J = 0; J <= NP - 1; J++ ) {
				// CALL DLAQZ2( .TRUE., .TRUE., K+I+J-1, ISTARTB, ISTOPB, IHI, A, LDA, B, LDB, NBLOCK, K+1, QC, LDQC, NBLOCK, K, ZC, LDZC )
				// 0-based: k = (K+I+J-1)-1, qstart = (K+1)-1 = K, zstart = K-1:
				dlaqz2( true, true, K + I + J - 2, ISTARTB - 1, ISTOPB - 1, IHI - 1, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, NBLOCK, K, QC, strideQC1, strideQC2, offsetQC, NBLOCK, K - 1, ZC, strideZC1, strideZC2, offsetZC );
			}
		}

		// Update the rest of the pencil.

		// Update `A(k+1:k+ns+np, k+ns+np:istopm)` and `B(k+1:k+ns+np, k+ns+np:istopm)` from the left with `QC(1:ns+np, 1:ns+np)'`:
		SHEIGHT = NS + NP;
		SWIDTH = ISTOPM - ( K + NS + NP ) + 1;
		if ( SWIDTH > 0 ) {
			dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, A, strideA1, strideA2, offsetA + ( K * strideA1 ) + ( (K+NS+NP-1) * strideA2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
			dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( K * strideA1 ) + ( (K+NS+NP-1) * strideA2 ) );
			dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, B, strideB1, strideB2, offsetB + ( K * strideB1 ) + ( (K+NS+NP-1) * strideB2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
			dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( K * strideB1 ) + ( (K+NS+NP-1) * strideB2 ) );
		}
		if ( ilq ) {
			// DGEMM( 'N', 'N', N, NBLOCK, NBLOCK, ONE, Q(1, K+1), LDQ, QC, LDQC, ZERO, WORK, N ):
			dgemm( 'no-transpose', 'no-transpose', N, NBLOCK, NBLOCK, 1.0, Q, strideQ1, strideQ2, offsetQ + ( K * strideQ2 ), QC, strideQC1, strideQC2, offsetQC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
			dlacpy( 'all', N, NBLOCK, WORK, strideWork, N * strideWork, offsetWork, Q, strideQ1, strideQ2, offsetQ + ( K * strideQ2 ) );
		}

		// Update `A(istartm:k, k:k+ns+np-1)` and `B(istartm:k, k:k+ns+np-1)` from the right with `ZC(1:ns+np, 1:ns+np)`:
		SHEIGHT = K - ISTARTM + 1;
		SWIDTH = NBLOCK;
		if ( SHEIGHT > 0 ) {
			dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (K-1) * strideA2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
			dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (K-1) * strideA2 ) );
			dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (K-1) * strideB2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
			dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (K-1) * strideB2 ) );
		}
		if ( ilz ) {
			// DGEMM( 'N', 'N', N, NBLOCK, NBLOCK, ONE, Z(1, K), LDZ, ZC, LDZC, ZERO, WORK, N ):
			dgemm( 'no-transpose', 'no-transpose', N, NBLOCK, NBLOCK, 1.0, Z, strideZ1, strideZ2, offsetZ + ( (K-1) * strideZ2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
			dlacpy( 'all', N, NBLOCK, WORK, strideWork, N * strideWork, offsetWork, Z, strideZ1, strideZ2, offsetZ + ( (K-1) * strideZ2 ) );
		}

		K += NP;
	}

	// Remove the shifts from the bottom-right corner one by one. Updates are initially applied to `A(ihi-ns+1:ihi, ihi-ns:ihi)`:
	dlaset( 'all', NS, NS, 0.0, 1.0, QC, strideQC1, strideQC2, offsetQC );
	dlaset( 'all', NS + 1, NS + 1, 0.0, 1.0, ZC, strideZC1, strideZC2, offsetZC );

	ISTARTB = IHI - NS + 1;
	ISTOPB = IHI;

	for ( I = 1; I <= NS; I += 2 ) {
		// Chase the shift down to the bottom right corner:
		for ( ISHIFT = IHI - I - 1; ISHIFT <= IHI - 2; ISHIFT++ ) {
			// CALL DLAQZ2( .TRUE., .TRUE., ISHIFT, ISTARTB, ISTOPB, IHI, A, LDA, B, LDB, NS, IHI-NS+1, QC, LDQC, NS+1, IHI-NS, ZC, LDZC )
			dlaqz2( true, true, ISHIFT - 1, ISTARTB - 1, ISTOPB - 1, IHI - 1, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, NS, IHI - NS, QC, strideQC1, strideQC2, offsetQC, NS + 1, IHI - NS - 1, ZC, strideZC1, strideZC2, offsetZC );
		}
	}

	// Update the rest of the pencil.

	// Update `A(ihi-ns+1:ihi, ihi+1:istopm)` from the left with `QC(1:ns, 1:ns)'`:
	SHEIGHT = NS;
	SWIDTH = ISTOPM - ( IHI + 1 ) + 1;
	if ( SWIDTH > 0 ) {
		// DGEMM( 'T', 'N', SHEIGHT, SWIDTH, SHEIGHT, ONE, QC, LDQC, A(IHI-NS+1, IHI+1), LDA, ZERO, WORK, SHEIGHT ):
		dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, A, strideA1, strideA2, offsetA + ( (IHI-NS) * strideA1 ) + ( IHI * strideA2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( (IHI-NS) * strideA1 ) + ( IHI * strideA2 ) );
		dgemm( 'transpose', 'no-transpose', SHEIGHT, SWIDTH, SHEIGHT, 1.0, QC, strideQC1, strideQC2, offsetQC, B, strideB1, strideB2, offsetB + ( (IHI-NS) * strideB1 ) + ( IHI * strideB2 ), 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( (IHI-NS) * strideB1 ) + ( IHI * strideB2 ) );
	}
	if ( ilq ) {
		// DGEMM( 'N', 'N', N, NS, NS, ONE, Q(1, IHI-NS+1), LDQ, QC, LDQC, ZERO, WORK, N ):
		dgemm( 'no-transpose', 'no-transpose', N, NS, NS, 1.0, Q, strideQ1, strideQ2, offsetQ + ( (IHI-NS) * strideQ2 ), QC, strideQC1, strideQC2, offsetQC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
		dlacpy( 'all', N, NS, WORK, strideWork, N * strideWork, offsetWork, Q, strideQ1, strideQ2, offsetQ + ( (IHI-NS) * strideQ2 ) );
	}

	// Update `A(istartm:ihi-ns, ihi-ns:ihi)` from the right with `ZC(1:ns+1, 1:ns+1)`:
	SHEIGHT = IHI - NS - ISTARTM + 1;
	SWIDTH = NS + 1;
	if ( SHEIGHT > 0 ) {
		dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-NS-1) * strideA2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, A, strideA1, strideA2, offsetA + ( (ISTARTM-1) * strideA1 ) + ( (IHI-NS-1) * strideA2 ) );
		dgemm( 'no-transpose', 'no-transpose', SHEIGHT, SWIDTH, SWIDTH, 1.0, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-NS-1) * strideB2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, SHEIGHT * strideWork, offsetWork );
		dlacpy( 'all', SHEIGHT, SWIDTH, WORK, strideWork, SHEIGHT * strideWork, offsetWork, B, strideB1, strideB2, offsetB + ( (ISTARTM-1) * strideB1 ) + ( (IHI-NS-1) * strideB2 ) );
	}
	if ( ilz ) {
		// DGEMM( 'N', 'N', N, NS+1, NS+1, ONE, Z(1, IHI-NS), LDZ, ZC, LDZC, ZERO, WORK, N ):
		dgemm( 'no-transpose', 'no-transpose', N, NS + 1, NS + 1, 1.0, Z, strideZ1, strideZ2, offsetZ + ( (IHI-NS-1) * strideZ2 ), ZC, strideZC1, strideZC2, offsetZC, 0.0, WORK, strideWork, N * strideWork, offsetWork );
		dlacpy( 'all', N, NS + 1, WORK, strideWork, N * strideWork, offsetWork, Z, strideZ1, strideZ2, offsetZ + ( (IHI-NS-1) * strideZ2 ) );
	}

	return 0;
}


// EXPORTS //

export default dlaqz4;
