
/* eslint-disable max-len, max-params, max-depth */

// MODULES //

import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import abs from '@stdlib/math/base/special/abs/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import sqrt from '@stdlib/math/base/special/sqrt/lib/index.js';
import dgemm from '../../../../blas/base/dgemm/lib/base.js';
import dgeqr2 from '../../dgeqr2/lib/base.js';
import dgerq2 from '../../dgerq2/lib/base.js';
import dlacpy from '../../dlacpy/lib/base.js';
import dlagv2 from '../../dlagv2/lib/base.js';
import dlamch from '../../dlamch/lib/base.js';
import dlartg from '../../dlartg/lib/base.js';
import dlassq from '../../dlassq/lib/base.js';
import dlaset from '../../dlaset/lib/base.js';
import dorg2r from '../../dorg2r/lib/base.js';
import dorgr2 from '../../dorgr2/lib/base.js';
import dorm2r from '../../dorm2r/lib/base.js';
import dormr2 from '../../dormr2/lib/base.js';
import drot from '../../../../blas/base/drot/lib/base.js';
import dscal from '../../../../blas/base/dscal/lib/base.js';
import dtgsy2 from '../../dtgsy2/lib/base.js';


// VARIABLES //

var ZERO = 0.0;
var ONE = 1.0;
var TWENTY = 20.0;
var LDST = 4;
var EPS = dlamch( 'precision' );
var SMLNUM = dlamch( 'safe-minimum' ) / EPS;


// MAIN //

