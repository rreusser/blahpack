/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import zlarzb from './../lib/index.js';


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof zlarzb, 'function', 'main export is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof zlarzb.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray method throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		var WORK = new Complex128Array( 4 );
		var V = new Complex128Array( 4 );
		var T = new Complex128Array( 4 );
		var C = new Complex128Array( 4 );
		zlarzb.ndarray( 'invalid', 'no-transpose', 'backward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray method throws TypeError for invalid direct', function t() {
	assert.throws( function throws() {
		var WORK = new Complex128Array( 4 );
		var V = new Complex128Array( 4 );
		var T = new Complex128Array( 4 );
		var C = new Complex128Array( 4 );
		zlarzb.ndarray( 'left', 'no-transpose', 'forward', 'rowwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray method throws TypeError for invalid storev', function t() {
	assert.throws( function throws() {
		var WORK = new Complex128Array( 4 );
		var V = new Complex128Array( 4 );
		var T = new Complex128Array( 4 );
		var C = new Complex128Array( 4 );
		zlarzb.ndarray( 'left', 'no-transpose', 'backward', 'columnwise', 2, 2, 1, 1, V, 1, 1, 0, T, 1, 1, 0, C, 1, 2, 0, WORK, 1, 2, 0 ); // eslint-disable-line max-len
	}, TypeError );
});
