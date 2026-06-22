// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgebrd from '../../zgebrd/lib/base.js';
import zungbr from './../lib/ndarray.js';

// FIXTURES //

import vect_q_m_ge_k from './fixtures/vect_q_m_ge_k.json' with { type: 'json' };
import vect_p_k_lt_n from './fixtures/vect_p_k_lt_n.json' with { type: 'json' };
import vect_q_m_lt_k from './fixtures/vect_q_m_lt_k.json' with { type: 'json' };
import vect_p_k_ge_n from './fixtures/vect_p_k_ge_n.json' with { type: 'json' };

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

/**
* Set up 4x3 matrix for bidiagonal reduction.
*/
function setup4x3() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	// Column 0
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=-1; Av[6]=1; Av[7]=1;
	// Column 1
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1; Av[2*LDA+6]=2; Av[2*LDA+7]=0;
	// Column 2
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0; Av[4*LDA+6]=2; Av[4*LDA+7]=1;

	var TAUQ = new Complex128Array( 6 );
	var TAUP = new Complex128Array( 6 );
	var D = new Float64Array( 6 );
	var E = new Float64Array( 6 );
	var WORK = new Complex128Array( 200 );
	zgebrd( 4, 3, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

/**
* Set up 3x5 matrix for bidiagonal reduction.
*/
function setup3x5() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	// Row 0
	Av[0]=1; Av[1]=0;
	Av[2*LDA]=2; Av[2*LDA+1]=1;
	Av[4*LDA]=0; Av[4*LDA+1]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1;
	Av[8*LDA]=3; Av[8*LDA+1]=0;
	// Row 1
	Av[2]=0; Av[3]=2;
	Av[2*LDA+2]=1; Av[2*LDA+3]=0;
	Av[4*LDA+2]=3; Av[4*LDA+3]=1;
	Av[6*LDA+2]=2; Av[6*LDA+3]=0;
	Av[8*LDA+2]=1; Av[8*LDA+3]=1;
	// Row 2
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

/**
* Set up 3x4 matrix for bidiagonal reduction (M < K case).
*/
function setup3x4() {
	var LDA = 6;
	var A = new Complex128Array( LDA * 6 );
	var Av = reinterpret( A, 0 );
	Av[0]=1; Av[1]=0; Av[2]=2; Av[3]=1; Av[4]=0; Av[5]=-1;
	Av[2*LDA]=0; Av[2*LDA+1]=2; Av[2*LDA+2]=1; Av[2*LDA+3]=0; Av[2*LDA+4]=3; Av[2*LDA+5]=1;
	Av[4*LDA]=3; Av[4*LDA+1]=1; Av[4*LDA+2]=0; Av[4*LDA+3]=0; Av[4*LDA+4]=1; Av[4*LDA+5]=0;
	Av[6*LDA]=1; Av[6*LDA+1]=1; Av[6*LDA+2]=2; Av[6*LDA+3]=0; Av[6*LDA+4]=2; Av[6*LDA+5]=1;

	var TAUQ = new Complex128Array( 6 );
	var TAUP = new Complex128Array( 6 );
	var D = new Float64Array( 6 );
	var E = new Float64Array( 6 );
	var WORK = new Complex128Array( 200 );
	zgebrd( 3, 4, A, 1, LDA, 0, D, 1, 0, E, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, WORK, 1, 0, 200 );
	return { A: A, TAUQ: TAUQ, TAUP: TAUP, LDA: LDA };
}

// TESTS //

test( 'zungbr: VECT=Q, M >= K (4x3 bidiagonal)', function t() {
	var tc = vect_q_m_ge_k;
	var bd = setup4x3();
	var WORK = new Complex128Array( 200 );
	var info = zungbr('apply-Q', 4, 3, 3, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=P, K < N (3x5 bidiagonal)', function t() {
	var tc = vect_p_k_lt_n;
	var bd = setup3x5();
	var WORK = new Complex128Array( 200 );
	var info = zungbr('apply-P', 3, 5, 3, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=Q, M < K (3x4 bidiagonal, Q is 3x3)', function t() {
	var tc = vect_q_m_lt_k;
	var bd = setup3x4();
	var WORK = new Complex128Array( 200 );
	var info = zungbr('apply-Q', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUQ, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: VECT=P, K >= N (4x3 bidiagonal, P^H is 3x3)', function t() {
	var tc = vect_p_k_ge_n;
	var bd = setup4x3();
	var WORK = new Complex128Array( 200 );
	var info = zungbr('apply-P', 3, 3, 4, bd.A, 1, bd.LDA, 0, bd.TAUP, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info );
	assertArrayClose( extractRaw( bd.A, tc.a.length ), tc.a, 1e-12, 'a' );
});

test( 'zungbr: M=0, N=0 quick return', function t() {
	var A = new Complex128Array( 1 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info = zungbr('apply-Q', 0, 0, 0, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, 0 );
});