/**
* Swaps adjacent diagonal 1-by-1 or 2-by-2 blocks in an upper (quasi) triangular matrix pair.
*
* @private
* @param {boolean} wantq - whether to update Q
* @param {boolean} wantz - whether to update Z
* @param {NonNegativeInteger} N - order of the matrices A and B
* @param {Float64Array} A - input matrix A (upper quasi-triangular)
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input matrix B (upper triangular)
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - orthogonal matrix Q
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - orthogonal matrix Z
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {integer} j1 - index of the first block (0-based)
* @param {integer} n1 - size of the first block (1 or 2)
* @param {integer} n2 - size of the second block (1 or 2)
* @param {Float64Array} WORK - workspace array
* @param {integer} strideWork - stride length for `WORK`
* @param {NonNegativeInteger} offsetWork - starting index for `WORK`
* @param {integer} lwork - length of workspace
* @returns {integer} status code (0 = success, 1 = swap rejected)
*/
function dtgex2( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1, n1, n2, WORK, strideWork, offsetWork, lwork ) { // eslint-disable-line max-len
	var threshb;
	var thresha;
	var dnormb;
	var dnorma;
	var dscale;
	var strong;
	var ircop;
	var licop;
	var iwork;
	var ddum;
	var dsum;
	var tcpy;
	var scpy;
	var taul;
	var taur;
	var weak;
	var info;
	var out;
	var res;
	var li;
	var ir;
	var ai;
	var ar;
	var be;
	var sa;
	var sb;
	var wk;
	var m;
	var f;
	var g;
	var s;
	var t;

	info = 0;

	// Quick return
	if ( N <= 1 || n1 <= 0 || n2 <= 0 ) {
		return info;
	}
	if ( n1 > N || ( j1 + n1 ) > N ) {
		return info;
	}
	m = n1 + n2;
	if ( lwork < max( 1, max( N * m, m * m * 2 ) ) ) {
		info = -16;
		WORK[ offsetWork ] = max( 1, max( N * m, m * m * 2 ) );
		return info;
	}

	weak = false;
	strong = false;

	// Local 4x4 scratch arrays (column-major, stride=LDST)
	li = new Float64Array( LDST * LDST );
	ir = new Float64Array( LDST * LDST );
	s = new Float64Array( LDST * LDST );
	t = new Float64Array( LDST * LDST );
	scpy = new Float64Array( LDST * LDST );
	tcpy = new Float64Array( LDST * LDST );
	ircop = new Float64Array( LDST * LDST );
	licop = new Float64Array( LDST * LDST );
	taul = new Float64Array( LDST );
	taur = new Float64Array( LDST );
	ai = new Float64Array( 2 );
	ar = new Float64Array( 2 );
	be = new Float64Array( 2 );
	iwork = new Int32Array( LDST + 2 );
	out = new Float64Array( 3 ); // for dlartg output
	wk = new Float64Array( max( 1, max( N * m, m * m * 2 ) ) );

	// Initialize LI and IR to zero
	dlaset( 'all', LDST, LDST, ZERO, ZERO, li, 1, LDST, 0 );
	dlaset( 'all', LDST, LDST, ZERO, ZERO, ir, 1, LDST, 0 );

	// Copy (A(j1:j1+m-1,j1:j1+m-1)) to S and (B(j1:j1+m-1,j1:j1+m-1)) to T
	dlacpy( 'all', m, m, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), s, 1, LDST, 0 );
	dlacpy( 'all', m, m, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), t, 1, LDST, 0 );

	// Compute norms of A and B subblocks
	dscale = ZERO;
	dsum = ONE;
	dlacpy( 'all', m, m, s, 1, LDST, 0, wk, 1, m, 0 );
	res = dlassq( m * m, wk, 1, 0, dscale, dsum );
	dscale = res.scl;
	dsum = res.sumsq;
	dnorma = dscale * sqrt( dsum );

	dscale = ZERO;
	dsum = ONE;
	dlacpy( 'all', m, m, t, 1, LDST, 0, wk, 1, m, 0 );
	res = dlassq( m * m, wk, 1, 0, dscale, dsum );
	dscale = res.scl;
	dsum = res.sumsq;
	dnormb = dscale * sqrt( dsum );

	// Thresholds
	thresha = max( TWENTY * EPS * dnorma, SMLNUM );
	threshb = max( TWENTY * EPS * dnormb, SMLNUM );

	if ( m === 2 ) {
		// 1x1 + 1x1 swap
		// s and t are column-major with stride LDST

		f = ( s[ 1 + ( 1 * LDST ) ] * t[ 0 ] ) - ( t[ 1 + ( 1 * LDST ) ] * s[ 0 ] );
		g = ( s[ 1 + ( 1 * LDST ) ] * t[ 1 * LDST ] ) - ( t[ 1 + ( 1 * LDST ) ] * s[ 1 * LDST ] );
		sa = abs( s[ 1 + ( 1 * LDST ) ] ) * abs( t[ 0 ] );
		sb = abs( s[ 0 ] ) * abs( t[ 1 + ( 1 * LDST ) ] );

		dlartg( f, g, out );
		ir[ 1 * LDST ] = out[ 0 ]; // ir(1,2) = c
		ir[ 0 ] = out[ 1 ];         // ir(1,1) = s (actually the result)
		ddum = out[ 2 ];             // eslint-disable-line no-unused-vars

		// Build 2x2 right rotation
		ir[ 1 ] = -ir[ 1 * LDST ];       // ir(2,1) = -ir(1,2)
		ir[ 1 + ( 1 * LDST ) ] = ir[ 0 ]; // ir(2,2) = ir(1,1)

		// Apply right rotation to columns of S: drot(2, S(1,1), 1, S(1,2), 1, ...)
		drot( 2, s, 1, 0, s, 1, LDST, ir[ 0 ], ir[ 1 ] );

		// Apply right rotation to columns of T
		drot( 2, t, 1, 0, t, 1, LDST, ir[ 0 ], ir[ 1 ] );

		if ( sa >= sb ) {
			dlartg( s[ 0 ], s[ 1 ], out );
		} else {
			dlartg( t[ 0 ], t[ 1 ], out );
		}
		li[ 0 ] = out[ 0 ];  // li(1,1) = c
		li[ 1 ] = out[ 1 ];  // li(2,1) = s

		// Apply left rotation to rows of S: drot(2, S(1,1), LDST, S(2,1), LDST, ...)
		drot( 2, s, LDST, 0, s, LDST, 1, li[ 0 ], li[ 1 ] );

		// Apply left rotation to rows of T
		drot( 2, t, LDST, 0, t, LDST, 1, li[ 0 ], li[ 1 ] );

		// Complete LI as 2x2 rotation matrix
		li[ 1 + ( 1 * LDST ) ] = li[ 0 ];       // li(2,2) = li(1,1)
		li[ 1 * LDST ] = -li[ 1 ];                // li(1,2) = -li(2,1)

		// Weak stability test
		weak = abs( s[ 1 ] ) <= thresha && abs( t[ 1 ] ) <= threshb;
		if ( !weak ) {
			info = 1;
			return info;
		}

		// Strong stability test (WANDS is always true)
		// Compute LI * S * IR^T - A(j1:j1+1,j1:j1+1) and check norm
		dlacpy( 'all', m, m, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), wk, 1, m, m * m );
		dgemm( 'no-transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, s, 1, LDST, 0, ZERO, wk, 1, m, 0 );
		dgemm( 'no-transpose', 'transpose', m, m, m, -ONE, wk, 1, m, 0, ir, 1, LDST, 0, ONE, wk, 1, m, m * m );
		dscale = ZERO;
		dsum = ONE;
		res = dlassq( m * m, wk, 1, m * m, dscale, dsum );
		dscale = res.scl;
		dsum = res.sumsq;
		sa = dscale * sqrt( dsum );

		dlacpy( 'all', m, m, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), wk, 1, m, m * m );
		dgemm( 'no-transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, t, 1, LDST, 0, ZERO, wk, 1, m, 0 );
		dgemm( 'no-transpose', 'transpose', m, m, m, -ONE, wk, 1, m, 0, ir, 1, LDST, 0, ONE, wk, 1, m, m * m );
		dscale = ZERO;
		dsum = ONE;
		res = dlassq( m * m, wk, 1, m * m, dscale, dsum );
		dscale = res.scl;
		dsum = res.sumsq;
		sb = dscale * sqrt( dsum );

		strong = sa <= thresha && sb <= threshb;
		if ( !strong ) { // NOTE: branch unreachable with well-formed upper-triangular inputs (1x1+1x1 strong stability)
			info = 1;
			return info;
		}

		// Apply the transformations to the full matrices
		// Right rotation on columns j1, j1+1 of A and B (rows 0..j1+1, i.e. j1+2 elements)
		drot( j1 + 2, A, strideA1, offsetA + ( j1 * strideA2 ), A, strideA1, offsetA + ( ( j1 + 1 ) * strideA2 ), ir[ 0 ], ir[ 1 ] );
		drot( j1 + 2, B, strideB1, offsetB + ( j1 * strideB2 ), B, strideB1, offsetB + ( ( j1 + 1 ) * strideB2 ), ir[ 0 ], ir[ 1 ] );

		// Left rotation on rows j1, j1+1 of A and B (columns j1..N-1, i.e. N-j1 elements)
		drot( N - j1, A, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), A, strideA2, offsetA + ( ( j1 + 1 ) * strideA1 ) + ( j1 * strideA2 ), li[ 0 ], li[ 1 ] );
		drot( N - j1, B, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), B, strideB2, offsetB + ( ( j1 + 1 ) * strideB1 ) + ( j1 * strideB2 ), li[ 0 ], li[ 1 ] );

		// Zero out subdiagonal
		A[ offsetA + ( ( j1 + 1 ) * strideA1 ) + ( j1 * strideA2 ) ] = ZERO;
		B[ offsetB + ( ( j1 + 1 ) * strideB1 ) + ( j1 * strideB2 ) ] = ZERO;

		// Update Z and Q
		if ( wantz ) {
			drot( N, Z, strideZ1, offsetZ + ( j1 * strideZ2 ), Z, strideZ1, offsetZ + ( ( j1 + 1 ) * strideZ2 ), ir[ 0 ], ir[ 1 ] );
		}
		if ( wantq ) {
			drot( N, Q, strideQ1, offsetQ + ( j1 * strideQ2 ), Q, strideQ1, offsetQ + ( ( j1 + 1 ) * strideQ2 ), li[ 0 ], li[ 1 ] );
		}

		return info;
	}

	// General case: M = 3 or 4 (blocks involving 2x2)
	return dtgex2General( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1, n1, n2, WORK, strideWork, offsetWork, lwork, m, li, ir, s, t, scpy, tcpy, ircop, licop, taul, taur, ai, ar, be, iwork, wk, thresha, threshb ); // eslint-disable-line max-len
}

