// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeqr2 from '../../zgeqr2/lib/base.js';
import zunm2r from './../lib/ndarray.js';

// FIXTURES //

import left_notrans from './fixtures/left_notrans.json' with { type: 'json' };
import left_conjtrans from './fixtures/left_conjtrans.json' with { type: 'json' };
import right_notrans from './fixtures/right_notrans.json' with { type: 'json' };
import right_conjtrans from './fixtures/right_conjtrans.json' with { type: 'json' };
import m_zero from './fixtures/m_zero.json' with { type: 'json' };
import n_zero from './fixtures/n_zero.json' with { type: 'json' };
import k_zero from './fixtures/k_zero.json' with { type: 'json' };
import left_notrans_rect from './fixtures/left_notrans_rect.json' with { type: 'json' };
import right_notrans_rect from './fixtures/right_notrans_rect.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Compute QR of 3x2 matrix [1 4+i; 2 5+i; 3 6+i] and return {A, TAU}.
* A is stored with strideA1=1, strideA2=3 (complex elements).
*/
function qr3x2() {
	var A = new Complex128Array( [ 1,0, 2,0, 3,0, 4,1, 5,1, 6,1 ] );
	var TAU = new Complex128Array( 2 );
	var WORK = new Complex128Array( 20 );
	zgeqr2( 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU };
}

/**
* Compute QR of 3x2 matrix in a 3x3 container (strideA2=3).
* Column 3 is zeros. Matches Fortran A(3,3) declaration.
*/
function qr3x2in3x3() {
	var A = new Complex128Array( 9 );
	var Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=0; Av[4]=3; Av[5]=0;
	Av[6]=4; Av[7]=1; Av[8]=5; Av[9]=1; Av[10]=6; Av[11]=1;
	var TAU = new Complex128Array( 2 );
	var WORK = new Complex128Array( 20 );
	zgeqr2( 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	return { A: A, TAU: TAU };
}

/**
* Create a 3x3 complex identity matrix (column-major interleaved, strideC2=3).
*/
function eye3() {
	return new Complex128Array( [ 1,0, 0,0, 0,0, 0,0, 1,0, 0,0, 0,0, 0,0, 1,0 ] );
}

// TESTS //

test( 'zunm2r: left, no transpose (Q*I)', function t() {
	var tc = left_notrans;
	var qr = qr3x2();
	var C = eye3();
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'left', 'no-transpose', 3, 3, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});

test( 'zunm2r: left, conjugate transpose (Q^H*I)', function t() {
	var tc = left_conjtrans;
	var qr = qr3x2();
	var C = eye3();
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'left', 'conjugate-transpose', 3, 3, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});

test( 'zunm2r: right, no transpose (I*Q)', function t() {
	var tc = right_notrans;
	var qr = qr3x2();
	var C = eye3();
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'right', 'no-transpose', 3, 3, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});

test( 'zunm2r: right, conjugate transpose (I*Q^H)', function t() {
	var tc = right_conjtrans;
	var qr = qr3x2();
	var C = eye3();
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'right', 'conjugate-transpose', 3, 3, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});

test( 'zunm2r: M=0 quick return', function t() {
	var tc = m_zero;
	var WORK = new Complex128Array( 5 );
	var A = new Complex128Array( 5 );
	var TAU = new Complex128Array( 2 );
	var C = new Complex128Array( 5 );
	var info = zunm2r( 'left', 'no-transpose', 0, 3, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunm2r: N=0 quick return', function t() {
	var tc = n_zero;
	var WORK = new Complex128Array( 5 );
	var A = new Complex128Array( 5 );
	var TAU = new Complex128Array( 2 );
	var C = new Complex128Array( 5 );
	var info = zunm2r( 'left', 'no-transpose', 3, 0, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunm2r: K=0 quick return', function t() {
	var tc = k_zero;
	var WORK = new Complex128Array( 5 );
	var A = new Complex128Array( 10 );
	var TAU = new Complex128Array( 2 );
	var C = eye3();
	var info = zunm2r( 'left', 'no-transpose', 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
});

test( 'zunm2r: left, no transpose, rectangular C (3x2)', function t() {
	var tc = left_notrans_rect;
	var qr = qr3x2in3x3();
	// C = [1+1i 2-1i; 3+0i 0+2i; -1+1i 4+0i] col-major, LDC=3
	var C = new Complex128Array( [ 1,1, 3,0, -1,1, 2,-1, 0,2, 4,0 ] );
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'left', 'no-transpose', 3, 2, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 3, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});

test( 'zunm2r: right, no transpose, rectangular C (2x3)', function t() {
	var tc = right_notrans_rect;
	var qr = qr3x2in3x3();
	// Fortran test: C(3,3) declared, LDC=2. The memory layout with LDC=2 reinterprets
	// the column-major C(3,3) data. Effective 2x3 matrix as seen by zunm2r:
	// Col 0: C(1,1)=1+0i, C(2,1)=0+1i
	// Col 1: C(3,1)=0+0i, C(1,2)=2+1i
	// Col 2: C(2,2)=1-1i, C(3,2)=0+0i
	var C = new Complex128Array( [
		1,0, 0,1,   // col 0
		0,0, 2,1,   // col 1
		1,-1, 0,0   // col 2
	] );
	var WORK = new Complex128Array( 20 );
	var info = zunm2r( 'right', 'no-transpose', 2, 3, 2, qr.A, 1, 3, 0, qr.TAU, 1, 0, C, 1, 2, 0, WORK, 1, 0 );
	assertClose( info, tc.info, 1e-14, 'info' );
	assertArrayClose( Array.from( reinterpret( C, 0 ) ), tc.c, 1e-10, 'c' );
});
