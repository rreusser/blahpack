

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlabrd from './../lib/ndarray.js';

// FIXTURES //

import m_ge_n_5x4_nb2 from './fixtures/m_ge_n_5x4_nb2.json' with { type: 'json' };
import m_lt_n_4x5_nb2 from './fixtures/m_lt_n_4x5_nb2.json' with { type: 'json' };
import quick_return_m0 from './fixtures/quick_return_m0.json' with { type: 'json' };
import nb1_3x3 from './fixtures/nb1_3x3.json' with { type: 'json' };
import nb1_m_lt_n_2x3 from './fixtures/nb1_m_lt_n_2x3.json' with { type: 'json' };
import m_lt_n_nb_eq_m_2x4 from './fixtures/m_lt_n_nb_eq_m_2x4.json' with { type: 'json' };

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

// TESTS //

test( 'zlabrd: m_ge_n_5x4_nb2', function t() {
	var tc = m_ge_n_5x4_nb2;
	var M = 5;
	var N = 4;
	var nb = 2;
	var LDA = M;
	var LDX = M;
	var LDY = N;

	var A = new Complex128Array([
		1.0, 0.5, 2.0, -1.0, -0.5, 0.3, 0.7, -0.2, 1.5, 0.8,
		0.3, 0.4, -1.0, 0.5, 0.6, -0.7, 1.2, 0.1, -0.3, 0.9,
		0.5, -0.1, 0.8, 0.2, -0.4, 1.0, 0.2, -0.5, 1.1, 0.3,
		-0.2, 0.6, 0.4, -0.3, 0.9, 0.1, -0.6, 0.8, 0.3, -0.4
	]);
	var d = new Float64Array( nb );
	var e = new Float64Array( nb );
	var TAUQ = new Complex128Array( nb );
	var TAUP = new Complex128Array( nb );
	var X = new Complex128Array( LDX * nb );
	var Y = new Complex128Array( LDY * nb );

	zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( Array.from( d ), tc.D, 1e-12, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-12, 'E' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.TAUQ, 1e-12, 'TAUQ' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.TAUP, 1e-12, 'TAUP' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( reinterpret( Y, 0 ) ), tc.Y, 1e-12, 'Y' );
});

test( 'zlabrd: m_lt_n_4x5_nb2', function t() {
	var tc = m_lt_n_4x5_nb2;
	var M = 4;
	var N = 5;
	var nb = 2;
	var LDA = M;
	var LDX = M;
	var LDY = N;

	var A = new Complex128Array([
		1.0, 0.5, 2.0, -1.0, -0.5, 0.3, 0.7, -0.2,
		0.3, 0.4, -1.0, 0.5, 0.6, -0.7, 1.2, 0.1,
		0.5, -0.1, 0.8, 0.2, -0.4, 1.0, 0.2, -0.5,
		-0.2, 0.6, 0.4, -0.3, 0.9, 0.1, -0.6, 0.8,
		1.5, 0.8, -0.3, 0.9, 1.1, 0.3, 0.3, -0.4
	]);
	var d = new Float64Array( nb );
	var e = new Float64Array( nb );
	var TAUQ = new Complex128Array( nb );
	var TAUP = new Complex128Array( nb );
	var X = new Complex128Array( LDX * nb );
	var Y = new Complex128Array( LDY * nb );

	zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( Array.from( d ), tc.D, 1e-12, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-12, 'E' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.TAUQ, 1e-12, 'TAUQ' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.TAUP, 1e-12, 'TAUP' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( reinterpret( Y, 0 ) ), tc.Y, 1e-12, 'Y' );
});

test( 'zlabrd: quick_return_m0', function t() {
	var tc = quick_return_m0;
	var d = new Float64Array( 2 );
	var e = new Float64Array( 2 );
	var TAUQ = new Complex128Array( 2 );
	var TAUP = new Complex128Array( 2 );
	var A = new Complex128Array( 4 );
	var X = new Complex128Array( 2 );
	var Y = new Complex128Array( 8 );

	zlabrd( 0, 4, 2, A, 1, 1, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, 1, 0, Y, 1, 4, 0 );

	assertArrayClose( Array.from( d ), tc.D, 1e-14, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-14, 'E' );
});

