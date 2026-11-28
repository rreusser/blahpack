// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrsen from './../lib/strided.js';

// FIXTURES //

import job_n_compq_v_sel_1_3 from './fixtures/job_n_compq_v_sel_1_3.json' with { type: 'json' };
import job_e_compq_v_sel_1_3 from './fixtures/job_e_compq_v_sel_1_3.json' with { type: 'json' };
import job_v_compq_v_sel_1_3 from './fixtures/job_v_compq_v_sel_1_3.json' with { type: 'json' };
import job_b_compq_v_sel_1_3 from './fixtures/job_b_compq_v_sel_1_3.json' with { type: 'json' };
import job_n_compq_n_sel_2 from './fixtures/job_n_compq_n_sel_2.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch (' + actual.length + ' vs ' + expected.length + ')' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Build the standard 4x4 upper triangular complex test matrix.
*/
function buildT4() {
	const N = 4;
	const T = new Complex128Array( N * N );
	const Tv = reinterpret( T, 0 );
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
	const Q = new Complex128Array( N * N );
	const Qv = reinterpret( Q, 0 );
	let i;
	for ( i = 0; i < N; i++ ) {
		Qv[ ( i + i * N ) * 2 ] = 1.0;
	}
	return { data: Q, view: Qv };
}

// TESTS //

test( 'ztrsen: job=N compq=V select 1,3', function t() {
	const tc = job_n_compq_v_sel_1_3;
	const N = 4;
	const tm = buildT4();
	const qm = identityComplex( N );
	const W = new Complex128Array( N );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( N * N );
	const SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'none', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=E compq=V select 1,3', function t() {
	const tc = job_e_compq_v_sel_1_3;
	const N = 4;
	const tm = buildT4();
	const qm = identityComplex( N );
	const W = new Complex128Array( N );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( N * N );
	const SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'eigenvalues', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=V compq=V select 1,3', function t() {
	const tc = job_v_compq_v_sel_1_3;
	const N = 4;
	const tm = buildT4();
	const qm = identityComplex( N );
	const W = new Complex128Array( N );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( N * N );
	const SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'subspace', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=B compq=V select 1,3', function t() {
	const tc = job_b_compq_v_sel_1_3;
	const N = 4;
	const tm = buildT4();
	const qm = identityComplex( N );
	const W = new Complex128Array( N );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( N * N );
	const SELECT = new Uint8Array( N );
	SELECT[ 0 ] = 1; SELECT[ 2 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'both', 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: job=N compq=N select 2', function t() {
	const tc = job_n_compq_n_sel_2;
	const N = 4;
	const tm = buildT4();
	const qm = identityComplex( N );
	const W = new Complex128Array( N );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( N * N );
	const SELECT = new Uint8Array( N );
	SELECT[ 1 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'none', 'none', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: N=1 quick return', function t() {
	const tc = n_1;
	const N = 1;
	const T = new Complex128Array( 1 );
	const Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 5.0; Tv[ 1 ] = 1.0;
	const Q = new Complex128Array( 1 );
	const Qv = reinterpret( Q, 0 );
	Qv[ 0 ] = 1.0;
	const W = new Complex128Array( 1 );
	const Wv = reinterpret( W, 0 );
	const WORK = new Complex128Array( 1 );
	const SELECT = new Uint8Array( 1 );
	SELECT[ 0 ] = 1;
	const M = new Float64Array( 1 );
	const s = new Float64Array( 1 );
	const sep = new Float64Array( 1 );

	const info = ztrsen( 'both', 'update', SELECT, 1, 0, N, T, 1, 1, 0, Q, 1, 1, 0, W, 1, 0, M, s, sep, WORK, 1, 0 );

	assert.strictEqual( info, tc.info, 'info' );
	assert.strictEqual( M[ 0 ], tc.M, 'M' );
	assertClose( s[ 0 ], tc.S, 1e-12, 'S' );
	assertClose( sep[ 0 ], tc.SEP, 1e-12, 'SEP' );
	assertArrayClose( Array.from( Wv ), tc.W, 1e-12, 'W' );
});

test( 'ztrsen: minimum workspace is M*(N-M) / 2*M*(N-M) complex elements (ticket 0096)', function t() { // eslint-disable-line max-len
	const cases = [
		[ 'eigenvalues', job_e_compq_v_sel_1_3, 4 ],
		[ 'subspace', job_v_compq_v_sel_1_3, 8 ],
		[ 'both', job_b_compq_v_sel_1_3, 8 ],
		[ 'none', job_n_compq_v_sel_1_3, 1 ]
	];
	let info, tc, tm, qm, W, M, s, sep, i;
	const N = 4;
	const SELECT = new Uint8Array([ 1, 0, 1, 0 ]);
	for ( i = 0; i < cases.length; i++ ) {
		tc = cases[ i ][ 1 ];
		tm = buildT4();
		qm = identityComplex( N );
		W = new Complex128Array( N );
		M = new Float64Array( 1 );
		s = new Float64Array( 1 );
		sep = new Float64Array( 1 );

		// Exactly the minimum (M = 2, N-M = 2):
		info = ztrsen( cases[ i ][ 0 ], 'update', SELECT, 1, 0, N, tm.data, 1, N, 0, qm.data, 1, N, 0, W, 1, 0, M, s, sep, new Complex128Array( cases[ i ][ 2 ] ), 1, 0 ); // eslint-disable-line max-len
		assert.strictEqual( info, tc.info, 'info' );
		assert.strictEqual( M[ 0 ], tc.M, 'M' );
		if ( tc.S !== void 0 ) {
			assertClose( s[ 0 ], tc.S, 1e-12, cases[ i ][ 0 ] + ' S' );
		}
		if ( tc.SEP !== void 0 ) {
			assertClose( sep[ 0 ], tc.SEP, 1e-12, cases[ i ][ 0 ] + ' SEP' );
		}
		assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
		assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
		assertArrayClose( Array.from( reinterpret( W, 0 ) ), tc.W, 1e-12, 'W' );
	}
	// The old minimum (one element) used to be accepted and returned NaN:
	for ( i = 0; i < 3; i++ ) {
		assert.throws( throwsWith( cases[ i ][ 0 ], 1 ), /WORK array must have at least/ ); // eslint-disable-line max-len
		assert.throws( throwsWith( cases[ i ][ 0 ], cases[ i ][ 2 ] - 1 ), RangeError ); // eslint-disable-line max-len
	}
	assert.throws( throwsWith( 'none', 0 ), RangeError );

	function throwsWith( job, lwork ) {
		return function throws() {
			ztrsen( job, 'update', SELECT, 1, 0, N, buildT4().data, 1, N, 0, identityComplex( N ).data, 1, N, 0, new Complex128Array( N ), 1, 0, new Float64Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ), new Complex128Array( lwork ), 1, 0 ); // eslint-disable-line max-len
		};
	}
});
