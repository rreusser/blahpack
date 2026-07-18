// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import ztrexc from './../lib/ndarray.js';

// FIXTURES //

import move_3_to_1_compq_v from './fixtures/move_3_to_1_compq_v.json' with { type: 'json' };
import move_1_to_4_compq_v from './fixtures/move_1_to_4_compq_v.json' with { type: 'json' };
import move_2_to_4_compq_n from './fixtures/move_2_to_4_compq_n.json' with { type: 'json' };
import ifst_ilst_no_op from './fixtures/ifst_ilst_no-op.json' with { type: 'json' };
import n_1 from './fixtures/n_1.json' with { type: 'json' };
import move_4_to_2_compq_v from './fixtures/move_4_to_2_compq_v.json' with { type: 'json' };

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
* Build a 4x4 upper triangular complex matrix from the standard test values.
* Column-major, stride = (1, N) in complex elements.
* Returns { data: Complex128Array, view: Float64Array }.
*/
function buildT4( vals ) {
	const N = 4;
	const T = new Complex128Array( N * N );
	const Tv = reinterpret( T, 0 );
	let i, j, idx;
	// vals is array of [row, col, re, im]
	for ( i = 0; i < vals.length; i++ ) {
		idx = ( vals[ i ][ 0 ] + vals[ i ][ 1 ] * N ) * 2;
		Tv[ idx ] = vals[ i ][ 2 ];
		Tv[ idx + 1 ] = vals[ i ][ 3 ];
	}
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

const T4_VALS = [
	[ 0, 0, 1.0, 0.5 ], [ 0, 1, 0.3, 0.1 ], [ 0, 2, 0.2, -0.1 ], [ 0, 3, 0.1, 0.05 ],
	[ 1, 1, 2.0, -0.3 ], [ 1, 2, 0.4, 0.2 ], [ 1, 3, 0.15, -0.1 ],
	[ 2, 2, 3.0, 1.0 ], [ 2, 3, 0.5, 0.3 ],
	[ 3, 3, 4.0, -0.5 ]
];

// TESTS //

test( 'ztrexc: move position 3 to 1, compq=V', function t() {
	const tc = move_3_to_1_compq_v;
	const N = 4;
	const tm = buildT4( T4_VALS );
	const qm = identityComplex( N );

	const info = ztrexc( 'update', N, tm.data, 1, N, 0, qm.data, 1, N, 0, 3, 1 );

	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
});

test( 'ztrexc: move position 1 to 4, compq=V', function t() {
	const tc = move_1_to_4_compq_v;
	const N = 4;
	const tm = buildT4( T4_VALS );
	const qm = identityComplex( N );

	const info = ztrexc( 'update', N, tm.data, 1, N, 0, qm.data, 1, N, 0, 1, 4 );

	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
});

test( 'ztrexc: move position 2 to 4, compq=N', function t() {
	const tc = move_2_to_4_compq_n;
	const N = 4;
	const tm = buildT4( T4_VALS );
	const qm = identityComplex( N );

	const info = ztrexc( 'none', N, tm.data, 1, N, 0, qm.data, 1, N, 0, 2, 4 );

	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( Array.from( tm.view ), tc.T, 1e-12, 'T' );
});

test( 'ztrexc: ifst=ilst no-op', function t() {
	const tc = ifst_ilst_no_op;
	const N = 4;
	const T = new Complex128Array( N * N );
	const Tv = reinterpret( T, 0 );
	Tv[ (0 + 0*N)*2 ] = 1.0;
	Tv[ (0 + 1*N)*2 ] = 0.5;
	Tv[ (1 + 1*N)*2 ] = 2.0;
	Tv[ (2 + 2*N)*2 ] = 3.0;
	Tv[ (3 + 3*N)*2 ] = 4.0;
	const qm = identityComplex( N );

	const info = ztrexc( 'update', N, T, 1, N, 0, qm.data, 1, N, 0, 2, 2 );

	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( Array.from( Tv ), tc.T, 1e-14, 'T' );
});

test( 'ztrexc: N=1 quick return', function t() {
	const tc = n_1;
	const T = new Complex128Array( 1 );
	const Tv = reinterpret( T, 0 );
	Tv[ 0 ] = 5.0; Tv[ 1 ] = 1.0;
	const Q = new Complex128Array( 1 );
	const Qv = reinterpret( Q, 0 );
	Qv[ 0 ] = 1.0;

	const info = ztrexc( 'update', 1, T, 1, 1, 0, Q, 1, 1, 0, 1, 1 );

	assert.strictEqual( info, tc.info, 'info' );
});

test( 'ztrexc: move position 4 to 2, compq=V', function t() {
	const tc = move_4_to_2_compq_v;
	const N = 4;
	const T = new Complex128Array( N * N );
	const Tv = reinterpret( T, 0 );
	const vals = [
		[ 0, 0, 5.0, 2.0 ], [ 0, 1, 1.0, 0.3 ], [ 0, 2, 0.5, -0.2 ], [ 0, 3, 0.2, 0.1 ],
		[ 1, 1, 3.0, -1.0 ], [ 1, 2, 0.8, 0.4 ], [ 1, 3, 0.3, -0.15 ],
		[ 2, 2, 1.0, 0.5 ], [ 2, 3, 0.6, 0.2 ],
		[ 3, 3, -1.0, 0.0 ]
	];
	let v, idx, k;
	for ( k = 0; k < vals.length; k++ ) {
		v = vals[ k ];
		idx = ( v[ 0 ] + v[ 1 ] * N ) * 2;
		Tv[ idx ] = v[ 2 ];
		Tv[ idx + 1 ] = v[ 3 ];
	}
	const qm = identityComplex( N );

	const info = ztrexc( 'update', N, T, 1, N, 0, qm.data, 1, N, 0, 4, 2 );

	assert.strictEqual( info, tc.info, 'info' );
	assertArrayClose( Array.from( Tv ), tc.T, 1e-12, 'T' );
	assertArrayClose( Array.from( qm.view ), tc.Q, 1e-12, 'Q' );
});