/**
* General case handler for dtgex2 when m > 2 (involves at least one 2x2 block).
*
* @private
* @param {boolean} wantq - whether to update Q
* @param {boolean} wantz - whether to update Z
* @param {NonNegativeInteger} N - order of the matrices
* @param {Float64Array} A - input matrix A
* @param {integer} strideA1 - stride of the first dimension of `A`
* @param {integer} strideA2 - stride of the second dimension of `A`
* @param {NonNegativeInteger} offsetA - starting index for `A`
* @param {Float64Array} B - input matrix B
* @param {integer} strideB1 - stride of the first dimension of `B`
* @param {integer} strideB2 - stride of the second dimension of `B`
* @param {NonNegativeInteger} offsetB - starting index for `B`
* @param {Float64Array} Q - orthogonal matrix Q
* @param {integer} strideQ1 - stride of the first dimension of `Q`
* @param {integer} strideQ2 - stride of the second dimension of `Q`
* @param {NonNegativeInteger} offsetQ - starting index for `Q`
* @param {Float64Array} Z - orthogonal matrix Z
* @param {integer} strideZ1 - stride of the first dimension of `Z`
* @param {integer} strideZ2 - stride of the second dimension of `Z`
* @param {NonNegativeInteger} offsetZ - starting index for `Z`
* @param {integer} j1 - index of the first block (0-based)
* @param {integer} n1 - size of the first block
* @param {integer} n2 - size of the second block
* @param {Float64Array} WORK - workspace
* @param {integer} strideWork - stride of WORK
* @param {NonNegativeInteger} offsetWork - offset of WORK
* @param {integer} lwork - workspace length
* @param {integer} m - n1 + n2
* @param {Float64Array} li - left transformation scratch
* @param {Float64Array} ir - right transformation scratch
* @param {Float64Array} s - copy of A subblock
* @param {Float64Array} t - copy of B subblock
* @param {Float64Array} scpy - copy of s
* @param {Float64Array} tcpy - copy of t
* @param {Float64Array} ircop - copy of ir
* @param {Float64Array} licop - copy of li
* @param {Float64Array} taul - QR tau
* @param {Float64Array} taur - RQ tau
* @param {Float64Array} ai - alpha imaginary
* @param {Float64Array} ar - alpha real
* @param {Float64Array} be - beta
* @param {Int32Array} iwork - integer workspace
* @param {Float64Array} wk - general workspace
* @param {number} thresha - threshold for A
* @param {number} threshb - threshold for B
* @returns {integer} info
*/
function dtgex2General( wantq, wantz, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, Q, strideQ1, strideQ2, offsetQ, Z, strideZ1, strideZ2, offsetZ, j1, n1, n2, WORK, strideWork, offsetWork, lwork, m, li, ir, s, t, scpy, tcpy, ircop, licop, taul, taur, ai, ar, be, iwork, wk, thresha, threshb ) { // eslint-disable-line max-len
	var bqra21;
	var brqa21;
	var dscale;
	var strong;
	var linfo;
	var scale;
	var dsum;
	var idum;
	var lagv;
	var res;
	var sa;
	var sb;
	var i;

	// Scalars for dtgsy2
	scale = new Float64Array( 1 );
	idum = new Int32Array( 1 );

	// Solve the generalized Sylvester equation

	// Copy T(1:n1, n1+1:m) to LI, S(1:n1, n1+1:m) to IR(n2+1:m, n1+1:m)
	dlacpy( 'all', n1, n2, t, 1, LDST, n1 * LDST, li, 1, LDST, 0 );
	dlacpy( 'all', n1, n2, s, 1, LDST, n1 * LDST, ir, 1, LDST, n2 + ( n1 * LDST ) );

	// dtgsy2( trans, ijob, M, N, A, sA1, sA2, oA, B, sB1, sB2, oB, C, sC1, sC2, oC, D, sD1, sD2, oD, E, sE1, sE2, oE, F, sF1, sF2, oF, scale, rdsum, rdscal, IWORK, sIWORK, oIWORK, pq )
	dscale = new Float64Array( 1 );
	dsum = new Float64Array( 1 );
	dscale[ 0 ] = ZERO;
	dsum[ 0 ] = ONE;

	linfo = dtgsy2( 'no-transpose', 0, n1, n2, s, 1, LDST, 0, s, 1, LDST, ( n1 ) + ( n1 * LDST ), ir, 1, LDST, n2 + ( n1 * LDST ), t, 1, LDST, 0, t, 1, LDST, ( n1 ) + ( n1 * LDST ), li, 1, LDST, 0, scale, dsum, dscale, iwork, 1, 0, idum );
	if ( linfo !== 0 ) {
		return 1;
	}

	// Build the column transformations:
	// Negate first n1 rows of LI, set diagonal below
	for ( i = 0; i < n2; i++ ) {
		dscal( n1, -ONE, li, 1, i * LDST );
		li[ n1 + i + ( i * LDST ) ] = scale[ 0 ];
	}

	// QR factorization
	linfo = dgeqr2( m, n2, li, 1, LDST, 0, taul, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dgeqr2 does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dorg2r( m, m, n2, li, 1, LDST, 0, taul, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dorg2r does not fail on well-formed internal scratch arrays
		return 1;
	}

	// Build the row transformations:
	// Set diagonal of IR
	for ( i = 0; i < n1; i++ ) {
		ir[ ( n2 + i ) + ( i * LDST ) ] = scale[ 0 ];
	}

	// RQ factorization
	linfo = dgerq2( n1, m, ir, 1, LDST, n2, taur, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dgerq2 does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dorgr2( m, m, n1, ir, 1, LDST, 0, taur, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dorgr2 does not fail on well-formed internal scratch arrays
		return 1;
	}

	// Compute transformed S and T: LI^T * S * IR^T and LI^T * T * IR^T
	dgemm( 'transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, s, 1, LDST, 0, ZERO, wk, 1, m, 0 );
	dgemm( 'no-transpose', 'transpose', m, m, m, ONE, wk, 1, m, 0, ir, 1, LDST, 0, ZERO, s, 1, LDST, 0 );
	dgemm( 'transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, t, 1, LDST, 0, ZERO, wk, 1, m, 0 );
	dgemm( 'no-transpose', 'transpose', m, m, m, ONE, wk, 1, m, 0, ir, 1, LDST, 0, ZERO, t, 1, LDST, 0 );

	// Save copies
	dlacpy( 'all', m, m, s, 1, LDST, 0, scpy, 1, LDST, 0 );
	dlacpy( 'all', m, m, t, 1, LDST, 0, tcpy, 1, LDST, 0 );
	dlacpy( 'all', m, m, ir, 1, LDST, 0, ircop, 1, LDST, 0 );
	dlacpy( 'all', m, m, li, 1, LDST, 0, licop, 1, LDST, 0 );

	// Triangularize the B-part by RQ: T = R * Q
	linfo = dgerq2( m, m, t, 1, LDST, 0, taur, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dgerq2 does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dormr2( 'right', 'transpose', m, m, m, t, 1, LDST, 0, taur, 1, 0, s, 1, LDST, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dormr2 does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dormr2( 'left', 'no-transpose', m, m, m, t, 1, LDST, 0, taur, 1, 0, ir, 1, LDST, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dormr2 does not fail on well-formed internal scratch arrays
		return 1;
	}

	// Compute BRQA21: norm of lower-left block of S after RQ
	dscale[ 0 ] = ZERO;
	dsum[ 0 ] = ONE;
	for ( i = 0; i < n2; i++ ) {
		res = dlassq( n1, s, 1, n2 + ( i * LDST ), dscale[ 0 ], dsum[ 0 ] );
		dscale[ 0 ] = res.scl;
		dsum[ 0 ] = res.sumsq;
	}
	brqa21 = dscale[ 0 ] * sqrt( dsum[ 0 ] );

	// Triangularize the B-part by QR: TCPY
	linfo = dgeqr2( m, m, tcpy, 1, LDST, 0, taul, 1, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dgeqr2 does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dorm2r( 'left', 'transpose', m, m, m, tcpy, 1, LDST, 0, taul, 1, 0, scpy, 1, LDST, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dorm2r does not fail on well-formed internal scratch arrays
		return 1;
	}
	linfo = dorm2r( 'right', 'no-transpose', m, m, m, tcpy, 1, LDST, 0, taul, 1, 0, licop, 1, LDST, 0, wk, 1, 0 );
	if ( linfo !== 0 ) { // NOTE: unreachable — dorm2r does not fail on well-formed internal scratch arrays
		return 1;
	}

	// Compute BQRA21: norm of lower-left block of SCPY after QR
	dscale[ 0 ] = ZERO;
	dsum[ 0 ] = ONE;
	for ( i = 0; i < n2; i++ ) {
		res = dlassq( n1, scpy, 1, n2 + ( i * LDST ), dscale[ 0 ], dsum[ 0 ] );
		dscale[ 0 ] = res.scl;
		dsum[ 0 ] = res.sumsq;
	}
	bqra21 = dscale[ 0 ] * sqrt( dsum[ 0 ] );

	// Choose the better method
	if ( bqra21 <= brqa21 && bqra21 <= thresha ) {
		dlacpy( 'all', m, m, scpy, 1, LDST, 0, s, 1, LDST, 0 );
		dlacpy( 'all', m, m, tcpy, 1, LDST, 0, t, 1, LDST, 0 );
		dlacpy( 'all', m, m, ircop, 1, LDST, 0, ir, 1, LDST, 0 );
		dlacpy( 'all', m, m, licop, 1, LDST, 0, li, 1, LDST, 0 );
	} else if ( brqa21 >= thresha ) { // NOTE: hard to trigger — requires dtgsy2 success with both factorizations exceeding threshold
		return 1;
	}

	// Set lower triangle of T to zero
	dlaset( 'lower', m - 1, m - 1, ZERO, ZERO, t, 1, LDST, 1 );

	// Strong stability test (WANDS = true)
	dlacpy( 'all', m, m, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), wk, 1, m, m * m );
	dgemm( 'no-transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, s, 1, LDST, 0, ZERO, wk, 1, m, 0 );
	dgemm( 'no-transpose', 'no-transpose', m, m, m, -ONE, wk, 1, m, 0, ir, 1, LDST, 0, ONE, wk, 1, m, m * m );
	dscale[ 0 ] = ZERO;
	dsum[ 0 ] = ONE;
	res = dlassq( m * m, wk, 1, m * m, dscale[ 0 ], dsum[ 0 ] );
	sa = res.scl * sqrt( res.sumsq );

	dlacpy( 'all', m, m, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), wk, 1, m, m * m );
	dgemm( 'no-transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, t, 1, LDST, 0, ZERO, wk, 1, m, 0 );
	dgemm( 'no-transpose', 'no-transpose', m, m, m, -ONE, wk, 1, m, 0, ir, 1, LDST, 0, ONE, wk, 1, m, m * m );
	dscale[ 0 ] = ZERO;
	dsum[ 0 ] = ONE;
	res = dlassq( m * m, wk, 1, m * m, dscale[ 0 ], dsum[ 0 ] );
	sb = res.scl * sqrt( res.sumsq );

	strong = sa <= thresha && sb <= threshb;
	if ( !strong ) { // NOTE: unreachable — LI and IR are orthogonal by construction so LI*S*IR = A_orig
		return 1;
	}

	// Zero out (n2+1:m, 1:n2) block of S
	dlaset( 'all', n1, n2, ZERO, ZERO, s, 1, LDST, n2 );

	// Copy the transformed blocks back to A, B
	dlacpy( 'all', m, m, s, 1, LDST, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ) );
	dlacpy( 'all', m, m, t, 1, LDST, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ) );

	// Clear T scratch for reuse
	dlaset( 'all', LDST, LDST, ZERO, ZERO, t, 1, LDST, 0 );

	// Standardize second block: build the transformations to make the diag blocks standard
	dlaset( 'all', m, m, ZERO, ZERO, wk, 1, m, 0 );
	wk[ 0 ] = ONE;
	t[ 0 ] = ONE;
	idum[ 0 ] = lwork - ( m * m ) - 2;

	if ( n2 > 1 ) {
		lagv = dlagv2( A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( j1 * strideA2 ), B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( j1 * strideB2 ), ar, 1, 0, ai, 1, 0, be, 1, 0 );
		wk[ 0 ] = lagv.CSL;       // WORK(1)
		wk[ 1 ] = lagv.SNL;       // WORK(2)
		t[ 0 ] = lagv.CSR;        // T(1,1)
		t[ 1 ] = lagv.SNR;        // T(2,1)

		wk[ m ] = -wk[ 1 ];       // WORK(M+1) = -WORK(2)
		wk[ m + 1 ] = wk[ 0 ];    // WORK(M+2) = WORK(1)
		t[ 1 + ( 1 * LDST ) ] = t[ 0 ];    // T(N2,N2) = T(1,1)
		t[ LDST ] = -t[ 1 ];                // T(1,2) = -T(2,1)
	}
	wk[ ( m * m ) - 1 ] = ONE;  // WORK(M*M) = ONE
	t[ ( m - 1 ) + ( ( m - 1 ) * LDST ) ] = ONE; // T(M,M) = ONE

	if ( n1 > 1 ) {
		lagv = dlagv2( A, strideA1, strideA2, offsetA + ( ( j1 + n2 ) * strideA1 ) + ( ( j1 + n2 ) * strideA2 ), B, strideB1, strideB2, offsetB + ( ( j1 + n2 ) * strideB1 ) + ( ( j1 + n2 ) * strideB2 ), ar, 1, 0, ai, 1, 0, be, 1, 0 ); // reuse ar,ai,be as TAUR,TAUL,WORK(M*M+1)

		// Fortran stores into WORK(N2*M+N2+1) and WORK(N2*M+N2+2) for the left rotation

		// And T(N2+1,N2+1) and T(M,M-1) for the right rotation
		wk[ ( n2 * m ) + n2 ] = lagv.CSL;     // WORK(N2*M+N2+1) in 0-based
		wk[ ( n2 * m ) + n2 + 1 ] = lagv.SNL; // WORK(N2*M+N2+2)
		t[ n2 + ( n2 * LDST ) ] = lagv.CSR;   // T(N2+1,N2+1)
		t[ ( m - 1 ) + ( ( m - 2 ) * LDST ) ] = lagv.SNR; // T(M,M-1)

		wk[ ( m * m ) - 1 ] = wk[ ( n2 * m ) + n2 ];         // WORK(M*M) = WORK(N2*M+N2+1)
		wk[ ( m * m ) - 2 ] = -wk[ ( n2 * m ) + n2 + 1 ];    // WORK(M*M-1) = -WORK(N2*M+N2+2)
		t[ ( m - 1 ) + ( ( m - 1 ) * LDST ) ] = t[ n2 + ( n2 * LDST ) ]; // T(M,M) = T(N2+1,N2+1)
		t[ ( m - 2 ) + ( ( m - 1 ) * LDST ) ] = -t[ ( m - 1 ) + ( ( m - 2 ) * LDST ) ]; // T(M-1,M) = -T(M,M-1)
	}

	// Apply WORK^T to columns of A(j1:j1+m-1, j1+n2:j1+m-1) from left: WORK^T * A(j1:j1+n2-1, j1+n2:j1+m-1)
	dgemm( 'transpose', 'no-transpose', n2, n1, n2, ONE, wk, 1, m, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( ( j1 + n2 ) * strideA2 ), ZERO, wk, 1, n2, m * m );
	dlacpy( 'all', n2, n1, wk, 1, n2, m * m, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( ( j1 + n2 ) * strideA2 ) );
	dgemm( 'transpose', 'no-transpose', n2, n1, n2, ONE, wk, 1, m, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( ( j1 + n2 ) * strideB2 ), ZERO, wk, 1, n2, m * m );
	dlacpy( 'all', n2, n1, wk, 1, n2, m * m, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( ( j1 + n2 ) * strideB2 ) );

	// Update LI: LI = LI * WORK
	dgemm( 'no-transpose', 'no-transpose', m, m, m, ONE, li, 1, LDST, 0, wk, 1, m, 0, ZERO, wk, 1, m, m * m );
	dlacpy( 'all', m, m, wk, 1, m, m * m, li, 1, LDST, 0 );

	// Apply T(n2+1:m, n2+1:m) to columns of A(j1:j1+n2-1, j1+n2:j1+m-1) from right
	dgemm( 'no-transpose', 'no-transpose', n2, n1, n1, ONE, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( ( j1 + n2 ) * strideA2 ), t, 1, LDST, n2 + ( n2 * LDST ), ZERO, wk, 1, n2, 0 );
	dlacpy( 'all', n2, n1, wk, 1, n2, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( ( j1 + n2 ) * strideA2 ) );
	dgemm( 'no-transpose', 'no-transpose', n2, n1, n1, ONE, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( ( j1 + n2 ) * strideB2 ), t, 1, LDST, n2 + ( n2 * LDST ), ZERO, wk, 1, n2, 0 );
	dlacpy( 'all', n2, n1, wk, 1, n2, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( ( j1 + n2 ) * strideB2 ) );

	// Update IR: IR = IR^T * T => store in IR
	dgemm( 'transpose', 'no-transpose', m, m, m, ONE, ir, 1, LDST, 0, t, 1, LDST, 0, ZERO, wk, 1, m, 0 );
	dlacpy( 'all', m, m, wk, 1, m, 0, ir, 1, LDST, 0 );

	// Update Q
	if ( wantq ) {
		dgemm( 'no-transpose', 'no-transpose', N, m, m, ONE, Q, strideQ1, strideQ2, offsetQ + ( j1 * strideQ2 ), li, 1, LDST, 0, ZERO, wk, 1, N, 0 );
		dlacpy( 'all', N, m, wk, 1, N, 0, Q, strideQ1, strideQ2, offsetQ + ( j1 * strideQ2 ) );
	}

	// Update Z
	if ( wantz ) {
		dgemm( 'no-transpose', 'no-transpose', N, m, m, ONE, Z, strideZ1, strideZ2, offsetZ + ( j1 * strideZ2 ), ir, 1, LDST, 0, ZERO, wk, 1, N, 0 );
		dlacpy( 'all', N, m, wk, 1, N, 0, Z, strideZ1, strideZ2, offsetZ + ( j1 * strideZ2 ) );
	}

	// Update trailing part of A and B
	i = j1 + m;
	if ( i < N ) {
		dgemm( 'transpose', 'no-transpose', m, N - i, m, ONE, li, 1, LDST, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( i * strideA2 ), ZERO, wk, 1, m, 0 );
		dlacpy( 'all', m, N - i, wk, 1, m, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA1 ) + ( i * strideA2 ) );
		dgemm( 'transpose', 'no-transpose', m, N - i, m, ONE, li, 1, LDST, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( i * strideB2 ), ZERO, wk, 1, m, 0 );
		dlacpy( 'all', m, N - i, wk, 1, m, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB1 ) + ( i * strideB2 ) );
	}

	// Update leading part of A and B
	i = j1 - 1;
	if ( i >= 0 ) {
		dgemm( 'no-transpose', 'no-transpose', i + 1, m, m, ONE, A, strideA1, strideA2, offsetA + ( j1 * strideA2 ), ir, 1, LDST, 0, ZERO, wk, 1, i + 1, 0 );
		dlacpy( 'all', i + 1, m, wk, 1, i + 1, 0, A, strideA1, strideA2, offsetA + ( j1 * strideA2 ) );
		dgemm( 'no-transpose', 'no-transpose', i + 1, m, m, ONE, B, strideB1, strideB2, offsetB + ( j1 * strideB2 ), ir, 1, LDST, 0, ZERO, wk, 1, i + 1, 0 );
		dlacpy( 'all', i + 1, m, wk, 1, i + 1, 0, B, strideB1, strideB2, offsetB + ( j1 * strideB2 ) );
	}

	return 0;
}


// EXPORTS //

export default dtgex2;
