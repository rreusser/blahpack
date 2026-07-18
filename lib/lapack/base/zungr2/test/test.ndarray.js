/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zungr2 from './../lib/ndarray.js';
const ndarrayFn = zungr2;


// FIXTURES //

import fixtureIdentityK0 from './fixtures/zungr2_identity_k0.json' with { type: 'json' };
import fixtureFromRq from './fixtures/zungr2_from_rq.json' with { type: 'json' };
import fixture3x3K1 from './fixtures/zungr2_3x3_k1.json' with { type: 'json' };
import fixture3x3K2 from './fixtures/zungr2_3x3_k2.json' with { type: 'json' };
import fixture3x4K2 from './fixtures/zungr2_3x4_k2.json' with { type: 'json' };
import fixture3x3K3 from './fixtures/zungr2_3x3_k3.json' with { type: 'json' };
import fixture1x1K1 from './fixtures/zungr2_1x1_k1.json' with { type: 'json' };
import fixtureM0 from './fixtures/zungr2_m0.json' with { type: 'json' };


// FUNCTIONS //

/**
* Asserts that two values are approximately equal.
*
* @private
* @param {number} actual - actual value
* @param {number} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {Array} actual - actual array
* @param {Array} expected - expected array
* @param {number} tol - tolerance
* @param {string} msg - error message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}


// TESTS //

test( 'base is a function', function t() {
	assert.strictEqual( typeof zungr2, 'function', 'is a function' );
});

test( 'ndarray is a function', function t() {
	assert.strictEqual( typeof ndarrayFn, 'function', 'is a function' );
});

test( 'M=0 quick return', function t() {
	const WORK = new Complex128Array( 3 );

	const TAU = new Complex128Array( 1 );
	const A = new Complex128Array( 9 );
	const tc = fixtureM0;

	const info = zungr2( 0, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
});

test( 'identity (K=0)', function t() {
	const WORK = new Complex128Array( 3 );

	const A = new Complex128Array( 3 * 3 );
	const TAU = new Complex128Array( 1 );
	const tc = fixtureIdentityK0;

	const info = zungr2( 3, 3, 0, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( '3x3, K=1', function t() {
	const WORK = new Complex128Array( 3 );

	const tc = fixture3x3K1;

	// Column-major layout: row 3 (last, 1-based) stores reflector
	const A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		0.25,
		0.0,
		0.0,
		0.0,
		0.0,
		0.3,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		1.2,
		0.3
	]);

	const info = zungr2( 3, 3, 1, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( '3x3, K=2', function t() {
	const WORK = new Complex128Array( 3 );

	const tc = fixture3x3K2;

	// Row 2: reflector 1, Row 3: reflector 2
	const A = new Complex128Array([
		0.0,
		0.0,
		0.4,
		0.2,
		0.6,
		0.5,
		0.0,
		0.0,
		1.0,
		0.0,
		0.1,
		-0.3,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		1.1,
		0.2,
		0.9,
		-0.1
	]);

	const info = zungr2( 3, 3, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( '3x4, K=2 (rectangular)', function t() {
	const WORK = new Complex128Array( 4 );

	const tc = fixture3x4K2;

	// M=3, N=4, K=2, LDA=3
	const A = new Complex128Array([
		0.0,
		0.0,
		0.3,
		0.1,
		0.1,
		0.05,
		0.0,
		0.0,
		0.2,
		-0.2,
		-0.1,
		0.2,
		0.0,
		0.0,
		1.0,
		0.0,
		0.5,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		1.05,
		0.1,
		0.8,
		0.15
	]);

	const info = zungr2( 3, 4, 2, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( '3x3, K=3 (K=M, all reflectors)', function t() {
	const WORK = new Complex128Array( 3 );

	const tc = fixture3x3K3;
	const A = new Complex128Array([
		1.0,
		0.0,
		0.5,
		-0.2,
		-0.1,
		0.4,
		0.0,
		0.0,
		1.0,
		0.0,
		0.3,
		0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		1.3,
		-0.1,
		0.7,
		0.4,
		1.1,
		0.0
	]);

	const info = zungr2( 3, 3, 3, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( '1x1, K=1', function t() {
	const WORK = new Complex128Array( 1 );

	const tc = fixture1x1K1;
	const A = new Complex128Array([
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		0.5,
		0.5
	]);

	const info = zungr2( 1, 1, 1, A, 1, 1, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});

test( 'from actual RQ factorization', function t() {
	const tc = fixtureFromRq;
	assert.ok( tc, 'fixture exists' );
	assert.equal( tc.info, 0, 'info' );
	assert.ok( tc.A.length === 2 * 3 * 4, 'expected 3x4 complex matrix' );
});

test( 'ndarray wrapper produces same results', function t() {
	const WORK = new Complex128Array( 3 );

	const tc = fixture3x3K1;
	const A = new Complex128Array([
		0.0,
		0.0,
		0.0,
		0.0,
		0.5,
		0.25,
		0.0,
		0.0,
		0.0,
		0.0,
		0.3,
		-0.1,
		0.0,
		0.0,
		0.0,
		0.0,
		1.0,
		0.0
	]);
	const TAU = new Complex128Array([
		1.2,
		0.3
	]);

	const info = ndarrayFn( 3, 3, 1, A, 1, 3, 0, TAU, 1, 0, WORK, 1, 0 );
	assert.equal( info, tc.info, 'info' );
	assertArrayClose( toArray( reinterpret( A, 0 ) ), tc.A, 1e-14, 'A' );
});
