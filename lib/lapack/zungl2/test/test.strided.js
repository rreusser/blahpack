// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungl2 from './../lib/ndarray.js';

// FIXTURES //

import zungl2_identity_k0 from './fixtures/zungl2_identity_k0.json' with { type: 'json' };
import zungl2_3x3_k1 from './fixtures/zungl2_3x3_k1.json' with { type: 'json' };
import zungl2_3x3_k2 from './fixtures/zungl2_3x3_k2.json' with { type: 'json' };
import zungl2_3x4_k3 from './fixtures/zungl2_3x4_k3.json' with { type: 'json' };
import zungl2_m0 from './fixtures/zungl2_m0.json' with { type: 'json' };
import zungl2_1x1_k1 from './fixtures/zungl2_1x1_k1.json' with { type: 'json' };
import zungl2_3x3_k3 from './fixtures/zungl2_3x3_k3.json' with { type: 'json' };
import zungl2_from_lq from './fixtures/zungl2_from_lq.json' with { type: 'json' };

// FUNCTIONS //

function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// TESTS //

test( 'zungl2: identity (K=0)', function t() {
	const tc = zungl2_identity_k0;
	const A = new Complex128Array( 3 * 3 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 3 );

	const info = zungl2( 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: 3x3, K=1', function t() {
	const tc = zungl2_3x3_k1;
	const A = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.5, 0.25, 0.0, 0.0,  0.0, 0.0,
		0.3, -0.1, 0.0, 0.0,  0.0, 0.0
	]);
	const TAU = new Complex128Array( [ 1.2, 0.3 ] );
	const WORK = new Complex128Array( 3 );

	const info = zungl2( 3, 3, 1, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: 3x3, K=2', function t() {
	const tc = zungl2_3x3_k2;
	const A = new Complex128Array( [
		1.0, 0.0,  0.0, 0.0,  0.0, 0.0,
		0.4, 0.2,  1.0, 0.0,  0.0, 0.0,
		0.1, -0.3, 0.6, 0.5,  0.0, 0.0
	]);
	const TAU = new Complex128Array( [ 1.1, 0.2, 0.9, -0.1 ] );
	const WORK = new Complex128Array( 3 );

	const info = zungl2( 3, 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: 3x4, K=3 (rectangular)', function t() {
	const tc = zungl2_3x4_k3;
	const A = new Complex128Array( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.3, 0.1,   1.0, 0.0,   0.0, 0.0,
		0.2, -0.2,  0.4, 0.3,   1.0, 0.0,
		0.1, 0.05, -0.1, 0.2,   0.5, -0.1
	]);
	const TAU = new Complex128Array( [ 1.05, 0.1, 1.15, -0.2, 0.8, 0.15 ] );
	const WORK = new Complex128Array( 4 );

	const info = zungl2( 3, 4, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: M=0 quick return', function t() {
	const tc = zungl2_m0;
	const A = new Complex128Array( 9 );
	const TAU = new Complex128Array( 1 );
	const WORK = new Complex128Array( 1 );

	const info = zungl2( 0, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zungl2: 1x1, K=1', function t() {
	const tc = zungl2_1x1_k1;
	const A = new Complex128Array( [ 1.0, 0.0 ] );
	const TAU = new Complex128Array( [ 0.5, 0.5 ] );
	const WORK = new Complex128Array( 1 );

	const info = zungl2( 1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: 3x3, K=3', function t() {
	const tc = zungl2_3x3_k3;
	const A = new Complex128Array( [
		1.0, 0.0,   0.0, 0.0,   0.0, 0.0,
		0.2, 0.3,   1.0, 0.0,   0.0, 0.0,
		-0.1, 0.4,  0.5, -0.2,  1.0, 0.0
	]);
	const TAU = new Complex128Array( [ 1.3, -0.1, 0.7, 0.4, 1.1, 0.0 ] );
	const WORK = new Complex128Array( 3 );

	const info = zungl2( 3, 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zungl2: from actual LQ factorization', function t() {
	const tc = zungl2_from_lq;
	assert.ok( tc, 'fixture exists' );
	assert.equal( tc.info, 0, 'info' );
});
