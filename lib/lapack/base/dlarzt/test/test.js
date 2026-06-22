
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dlarzt from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof dlarzt, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof dlarzt.ndarray, 'function', 'has ndarray method' );
});

test( 'dlarzt computes T for a single reflector (row-major)', function t() {
	var TAU = new Float64Array( [ 0.8 ] );
	var V = new Float64Array( [ 1.0, 0.5, -0.3, 0.7 ] );
	var T = new Float64Array( 1 );

	dlarzt( 'row-major', 'backward', 'rowwise', 4, 1, V, 4, TAU, 1, T, 1 );
	assert.ok( Math.abs( T[ 0 ] - 0.8 ) < 1e-14, 'T[0] should be 0.8' );
});

test( 'dlarzt.ndarray computes T for a single reflector', function t() {
	var TAU = new Float64Array( [ 0.8 ] );
	var V = new Float64Array( [ 1.0, 0.5, -0.3, 0.7 ] );
	var T = new Float64Array( 1 );

	dlarzt.ndarray( 'backward', 'rowwise', 4, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 ); // eslint-disable-line max-len
	assert.ok( Math.abs( T[ 0 ] - 0.8 ) < 1e-14, 'T[0] should be 0.8' );
});

test( 'dlarzt.ndarray throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		dlarzt.ndarray( 'forward', 'rowwise', 4, 1, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'dlarzt.ndarray throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		dlarzt.ndarray( 'backward', 'columnwise', 4, 1, new Float64Array( 4 ), 1, 1, 0, new Float64Array( 1 ), 1, 0, new Float64Array( 1 ), 1, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
