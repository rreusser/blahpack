/* eslint-disable max-len, max-params */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import dlapy2 from './../../../../lapack/base/dlapy2/lib/base.js';
import dznrm2 from './../../../../blas/base/dznrm2/lib/base.js';
import zdotc from './../../../../blas/base/zdotc/lib/base.js';
import zgemv from './../../../../blas/base/zgemv/lib/base.js';
import zlacpy from './../../../../lapack/base/zlacpy/lib/base.js';
import ztgexc from './../../../../lapack/base/ztgexc/lib/base.js';
import ztgsyl from './../../../../lapack/base/ztgsyl/lib/base.js';
import cmplx from './../../../../cmplx.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var IDIFJB = 3;


// MAIN //

/**
* Estimates reciprocal condition numbers for specified eigenvalues and/or right eigenvectors of a complex matrix pair (A,B) in generalized Schur form.
*
* ## Notes
*
* -   `job`: `'eigenvalues'` (reciprocal cond nums of eigenvalues → s), `'eigenvectors'` (reciprocal cond nums of eigenvectors → DIF), `'both'`.
* -   `howmny`: `'all'` (all eigenpairs) or `'selected'` (selected via SELECT).
* -   SELECT is a boolean array (truthy/falsy).
* -   A, B, VL, VR are Complex128Array.
* -   s, DIF are Float64Array.
* -   WORK, IWORK, lwork are unused; allocated internally.
* -   Returns `{ info, m }`.
*
* @private
* @param {string} job - one of `'eigenvalues'`, `'eigenvectors'`, `'both'`
* @param {string} howmny - one of `'all'`, `'selected'`
* @param {Uint8Array} SELECT - boolean selection array (length N)
* @param {integer} strideSELECT - stride for SELECT
* @param {NonNegativeInteger} offsetSELECT - offset for SELECT
* @param {NonNegativeInteger} N - matrix order
* @param {Complex128Array} A - N-by-N upper triangular matrix (generalized Schur form)
* @param {integer} strideA1 - stride of dim 1 of A (complex elements)
* @param {integer} strideA2 - stride of dim 2 of A (complex elements)
* @param {NonNegativeInteger} offsetA - complex offset for A
* @param {Complex128Array} B - N-by-N upper triangular matrix
* @param {integer} strideB1 - stride of dim 1 of B (complex elements)
* @param {integer} strideB2 - stride of dim 2 of B (complex elements)
* @param {NonNegativeInteger} offsetB - complex offset for B
* @param {Complex128Array} VL - left eigenvectors (N-by-MM)
* @param {integer} strideVL1 - stride of dim 1 of VL (complex elements)
* @param {integer} strideVL2 - stride of dim 2 of VL (complex elements)
* @param {NonNegativeInteger} offsetVL - complex offset for VL
* @param {Complex128Array} VR - right eigenvectors (N-by-MM)
* @param {integer} strideVR1 - stride of dim 1 of VR (complex elements)
* @param {integer} strideVR2 - stride of dim 2 of VR (complex elements)
* @param {NonNegativeInteger} offsetVR - complex offset for VR
* @param {Float64Array} s - output: reciprocal eigenvalue condition numbers
* @param {integer} strideS - stride for s
* @param {NonNegativeInteger} offsetS - offset for s
* @param {Float64Array} DIF - output: reciprocal eigenvector condition numbers
* @param {integer} strideDIF - stride for DIF
* @param {NonNegativeInteger} offsetDIF - offset for DIF
* @param {integer} mm - number of columns of VL/VR
* @param {integer} M - (ignored; returned)
* @param {Complex128Array} WORK - workspace (unused)
* @param {integer} strideWORK - workspace stride (unused)
* @param {NonNegativeInteger} offsetWORK - workspace offset (unused)
* @param {integer} lwork - workspace size (unused)
* @param {Int32Array} IWORK - workspace (unused)
* @param {integer} strideIWORK - workspace stride (unused)
* @param {NonNegativeInteger} offsetIWORK - workspace offset (unused)
* @returns {Object} result object with fields `info` and `m`
*/
function ztgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, M, WORK, strideWORK, offsetWORK, lwork, IWORK, strideIWORK, offsetIWORK ) { // eslint-disable-line no-unused-vars
	var wantbh;
	var wantdf;
	var somcon;
	var scaleV;
	var CZERO;
	var wants;
	var ia11;
	var ib11;
	var ifst;
	var ilst;
	var difV;
	var CONE;
	var yhax;
	var yhbx;
	var cond;
	var lnrm;
	var rnrm;
	var ierr;
	var cnt;
	var res;
	var IWK;
	var aa;
	var bb;
	var Av;
	var Bv;
	var ks;
	var WK;
	var n1;
	var n2;
	var k;

	wantbh = ( job === 'both' );
	wants = ( job === 'eigenvalues' || wantbh );
	wantdf = ( job === 'eigenvectors' || wantbh );
	somcon = ( howmny === 'selected' );

	// Count selected eigenvalues (compute M):
	if ( somcon ) {
		cnt = 0;
		for ( k = 0; k < N; k++ ) {
			if ( SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
				cnt += 1;
			}
		}
		M = cnt;
	} else {
		M = N;
	}

	if ( N === 0 ) {
		return {
			'info': 0,
			'm': M
		};
	}

	CONE = new Complex128( ONE, ZERO );
	CZERO = new Complex128( ZERO, ZERO );

	Av = reinterpret( A, 0 );
	Bv = reinterpret( B, 0 );

	ks = 0;
	for ( k = 0; k < N; k++ ) {
		if ( somcon ) {
			if ( !SELECT[ offsetSELECT + ( k * strideSELECT ) ] ) {
				continue; // eslint-disable-line no-continue
			}
		}

		// Eigenvalue condition number:
		if ( wants ) {
			// RNRM = ||VR(:,ks)||_2, LNRM = ||VL(:,ks)||_2:
			rnrm = dznrm2( N, VR, 1, offsetVR + ( ks * strideVR2 ) );
			lnrm = dznrm2( N, VL, 1, offsetVL + ( ks * strideVL2 ) );

			// WORK = A * VR(:,ks); YHAX = VL(:,ks)^H * WORK = zdotc(WORK, VL):
			WK = new Complex128Array( N );
			zgemv( 'no-transpose', N, N, CONE, A, strideA1, strideA2, offsetA, VR, 1, offsetVR + ( ks * strideVR2 ), CZERO, WK, 1, 0 );
			yhax = zdotc( N, WK, 1, 0, VL, 1, offsetVL + ( ks * strideVL2 ) );

			// WORK = B * VR(:,ks); YHBX = VL(:,ks)^H * WORK:
			zgemv( 'no-transpose', N, N, CONE, B, strideB1, strideB2, offsetB, VR, 1, offsetVR + ( ks * strideVR2 ), CZERO, WK, 1, 0 );
			yhbx = zdotc( N, WK, 1, 0, VL, 1, offsetVL + ( ks * strideVL2 ) );

			cond = dlapy2( cmplx.abs( yhax ), cmplx.abs( yhbx ) );
			if ( cond === ZERO ) {
				s[ offsetS + ( ks * strideS ) ] = -ONE;
			} else {
				s[ offsetS + ( ks * strideS ) ] = cond / ( rnrm * lnrm );
			}
		}

		// Eigenvector condition number:
		if ( wantdf ) {
			if ( N === 1 ) {
				ia11 = offsetA * 2;
				ib11 = offsetB * 2;
				aa = dlapy2( Av[ ia11 ], Av[ ia11 + 1 ] );
				bb = dlapy2( Bv[ ib11 ], Bv[ ib11 + 1 ] );
				DIF[ offsetDIF + ( ks * strideDIF ) ] = dlapy2( aa, bb );
			} else {
				// Allocate workspace as a single flat Complex128Array.
				// Fortran layout: WORK(1..N*N) = copy of A, WORK(N*N+1..2*N*N) = copy of B.
				// Then ztgsyl uses additional space starting at index 2*N*N for its DUMMY/workspace arg.
				// With n1=1, n2=N-1, ztgsyl needs at most 2*n1*n2 extra for ijob=IDIFJB (direct solve).
				// We allocate generously.
				n1 = 1;
				n2 = N - n1;
				WK = new Complex128Array( ( 2 * N * N ) + Math.max( 1, 4 * n1 * n2 ) );

				// Copy A, B into WK (contiguous, LD=N):
				zlacpy( 'full', N, N, A, strideA1, strideA2, offsetA, WK, 1, N, 0 );
				zlacpy( 'full', N, N, B, strideB1, strideB2, offsetB, WK, 1, N, N * N );

				// Move eigenvalue at k → position 0:
				ifst = k;
				ilst = 0;
				res = ztgexc( false, false, N, WK, 1, N, 0, WK, 1, N, N * N, WK, 1, 1, 0, WK, 1, 1, 0, ifst, ilst );
				ierr = res.info;

				if ( ierr > 0 ) {
					DIF[ offsetDIF + ( ks * strideDIF ) ] = ZERO;
				} else {
					IWK = new Int32Array( Math.max( 1, n1 + n2 + 6 ) );
					scaleV = new Float64Array( 1 );
					difV = new Float64Array( 1 );

					// Call ztgsyl with the submatrix offsets derived from the Fortran WORK layout (A-copy at WK[0..N*N-1], B-copy at WK[N*N..2*N*N-1], both with LD=N).  With n1=1, n2=N-1 the six array arguments map to offsets N*n1+n1, 0, n1, (N*n1+n1)+N*N, N*N, n1+N*N:
					ztgsyl( 'no-transpose', IDIFJB, n2, n1, WK, 1, N, ( N * n1 ) + n1, WK, 1, N, 0, WK, 1, N, n1, WK, 1, N, ( N * n1 ) + n1 + ( N * N ), WK, 1, N, N * N, WK, 1, N, n1 + ( N * N ), scaleV, difV, WK, 1, 2 * N * N, -1, IWK, 1, 0 );
					DIF[ offsetDIF + ( ks * strideDIF ) ] = difV[ 0 ];
				}
			}
		}

		ks += 1;
	}

	return {
		'info': 0,
		'm': M
	};
}


// EXPORTS //

export default ztgsna;
