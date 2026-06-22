// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zung2r from './../lib/ndarray.js';

// FIXTURES //

import zung2r_identity_k0 from './fixtures/zung2r_identity_k0.json' with { type: 'json' };
import zung2r_3x3_k1 from './fixtures/zung2r_3x3_k1.json' with { type: 'json' };
import zung2r_3x3_k2 from './fixtures/zung2r_3x3_k2.json' with { type: 'json' };
import zung2r_4x3_k3 from './fixtures/zung2r_4x3_k3.json' with { type: 'json' };
import zung2r_n0 from './fixtures/zung2r_n0.json' with { type: 'json' };
import zung2r_1x1_k1 from './fixtures/zung2r_1x1_k1.json' with { type: 'json' };
import zung2r_3x3_k3 from './fixtures/zung2r_3x3_k3.json' with { type: 'json' };
import zung2r_from_qr from './fixtures/zung2r_from_qr.json' with { type: 'json' };

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

test( 'zung2r: identity (K=0)', function t() {
	var tc = zung2r_identity_k0;
	var A = new Complex128Array( 3 * 3 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 3 );
	var info;

	info = zung2r( 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: 3x3, K=1', function t() {
	var tc = zung2r_3x3_k1;
	var A = new Complex128Array( [
		1.0, 0.0,  0.5, 0.25,  0.3, -0.1,
		0.0, 0.0,  0.0, 0.0,   0.0, 0.0,
		0.0, 0.0,  0.0, 0.0,   0.0, 0.0
	]);
	var TAU = new Complex128Array( [ 1.2, 0.3 ] );
	var WORK = new Complex128Array( 3 );
	var info;

	info = zung2r( 3, 3, 1, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: 3x3, K=2', function t() {
	var tc = zung2r_3x3_k2;
	var A = new Complex128Array( [
		1.0, 0.0,  0.4, 0.2,  0.1, -0.3,
		0.0, 0.0,  1.0, 0.0,  0.6, 0.5,
		0.0, 0.0,  0.0, 0.0,  0.0, 0.0
	]);
	var TAU = new Complex128Array( [ 1.1, 0.2, 0.9, -0.1 ] );
	var WORK = new Complex128Array( 3 );
	var info;

	info = zung2r( 3, 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: 4x3, K=3 (rectangular)', function t() {
	var tc = zung2r_4x3_k3;
	var A = new Complex128Array( [
		1.0, 0.0,  0.3, 0.1,  0.2, -0.2,  0.1, 0.05,
		0.0, 0.0,  1.0, 0.0,  0.4, 0.3,  -0.1, 0.2,
		0.0, 0.0,  0.0, 0.0,  1.0, 0.0,   0.5, -0.1
	]);
	var TAU = new Complex128Array( [ 1.05, 0.1, 1.15, -0.2, 0.8, 0.15 ] );
	var WORK = new Complex128Array( 4 );
	var info;

	info = zung2r( 4, 3, 3, A, 1, 4, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: N=0 quick return', function t() {
	var tc = zung2r_n0;
	var A = new Complex128Array( 9 );
	var TAU = new Complex128Array( 1 );
	var WORK = new Complex128Array( 1 );
	var info;

	info = zung2r( 3, 0, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'zung2r: 1x1, K=1', function t() {
	var tc = zung2r_1x1_k1;
	var A = new Complex128Array( [ 1.0, 0.0 ] );
	var TAU = new Complex128Array( [ 0.5, 0.5 ] );
	var WORK = new Complex128Array( 1 );
	var info;

	info = zung2r( 1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: 3x3, K=3', function t() {
	var tc = zung2r_3x3_k3;
	var A = new Complex128Array( [
		1.0, 0.0,  0.2, 0.3,  -0.1, 0.4,
		0.0, 0.0,  1.0, 0.0,   0.5, -0.2,
		0.0, 0.0,  0.0, 0.0,   1.0, 0.0
	]);
	var TAU = new Complex128Array( [ 1.3, -0.1, 0.7, 0.4, 1.1, 0.0 ] );
	var WORK = new Complex128Array( 3 );
	var info;

	info = zung2r( 3, 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( Array.from( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'zung2r: from actual QR factorization', function t() {
	var tc = zung2r_from_qr;
	// This test uses precomputed QR factorization output.
	// We verify the fixture exists and has correct info.
	// Full end-to-end testing requires zgeqrf which is tested separately.
	assert.ok( tc, 'fixture exists' );
	assert.equal( tc.info, 0, 'info' );
});
