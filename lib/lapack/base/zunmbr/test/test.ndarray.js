// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zunmbr from './../lib/ndarray.js';

// FIXTURES //

import q_left_notrans from './fixtures/q_left_notrans.json' with { type: 'json' };
import q_left_conjtrans from './fixtures/q_left_conjtrans.json' with { type: 'json' };
import p_right_notrans from './fixtures/p_right_notrans.json' with { type: 'json' };
import p_right_conjtrans from './fixtures/p_right_conjtrans.json' with { type: 'json' };
import q_right_notrans from './fixtures/q_right_notrans.json' with { type: 'json' };
import p_left_conjtrans from './fixtures/p_left_conjtrans.json' with { type: 'json' };

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

function extractRaw( C, count ) {
	var Cv = reinterpret( C, 0 );
	var result = [];
	var i;
	for ( i = 0; i < count; i++ ) {
		result.push( Cv[ i ] );
	}
	return result;
}

function setup4x3() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=-1; Av[6]=1; Av[7]=1;
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1; Av[2*LDA+6]=2; Av[2*LDA+7]=0;
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=2; Av[4*LDA+7]=1;
	var TAUQ = new Complex128Array( 6 );
	var TAUP = new Complex128Array( 6 );
	var D = new Float64Array( 6 );
	var E = new Float64Array( 6 );
	var WORK = new Complex128Array( 200 );
	zgebrd( 4, 3, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

function setup3x5() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0;
	Av[2*LDA]=2; Av[2*LDA+1]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1;
	Av[8*LDA]=3; Av[8*LDA+1]=0;
	Av[2]=0; Av[3]=2;
	Av[2*LDA+2]=1; Av[2*LDA+3]=0;
	Av[4*LDA+2]=3; Av[4*LDA+3]=1;
	Av[6*LDA+2]=2; Av[6*LDA+3]=0;
	Av[8*LDA+2]=1; Av[8*LDA+3]=1;
	Av[4]=3; Av[5]=1;
	Av[2*LDA+4]=0; Av[2*LDA+5]=0;
	Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA+4]=2; Av[6*LDA+5]=1;
	Av[8*LDA+4]=0; Av[8*LDA+5]=2;
	var TAUQ = new Complex128Array( 6 );
	var TAUP = new Complex128Array( 6 );
	var D = new Float64Array( 6 );
	var E = new Float64Array( 6 );
	var WORK = new Complex128Array( 200 );
	zgebrd( 3, 5, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

function eye( n, ld ) {
	var C = new Complex128Array( ld * ld );
	var Cv = reinterpret( C, 0 );
	var i;
	for ( i = 0; i < n; i++ ) {
		Cv[ 2 * ( i + i * ld ) ] = 1.0;
	}
	return C;
}

// TESTS //

test( 'zunmbr: Q, left, no transpose', function t() {
	var tc = q_left_notrans;
	var bd = setup4x3();
	var LDC = 6;
	var C = eye( 4, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-Q', 'left', 'no-transpose', 4, 4, 3, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: Q, left, conjugate transpose', function t() {
	var tc = q_left_conjtrans;
	var bd = setup4x3();
	var LDC = 6;
	var C = eye( 4, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-Q', 'left', 'conjugate-transpose', 4, 4, 3, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: P, right, no transpose', function t() {
	var tc = p_right_notrans;
	var bd = setup3x5();
	var LDC = 6;
	var C = eye( 5, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-P', 'right', 'no-transpose', 5, 5, 3, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: P, right, conjugate transpose', function t() {
	var tc = p_right_conjtrans;
	var bd = setup3x5();
	var LDC = 6;
	var C = eye( 5, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-P', 'right', 'conjugate-transpose', 5, 5, 3, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: M=0 quick return', function t() {
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var C = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zunmbr('apply-Q', 'left', 'no-transpose', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, C, 1, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});

test( 'zunmbr: Q, right, no transpose', function t() {
	var tc = q_right_notrans;
	var bd = setup4x3();
	var LDC = 6;
	var C = eye( 4, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-Q', 'right', 'no-transpose', 4, 4, 3, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: P, left, conjugate transpose', function t() {
	var tc = p_left_conjtrans;
	var bd = setup3x5();
	var LDC = 6;
	var C = eye( 5, LDC );
	var WORK = new Complex128Array( 200 );
	var info = zunmbr('apply-P', 'left', 'conjugate-transpose', 5, 5, 3, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( C, tc.c.length ), tc.c, 1e-12, 'c' );
});

test( 'zunmbr: Q, left, nq < K (M=3, K=5, truncated Q reflectors)', function t() {
	// Covers lines 110-129: vect = 'Q', nq < K path (left branch)
	// setup3x5() does zgebrd(3,5), K=5 (N of original). nq=M=3 < K=5.
	// The code adjusts to use nq-1=2 reflectors starting from row 1 of A.
	var bd = setup3x5();
	var LDC = 6;
	var C = eye( 3, LDC );
	var C2 = eye( 3, LDC );
	var WORK = new Complex128Array( 200 );

	// Apply Q from left, then Q^H from left => should roundtrip to identity
	var info = zunmbr('apply-Q', 'left', 'no-transpose', 3, 3, 5, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q*C' );

	info = zunmbr('apply-Q', 'left', 'conjugate-transpose', 3, 3, 5, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after Q^H*Q*C' );

	// Verify roundtrip: Q^H * Q * I = I
	var Cv = reinterpret( C, 0 );
	var C2v = reinterpret( C2, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, 2 * 3 * LDC ) ), Array.from( C2v.subarray( 0, 2 * 3 * LDC ) ), 1e-10, 'Q roundtrip' );
});

test( 'zunmbr: Q, right, nq < K (N=3, K=5, truncated Q reflectors)', function t() {
	// Covers lines 117-122: vect = 'Q', nq < K path (right branch: i1=0, i2=1)
	var bd = setup3x5();
	var LDC = 6;
	var C = eye( 3, LDC );
	var C2 = eye( 3, LDC );
	var WORK = new Complex128Array( 200 );

	// Apply Q from right, then Q^H from right => roundtrip to identity
	var info = zunmbr('apply-Q', 'right', 'no-transpose', 3, 3, 5, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q' );

	info = zunmbr('apply-Q', 'right', 'conjugate-transpose', 3, 3, 5, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*Q*Q^H' );

	var Cv = reinterpret( C, 0 );
	var C2v = reinterpret( C2, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, 2 * 3 * LDC ) ), Array.from( C2v.subarray( 0, 2 * 3 * LDC ) ), 1e-10, 'Q right roundtrip' );
});

test( 'zunmbr: P, left, nq <= K (M=3, K=4, truncated P reflectors)', function t() {
	// Covers lines 148-167: vect = 'P', nq <= K path (left branch: i1=1, i2=0)
	// setup4x3() does zgebrd(4,3). K=4 (M of original). nq=M=3 <= K=4.
	// The code adjusts to use nq-1=2 reflectors starting from col 1 of A.
	var bd = setup4x3();
	var LDC = 6;
	var C = eye( 3, LDC );
	var C2 = eye( 3, LDC );
	var WORK = new Complex128Array( 200 );

	// Apply P from left (trans = 'no-transpose' => internally becomes transt = 'conjugate-transpose'), then
	// undo with P (trans = 'conjugate-transpose' => transt = 'no-transpose') => roundtrip
	var info = zunmbr('apply-P', 'left', 'no-transpose', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after P*C' );

	info = zunmbr('apply-P', 'left', 'conjugate-transpose', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after P^H*P*C' );

	var Cv = reinterpret( C, 0 );
	var C2v = reinterpret( C2, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, 2 * 3 * LDC ) ), Array.from( C2v.subarray( 0, 2 * 3 * LDC ) ), 1e-10, 'P left roundtrip' );
});

test( 'zunmbr: P, right, nq <= K (N=3, K=4, truncated P reflectors)', function t() {
	// Covers lines 155-159: vect = 'P', nq <= K path (right branch: i1=0, i2=1)
	var bd = setup4x3();
	var LDC = 6;
	var C = eye( 3, LDC );
	var C2 = eye( 3, LDC );
	var WORK = new Complex128Array( 200 );

	// Apply P from right, then undo => roundtrip
	var info = zunmbr('apply-P', 'right', 'no-transpose', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*P' );

	info = zunmbr('apply-P', 'right', 'conjugate-transpose', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, C, 1, LDC, 0, WORK, 1, 0 );
	assert.equal( info, 0, 'info after C*P*P^H' );

	var Cv = reinterpret( C, 0 );
	var C2v = reinterpret( C2, 0 );
	assertArrayClose( Array.from( Cv.subarray( 0, 2 * 3 * LDC ) ), Array.from( C2v.subarray( 0, 2 * 3 * LDC ) ), 1e-10, 'P right roundtrip' );
});
