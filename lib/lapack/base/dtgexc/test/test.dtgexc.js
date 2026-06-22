/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, no-mixed-operators */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtgexc from './../lib/dtgexc.js';


// TESTS //

test( 'dtgexc is a function', function t() {
	assert.strictEqual( typeof dtgexc, 'function', 'is a function' );
});

test( 'dtgexc has expected arity', function t() {
	assert.strictEqual( dtgexc.length, 17, 'has expected arity' );
});

test( 'dtgexc throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		dtgexc( 'invalid', 2, 2, 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 2, 2 );
	}, TypeError );
});

test( 'dtgexc throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtgexc( 'row-major', true, true, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, 0, 0, new Float64Array( 20 ), 1, 20 );
	}, RangeError );
});

test( 'dtgexc performs column-major swap correctly', function t() {
	var WORK;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	N = 3;
	A = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.5,
		2.0,
		0.0,
		0.3,
		0.4,
		3.0
	]);
	B = new Float64Array([
		1.0,
		0.0,
		0.0,
		0.2,
		1.5,
		0.0,
		0.1,
		0.3,
		2.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N + 16 );

	r = dtgexc( 'column-major', false, false, N, A, N, B, N, Q, N, Z, N, 0, 2, WORK, 1, WORK.length );
	assert.strictEqual( r.info, 0, 'info is zero' );
	assert.strictEqual( r.ilst, 2, 'ilst' );
});

test( 'dtgexc performs row-major swap correctly', function t() {
	var WORK;
	var N;
	var A;
	var B;
	var Q;
	var Z;
	var r;

	N = 3;

	// Row-major: each row is contiguous
	A = new Float64Array([
		1.0,
		0.5,
		0.3,
		0.0,
		2.0,
		0.4,
		0.0,
		0.0,
		3.0
	]);
	B = new Float64Array([
		1.0,
		0.2,
		0.1,
		0.0,
		1.5,
		0.3,
		0.0,
		0.0,
		2.0
	]);
	Q = new Float64Array( N * N );
	Z = new Float64Array( N * N );
	WORK = new Float64Array( 4 * N + 16 );

	r = dtgexc( 'row-major', false, false, N, A, N, B, N, Q, N, Z, N, 0, 2, WORK, 1, WORK.length );
	assert.strictEqual( r.info, 0, 'info is zero' );
	assert.strictEqual( r.ilst, 2, 'ilst' );
});
