// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsen from './../lib/ndarray.js';

// FIXTURES //

import job_n_compq_v_sel_1_3 from './fixtures/job_n_compq_v_sel_1_3.json' with { type: 'json' };
import job_e_compq_v_sel_1_3 from './fixtures/job_e_compq_v_sel_1_3.json' with { type: 'json' };
import job_v_compq_v_sel_1_3 from './fixtures/job_v_compq_v_sel_1_3.json' with { type: 'json' };
import job_b_compq_v_sel_1_3 from './fixtures/job_b_compq_v_sel_1_3.json' with { type: 'json' };
import job_n_compq_n_sel_2 from './fixtures/job_n_compq_n_sel_2.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build the standard 4x4 upper triangular complex test matrix.
*/
function buildT4() {
	var N = 4;
	var T = new Complex128Array( N * N );
	var Tv = reinterpret( T, 0 );
	// T(0,0) = (1, 0.5)
	Tv[ (0 + 0*N)*2 ] = 1.0; Tv[ (0 + 0*N)*2 + 1 ] = 0.5;
	// T(0,1) = (0.3, 0.1)
	Tv[ (0 + 1*N)*2 ] = 0.3; Tv[ (0 + 1*N)*2 + 1 ] = 0.1;
	// T(0,2) = (0.2, -0.1)
	Tv[ (0 + 2*N)*2 ] = 0.2; Tv[ (0 + 2*N)*2 + 1 ] = -0.1;
	// T(0,3) = (0.1, 0.05)
	Tv[ (0 + 3*N)*2 ] = 0.1; Tv[ (0 + 3*N)*2 + 1 ] = 0.05;
	// T(1,1) = (2, -0.3)
	Tv[ (1 + 1*N)*2 ] = 2.0; Tv[ (1 + 1*N)*2 + 1 ] = -0.3;
	// T(1,2) = (0.4, 0.2)
	Tv[ (1 + 2*N)*2 ] = 0.4; Tv[ (1 + 2*N)*2 + 1 ] = 0.2;
	// T(1,3) = (0.15, -0.1)
	Tv[ (1 + 3*N)*2 ] = 0.15; Tv[ (1 + 3*N)*2 + 1 ] = -0.1;
	// T(2,2) = (3, 1)
	Tv[ (2 + 2*N)*2 ] = 3.0; Tv[ (2 + 2*N)*2 + 1 ] = 1.0;
	// T(2,3) = (0.5, 0.3)
	Tv[ (2 + 3*N)*2 ] = 0.5; Tv[ (2 + 3*N)*2 + 1 ] = 0.3;
	// T(3,3) = (4, -0.5)
	Tv[ (3 + 3*N)*2 ] = 4.0; Tv[ (3 + 3*N)*2 + 1 ] = -0.5;
	return { data: T, view: Tv };
}

function identityComplex( N ) {
	var Q = new Complex128Array( N * N );
	var Qv = reinterpret( Q, 0 );
	var i;
	for ( i = 0; i < N; i++ ) {
		Qv[ ( i + i * N ) * 2 ] = 1.0;
	}
	return { data: Q, view: Qv };
}

// TESTS //

test( 'ztrsen: job=N compq=V select 1,3', function t() {
	var tc = job_n_compq_v_sel_1_3;
	var N = 4;
	var tm = buildT4();
	var qm = identityComplex( N );
	var W = new Complex128Array( N );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( N * N );
	var SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'none', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0, N * N );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=E compq=V select 1,3', function t() {
	var tc = job_e_compq_v_sel_1_3;
	var N = 4;
	var tm = buildT4();
	var qm = identityComplex( N );
	var W = new Complex128Array( N );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( N * N );
	var SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'eigenvalues', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0, N * N );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=V compq=V select 1,3', function t() {
	var tc = job_v_compq_v_sel_1_3;
	var N = 4;
	var tm = buildT4();
	var qm = identityComplex( N );
	var W = new Complex128Array( N );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( N * N );
	var SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'subspace', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0, N * N );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=B compq=V select 1,3', function t() {
	var tc = job_b_compq_v_sel_1_3;
	var N = 4;
	var tm = buildT4();
	var qm = identityComplex( N );
	var W = new Complex128Array( N );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( N * N );
	var SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'both', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0, N * N );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=N compq=N select 2', function t() {
	var tc = job_n_compq_n_sel_2;
	var N = 4;
	var tm = buildT4();
	var qm = identityComplex( N );
	var W = new Complex128Array( N );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( N * N );
	var SELECT = new Uint8Array( N );
	SELECT[ 1 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'none', 'none', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0, N * N );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: N=1 quick return', function t() {
	var tc = n_1;
	var N = 1;
	var T = new Complex128Array( 1 );
	var Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 5.0; Tv[ 1 ] = 1.0;
	var Q = new Complex128Array( 1 );
	var Qv = reinterpret( Q, 0 );
	Qv[ 0 ] = 1.0;
	var W = new Complex128Array( 1 );
	var Wv = reinterpret( W, 0 );
	var WORK = new Complex128Array( 1 );
	var SELECT = new Uint8Array( 1 );
	SELECT[ 0 ] = 1;
	var M = new Float64Array( 1 );
	var s = new Float64Array( 1 );
	var sep = new Float64Array( 1 );

	var info = ztrsen( 'both', 'update', SELECT, 1, 0, N, T, 1, 1, 0, Q, 1, 1, 0, W, 1, 0, M, s, sep, WORK, 1, 0, 1 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});