test( 'zlabrd: nb1_3x3', function t() {
	var tc = nb1_3x3;
	var M = 3;
	var N = 3;
	var nb = 1;
	var LDA = M;
	var LDX = M;
	var LDY = N;

	var A = new Complex128Array([
		2.0, 1.0, -1.0, 0.5, 0.3, -0.2,
		0.5, -0.4, 1.0, 0.3, -0.7, 0.6,
		0.8, 0.2, -0.3, -0.1, 1.5, -0.5
	]);
	var d = new Float64Array( nb );
	var e = new Float64Array( nb );
	var TAUQ = new Complex128Array( nb );
	var TAUP = new Complex128Array( nb );
	var X = new Complex128Array( LDX * nb );
	var Y = new Complex128Array( LDY * nb );

	zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( Array.from( d ), tc.D, 1e-12, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-12, 'E' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.TAUQ, 1e-12, 'TAUQ' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.TAUP, 1e-12, 'TAUP' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( reinterpret( Y, 0 ) ), tc.Y, 1e-12, 'Y' );
});

test( 'zlabrd: nb1_m_lt_n_2x3', function t() {
	var tc = nb1_m_lt_n_2x3;
	var M = 2;
	var N = 3;
	var nb = 1;
	var LDA = M;
	var LDX = M;
	var LDY = N;

	var A = new Complex128Array([
		1.5, 0.5, -0.8, 0.3,
		0.6, -0.2, 1.0, 0.7,
		-0.4, 0.9, 0.2, -0.6
	]);
	var d = new Float64Array( nb );
	var e = new Float64Array( nb );
	var TAUQ = new Complex128Array( nb );
	var TAUP = new Complex128Array( nb );
	var X = new Complex128Array( LDX * nb );
	var Y = new Complex128Array( LDY * nb );

	zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( Array.from( d ), tc.D, 1e-12, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-12, 'E' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.TAUQ, 1e-12, 'TAUQ' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.TAUP, 1e-12, 'TAUP' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( reinterpret( Y, 0 ) ), tc.Y, 1e-12, 'Y' );
});

test( 'zlabrd: m_lt_n_nb_eq_m_2x4', function t() {
	var tc = m_lt_n_nb_eq_m_2x4;
	var M = 2;
	var N = 4;
	var nb = 2;
	var LDA = M;
	var LDX = M;
	var LDY = N;

	var A = new Complex128Array([
		1.5, 0.5, -0.8, 0.3,
		0.6, -0.2, 1.0, 0.7,
		-0.4, 0.9, 0.2, -0.6,
		0.7, -0.1, -0.3, 0.4
	]);
	var d = new Float64Array( nb );
	var e = new Float64Array( nb );
	var TAUQ = new Complex128Array( nb );
	var TAUP = new Complex128Array( nb );
	var X = new Complex128Array( LDX * nb );
	var Y = new Complex128Array( LDY * nb );

	zlabrd( M, N, nb, A, 1, LDA, 0, d, 1, 0, e, 1, 0, TAUQ, 1, 0, TAUP, 1, 0, X, 1, LDX, 0, Y, 1, LDY, 0 );

	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-12, 'A' );
	assertArrayClose( Array.from( d ), tc.D, 1e-12, 'D' );
	assertArrayClose( Array.from( e ), tc.E, 1e-12, 'E' );
	assertArrayClose( Array.from( reinterpret( TAUQ, 0 ) ), tc.TAUQ, 1e-12, 'TAUQ' );
	assertArrayClose( Array.from( reinterpret( TAUP, 0 ) ), tc.TAUP, 1e-12, 'TAUP' );
	assertArrayClose( Array.from( reinterpret( X, 0 ) ), tc.X, 1e-12, 'X' );
	assertArrayClose( Array.from( reinterpret( Y, 0 ) ), tc.Y, 1e-12, 'Y' );
});
