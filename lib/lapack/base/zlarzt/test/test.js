/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarzt from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarzt, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlarzt.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray method throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		var TAU = new Complex128Array( 1 );
		var V = new Complex128Array( 4 );
		var T = new Complex128Array( 1 );
		zlarzt.ndarray( 'invalid', 'rowwise', 2, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray method throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		var TAU = new Complex128Array( 1 );
		var V = new Complex128Array( 4 );
		var T = new Complex128Array( 1 );
		zlarzt.ndarray( 'backward', 'invalid', 2, 1, V, 1, 1, 0, TAU, 1, 0, T, 1, 1, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
